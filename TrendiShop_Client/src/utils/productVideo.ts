// A product's video is either an uploaded file or a YouTube link, kept in one
// field (videoUrl). These helpers tell the two apart.

/** The 11-character video id from any common YouTube link, or '' if it isn't one. */
export function youTubeId(url?: string | null): string {
    const s = String(url || '').trim();
    if (!s) return '';
    const m = s.match(
        /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
    );
    return m ? m[1] : '';
}

export const youTubeEmbedUrl = (id: string) => `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
export const youTubeThumbUrl = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
