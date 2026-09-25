const assetModules = import.meta.glob<{ default: string }>('/src/assets/**/*.{png,jpg,jpeg,webp}', {
  eager: true,
})

/**
 * Resolves a path relative to src/assets (e.g. "ragify/preview-1.png") to its
 * bundled URL, or undefined if the file doesn't exist. Missing files are
 * skipped rather than breaking the build/dev server, since import.meta.glob
 * only picks up files actually present on disk.
 */
export function resolveAsset(relativePath: string): string | undefined {
  return assetModules[`/src/assets/${relativePath}`]?.default
}
