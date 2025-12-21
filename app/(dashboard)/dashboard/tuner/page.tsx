import CVTuner from '@/components/dashboard/CVTuner';

export default function TunerPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="font-bold text-cevace-blue mb-2" style={{ fontSize: '45px', letterSpacing: '-0.02em' }}>
                    CV Tuner
                </h1>
                <p className="text-gray-600">
                    Optimaliseer je CV met Cevace Power Score analyse
                </p>
            </div>

            <CVTuner />
        </div>
    );
}
