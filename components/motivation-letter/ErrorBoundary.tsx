'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class MotivationLetterErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('[MotivationLetterErrorBoundary] Error caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#F2E9E4] flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Er ging iets mis
                        </h2>
                        <p className="text-gray-600 mb-6">
                            De motivatiebrief generator heeft een onverwachte fout ondervonden.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-cevace-orange text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition-colors"
                        >
                            Pagina herladen
                        </button>
                        {this.state.error && (
                            <details className="mt-4 text-left">
                                <summary className="text-sm text-gray-500 cursor-pointer">
                                    Technische details
                                </summary>
                                <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto">
                                    {this.state.error.message}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
