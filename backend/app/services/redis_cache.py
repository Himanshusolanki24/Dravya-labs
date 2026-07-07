"""
Redis Cache — centralized async Redis client for the Dravya backend.

Uses `redis.asyncio` for non-blocking operations with connection pooling.
Gracefully degrades to a no-op if Redis is unavailable (the app still works,
just without caching).
"""

import json
import logging
from typing import Any, Optional

import redis.asyncio as aioredis

from app.core.config import settings

logger = logging.getLogger("dravya.redis_cache")

DEFAULT_TTL = 3600  # 1 hour

_pool: Optional[aioredis.Redis] = None


async def get_redis() -> Optional[aioredis.Redis]:
    """Return a shared async Redis client (lazy-initialized with connection pool)."""
    global _pool
    if _pool is None:
        try:
            _pool = aioredis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
                max_connections=50,
            )
            # Quick health check
            await _pool.ping()
            logger.info("Redis connected at %s", settings.REDIS_URL)
        except Exception as e:
            logger.warning("Redis connection failed (caching disabled): %s", e)
            _pool = None
    return _pool


async def cache_get(key: str) -> Optional[str]:
    """Get a cached value. Returns None on miss or if Redis is unavailable."""
    client = await get_redis()
    if client is None:
        return None
    try:
        return await client.get(key)
    except Exception as e:
        logger.warning("Redis GET failed (non-fatal): %s", e)
        return None


async def cache_set(key: str, value: str, ttl: int = DEFAULT_TTL) -> None:
    """Set a cached value with TTL. Silently fails if Redis is unavailable."""
    client = await get_redis()
    if client is None:
        return
    try:
        await client.setex(key, ttl, value)
    except Exception as e:
        logger.warning("Redis SET failed (non-fatal): %s", e)


async def cache_get_json(key: str) -> Optional[Any]:
    """Get and JSON-decode a cached value."""
    raw = await cache_get(key)
    if raw is None:
        return None
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


async def cache_set_json(key: str, value: Any, ttl: int = DEFAULT_TTL) -> None:
    """JSON-encode and set a cached value with TTL."""
    try:
        raw = json.dumps(value)
        await cache_set(key, raw, ttl)
    except (TypeError, ValueError) as e:
        logger.warning("Redis JSON serialization failed: %s", e)


async def close_redis() -> None:
    """Cleanly close the Redis connection pool (call on app shutdown)."""
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None
        logger.info("Redis connection closed.")
