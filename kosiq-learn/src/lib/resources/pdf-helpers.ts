import jsPDF from 'jspdf'

const NAVY = [15, 30, 75] as const
const GOLD = [212, 175, 55] as const
const WHITE = [255, 255, 255] as const
const LIGHT_GRAY = [245, 245, 250] as const
const MID_GRAY = [100, 100, 110] as const
const DARK = [30, 30, 40] as const

export function createDoc(): jsPDF {
  return new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' })
}

export function addHeader(doc: jsPDF) {
  const w = doc.internal.pageSize.getWidth()
  // Navy bar
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, w, 52, 'F')
  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(...WHITE)
  doc.text('Pop Health Academy', 40, 33)
  // Gold accent
  doc.setFillColor(...GOLD)
  doc.rect(0, 52, w, 4, 'F')
}

export function addFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  const w = doc.internal.pageSize.getWidth()
  const h = doc.internal.pageSize.getHeight()
  doc.setDrawColor(200, 200, 200)
  doc.line(40, h - 40, w - 40, h - 40)
  doc.setFont('Helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...MID_GRAY)
  doc.text('© 2026 Pop Health Academy | Confidential Course Material', 40, h - 28)
  doc.text(`Page ${pageNum} of ${totalPages}`, w - 40, h - 28, { align: 'right' })
}

export function addTitle(doc: jsPDF, title: string, y: number = 80): number {
  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(...NAVY)
  const lines = doc.splitTextToSize(title, 500)
  doc.text(lines, 40, y)
  return y + lines.length * 24 + 8
}

export function addSubtitle(doc: jsPDF, text: string, y: number): number {
  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...NAVY)
  doc.text(text, 40, y)
  // Gold underline
  const tw = doc.getTextWidth(text)
  doc.setDrawColor(...GOLD)
  doc.setLineWidth(1.5)
  doc.line(40, y + 3, 40 + tw, y + 3)
  return y + 20
}

export function addParagraph(doc: jsPDF, text: string, y: number, opts?: { maxWidth?: number; fontSize?: number; bold?: boolean }): number {
  const fs = opts?.fontSize || 9.5
  doc.setFont('Helvetica', opts?.bold ? 'bold' : 'normal')
  doc.setFontSize(fs)
  doc.setTextColor(...DARK)
  const mw = opts?.maxWidth || 520
  const lines = doc.splitTextToSize(text, mw)
  doc.text(lines, 40, y)
  return y + lines.length * (fs + 3) + 4
}

export function addBullet(doc: jsPDF, items: string[], y: number, opts?: { fontSize?: number }): number {
  const fs = opts?.fontSize || 9
  doc.setFont('Helvetica', 'normal')
  doc.setFontSize(fs)
  doc.setTextColor(...DARK)
  let cy = y
  for (const item of items) {
    doc.setFillColor(...NAVY)
    doc.circle(48, cy - 3, 2, 'F')
    const lines = doc.splitTextToSize(item, 490)
    doc.text(lines, 58, cy)
    cy += lines.length * (fs + 3) + 4
  }
  return cy + 2
}

export interface TableCol {
  header: string
  width: number
  align?: 'left' | 'center' | 'right'
}

export function addTable(doc: jsPDF, cols: TableCol[], rows: string[][], y: number, opts?: { fontSize?: number }): number {
  const fs = opts?.fontSize || 8
  const rh = 18 // base row height
  const x0 = 40
  const pageH = doc.internal.pageSize.getHeight()
  let cy = y

  // Helper to calculate row height based on content
  const getRowHeight = (row: string[]): number => {
    let maxLines = 1
    row.forEach((cell, i) => {
      const lines = doc.splitTextToSize(cell, cols[i].width - 8)
      if (lines.length > maxLines) maxLines = lines.length
    })
    return Math.max(rh, maxLines * (fs + 3) + 6)
  }

  const drawHeaderRow = () => {
    doc.setFillColor(...NAVY)
    let cx = x0
    doc.rect(x0, cy, cols.reduce((s, c) => s + c.width, 0), rh, 'F')
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(fs)
    doc.setTextColor(...WHITE)
    for (const col of cols) {
      doc.text(col.header, cx + 4, cy + 12)
      cx += col.width
    }
    cy += rh
  }

  drawHeaderRow()

  for (let r = 0; r < rows.length; r++) {
    const rowH = getRowHeight(rows[r])
    if (cy + rowH > pageH - 60) {
      // new page
      doc.addPage()
      addHeader(doc)
      cy = 72
      drawHeaderRow()
    }
    if (r % 2 === 0) {
      doc.setFillColor(...LIGHT_GRAY)
      doc.rect(x0, cy, cols.reduce((s, c) => s + c.width, 0), rowH, 'F')
    }
    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(fs)
    doc.setTextColor(...DARK)
    let cx = x0
    for (let c = 0; c < cols.length; c++) {
      const lines = doc.splitTextToSize(rows[r][c] || '', cols[c].width - 8)
      doc.text(lines, cx + 4, cy + 11)
      cx += cols[c].width
    }
    cy += rowH
  }
  return cy + 6
}

export function checkPage(doc: jsPDF, y: number, needed: number = 80): number {
  if (y + needed > doc.internal.pageSize.getHeight() - 60) {
    doc.addPage()
    addHeader(doc)
    return 72
  }
  return y
}

export function finalize(doc: jsPDF): Buffer {
  const pages = doc.internal.pages.length - 1 // pages[0] is empty
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    addFooter(doc, i, pages)
  }
  return Buffer.from(doc.output('arraybuffer'))
}
