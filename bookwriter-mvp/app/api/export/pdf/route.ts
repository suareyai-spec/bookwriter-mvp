import { PDFDocument, StandardFonts } from "pdf-lib";

export async function GET() {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  page.drawText("BookWriter MVP Export", { x: 50, y: 790, size: 20, font });
  page.drawText("Replace this with your generated manuscript content.", {
    x: 50,
    y: 760,
    size: 12,
    font,
  });

  const bytes = await pdf.save();
  const buffer = new Uint8Array(bytes);

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="bookwriter-export.pdf"',
    },
  });
}
