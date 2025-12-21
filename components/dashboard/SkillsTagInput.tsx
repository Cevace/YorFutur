'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

type SkillsTagInputProps = {
    skills: string[];
    onChange: (skills: string[]) => void;
    placeholder?: string;
};

export default function SkillsTagInput({ skills, onChange, placeholder = 'Voeg skill toe...' }: SkillsTagInputProps) {
    const [inputValue, setInputValue] = useState('');

    const addSkill = () => {
        const trimmed = inputValue.trim();
        if (trimmed && !skills.includes(trimmed)) {
            onChange([...skills, trimmed]);
            setInputValue('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        onChange(skills.filter(s => s !== skillToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill();
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2 mb-2">
                {skills.map((skill, index) => (
                    <span
                        key={index}
                        className="inline-flex items-center gap-1 bg-cevace-blue/10 text-cevace-blue px-3 py-1 rounded-full text-sm font-medium"
                    >
                        {skill}
                        <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="hover:bg-cevace-blue/20 rounded-full p-0.5 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </span>
                ))}
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cevace-blue focus:border-transparent"
                />
                <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2 bg-cevace-blue text-white rounded-lg text-sm font-medium hover:bg-blue-900 transition-colors"
                >
                    Toevoegen
                </button>
            </div>
        </div>
    );
}
