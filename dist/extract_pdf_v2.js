const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('assets/DOMIINIQUE INTEGRATION .pdf');

pdf(dataBuffer).then(function(data) {
    fs.writeFileSync('integration_pdf_text.txt', data.text);
    console.log('PDF text extracted to integration_pdf_text.txt');
}).catch(err => {
    console.error('Error extracting PDF:', err);
});
