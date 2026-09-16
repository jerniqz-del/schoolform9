# School Form 9 Maker — tooling

Command-line tooling to fill the School Form 9 (Learner's Progress Report) `.docx`
templates in this repository with learner data and, optionally, render the result
to PDF.

The templates use [docxtemplater](https://docxtemplater.com/) tag syntax:

- `{field}` — simple text substitution (e.g. `{Name}`, `{schoolYear}`).
- `{#students}` … `{/students}` — a loop that repeats the report for each learner.
- `{%logo}` — an image tag (rendered via a docxtemplater image module).

## Requirements

- Node.js 18+ (`npm ci` installs the pinned dependencies).
- LibreOffice (`soffice` on `PATH`) — only needed for the optional `--pdf` rendering.

## Install

```bash
cd tools
npm ci
```

## Usage

```bash
node generate.js \
  --template "../Grade One.docx" \
  --data sample-data.json \
  --out out/Grade-One-filled.docx \
  --pdf
```

- `--template` — a School Form 9 `.docx` template from the repository root.
- `--data` — a JSON file whose keys match the template tags (see `sample-data.json`).
- `--out` — the generated `.docx` path.
- `--pdf` — also render a PDF next to the `.docx` using LibreOffice.

If a learner record does not supply its own `logo` file path, the `{%logo}` tag
falls back to the first image already embedded in the template.

## Quick demo

```bash
npm run demo
```

This fills `../Grade One.docx` with `sample-data.json` and writes both a `.docx`
and a `.pdf` into `out/`.
