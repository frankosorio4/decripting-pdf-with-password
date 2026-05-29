const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const app = express();
const PORT = 3000;

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

if (!fs.existsSync('downloads')) {
  fs.mkdirSync('downloads');
}

// Path to bundled qpdf binary
const QPDF_PATH = path.join(__dirname, 'bin', 'qpdf.exe');

// Verify qpdf at startup
try {
  execSync(`"${QPDF_PATH}" --version`, { stdio: 'ignore' });
  console.log('qpdf detected successfully at:', QPDF_PATH);
} catch (error) {
  console.error('CRITICAL ERROR: qpdf not found at:', QPDF_PATH);
  process.exit(1);
}

// Serve the HTML page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>PDF Password Remover</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .container {
          background: white;
          border-radius: 10px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          padding: 40px;
          max-width: 500px;
          width: 100%;
        }

        h1 {
          color: #333;
          margin-bottom: 10px;
          text-align: center;
        }

        .subtitle {
          color: #666;
          text-align: center;
          margin-bottom: 30px;
          font-size: 14px;
        }

        .form-group {
          margin-bottom: 25px;
        }

        label {
          display: block;
          color: #333;
          font-weight: 500;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .file-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px dashed #667eea;
          border-radius: 8px;
          padding: 30px 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #f8f9ff;
        }

        .file-input-wrapper:hover {
          border-color: #764ba2;
          background: #f0f2ff;
        }

        .file-input-wrapper input[type="file"] {
          display: none;
        }

        .file-input-text {
          text-align: center;
          color: #666;
          font-size: 14px;
        }

        .file-input-text.has-file {
          color: #667eea;
          font-weight: 500;
        }

        .file-input-icon {
          font-size: 28px;
          margin-bottom: 10px;
          display: block;
        }

        input[type="password"] {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.3s;
          font-family: Arial, sans-serif;
          letter-spacing: 0.5px;
        }

        input[type="password"]:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        button {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .message {
          margin-top: 20px;
          padding: 15px;
          border-radius: 6px;
          font-size: 14px;
          display: none;
          word-break: break-word;
        }

        .message.success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
          display: block !important;
        }

        .message.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
          display: block;
        }

        .message.info {
          background: #d1ecf1;
          color: #0c5460;
          border: 1px solid #bee5eb;
          display: block;
        }

        .file-input-wrapper.is-valid {
          border-color: #28a745 !important;
          background: #e6ffed !important;
        }

        .loading-state {
          opacity: 0.7;
          pointer-events: none;
        }

        .message.success .checkmark {
          font-size: 40px;
          display: block;
          margin-bottom: 10px;
          color: #28a745;
        }

        .download-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          margin-top: 15px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .download-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 10px rgba(102, 126, 234, 0.3);
        }

        .download-btn svg {
          width: 16px;
          height: 16px;
        }

        .loading {
          display: none;
          text-align: center;
          margin-top: 10px;
        }

        .spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #667eea;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
          margin: 0 auto 10px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔓 PDF Password Remover</h1>
        <p class="subtitle">Remove password protection from your PDF files</p>

        <form id="form">
          <div class="form-group">
            <label for="pdfFile">Select PDF File</label>
            <div class="file-input-wrapper" onclick="document.getElementById('pdfFile').click()">
              <input type="file" id="pdfFile" name="pdf" accept=".pdf" required>
              <div class="file-input-text">
                <span class="file-input-icon">📄</span>
                <span>Click to select or drag and drop your PDF</span>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="password">PDF Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              placeholder="Enter your PDF password" 
              required
            >
          </div>

          <button type="submit" id="submitBtn">Remove Password</button>

          <div class="loading" id="loading">
            <div class="spinner"></div>
            <p>Processing your PDF...</p>
          </div>

          <div class="message" id="message"></div>
        </form>
      </div>

      <script>
        const form = document.getElementById('form');
        const fileInput = document.getElementById('pdfFile');
        const passwordInput = document.getElementById('password');
        const submitBtn = document.getElementById('submitBtn');
        const message = document.getElementById('message');
        const loading = document.getElementById('loading');
        const fileInputWrapper = document.querySelector('.file-input-wrapper');
        const fileInputText = document.querySelector('.file-input-text');

        // File input change handler
        fileInput.addEventListener('change', (e) => {
          const fileName = e.target.files[0]?.name || '';
          if (fileName) {
            fileInputText.textContent = '✓ ' + fileName;
            fileInputText.classList.add('has-file');
            fileInputWrapper.classList.add('is-valid');
          }
        });

        // Drag and drop
        fileInputWrapper.addEventListener('dragover', (e) => {
          e.preventDefault();
          fileInputWrapper.style.borderColor = '#764ba2';
          fileInputWrapper.style.background = '#f0f2ff';
        });

        fileInputWrapper.addEventListener('dragleave', () => {
          fileInputWrapper.style.borderColor = '#667eea';
          fileInputWrapper.style.background = '#f8f9ff';
        });

        fileInputWrapper.addEventListener('drop', (e) => {
          e.preventDefault();
          const files = e.dataTransfer.files;
          if (files[0]?.type === 'application/pdf' || files[0]?.name.endsWith('.pdf')) {
            fileInput.files = files;
            fileInputText.textContent = '✓ ' + files[0].name;
            fileInputText.classList.add('has-file');
            fileInputWrapper.classList.add('is-valid');
          } else {
            showMessage('Only PDF files are allowed', 'error');
          }
          fileInputWrapper.style.borderColor = '#667eea';
          fileInputWrapper.style.background = '#f8f9ff';
        });

        // Form submission
        form.addEventListener('submit', async (e) => {
          e.preventDefault();

          const file = fileInput.files[0];
          const password = passwordInput.value;

          if (!file) {
            showMessage('Please select a PDF file', 'error');
            return;
          }

          if (!password) {
            showMessage('Please enter the password', 'error');
            return;
          }

          const formData = new FormData();
          formData.append('pdf', file);
          formData.append('password', password);

          submitBtn.disabled = true;
          form.classList.add('loading-state');
          loading.style.display = 'block';
          message.style.display = 'none';

          try {
            const response = await fetch('/decrypt', {
              method: 'POST',
              body: formData
            });

            const data = await response.json();
            console.log('Server response:', data);

            if (response.ok) {
              const downloadHtml = 
                '<a href="' + data.downloadUrl + '" class="download-btn">' +
                  '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
                    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>' +
                  '</svg>' +
                  'Download: ' + data.filename +
                '</a>';
              
              showMessage(
                '<span class="checkmark">✓</span> Password removed successfully!<br>' + downloadHtml,
                'success'
              );
              form.reset();
              fileInputText.textContent = 'Click to select or drag and drop your PDF';
              fileInputText.classList.remove('has-file');
              fileInputWrapper.classList.remove('is-valid');
            } else {
              showMessage(data.error || 'An error occurred', 'error');
            }
          } catch (error) {
            showMessage('Error: ' + error.message, 'error');
          } finally {
            submitBtn.disabled = false;
            form.classList.remove('loading-state');
            loading.style.display = 'none';
          }
        });

        function showMessage(text, type) {
          console.log('Showing message:', text, 'Type:', type);
          message.innerHTML = text;
          message.className = 'message ' + type;
          message.style.display = 'block'; // Ensure it's visible
        }
      </script>
    </body>
    </html>
  `);
});

// API endpoint for decrypting PDFs
app.post('/decrypt', upload.single('pdf'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const password = req.body.password;
    if (!password) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Password not provided' });
    }

    const inputFile = req.file.path;
    const outputFilename = `${path.parse(req.file.originalname).name}_unlocked.pdf`;
    const outputPath = path.join('downloads', outputFilename);

    try {
      // Execute qpdf command
      execSync(`"${QPDF_PATH}" --password="${password.replace(/"/g, '\\"')}" --decrypt "${inputFile}" "${outputPath}"`, {
        stdio: 'pipe'
      });

      // Clean up uploaded file
      fs.unlinkSync(inputFile);

      res.json({
        success: true,
        filename: outputFilename,
        downloadUrl: `/download/${outputFilename}`
      });
    } catch (error) {
      // Clean up files
      if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

      // Specific check for qpdf error
      if (error.code === 'ENOENT' || error.message.includes('qpdf')) {
        res.status(500).json({
          error: 'Server error: The decryption tool (qpdf) is not configured correctly in the server/bin directory.'
        });
      } else {
        res.status(400).json({
          error: 'Failed to decrypt PDF. The password may be incorrect or the file may be corrupted.'
        });
      }
    }
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
});

// Download endpoint
app.get('/download/:filename', (req, res) => {
  const filepath = path.join('downloads', req.params.filename);
  
  // Security check - prevent directory traversal
  if (!path.resolve(filepath).startsWith(path.resolve('downloads'))) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (fs.existsSync(filepath)) {
    res.download(filepath, () => {
      // Delete file after download
      setTimeout(() => {
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
      }, 1000);
    });
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 PDF Password Remover running at http://localhost:${PORT}`);
  console.log('Open your browser and go to http://localhost:3000\n');
});