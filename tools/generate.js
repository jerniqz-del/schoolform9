#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const ImageModule = require("@slosarek/docxtemplater-image-module-free");

function usage() {
  console.error(
    [
      "School Form 9 Maker",
      "",
      "Usage:",
      "  node generate.js --template <template.docx> --data <data.json> --out <out.docx> [--pdf]",
      "",
      "Options:",
      "  --template  Path to a School Form 9 .docx template (docxtemplater syntax).",
      "  --data      Path to a JSON file with the values to fill in.",
      "  --out       Output .docx path.",
      "  --pdf       Also render the output to PDF via LibreOffice (soffice).",
      "",
      "The '{%logo}' image tag falls back to the first image embedded in the",
      "template when a record does not provide its own 'logo' file path.",
    ].join("\n")
  );
  process.exit(1);
}

function parseArgs(argv) {
  const args = { pdf: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--pdf") args.pdf = true;
    else if (a === "--template") args.template = argv[++i];
    else if (a === "--data") args.data = argv[++i];
    else if (a === "--out") args.out = argv[++i];
    else usage();
  }
  if (!args.template || !args.data || !args.out) usage();
  return args;
}

function firstEmbeddedImage(zip) {
  const names = Object.keys(zip.files).filter((n) =>
    /^word\/media\/.*\.(png|jpe?g|gif|bmp)$/i.test(n)
  );
  if (names.length === 0) return null;
  return zip.file(names.sort()[0]).asNodeBuffer();
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  const templateBuf = fs.readFileSync(args.template, "binary");
  const zip = new PizZip(templateBuf);
  const fallbackLogo = firstEmbeddedImage(zip);

  const imageModule = new ImageModule({
    centered: false,
    getImage(tagValue) {
      if (typeof tagValue === "string" && tagValue.length && fs.existsSync(tagValue)) {
        return fs.readFileSync(tagValue);
      }
      if (fallbackLogo) return fallbackLogo;
      throw new Error(
        "No image available for a '{%...}' tag: provide a valid file path in the data " +
          "or use a template that embeds a fallback image."
      );
    },
    getSize() {
      return [90, 90];
    },
    getProps() {
      return null;
    },
  });

  const doc = new Docxtemplater(zip, {
    modules: [imageModule],
    paragraphLoop: true,
    linebreaks: true,
  });

  const data = JSON.parse(fs.readFileSync(args.data, "utf-8"));
  doc.render(data);

  const outBuf = doc
    .getZip()
    .generate({ type: "nodebuffer", compression: "DEFLATE" });
  fs.mkdirSync(path.dirname(path.resolve(args.out)) || ".", { recursive: true });
  fs.writeFileSync(args.out, outBuf);

  const students = Array.isArray(data.students) ? data.students.length : 1;
  console.log(`Generated ${students} report card(s) -> ${args.out}`);

  if (args.pdf) {
    const outDir = path.dirname(path.resolve(args.out));
    execFileSync(
      "soffice",
      ["--headless", "--convert-to", "pdf", "--outdir", outDir, path.resolve(args.out)],
      { stdio: "inherit" }
    );
    const pdfPath = args.out.replace(/\.docx$/i, ".pdf");
    console.log(`Rendered PDF -> ${pdfPath}`);
  }
}

main();
