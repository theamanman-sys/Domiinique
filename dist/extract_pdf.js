const fs = require('fs');
const PDFParse = require('pdf-parse').PDFParse;
if(!PDFParse) {
  // Try default import
  const pdflib = require('pdf-parse');
  // Sometimes it's default
  (pdflib.default || pdflib)(fs.readFileSync('assets/DOMIINIQUE INTEGRATION .pdf')).then(d => {
      fs.writeFileSync('integration_pdf_text.txt', d.text);
      console.log('done via default');
  });
} else {
    PDFParse(fs.readFileSync('assets/DOMIINIQUE INTEGRATION .pdf')).then(d => {
        fs.writeFileSync('integration_pdf_text.txt', d.text);
        console.log('done via PDFParse');
    });
}
