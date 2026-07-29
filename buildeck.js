const pptxgen = require("pptxgenjs");
const path = require("path");

const DOCS = path.join(__dirname, "..", "docs");

// --- design tokens -----------------------------------------------------
const COLOR = {
  bg: "121A2B",       // deep indigo, matches a "lattice at night" feel
  panel: "1B2740",    // slightly lighter panel background
  panelLine: "2C3A5A",
  cyan: "5EEAD4",      // quantum / entanglement accent
  amber: "F5B942",     // risk / attention accent
  red: "FF6B6B",       // critical risk
  text: "EDF1F7",
  muted: "8291AD",
  white: "FFFFFF",
};

const FONT_DISPLAY = "Georgia";
const FONT_BODY = "Arial";
const FONT_MONO = "Consolas";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.3 x 7.5 in
const W = 13.3;
const H = 7.5;

function background(slide) {
  slide.background = { color: COLOR.bg };
}

function dotLattice(slide, opts) {
  // a quiet lattice-of-dots pattern, standing in for the "accent stripe"
  // this project keeps referring back to: the lattice structure Kyber
  // and Dilithium are literally built on.
  const { x0, y0, cols, rows, gap, r } = opts;
  for (let c = 0; c < cols; c++) {
    for (let r2 = 0; r2 < rows; r2++) {
      slide.addShape("ellipse", {
        x: x0 + c * gap, y: y0 + r2 * gap, w: r, h: r,
        fill: { color: COLOR.panelLine },
        line: { type: "none" },
      });
    }
  }
}

function footer(slide, label) {
  slide.addText(label, {
    x: 0.5, y: H - 0.45, w: W - 1, h: 0.3,
    fontFace: FONT_MONO, fontSize: 9, color: COLOR.muted,
  });
  slide.addText("pqc-migration-toolkit", {
    x: W - 3.3, y: H - 0.45, w: 2.8, h: 0.3,
    fontFace: FONT_MONO, fontSize: 9, color: COLOR.muted, align: "right",
  });
}

function kicker(slide, text) {
  slide.addText(text.toUpperCase(), {
    x: 0.6, y: 0.5, w: 8, h: 0.35,
    fontFace: FONT_MONO, fontSize: 12, color: COLOR.cyan, charSpacing: 2,
  });
}

function heading(slide, text, y = 0.85) {
  slide.addText(text, {
    x: 0.6, y, w: 12.0, h: 0.8,
    fontFace: FONT_DISPLAY, fontSize: 30, bold: true, color: COLOR.text,
  });
}

function codeBlock(slide, lines, opts) {
  const { x, y, w, h, fontSize = 12 } = opts;
  slide.addShape("roundRect", {
    x, y, w, h, rectRadius: 0.08,
    fill: { color: COLOR.panel }, line: { color: COLOR.panelLine, width: 1 },
  });
  slide.addText(lines.map((l) => ({ text: l, options: { breakLine: true } })), {
    x: x + 0.25, y: y + 0.2, w: w - 0.5, h: h - 0.4,
    fontFace: FONT_MONO, fontSize, color: COLOR.text, valign: "top",
    lineSpacingMultiple: 1.25,
  });
}

// --- Slide 1: Title -----------------------------------------------------
{
  const slide = pres.addSlide();
  background(slide);
  dotLattice(slide, { x0: 9.6, y0: 0.6, cols: 8, rows: 10, gap: 0.42, r: 0.05 });

  slide.addText("PROJECT-Q 30-DAY QUANTUM COMPUTING CHALLENGE", {
    x: 0.7, y: 1.5, w: 9, h: 0.4,
    fontFace: FONT_MONO, fontSize: 13, color: COLOR.cyan, charSpacing: 2,
  });
  slide.addText("Post-Quantum Cryptography\nMigration Toolkit", {
    x: 0.7, y: 2.0, w: 9.5, h: 2.0,
    fontFace: FONT_DISPLAY, fontSize: 42, bold: true, color: COLOR.text, lineSpacingMultiple: 1.05,
  });
  slide.addText("Capstone wrap-up: Day 29 (Finalization) and Day 30 (Portfolio & Submission)", {
    x: 0.7, y: 4.0, w: 9, h: 0.5,
    fontFace: FONT_BODY, fontSize: 16, color: COLOR.muted,
  });
  slide.addText("28 July 2026", {
    x: 0.7, y: 6.6, w: 4, h: 0.4,
    fontFace: FONT_MONO, fontSize: 12, color: COLOR.muted,
  });
}

