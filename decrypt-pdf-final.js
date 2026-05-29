#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const pdfParse = require('pdf-parse');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to prompt user
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function decryptPDF() {
  console.log('\n=== PDF Password Remover ===\n');

  try {
    // Get input file name
    const inputFile = await prompt('Enter the PDF filename (e.g., document.pdf): ');
    
    // Check if file exists
    if (!fs.existsSync(inputFile)) {
      console.error(`Error: File '${inputFile}' not found in current directory.`);
      process.exit(1);
    }

    // Get password
    const password = await prompt('Enter the PDF password: ');

    // Get output file name (optional)
    let outputFile = await prompt('Enter output filename (press Enter for "[original]_unlocked.pdf"): ');
    
    if (!outputFile) {
      const baseName = path.parse(inputFile).name;
      const ext = path.parse(inputFile).ext;
      outputFile = `${baseName}_unlocked${ext}`;
    }

    console.log(`\nProcessing: ${inputFile} -> ${outputFile}`);

    // Read the PDF file
    const pdfBuffer = fs.readFileSync(inputFile);

    // Parse the PDF with password
    const data = await pdfParse(pdfBuffer, { password: password });

    // Write the decrypted content back
    fs.writeFileSync(outputFile, pdfBuffer);

    console.log(`\n✓ Successfully processed PDF!`);
    console.log(`✓ Output saved to: ${outputFile}`);
    console.log(`✓ Pages in PDF: ${data.numpages}`);

  } catch (error) {
    console.error('\n✗ Error processing PDF:');
    console.error(error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the script
decryptPDF().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});