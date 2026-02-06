/**
 * GitHub-style identicon avatar generator.
 * Creates symmetric 5x5 pixel-art patterns like GitHub's default avatars.
 * Deterministic: same name always produces the same identicon.
 * No external dependencies required.
 */

// Curated foreground colors (vibrant, high contrast against dark/light bg)
const COLORS = [
  '#e17076', // coral
  '#7bc862', // green
  '#6ec9cb', // teal
  '#65aadd', // blue
  '#ee7aae', // pink
  '#e5ae88', // tan
  '#daa06d', // gold
  '#a695e7', // purple
  '#59c9a5', // mint
  '#5b9bd5', // steel blue
  '#f0a742', // amber
  '#c9849b', // mauve
  '#5cc5a7', // jade
  '#d4876e', // salmon
  '#7986cb', // indigo
  '#4db6ac', // sea green
]

/**
 * Generate a stable hash from a string.
 * Uses djb2 algorithm for good distribution.
 */
function hashCode(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0x7fffffff
  }
  return hash
}

/**
 * Generate a 5x5 grid of booleans from a name.
 * Only the left 3 columns are random; the right 2 mirror the left.
 * This creates GitHub-style bilateral symmetry.
 */
function generateGrid(name: string): boolean[][] {
  const hash = hashCode(name)
  const grid: boolean[][] = []

  // We need 15 bits for the left half (5 rows × 3 columns)
  // Use multiple hash variations to get enough bits
  const bits: boolean[] = []
  for (let i = 0; i < 4; i++) {
    const h = hashCode(name + String(i))
    for (let b = 0; b < 8; b++) {
      bits.push(((h >> b) & 1) === 1)
    }
  }

  for (let row = 0; row < 5; row++) {
    const r: boolean[] = []
    for (let col = 0; col < 5; col++) {
      // Mirror: col 0 ↔ 4, col 1 ↔ 3, col 2 = center
      const srcCol = col <= 2 ? col : 4 - col
      const bitIndex = row * 3 + srcCol
      r.push(bits[bitIndex] ?? false)
    }
    grid.push(r)
  }

  return grid
}

/**
 * Pick a foreground color based on the name hash.
 */
function pickColor(name: string): string {
  const hash = hashCode(name + '_color')
  return COLORS[hash % COLORS.length]
}

/**
 * Generate a GitHub-style identicon SVG as a data URL.
 * @param name - The user's display name or username
 * @param size - Output image size in pixels (default 200)
 */
export function generateAvatarDataUrl(name: string, size: number = 200): string {
  const grid = generateGrid(name)
  const fg = pickColor(name)
  const bg = '#161b22' // GitHub-dark background

  const cellSize = 70 // Each cell in the 5×5 grid
  const padding = 45  // Padding around the grid
  const viewBox = cellSize * 5 + padding * 2 // 440

  let cells = ''
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      if (grid[row][col]) {
        const x = padding + col * cellSize
        const y = padding + row * cellSize
        cells += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="8" fill="${fg}" />\n`
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${viewBox} ${viewBox}">
  <rect width="${viewBox}" height="${viewBox}" rx="70" fill="${bg}" />
  ${cells}
</svg>`

  const encoded = typeof btoa !== 'undefined'
    ? btoa(unescape(encodeURIComponent(svg)))
    : Buffer.from(svg).toString('base64')

  return `data:image/svg+xml;base64,${encoded}`
}

/**
 * Generate avatar and return as an object with metadata.
 */
export function generateAvatar(name: string): { dataUrl: string; color: string } {
  const color = pickColor(name)
  const dataUrl = generateAvatarDataUrl(name, 200)
  return { dataUrl, color }
}