// --- Slide 2: Agenda -----------------------------------------------------
{
  const slide = pres.addSlide();
  background(slide);
  kicker(slide, "Agenda");
  heading(slide, "Two days, two jobs");

  const rows = [
    ["Day 29", "27 Jul", "Finalize documentation, regenerate diagrams from live code, capture real output, build this deck"],
    ["Day 30", "28 Jul", "Run the final review checklist, clean up the repository, publish, submit"],
  ];
  let y = 2.1;
  rows.forEach(([day, date, desc]) => {
    slide.addShape("roundRect", {
      x: 0.6, y, w: 12.1, h: 1.5, rectRadius: 0.08,
      fill: { color: COLOR.panel }, line: { color: COLOR.panelLine, width: 1 },
    });
    slide.addText(day, { x: 0.9, y: y + 0.2, w: 2, h: 0.5, fontFace: FONT_DISPLAY, fontSize: 22, bold: true, color: COLOR.cyan });
    slide.addText(date, { x: 0.9, y: y + 0.75, w: 2, h: 0.4, fontFace: FONT_MONO, fontSize: 12, color: COLOR.muted });
    slide.addText(desc, { x: 3.2, y: y + 0.25, w: 9.2, h: 1.0, fontFace: FONT_BODY, fontSize: 15, color: COLOR.text, valign: "middle" });
    y += 1.9;
  });
  footer(slide, "day29-30 / agenda");
}

// --- Slide 3: Day 29 - Documentation & Architecture ---------------------
{
  const slide = pres.addSlide();
  background(slide);
  kicker(slide, "Day 29 -- Finalization");
  heading(slide, "Documentation regenerated from the live code");
  slide.addText(
    "scripts/generate_diagrams.py rebuilds every diagram straight from the current pipeline and circuit, " +
    "so the README can never drift out of sync with what the code actually does.",
    { x: 0.6, y: 1.7, w: 12.1, h: 0.6, fontFace: FONT_BODY, fontSize: 13, color: COLOR.muted }
  );
  slide.addImage({ path: path.join(DOCS, "architecture.png"), x: 0.6, y: 2.5, w: 12.1, h: 5.5 * (1000/2200) });
  footer(slide, "docs/architecture.png");
}

// --- Slide 4: Quantum circuit + histogram --------------------------------
{
  const slide = pres.addSlide();
  background(slide);
  kicker(slide, "Day 29 -- Finalization");
  heading(slide, "The entropy circuit, drawn by Qiskit itself");
  slide.addImage({ path: path.join(DOCS, "quantum_circuit.png"), x: 0.6, y: 1.9, w: 6.6, h: 6.6 * (477/997) });
  slide.addImage({ path: path.join(DOCS, "entropy_histogram.png"), x: 7.5, y: 1.7, w: 5.2, h: 5.2 * (937/1260) });
  slide.addText(
    "H then CNOT entangles q0/q1, so an ideal run only ever lands on 00 or 11. " +
    "This 1024-shot simulator run split roughly 50/50 between them, exactly as expected.",
    { x: 0.6, y: 6.6, w: 12.1, h: 0.6, fontFace: FONT_BODY, fontSize: 13, color: COLOR.muted }
  );
  footer(slide, "src/quantum/circuit_builder.py");
}

// --- Slide 5: Pipeline run screenshot + code -----------------------------
{
  const slide = pres.addSlide();
  background(slide);
  kicker(slide, "Day 29 -- Finalization");
  heading(slide, "End to end: scan, score, migrate, sign");
  slide.addImage({ path: path.join(DOCS, "screenshot_pipeline_run.png"), x: 0.6, y: 1.8, w: 12.1, h: 12.1 * (608/1180) });
  codeBlock(slide, [
    "python src/main.py \\",
    "  --manifest sample_data/key_inventory.json \\",
    "  --output logs/audit_report.json",
  ], { x: 0.6, y: 6.35, w: 12.1, h: 0.9, fontSize: 13 });
  footer(slide, "src/main.py");
}

