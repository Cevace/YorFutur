'use client';

import { useState, useRef } from 'react';
import { Camera, Trash2, Upload, Loader2 } from 'lucide-react';
import { uploadProfilePhoto, deleteProfilePhoto } from '@/actions/profile';
import Image from 'next/image';

interface ProfilePhotoUploadProps {
    currentPhotoUrl?: string | null;
    onUploadSuccess?: (photoUrl: string) => void;
    onDeleteSuccess?: () => void;
}

export default function ProfilePhotoUpload({
    currentPhotoUrl,
    onUploadSuccess,
    onDeleteSuccess
}: ProfilePhotoUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [photoUrl, setPhotoUrl] = useState<string | null>(currentPhotoUrl || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setError(null);
        setIsUploading(true);

        const formData = new FormData();
        formData.append('photo', file);

        try {
            const result = await uploadProfilePhoto(formData);

            if (result.success && result.photoUrl) {
                setPhotoUrl(result.photoUrl);
                onUploadSuccess?.(result.photoUrl);
            } else {
                setError(result.error || 'Upload mislukt');
            }
        } catch (err) {
            setError('Er ging iets mis bij het uploaden');
        } finally {
            setIsUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDelete = async () => {
        if (!confirm('Weet je zeker dat je je profielfoto wilt verwijderen?')) {
            return;
        }

        setError(null);
        setIsDeleting(true);

        try {
            const result = await deleteProfilePhoto();

            if (result.success) {
                setPhotoUrl(null);
                onDeleteSuccess?.();
            } else {
                setError(result.error || 'Verwijderen mislukt');
            }
        } catch (err) {
            setError('Er ging iets mis bij het verwijderen');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Photo Preview */}
            <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                    {photoUrl ? (
                        <Image
                            src={photoUrl}
                            alt="Profile photo"
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cevace-blue to-cevace-orange">
                            <Camera size={40} className="text-white" />
                        </div>
                    )}
                </div>

                {/* Upload button overlay */}
                {!isUploading && !isDeleting && (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-cevace-orange text-white p-2 rounded-full shadow-lg hover:bg-orange-600 transition-colors"
                        title="Wijzig foto"
                    >
                        <Upload size={16} />
                    </button>
                )}
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Action Buttons */}
            <div className="flex gap-2">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || isDeleting}
                    className="flex items-center gap-2 px-4 py-2 bg-cevace-blue text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isUploading ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Uploaden...
                        </>
                    ) : (
                        <>
                            <Camera size={16} />
                            {photoUrl ? 'Wijzig Foto' : 'Upload Foto'}
                        </>
                    )}
                </button>

                {photoUrl && (
                    <button
                        onClick={handleDelete}
                        disabled={isUploading || isDeleting}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Verwijderen...
                            </>
                        ) : (
                            <>
                                <Trash2 size={16} />
                                Verwijder
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                    {error}
                </div>
            )}

            {/* File Requirements */}
            <p className="text-xs text-gray-500 text-center">
                JPEG, PNG of WebP • Max 5MB
            </p>
        </div>
    );
}
