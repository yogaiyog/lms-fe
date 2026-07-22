export type MixedSegment =
  | { type: "text"; content: string }
  | { type: "blocks3"; code: string };

export function parseMixedContent(text: string): MixedSegment[] {
  const segments: MixedSegment[] = [];
  const regex = /\{([^}]+)\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: "blocks3", code: match[1].trim() });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", content: text.slice(lastIndex) });
  }

  return segments;
}