// --- Slide 6: Test suite --------------------------------------------------
{
  const slide = pres.addSlide();
  background(slide);
  kicker(slide, "Day 29 -- Finalization");
  heading(slide, "12 tests, covering risk scoring, Kyber, Dilithium, and the circuit");
  slide.addImage({ path: path.join(DOCS, "screenshot_test_run.png"), x: 1.2, y: 1.9, w: 10.9, h: 10.9 * (520/1180) });
  footer(slide, "python -m pytest tests/ -v");
}

// --- Slide 7: Day 30 - Final review checklist ----------------------------
{
  const slide = pres.addSlide();
  background(slide);
  kicker(slide, "Day 30 -- Portfolio & Submission");
  heading(slide, "A script does the pre-submission review, not memory");
  slide.addText(
    "scripts/final_review.py checks that every required file exists, the test suite is green, the " +
    "signed audit report still verifies, and there are no leftover TODOs before anything gets published.",
    { x: 0.6, y: 1.7, w: 12.1, h: 0.7, fontFace: FONT_BODY, fontSize: 13, color: COLOR.muted }
  );
  slide.addImage({ path: path.join(DOCS, "screenshot_final_review.png"), x: 1.4, y: 2.7, w: 10.5, h: 10.5 * (256/1180) });
  footer(slide, "scripts/final_review.py");
}

// --- Slide 8: Repository structure ---------------------------------------
{
  const slide = pres.addSlide();
  background(slide);
  kicker(slide, "Day 30 -- Portfolio & Submission");
  heading(slide, "Repository, organized for a reviewer, not just for me");
  codeBlock(slide, [
    "pqc-migration-toolkit/",
    "  README.md               overview, architecture, how to run",
    "  requirements.txt",
    "  docs/                   diagrams + output screenshots",
    "  sample_data/            example key inventory manifest",
    "  src/",
    "    analyzer/             scanner.py, risk_matrix.py",
    "    crypto/                kyber_wrapper.py, dilithium_wrapper.py",
    "    quantum/               circuit_builder.py, ibm_backend.py",
    "    main.py",
    "  scripts/                 generate_diagrams.py, final_review.py",
    "  logs/                   audit_report.json, run output",
    "  tests/                  test_analyzer.py, test_crypto.py",
  ], { x: 0.9, y: 1.8, w: 11.5, h: 5.0, fontSize: 13.5 });
  footer(slide, "final layout, published to GitHub");
}

// --- Slide 9: Closing summary ---------------------------------------------
{
  const slide = pres.addSlide();
  background(slide);
  dotLattice(slide, { x0: 0.6, y0: 5.4, cols: 10, rows: 4, gap: 0.4, r: 0.05 });
  kicker(slide, "Wrap-up");
  heading(slide, "What the 7-day capstone actually produced");

  const stats = [
    ["8", "keys scanned in the sample inventory"],
    ["6", "flagged and migrated to ML-KEM-768"],
    ["12", "passing tests across risk scoring and crypto"],
    ["1", "signed, self-verifying ML-DSA audit report"],
  ];
  let x = 0.6;
  stats.forEach(([n, label]) => {
    slide.addText(n, { x, y: 2.0, w: 2.9, h: 1.0, fontFace: FONT_DISPLAY, fontSize: 44, bold: true, color: COLOR.cyan, align: "center" });
    slide.addText(label, { x, y: 3.0, w: 2.9, h: 0.9, fontFace: FONT_BODY, fontSize: 12, color: COLOR.muted, align: "center" });
    x += 3.05;
  });

  slide.addText(
    "Next: rotate the sample manifest for a real inventory, wire --hardware into a CI job with a stored " +
    "IBM Quantum token, and keep the risk table updated as NIST finalizes more PQC parameter sets.",
    { x: 0.6, y: 4.5, w: 12.1, h: 0.8, fontFace: FONT_BODY, fontSize: 14, color: COLOR.text }
  );
  footer(slide, "submitted 28 Jul 2026");
}

const OUT = path.join(__dirname, "..", "Day29_30_Submission_Deck.pptx");
pres.writeFile({ fileName: OUT }).then(() => console.log("wrote " + OUT));