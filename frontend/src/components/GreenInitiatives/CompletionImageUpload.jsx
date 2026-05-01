import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import greenInitiativeService from '../../services/greenInitiative.service';

const MAX_FILES = 5;
const MAX_SIZE_MB = 5;

/**
 * Props:
 *  - initiativeId    : string
 *  - initiativeTitle : string
 *  - onSkip          : () => void   — called when user clicks "Skip for now"
 *  - onSuccess       : (updatedInitiative) => void  — called after a successful upload
 *                      If omitted, falls back to navigating to the initiative detail page.
 */
const CompletionImageUpload = ({ initiativeId, initiativeTitle, onSkip, onSuccess }) => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);

    const addFiles = useCallback((incoming) => {
        const remaining = MAX_FILES - files.length;
        if (remaining <= 0) {
            setUploadError(`You can upload a maximum of ${MAX_FILES} images.`);
            return;
        }

        const valid = [];
        const errors = [];

        Array.from(incoming).slice(0, remaining).forEach((file) => {
            if (!file.type.startsWith('image/')) {
                errors.push(`"${file.name}" is not an image.`);
            } else if (file.size > MAX_SIZE_MB * 1024 * 1024) {
                errors.push(`"${file.name}" exceeds ${MAX_SIZE_MB}MB.`);
            } else {
                valid.push(file);
            }
        });

        if (errors.length) {
            setUploadError(errors.join(' '));
        } else {
            setUploadError('');
        }

        if (valid.length) {
            setFiles((prev) => [...prev, ...valid]);
            valid.forEach((file) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviews((prev) => [...prev, { src: reader.result, name: file.name }]);
                };
                reader.readAsDataURL(file);
            });
        }
    }, [files.length]);

    const removeFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
        setPreviews((prev) => prev.filter((_, i) => i !== index));
        setUploadError('');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        addFiles(e.dataTransfer.files);
    };

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);
    const handleBrowse = () => fileInputRef.current?.click();
    const handleFileChange = (e) => { addFiles(e.target.files); e.target.value = ''; };

    const handleUpload = async () => {
        if (files.length === 0) return;
        setUploading(true);
        setUploadError('');
        setProgress(10);

        const formData = new FormData();
        files.forEach((f) => formData.append('images', f));

        try {
            setProgress(40);
            const response = await greenInitiativeService.uploadCompletionImages(initiativeId, formData);
            setProgress(100);

            // Extract the updated initiative from the response
            const updatedInitiative = response?.data?.data || response?.data || null;

            setTimeout(() => {
                if (onSuccess) {
                    // Parent handles the state update — no navigation needed
                    onSuccess(updatedInitiative);
                } else {
                    // Fallback: navigate to the detail page (e.g. from EditInitiativeForm)
                    navigate(`/dashboard/initiatives/${initiativeId}`);
                }
            }, 400);
        } catch (err) {
            setUploadError(err.response?.data?.message || 'Upload failed. Please try again.');
            setUploading(false);
            setProgress(0);
        }
    };


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
            <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">

                {/* Header */}
                <div className="px-8 pt-8 pb-4">
                    <div className="flex items-center gap-3 mb-1">
                        <span className="text-2xl">📸</span>
                        <h2 className="text-2xl font-extrabold text-textMain tracking-tight">
                            Upload Event Photos
                        </h2>
                    </div>
                    <p className="text-textMuted text-sm">
                        Add up to <strong>5 photos</strong> from{' '}
                        <span className="text-primary-600 font-semibold">"{initiativeTitle}"</span>{' '}
                        to share with the community.
                    </p>
                </div>

                <div className="px-8 pb-8 space-y-5">
                    {/* Error alert */}
                    {uploadError && (
                        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-700 text-sm font-medium flex items-start gap-2">
                            <span>⚠️</span>
                            <span>{uploadError}</span>
                        </div>
                    )}

                    {/* Drop zone */}
                    {files.length < MAX_FILES && (
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onClick={handleBrowse}
                            className={`
                                relative flex flex-col items-center justify-center gap-3
                                border-2 border-dashed rounded-2xl p-8 cursor-pointer
                                transition-all duration-200
                                ${isDragging
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 scale-[1.01]'
                                    : 'border-border hover:border-primary-400 hover:bg-surfaceHover'
                                }
                            `}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-2xl">
                                🖼️
                            </div>
                            <div className="text-center">
                                <p className="font-semibold text-textMain text-sm">
                                    {isDragging ? 'Drop your images here!' : 'Drag & drop images here'}
                                </p>
                                <p className="text-textMuted text-xs mt-0.5">
                                    or <span className="text-primary-600 underline cursor-pointer">browse files</span>
                                    {' '} · JPG, PNG, WebP · max {MAX_SIZE_MB}MB each · up to {MAX_FILES - files.length} more
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Preview grid */}
                    {previews.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                            {previews.map((p, i) => (
                                <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-border bg-surfaceHover">
                                    <img
                                        src={p.src}
                                        alt={p.name}
                                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                                    />
                                    {!uploading && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md leading-none"
                                            title="Remove"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Upload Progress */}
                    {uploading && (
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs text-textMuted font-medium">
                                <span>Uploading to Cloudinary…</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary-500 rounded-full transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-1">
                        <button
                            onClick={handleUpload}
                            disabled={files.length === 0 || uploading}
                            className="btn btn-default btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading
                                ? `Uploading ${files.length} photo${files.length !== 1 ? 's' : ''}…`
                                : `📤 Upload ${files.length > 0 ? `${files.length} Photo${files.length !== 1 ? 's' : ''}` : 'Photos'}`
                            }
                        </button>
                        <button
                            onClick={onSkip}
                            disabled={uploading}
                            className="btn btn-default btn-secondary disabled:opacity-50"
                        >
                            Skip for now
                        </button>
                    </div>

                    <p className="text-xs text-textMuted text-center">
                        You can also upload photos later from the initiative's detail page.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CompletionImageUpload;
