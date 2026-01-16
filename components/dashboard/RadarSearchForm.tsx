'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

interface RadarSearchFormProps {
    onSearch: (query: string, location: string, sector: string, freshness: '24h' | '3days' | '7days') => void;
    isLoading: boolean;
}

export default function RadarSearchForm({ onSearch, isLoading }: RadarSearchFormProps) {
    const [query, setQuery] = useState('');
    const [location, setLocation] = useState('Nederland');
    const [sector, setSector] = useState('alles');
    const [freshness, setFreshness] = useState<'24h' | '3days' | '7days'>('7days');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        onSearch(query, location, sector, freshness);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Job Title */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Functietitel
                    </label>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="bijv. Sales Manager, Developer..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cevace-orange focus:border-transparent"
                        disabled={isLoading}
                    />
                </div>

                {/* Location */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Locatie
                    </label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="bijv. Amsterdam, Utrecht..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cevace-orange focus:border-transparent"
                        disabled={isLoading}
                    />
                </div>

                {/* Sector */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sector / Branche
                    </label>
                    <select
                        value={sector}
                        onChange={(e) => setSector(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cevace-orange focus:border-transparent"
                        disabled={isLoading}
                    >
                        <option value="alles">Alles</option>
                        <option value="techniek">Techniek</option>
                        <option value="bouw">Bouw</option>
                        <option value="logistiek">Logistiek</option>
                        <option value="zakelijk">Zakelijk</option>
                        <option value="zorg">Zorg</option>
                        <option value="horeca">Horeca</option>
                    </select>
                </div>

                {/* Freshness */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Versheid
                    </label>
                    <select
                        value={freshness}
                        onChange={(e) => setFreshness(e.target.value as '24h' | '3days' | '7days')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cevace-orange focus:border-transparent"
                        disabled={isLoading}
                    >
                        <option value="24h">Laatste 24 uur</option>
                        <option value="3days">Laatste 3 dagen</option>
                        <option value="7days">Laatste 7 dagen</option>
                    </select>
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="mt-4 flex items-center gap-2 bg-cevace-orange text-white px-6 py-3 rounded-full font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Search size={20} />
                {isLoading ? 'Zoeken...' : 'Zoek vacatures'}
            </button>
        </form>
    );
}
