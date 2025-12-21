import CVImport from '@/components/dashboard/CVImport';

export default function ImportPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="font-bold text-cevace-blue mb-2" style={{ fontSize: '45px', letterSpacing: '-0.02em' }}>CV Import</h1>
                <p className="text-gray-600">
                    Upload je CV (PDF of Word) en we plaatsen het automatisch naar je profiel.
                </p>
            </div>

            <CVImport />
        </div>
    );
}
