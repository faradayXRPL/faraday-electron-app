/** Incremental USB line parser — accumulates bytes until \\n (any line length). */

/**
 * @param {(line: string) => void} onLine
 */
function createSerialFramer(onLine) {
  let buf = Buffer.alloc(0)

  /** @param {Buffer} chunk */
  function push(chunk) {
    buf = buf.length ? Buffer.concat([buf, chunk]) : Buffer.from(chunk)
    for (;;) {
      const idx = buf.indexOf(0x0a)
      if (idx < 0) return
      let line = buf.subarray(0, idx).toString('utf8')
      buf = buf.subarray(idx + 1)
      if (line.endsWith('\r')) line = line.slice(0, -1)
      const trimmed = line.trim()
      if (trimmed) onLine(trimmed)
    }
  }

  function reset() {
    buf = Buffer.alloc(0)
  }

  return { push, reset }
}

module.exports = { createSerialFramer }
