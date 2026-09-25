/** Splits text into lowercase words, keeping things like "c++", "c#" and "node.js" whole. */
export function words(text: string): string[] {
  return text.toLowerCase().match(/[\p{L}\p{N}+#]+(?:\.[\p{L}\p{N}]+)*/gu) ?? []
}

/** True when `needle` appears in `haystack` as whole words in order ("sql" is not in "postgresql"). */
export function hasPhrase(haystack: string[], needle: string[]): boolean {
  if (needle.length === 0) return false
  for (let i = 0; i + needle.length <= haystack.length; i++) {
    if (needle.every((w, j) => haystack[i + j] === w)) return true
  }
  return false
}
