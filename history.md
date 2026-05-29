# Changelog — PDF Password Remover

> Historical record of approved changes. Entries are append-only — never modify past entries.

---

## [1] — 2026-05-29 — `feat: implement OS-aware qpdf detection and robust file cleanup`

**Files changed:**
- `server.js` — implemented OS detection using `os.platform()`; refactored `QPDF_PATH` to dynamically switch between `bin/qpdf.exe` (Windows) and `qpdf` (Linux system-level); added validation at startup; updated `execSync` commands to be OS-safe; implemented UI enhancements (success/loading states) using CSS classes and DOM manipulation; fixed syntax issues with response message template rendering.
- `README.md` — updated with professional structure: Architecture (Mermaid), Tech Stack, detailed OS-specific setup instructions (Windows `bin/` vs Linux `apt`), and Technical Details (auto-purge behavior).
- `package.json` — added `nodemon` as dev dependency; added `dev` script.

**What:** Transformed a Windows-only, binary-dependent script into a portable, "OS-aware" web application. Added professional UX feedback (visual indicators, loading states) and explicit security/cleanup documentation.

**Why:** The original setup relied on a hardcoded Windows path and manual setup, making it unusable in other environments. The missing UX feedback left the user in the dark during processing.

**Design decisions:**
- `OS-Awareness`: Dynamic `QPDF_PATH` logic in `server.js` prevents code duplication while allowing cross-platform deployment.
- `Auto-Purge`: Logic in the download callback (`setTimeout` + `fs.unlinkSync`) ensures privacy by default.
- `README`: Explicit documentation of the `bin/` folder requirement and Linux `apt` installation provides a clear path for users.
- `Syntax fixes`: Replaced template literals with string concatenation inside `showMessage` to avoid JS engine errors in the server-sent HTML context.
