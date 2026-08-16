'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { aiService, ChatSkill, ChatToolsState } from '@/lib/ai-service';

const STORAGE_KEY = 'dravya-chat-tools';

export const DEFAULT_SKILLS: ChatSkill[] = [
    {
        id: 'diet-coach',
        name: 'Diet coach',
        enabled: false,
        body: 'Lead with food. Name 3 foods to favor and 3 to reduce for the user\'s dosha. No long essays.',
    },
    {
        id: 'herb-protocol',
        name: 'Herb protocol',
        enabled: false,
        body: 'If suggesting herbs, give name, typical culinary/tea use, and one contraindication. Never high-dose or pregnancy herbs without a caution.',
    },
    {
        id: 'pcos-cycle',
        name: 'PCOS / cycle',
        enabled: false,
        body: 'When relevant, tie advice to cycle regularity, insulin, and Kapha-Pitta patterns. Stay educational.',
    },
];

export function defaultTools(): ChatToolsState {
    return {
        caveman: false,
        skills: DEFAULT_SKILLS.map((s) => ({ ...s })),
        mcp: {
            knowledge: true,
            notion: { enabled: false, token: '' },
            obsidian: { enabled: false, base_url: 'https://127.0.0.1:27124', api_key: '' },
        },
    };
}

function readLocal(): ChatToolsState {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return defaultTools();
        const parsed = JSON.parse(raw) as ChatToolsState;
        return {
            ...defaultTools(),
            ...parsed,
            skills: parsed.skills?.length ? parsed.skills : defaultTools().skills,
            mcp: { ...defaultTools().mcp, ...parsed.mcp },
        };
    } catch {
        return defaultTools();
    }
}

export function useChatTools() {
    const [tools, setTools] = useState<ChatToolsState>(defaultTools);
    const [ready, setReady] = useState(false);
    const saveTimer = useRef<number | null>(null);

    useEffect(() => {
        const local = readLocal();
        setTools(local);
        setReady(true);
        void aiService.getChatTools().then((remote) => {
            if (!remote) return;
            setTools((prev) => ({
                caveman: remote.caveman,
                skills: remote.skills?.length ? remote.skills : prev.skills,
                mcp: {
                    knowledge: remote.mcp?.knowledge ?? prev.mcp.knowledge,
                    notion: {
                        enabled: remote.mcp?.notion?.enabled ?? false,
                        token: prev.mcp.notion.token || '',
                        configured: remote.mcp?.notion?.configured,
                    },
                    obsidian: {
                        enabled: remote.mcp?.obsidian?.enabled ?? false,
                        base_url: remote.mcp?.obsidian?.base_url || prev.mcp.obsidian.base_url,
                        api_key: prev.mcp.obsidian.api_key || '',
                        configured: remote.mcp?.obsidian?.configured,
                    },
                },
            }));
        });
    }, []);

    const persist = useCallback((next: ChatToolsState) => {
        setTools(next);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
            /* ignore */
        }
        if (saveTimer.current) window.clearTimeout(saveTimer.current);
        saveTimer.current = window.setTimeout(() => {
            void aiService.saveChatTools({
                caveman: next.caveman,
                skills: next.skills,
                mcp: {
                    knowledge: next.mcp.knowledge,
                    notion: {
                        enabled: next.mcp.notion.enabled,
                        token: next.mcp.notion.token || undefined,
                    },
                    obsidian: {
                        enabled: next.mcp.obsidian.enabled,
                        base_url: next.mcp.obsidian.base_url,
                        api_key: next.mcp.obsidian.api_key || undefined,
                    },
                },
            });
        }, 500);
    }, []);

    const setCaveman = useCallback((caveman: boolean) => {
        persist({ ...tools, caveman });
    }, [persist, tools]);

    return { tools, ready, persist, setCaveman };
}
