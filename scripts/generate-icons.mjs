// Generates PWA icons as valid PNG files using pure Node.js (no dependencies)
// Uses raw PNG encoding with zlib deflate

import { writeFileSync } from 'fs'
import { deflateSync } from 'zlib'

function createPNG(size, bgR, bgG, bgB, fgR, fgG, fgB) {
  const pixels = new Uint8Array(size * size * 4)

  // Fill background color
  for (let i = 0; i < size * size; i++) {
    pixels[i * 4 + 0] = bgR
    pixels[i * 4 + 1] = bgG
    pixels[i * 4 + 2] = bgB
    pixels[i * 4 + 3] = 255
  }

  // Draw rounded rectangle mask (corner radius = 20% of size)
  const r = Math.floor(size * 0.2)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let inside = true
      // Top-left corner
      if (x < r && y < r) inside = Math.hypot(x - r, y - r) <= r
      // Top-right corner
      else if (x >= size - r && y < r) inside = Math.hypot(x - (size - r - 1), y - r) <= r
      // Bottom-left corner
      else if (x < r && y >= size - r) inside = Math.hypot(x - r, y - (size - r - 1)) <= r
      // Bottom-right corner
      else if (x >= size - r && y >= size - r) inside = Math.hypot(x - (size - r - 1), y - (size - r - 1)) <= r

      if (!inside) {
        const idx = (y * size + x) * 4
        pixels[idx + 3] = 0 // transparent outside rounded corners
      }
    }
  }

  // Draw "CC" text using a simple bitmap font approach
  // We'll draw two letter C shapes using rectangles
  const fontSize = Math.floor(size * 0.38)
  const centerX = Math.floor(size / 2)
  const centerY = Math.floor(size / 2)

  // Draw a thick horizontal bar (simplified "CC" as two arcs approximated by rectangles)
  const lw = Math.max(2, Math.floor(fontSize * 0.12)) // line width
  const cw = Math.floor(fontSize * 0.28)  // C width
  const ch = Math.floor(fontSize * 0.42)  // C height
  const gap = Math.floor(fontSize * 0.06) // gap between two C's

  // Left C center, Right C center
  const leftCX = centerX - Math.floor(cw * 0.6)
  const rightCX = centerX + Math.floor(cw * 0.6)

  for (const cx of [leftCX, rightCX]) {
    const x0 = cx - cw
    const x1 = cx + cw
    const y0 = centerY - ch
    const y1 = centerY + ch

    // Top bar
    fillRect(pixels, size, x0, y0, x1, y0 + lw, fgR, fgG, fgB)
    // Bottom bar
    fillRect(pixels, size, x0, y1 - lw, x1, y1, fgR, fgG, fgB)
    // Left bar
    fillRect(pixels, size, x0, y0, x0 + lw, y1, fgR, fgG, fgB)
  }

  // Build PNG binary
  const width = size
  const height = size

  // Raw image data with filter bytes
  const rawData = new Uint8Array(height * (1 + width * 4))
  for (let y = 0; y < height; y++) {
    rawData[y * (width * 4 + 1)] = 0 // filter type None
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4
      const dst = y * (width * 4 + 1) + 1 + x * 4
      rawData[dst] = pixels[src]
      rawData[dst + 1] = pixels[src + 1]
      rawData[dst + 2] = pixels[src + 2]
      rawData[dst + 3] = pixels[src + 3]
    }
  }

  const compressed = deflateSync(rawData, { level: 6 })

  const chunks = []

  // PNG signature
  chunks.push(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))

  // IHDR chunk
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8   // bit depth
  ihdr[9] = 6   // color type RGBA
  ihdr[10] = 0  // compression
  ihdr[11] = 0  // filter
  ihdr[12] = 0  // interlace
  chunks.push(makeChunk('IHDR', ihdr))

  // IDAT chunk
  chunks.push(makeChunk('IDAT', compressed))

  // IEND chunk
  chunks.push(makeChunk('IEND', Buffer.alloc(0)))

  return Buffer.concat(chunks)
}

function fillRect(pixels, size, x0, y0, x1, y1, r, g, b) {
  for (let y = Math.max(0, y0); y < Math.min(size, y1); y++) {
    for (let x = Math.max(0, x0); x < Math.min(size, x1); x++) {
      const idx = (y * size + x) * 4
      if (pixels[idx + 3] > 0) { // only paint inside the rounded rect
        pixels[idx] = r
        pixels[idx + 1] = g
        pixels[idx + 2] = b
        pixels[idx + 3] = 255
      }
    }
  }
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuffer = Buffer.from(type, 'ascii')
  const crcData = Buffer.concat([typeBuffer, data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(crcData), 0)
  return Buffer.concat([len, typeBuffer, data, crc])
}

function crc32(buf) {
  const table = makeCRCTable()
  let crc = 0xFFFFFFFF
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF]
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function makeCRCTable() {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    }
    table[n] = c
  }
  return table
}

// Brand colors: bg = #7400E8 (purple), fg = #FACC15 (yellow)
const bgR = 0x74, bgG = 0x00, bgB = 0xE8
const fgR = 0xFA, fgG = 0xCC, fgB = 0x15

const icons = [
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
]

for (const { name, size } of icons) {
  const png = createPNG(size, bgR, bgG, bgB, fgR, fgG, fgB)
  writeFileSync(`public/${name}`, png)
  console.log(`✅  public/${name}  (${png.length} bytes)`)
}
