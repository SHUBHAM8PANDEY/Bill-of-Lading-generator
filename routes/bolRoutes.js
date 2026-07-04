const express = require("express");
const router = express.Router();

const defaultData = require("../utils/defaultData");
const { generateBolPDF } = require("../utils/generatePDF");

// GET: show the fill-in form (pre-filled with default/sample values)
router.get("/", (req, res) => {
  const viewData = {
    ...defaultData,
    termsColumn1Text: defaultData.termsColumn1.join("\n\n"),
    termsColumn2Text: defaultData.termsColumn2.join("\n\n"),
    termsColumn3Text: defaultData.termsColumn3.join("\n\n"),
  };
  res.render("index", { data: viewData, error: null });
});

// POST: user submits form -> stream back a single-page A4 PDF for download
router.post("/download-pdf", (req, res) => {
  try {
    const formData = { ...defaultData, ...req.body };

    // The form sends each of the 3 terms-page columns as its own
    // textarea (clauses separated by a blank line). Convert each
    // back into an array of clauses for the PDF generator.
    ["termsColumn1", "termsColumn2", "termsColumn3"].forEach((key) => {
      const textKey = `${key}Text`;
      if (typeof req.body[textKey] === "string") {
        formData[key] = req.body[textKey]
          .split(/\n\s*\n/)
          .map((c) => c.trim())
          .filter(Boolean);
      }
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Bill-of-Lading-${Date.now()}.pdf"`
    );

    const doc = generateBolPDF(formData);
    doc.pipe(res);
    doc.end();
  } catch (err) {
    console.error("PDF generation failed:", err);
    res.status(500).render("index", {
      data: { ...defaultData, ...req.body },
      error: "PDF generate karte waqt error aayi. Dobara try karein.",
    });
  }
});

module.exports = router;
