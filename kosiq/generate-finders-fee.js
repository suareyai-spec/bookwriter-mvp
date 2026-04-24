const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument({
  size: 'LETTER',
  margins: { top: 72, bottom: 90, left: 72, right: 72 },
  bufferPages: true,
  info: {
    Title: "Finder's Fee Agreement — Downtown Miami Land Assemblage",
    Author: 'David Suarez',
  }
});

const out = fs.createWriteStream(__dirname + '/Finders-Fee-Agreement.pdf');
doc.pipe(out);

const W = 612 - 144; // usable width

function heading(text, size = 16) {
  doc.font('Helvetica-Bold').fontSize(size).text(text, { align: 'center' });
  doc.moveDown(0.5);
}

function label(text) {
  doc.font('Helvetica-Bold').fontSize(10).text(text, { continued: false });
}

function body(text, opts = {}) {
  doc.font('Helvetica').fontSize(10).text(text, { lineGap: 2, ...opts });
}

function term(num, title, description) {
  const x = doc.x;
  // Check if we need a new page (rough estimate)
  if (doc.y > 650) doc.addPage();
  doc.font('Helvetica-Bold').fontSize(10).text(`${num}. ${title}`, { continued: false });
  doc.font('Helvetica').fontSize(10).text(description, { lineGap: 2 });
  doc.moveDown(0.4);
}

// === HEADER ===
doc.moveDown(0.5);
heading("FINDER'S FEE AGREEMENT", 18);
doc.moveTo(72, doc.y).lineTo(540, doc.y).lineWidth(1).stroke();
doc.moveDown(1);

// === RECITALS ===
doc.font('Helvetica-Bold').fontSize(11).text('RECITALS', { align: 'center' });
doc.moveDown(0.5);

body('This Agreement is entered into as of [DATE] by and between:');
doc.moveDown(0.3);
doc.font('Helvetica-Bold').fontSize(10).text('FINDER: ', { continued: true });
doc.font('Helvetica').text('David Suarez ("Finder")');
body('Contact: david@iamdivid.com');
doc.moveDown(0.3);
doc.font('Helvetica-Bold').fontSize(10).text('PROPERTY OWNER / SELLER: ', { continued: true });
doc.font('Helvetica').text('[________________] ("Owner")');
doc.moveDown(0.3);
doc.font('Helvetica-Bold').fontSize(10).text('RE: ', { continued: true });
doc.font('Helvetica').text('Two (2) parcels of land located in Downtown Miami, Florida, with a combined estimated value of $11,500,000 (Eleven Million Five Hundred Thousand Dollars) (the "Property").');
doc.moveDown(0.5);

doc.moveTo(72, doc.y).lineTo(540, doc.y).lineWidth(0.5).stroke();
doc.moveDown(0.5);

// === TERMS ===
doc.font('Helvetica-Bold').fontSize(11).text('TERMS AND CONDITIONS', { align: 'center' });
doc.moveDown(0.5);

term('1', 'Engagement',
  'Owner engages Finder to identify and introduce qualified buyers, developers, or investors for the purpose of acquiring and/or developing the Property.');

term('2', "Finder's Fee",
  "In consideration of Finder's services, Owner agrees to pay Finder a fee equal to THREE PERCENT (3%) of the total gross purchase price of the Property at closing. Based on the current estimated value, the Finder's Fee is approximately $345,000 (Three Hundred Forty-Five Thousand Dollars). Fee applies to any transaction involving the Property or substantially similar transaction with any party introduced by Finder.");

term('3', 'Payment Terms',
  "The Finder's Fee shall be due and payable at closing, disbursed from the closing proceeds through the title company or escrow agent handling the transaction.");

term('4', 'Tail Period',
  "If the Property is sold or transferred to any party introduced by Finder within TWENTY-FOUR (24) months following the termination of this Agreement, the Finder's Fee shall still be owed and payable to Finder.");

term('5', 'Introduced Parties',
  'Finder shall provide Owner with written notice (email acceptable) of each party introduced. Owner agrees not to circumvent Finder by dealing directly with any introduced party without Finder\'s involvement.');

term('6', 'Non-Circumvention',
  "Owner agrees not to circumvent, avoid, bypass, or obviate Finder, directly or indirectly, to avoid payment of the Finder's Fee. This includes any affiliates, subsidiaries, partners, or assigns of any introduced party.");

term('7', 'Exclusivity',
  'This agreement is [   ] Exclusive  /  [   ] Non-Exclusive for a period of [______] months.');

term('8', 'Expenses',
  'Each party shall bear their own costs and expenses. Finder shall not be responsible for any costs related to due diligence, legal fees, inspections, or closing costs.');

term('9', 'Independent Contractor',
  "Finder is acting as an independent contractor and not as a licensed real estate broker. Finder's role is limited to introducing parties. Finder makes no representations regarding the Property's value, condition, or suitability.");

term('10', 'Governing Law',
  'This Agreement shall be governed by the laws of the State of Florida.');

term('11', 'Entire Agreement',
  'This Agreement constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, or agreements.');

term('12', 'Dispute Resolution',
  'Any disputes arising under this Agreement shall be resolved through binding arbitration in Miami-Dade County, Florida, in accordance with the rules of the American Arbitration Association.');

term('13', 'Severability',
  'If any provision is found to be unenforceable, the remaining provisions shall remain in full force and effect.');

// === SIGNATURE BLOCKS ===
if (doc.y > 520) doc.addPage();
doc.moveDown(1);
doc.moveTo(72, doc.y).lineTo(540, doc.y).lineWidth(0.5).stroke();
doc.moveDown(1);

doc.font('Helvetica-Bold').fontSize(11).text('SIGNATURES', { align: 'center' });
doc.moveDown(1);

// Finder signature
doc.font('Helvetica-Bold').fontSize(10).text('FINDER:');
doc.moveDown(1.5);
doc.moveTo(72, doc.y).lineTo(300, doc.y).lineWidth(0.5).stroke();
doc.moveDown(0.2);
doc.font('Helvetica').fontSize(10).text('David Suarez');
doc.moveDown(0.3);
doc.text('Date: ___________________');
doc.text('Email: david@iamdivid.com');
doc.moveDown(1);

// Owner signature
doc.font('Helvetica-Bold').fontSize(10).text('OWNER:');
doc.moveDown(1.5);
doc.moveTo(72, doc.y).lineTo(300, doc.y).lineWidth(0.5).stroke();
doc.moveDown(0.2);
doc.font('Helvetica').fontSize(10).text('Name: ___________________');
doc.moveDown(0.3);
doc.text('Date: ___________________');
doc.text('Email: ___________________');

// === DISCLAIMER ===
doc.moveDown(2);
doc.font('Helvetica-Oblique').fontSize(7.5).fillColor('#555555')
  .text('This document is a template and does not constitute legal advice. Parties are advised to consult with a licensed attorney before executing this agreement.', {
    align: 'center'
  });

// === FOOTERS ===
const pages = doc.bufferedPageRange();
for (let i = 0; i < pages.count; i++) {
  doc.switchToPage(i);
  doc.font('Helvetica').fontSize(8).fillColor('#888888');
  doc.text(
    `Finder's Fee Agreement — Downtown Miami Land Assemblage — Page ${i + 1}`,
    72, 750, { align: 'center', width: W }
  );
}

doc.end();
out.on('finish', () => console.log('PDF generated successfully.'));
