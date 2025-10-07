const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = './vantyx commercial v1.0 draft.pdf';
const outputPath = './vantyx_extracted.txt';

fs.readFile(pdfPath, (err, dataBuffer) => {
  if (err) {
    console.error('Error reading PDF:', err);
    process.exit(1);
  }

  pdf(dataBuffer).then((data) => {
    fs.writeFile(outputPath, data.text, (err) => {
      if (err) {
        console.error('Error writing text file:', err);
        process.exit(1);
      }
      console.log(`Extracted text saved to ${outputPath}`);
      console.log(`Total pages: ${data.numpages}`);
    });
  }).catch((error) => {
    console.error('Error parsing PDF:', error);
    process.exit(1);
  });
});
