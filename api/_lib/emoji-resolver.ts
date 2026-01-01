/**
 * Utility to resolve emojis to PNG images for use in PDF generation.
 * This is necessary because PDF fonts typically do not support color emojis.
 */

/**
 * Converts an emoji string into its corresponding Twemoji PNG URL.
 * Supports complex emojis (sequences, skin tones, etc.)
 * 
 * @param emoji The emoji string (e.g., "🔥" or "👋🏽")
 * @returns A URL to the corresponding PNG image from Twemoji CDN
 */
export function getEmojiPngUrl(emoji: string): string {
    if (!emoji) return '';

    // Extract code points from the emoji string
    // Array.from() handles surrogate pairs correctly
    const codePoints = Array.from(emoji)
        .map(char => char.codePointAt(0)?.toString(16))
        .filter(Boolean);

    const fileName = codePoints.join('-');

    // Return standard Twemoji CDN URL (72x72 PNGs are good for PDFs)
    return `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/${fileName}.png`;
}

/**
 * Regex for matching emojis in strings.
 * Covers basic emojis, skin tones, and various symbol ranges.
 */
export const EMOJI_REGEX = /([\u{1f300}-\u{1f5ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{1f700}-\u{1f77f}\u{1f780}-\u{1f7ff}\u{1f800}-\u{1f8ff}\u{1f900}-\u{1f9ff}\u{1fa00}-\u{1fa6f}\u{1fa70}-\u{1faff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}])/gu;
