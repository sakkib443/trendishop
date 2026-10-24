"use client";

import React, { useRef, useState } from 'react';
import { FiVideo, FiUploadCloud, FiYoutube, FiX } from 'react-icons/fi';
import { useUploadVideoMutation } from '@/redux/api/uploadApi';
import { youTubeId, youTubeEmbedUrl } from '@/utils/productVideo';

const MAX_MB = 100;

/**
 * The product's one video — an uploaded file or a YouTube link — plus whether the
 * product page opens on the video or on the images.
 */
export default function ProductVideoField({
    videoUrl,
    mediaFirst,
    onChange,
}: {
    videoUrl: string;
    mediaFirst: 'image' | 'video';
    onChange: (patch: { videoUrl?: string; mediaFirst?: 'image' | 'video' }) => void;
}) {
    const ytId = youTubeId(videoUrl);
    const [mode, setMode] = useState<'upload' | 'youtube'>(ytId ? 'youtube' : 'upload');
    const [link, setLink] = useState(ytId ? videoUrl : '');
    const [error, setError] = useState('');
    const [uploadVideo, { isLoading }] = useUploadVideoMutation();
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file?: File) => {
        if (!file) return;
        if (file.size > MAX_MB * 1024 * 1024) { setError(`Video must be under ${MAX_MB}MB`); return; }
        setError('');
        const fd = new FormData();
        fd.append('video', file);
        try {
            const res = await uploadVideo(fd).unwrap();
            onChange({ videoUrl: res.data.url });
        } catch {
            setError('Upload failed. Use an mp4, webm or mov file and try again.');
        }
    };

    const applyLink = (value: string) => {
        setLink(value);
        if (!value.trim()) { setError(''); onChange({ videoUrl: '', mediaFirst: 'image' }); return; }
        if (youTubeId(value)) { setError(''); onChange({ videoUrl: value.trim() }); }
        else setError('This does not look like a YouTube link.');
    };

    const clear = () => {
        setLink('');
        setError('');
        onChange({ videoUrl: '', mediaFirst: 'image' });
    };

    const tab = (key: 'upload' | 'youtube', label: string, icon: React.ReactNode) => (
        <button
            type="button"
            onClick={() => { setMode(key); setError(''); }}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-colors ${mode === key ? 'bg-white text-gray-900 border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
        >
            {icon} {label}
        </button>
    );

    return (
        <div className="bg-white p-6 rounded-md border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2"><FiVideo className="text-rose-500" /> Product Video</h3>
            <p className="text-[11px] text-gray-400 -mt-2">Optional — upload a video or paste a YouTube link</p>

            {/* Current video */}
            {videoUrl ? (
                <div className="relative overflow-hidden rounded-md border border-gray-200 bg-black">
                    {ytId ? (
                        <iframe
                            src={youTubeEmbedUrl(ytId)}
                            title="Product video"
                            className="aspect-video w-full"
                            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <video src={videoUrl} controls preload="metadata" className="aspect-video w-full" />
                    )}
                    <button
                        type="button"
                        onClick={clear}
                        aria-label="Remove video"
                        className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-600 hover:bg-white"
                    >
                        <FiX size={14} />
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
                        {tab('upload', 'Upload video', <FiUploadCloud size={13} />)}
                        {tab('youtube', 'YouTube link', <FiYoutube size={13} />)}
                    </div>

                    {mode === 'upload' ? (
                        <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            disabled={isLoading}
                            className="flex w-full flex-col items-center justify-center gap-1.5 rounded-md border-2 border-dashed border-gray-200 px-4 py-6 text-center text-gray-500 hover:border-gray-300 disabled:opacity-60"
                        >
                            <FiUploadCloud size={22} />
                            <span className="text-xs font-semibold">{isLoading ? 'Uploading… please wait' : 'Click to choose a video'}</span>
                            <span className="text-[11px] text-gray-400">mp4, webm or mov · up to {MAX_MB}MB</span>
                        </button>
                    ) : (
                        <input
                            type="url"
                            value={link}
                            onChange={(e) => applyLink(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                        />
                    )}
                    <input
                        ref={fileRef}
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        className="hidden"
                        onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ''; }}
                    />
                </>
            )}

            {error && <p className="text-xs text-red-500 font-medium">⚠ {error}</p>}

            {/* What the product page opens on */}
            <div className={videoUrl ? '' : 'opacity-50 pointer-events-none'}>
                <p className="text-xs font-semibold text-gray-600 mb-2">Product page shows first</p>
                <div className="grid grid-cols-2 gap-2">
                    {(['image', 'video'] as const).map((opt) => (
                        <label
                            key={opt}
                            className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold ${mediaFirst === opt ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary-lightest)]' : 'border-gray-200 text-gray-600'}`}
                        >
                            <input
                                type="radio"
                                name="mediaFirst"
                                checked={mediaFirst === opt}
                                onChange={() => onChange({ mediaFirst: opt })}
                                className="accent-[var(--color-primary)]"
                            />
                            {opt === 'image' ? 'Image' : 'Video'}
                        </label>
                    ))}
                </div>
                {!videoUrl && <p className="text-[11px] text-gray-400 mt-1.5">Add a video to choose.</p>}
            </div>
        </div>
    );
}
