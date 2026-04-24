"""
Base client for external ML model APIs.

All disease-specific clients inherit from this.
Provides: retry, timeout, logging, graceful degradation.
"""

import logging
from typing import Any, Optional

import httpx
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
)

from app.core.config import settings

logger = logging.getLogger("dravya.model_clients")


class BaseModelClient:
    """
    Abstract base for calling a pre-hosted ML model API.

    Subclasses only need to set `api_url`, `api_key`, and
    implement `_build_payload()`.
    """

    api_url: str = ""
    api_key: str = ""
    model_name: str = "unknown"

    def __init__(self) -> None:
        self.timeout = settings.MODEL_CLIENTS_TIMEOUT

    # ── Public entry point ────────────────────────────────
    async def predict(self, data: dict[str, Any]) -> dict[str, Any]:
        """
        Call the model API and return prediction results.
        Returns {"status": "unavailable", ...} on failure instead of raising.
        """
        if not self.api_url:
            logger.info("%s API URL not configured — skipping.", self.model_name)
            return {
                "status": "unavailable",
                "reason": f"{self.model_name} API URL not configured",
            }

        try:
            return await self._call_api(data)
        except Exception as e:
            logger.warning(
                "%s prediction failed (non-fatal): %s", self.model_name, e
            )
            return {
                "status": "error",
                "reason": str(e),
            }

    # ── Internal with retry ───────────────────────────────
    @retry(
        stop=stop_after_attempt(2),
        wait=wait_exponential(multiplier=1, min=1, max=5),
        retry=retry_if_exception_type(
            (httpx.TimeoutException, httpx.ConnectError)
        ),
        reraise=True,
    )
    async def _call_api(self, data: dict[str, Any]) -> dict[str, Any]:
        headers: dict[str, str] = {"Content-Type": "application/json"}
        if self.api_key:
            headers["X-API-Key"] = self.api_key

        payload = self._build_payload(data)

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(self.api_url, json=payload, headers=headers)
            if resp.status_code == 422:
                logger.error(f"Validation Error (422) from {self.model_name}: {resp.text}")
            resp.raise_for_status()

        result = resp.json()
        result["status"] = "success"
        return result

    # ── Override in subclasses ────────────────────────────
    def _build_payload(self, data: dict[str, Any]) -> dict[str, Any]:
        """Transform input data into the payload that the model API expects."""
        return data
