FROM node:22-bookworm-slim

# System tooling for working with the School Form 9 .docx templates:
# - libreoffice-writer + fonts: render/convert .docx <-> .pdf (soffice --headless)
# - poppler-utils: inspect and rasterize generated PDFs (pdfinfo, pdftotext, pdftoppm)
# - git/curl: required in fully custom images
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        curl \
        ca-certificates \
        libreoffice-writer \
        poppler-utils \
        fonts-liberation \
        fonts-dejavu \
    && rm -rf /var/lib/apt/lists/*
