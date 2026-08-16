'use client';

import React, { useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ChatSkill, ChatToolsState } from '@/lib/ai-service';

interface ChatToolsSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tools: ChatToolsState;
    onChange: (next: ChatToolsState) => void;
}

export default function ChatToolsSheet({ open, onOpenChange, tools, onChange }: ChatToolsSheetProps) {
    const [name, setName] = useState('');
    const [body, setBody] = useState('');

    const toggleSkill = (id: string) => {
        onChange({
            ...tools,
            skills: tools.skills.map((skill) =>
                skill.id === id ? { ...skill, enabled: !skill.enabled } : skill
            ),
        });
    };

    const removeSkill = (id: string) => {
        onChange({ ...tools, skills: tools.skills.filter((skill) => skill.id !== id) });
    };

    const addSkill = () => {
        const trimmedName = name.trim();
        const trimmedBody = body.trim();
        if (!trimmedName || !trimmedBody) return;
        const skill: ChatSkill = {
            id: `custom-${Date.now()}`,
            name: trimmedName,
            body: trimmedBody,
            enabled: true,
        };
        onChange({ ...tools, skills: [...tools.skills, skill] });
        setName('');
        setBody('');
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="bg-white overflow-y-auto sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Chat tools</SheetTitle>
                    <SheetDescription>
                        Skills shape replies. MCP pulls your notes. Caveman keeps answers short.
                    </SheetDescription>
                </SheetHeader>

                <div className="px-4 pb-8 space-y-8">
                    <section>
                        <h3 className="text-sm font-semibold text-slate-800 mb-2">Skills</h3>
                        <p className="text-xs text-slate-500 mb-3">Enabled skills are added to every chat turn.</p>
                        <ul className="space-y-2">
                            {tools.skills.map((skill) => (
                                <li key={skill.id} className="rounded-xl border border-slate-200 p-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
                                            <input
                                                type="checkbox"
                                                checked={skill.enabled}
                                                onChange={() => toggleSkill(skill.id)}
                                            />
                                            {skill.name}
                                        </label>
                                        {skill.id.startsWith('custom-') ? (
                                            <button
                                                type="button"
                                                className="text-xs text-slate-400 hover:text-red-500"
                                                onClick={() => removeSkill(skill.id)}
                                            >
                                                Remove
                                            </button>
                                        ) : null}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{skill.body}</p>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-3 space-y-2">
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Skill name"
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder="Instructions the assistant should follow"
                                rows={3}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                            <button
                                type="button"
                                onClick={addSkill}
                                className="text-sm font-medium text-[#16826B] hover:text-[#0f5c4c]"
                            >
                                Add skill
                            </button>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-sm font-semibold text-slate-800 mb-2">MCP providers</h3>
                        <p className="text-xs text-slate-500 mb-3">
                            Connect Notion or a local Obsidian vault. Keys stay on this device and the backend vault; they are not shown again after save.
                        </p>
                        <label className="flex items-center gap-2 text-sm text-slate-700 mb-3">
                            <input
                                type="checkbox"
                                checked={tools.mcp.knowledge}
                                onChange={(e) => onChange({
                                    ...tools,
                                    mcp: { ...tools.mcp, knowledge: e.target.checked },
                                })}
                            />
                            Dravya knowledge vault
                        </label>
                        <div className="rounded-xl border border-slate-200 p-3 space-y-2 mb-3">
                            <label className="flex items-center gap-2 text-sm font-medium">
                                <input
                                    type="checkbox"
                                    checked={tools.mcp.notion.enabled}
                                    onChange={(e) => onChange({
                                        ...tools,
                                        mcp: {
                                            ...tools.mcp,
                                            notion: { ...tools.mcp.notion, enabled: e.target.checked },
                                        },
                                    })}
                                />
                                Notion
                            </label>
                            <input
                                type="password"
                                value={tools.mcp.notion.token || ''}
                                onChange={(e) => onChange({
                                    ...tools,
                                    mcp: {
                                        ...tools.mcp,
                                        notion: { ...tools.mcp.notion, token: e.target.value },
                                    },
                                })}
                                placeholder={tools.mcp.notion.configured ? 'Token saved — paste to replace' : 'Notion integration token'}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="rounded-xl border border-slate-200 p-3 space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium">
                                <input
                                    type="checkbox"
                                    checked={tools.mcp.obsidian.enabled}
                                    onChange={(e) => onChange({
                                        ...tools,
                                        mcp: {
                                            ...tools.mcp,
                                            obsidian: { ...tools.mcp.obsidian, enabled: e.target.checked },
                                        },
                                    })}
                                />
                                Obsidian (Local REST API)
                            </label>
                            <input
                                value={tools.mcp.obsidian.base_url}
                                onChange={(e) => onChange({
                                    ...tools,
                                    mcp: {
                                        ...tools.mcp,
                                        obsidian: { ...tools.mcp.obsidian, base_url: e.target.value },
                                    },
                                })}
                                placeholder="https://127.0.0.1:27124"
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                            <input
                                type="password"
                                value={tools.mcp.obsidian.api_key || ''}
                                onChange={(e) => onChange({
                                    ...tools,
                                    mcp: {
                                        ...tools.mcp,
                                        obsidian: { ...tools.mcp.obsidian, api_key: e.target.value },
                                    },
                                })}
                                placeholder={tools.mcp.obsidian.configured ? 'Key saved — paste to replace' : 'Obsidian API key'}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                        </div>
                    </section>
                </div>
            </SheetContent>
        </Sheet>
    );
}
