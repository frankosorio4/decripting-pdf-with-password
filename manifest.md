# Project Context:

> This file is intended to give a quick context about the project at the start of a new conversation, reducing the need to re-explain the architecture, rules, and conventions from scratch.

## PHASE 1: OPERATIONAL INSTRUCTIONS
- Read `manifest.md` at the start of every session for general context.
- When a feature is finished and approved, provide a professional commit name.
- Before committing, summarize changes in `history.md`. This is a historical record; never modify past entries.
- Before committing, update `manifest.md` with new architectural changes. Keep it dense and concise to save tokens.
- Update `readme.md` only if the project's high-level setup changes.
- Think before acting: Read existing files before writing code.
- Be concise in output but thorough in reasoning.
- Do not re-read files you have already accessed unless they have changed.
- Test your code before declaring a task "done."
- No sycophantic openers or closing fluff.
- Keep solutions simple and direct.
- User instructions always override this file.
- Do not proceed until the user gives specific instructions. Do not commit or push anything without authorization.

## What This Project Does
A web-based local PDF Password Remover. It provides a secure, privacy-first interface where users can upload password-protected PDF files to be decrypted locally using the `qpdf` engine.

## Tech Stack
- **Language/Runtime:** JavaScript (CommonJS), Node.js
- **Framework:** Express v4
- **Security:** Helmet v8
- **File Handling:** Multer (multipart/form-data)
- **Decryption:** `qpdf` (v12.3.2) - OS-aware execution (bundled binary for Windows, system-level for Linux)
- **Development:** Nodemon (restarts on changes)
- **Documentation:** Markdown with Mermaid diagrams

## File Architecture
```
Copy-unlock-pdf/
├── bin/
│   └── qpdf.exe         # Bundled binary for Windows
├── downloads/           # Temp storage for decrypted files
├── uploads/             # Temp storage for uploaded files
├── node_modules/
├── package.json
├── server.js            # Express server, routes, decryption logic (OS-aware)
└── README.md
```

## Running the Application
- **Production:** `npm start`
- **Development:** `npm run dev` (uses `nodemon`)
