'use client';

import React from 'react';
import { Renderer } from '@openuidev/react-lang';
import { openuiChatLibrary } from '@openuidev/react-ui/genui-lib';
import '@openuidev/react-ui/components.css';
import '@openuidev/react-ui/styles/index.css';

function looksLikeOpenUI(text: string | undefined | null): boolean {
    const raw = (text || '').trim().replace(/^```(?:openui|txt)?\s*/i, '');
    return raw.includes('root =');
}

interface OpenUIViewProps {
    source?: string | null;
    fallbackMarkdown?: string;
    isStreaming?: boolean;
    onFollowUp?: (text: string) => void;
}

export default function OpenUIView({
    source,
    fallbackMarkdown,
    isStreaming,
    onFollowUp,
}: OpenUIViewProps) {
    const response = looksLikeOpenUI(source)
        ? (source || '').trim().replace(/^```[\w]*\n?/, '').replace(/```$/, '').trim()
        : fallbackMarkdown
            ? `root = Card([md])\nmd = MarkDownRenderer(${JSON.stringify(fallbackMarkdown.slice(0, 6000))})`
            : source || '';

    if (!response) return null;

    return (
        <div className="dravya-openui w-full text-left">
            <Renderer
                response={response}
                library={openuiChatLibrary}
                isStreaming={isStreaming}
                onAction={(event) => {
                    const record = event as unknown as Record<string, unknown>;
                    const text = String(
                        record.label || record.name || record.text || record.value || ''
                    ).trim();
                    if (text && onFollowUp) onFollowUp(text);
                }}
            />
        </div>
    );
}
