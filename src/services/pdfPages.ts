/**
 * Counts the pages in a PDF by looking for page objects. This is enough for the PDFs this app
 * generates itself, and avoids loading the much larger PDF reader just to count pages.
 */
export function countPdfPages(bytes: Uint8Array): number {
  let text = ''
  // Decode in chunks: a spread of a large array would overflow the call stack
  for (let i = 0; i < bytes.length; i += 0x8000) {
    text += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return (text.match(/\/Type\s*\/Page(?![s\w])/g) ?? []).length
}
