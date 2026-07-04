const PDFDocument = require("pdfkit");

// ----------------------------------------------------------------------
// This module draws the Bill of Lading / MTD form manually on a SINGLE
// A4 page using absolute coordinates. Every dynamic text block is drawn
// with a fixed { width, height, ellipsis:true } box so long user input
// never pushes PDFKit into auto-creating a second page.
// ----------------------------------------------------------------------

const PAGE_W = 595.28; // A4 width in points
const PAGE_H = 841.89; // A4 height in points
const MARGIN = 28;
const CONTENT_W = PAGE_W - MARGIN * 2;

function generateBolPDF(data) {
  const doc = new PDFDocument({
    size: "A4",
    margin: 0, // we manage all spacing manually
    autoFirstPage: true,
    bufferPages: true, // lets us hard-trim to 1 page at the end
  });

  const x0 = MARGIN;
  let y = MARGIN;

  // ---- helpers ---------------------------------------------------------
  function rect(x, y, w, h) {
    doc.rect(x, y, w, h).stroke("#000000");
  }

  function label(text, x, y, w) {
    doc
      .font("Helvetica")
      .fontSize(6.5)
      .fillColor("#333333")
      .text(text, x + 4, y + 3, { width: w - 8, height: 10, ellipsis: true });
  }

  function value(text, x, y, w, h, opts = {}) {
    doc
      .font("Helvetica")
      .fontSize(opts.size || 8.5)
      .fillColor("#000000")
      .text(text || "", x + 4, y + (opts.topPad !== undefined ? opts.topPad : 13), {
        width: w - 8,
        height: h - (opts.topPad !== undefined ? opts.topPad : 13) - 2,
        ellipsis: true,
        lineGap: 1,
      });
  }

  function boxWithLabel(labelText, val, x, y, w, h, opts = {}) {
    rect(x, y, w, h);
    label(labelText, x, y, w);
    value(val, x, y, w, h, opts);
  }

  // ---- ROW 1: Consigner/Shipper (left, tall) + Title/BL No + Company (right) ----
  const row1H = 160;
  const leftW = CONTENT_W * 0.54;
  const rightW = CONTENT_W - leftW;
  const rightX = x0 + leftW;

  boxWithLabel(
    "CONSIGNER/SHIPPER",
    data.consignerShipper,
    x0,
    y,
    leftW,
    row1H
  );

  // Right column split: title box (top) + company info box (bottom)
  const titleH = 50;
  rect(rightX, y, rightW, titleH);
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#000000")
    .text("BILL OF LADING", rightX + 8, y + 8, { width: rightW - 16 });
  doc
    .font("Helvetica")
    .fontSize(8)
    .text("OR MULTIMODAL TRANSPORT DOCUMENT", rightX + 8, y + 20, {
      width: rightW - 16,
    });
  // BL No sub-line
  doc.moveTo(rightX, y + 34).lineTo(rightX + rightW, y + 34).stroke();
  doc.font("Helvetica").fontSize(7).text("BILL OF LADING NO.", rightX + 8, y + 38);
  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .text(data.blNumber || "", rightX + 110, y + 37, { width: rightW - 118 });

  const companyBoxY = y + titleH;
  const companyBoxH = row1H - titleH;
  rect(rightX, companyBoxY, rightW, companyBoxH);

  // little logo circle placeholder
  doc.rect(rightX + 10, companyBoxY + 6, 26, 26).fillAndStroke("#2b2b2b", "#000000");
  doc
    .fillColor("#ffffff")
    .font("Helvetica-Bold")
    .fontSize(12)
    .text((data.companyName || "C").trim().charAt(0), rightX + 18, companyBoxY + 12);
  doc.fillColor("#000000");

  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .text(data.companyName, rightX + 45, companyBoxY + 8, { width: rightW - 55 });
  doc
    .font("Helvetica")
    .fontSize(6.5)
    .text(data.companyAddress, rightX + 8, companyBoxY + 22, {
      width: rightW - 16,
      align: "center",
    });
  doc
    .fontSize(6.5)
    .text(`GSTIN: ${data.companyGSTIN}`, rightX + 8, companyBoxY + 50, {
      width: rightW - 16,
      align: "center",
    });
  doc.text(data.companyReg, rightX + 8, companyBoxY + 60, {
    width: rightW - 16,
    align: "center",
  });
  doc.text(data.companyMTO, rightX + 8, companyBoxY + 70, {
    width: rightW - 16,
    align: "center",
  });
  doc.text(data.companyFMC, rightX + 8, companyBoxY + 80, {
    width: rightW - 16,
    align: "center",
  });
  doc.text(data.companySCAC, rightX + 8, companyBoxY + 90, {
    width: rightW - 16,
    align: "center",
  });

  y += row1H;

  // ---- ROW 2: Consignee (left) + boiler-plate terms paragraph (right) ----
  const row2H = 150;
  boxWithLabel("CONSIGNEE (OR ORDER)", data.consigneeOrder, x0, y, leftW, row2H);

  rect(rightX, y, rightW, row2H);
  const terms =
    "TAKEN IN CHARGE IN APPARENTLY GOOD CONDITION, HEREIN AT THE PLACE OF RECEIPT, FOR TRANSPORT AND DELIVERY AS MENTIONED ABOVE, UNLESS OTHERWISE STATED. THE MTO, IN ACCORDANCE WITH THE PROVISIONS CONTAINED IN THE MTD, UNDERTAKES TO PERFORM OR TO PROCURE THE PERFORMANCE OF THE MULTIMODAL TRANSPORT FROM THE PLACE AT WHICH THE GOODS ARE TAKEN IN CHARGE, TO THE PLACE DESIGNATED FOR DELIVERY AND ASSUMES THE RESPONSIBILITY FOR SUCH TRANSPORT. ONE OF THE MTD(S) MUST BE SURRENDERED, DULY ENDORSED IN EXCHANGE FOR THE GOODS IN WITNESS WHERE OF THE ORIGINAL MTD ALL THIS TENOR AND DATE HAVE BEEN SIGNED IN THE NUMBER INDICATED BELOW ONE OF WHICH BEING ACCOMPLISHED THE OTHER(S) TO BE VOID.";
  doc
    .font("Helvetica")
    .fontSize(6.3)
    .fillColor("#000000")
    .text(terms, rightX + 8, y + 6, {
      width: rightW - 16,
      height: row2H - 12,
      ellipsis: true,
      lineGap: 0.5,
    });

  y += row2H;

  // ---- ROW 3: Notify Address (left) + "For delivery please apply to" (right) ----
  const row3H = 70;
  boxWithLabel("NOTIFY ADDRESS", data.notifyAddress, x0, y, leftW, row3H);

  rect(rightX, y, rightW, row3H);
  label("FOR DELIVERY OF GOODS PLEASE APPLY TO:", rightX, y, rightW);
  value(data.forDeliveryApplyTo, rightX, y, rightW, row3H);

  y += row3H;

  // ---- ROW 4: Place of Acceptance | Port of Loading ----
  const row4H = 30;
  const half = CONTENT_W / 2;
  boxWithLabel("PLACE OF ACCEPTANCE", data.placeOfAcceptance, x0, y, half, row4H, {
    size: 8,
  });
  boxWithLabel(
    "PORT OF LOADING",
    data.portOfLoading,
    x0 + half,
    y,
    half,
    row4H,
    { size: 8 }
  );
  y += row4H;

  // ---- ROW 5: Port of Discharge | Place of Delivery ----
  const row5H = 30;
  boxWithLabel(
    "PORT OF DISCHARGE",
    data.portOfDischarge,
    x0,
    y,
    half,
    row5H,
    { size: 8 }
  );
  boxWithLabel(
    "PLACE OF DELIVERY",
    data.placeOfDelivery,
    x0 + half,
    y,
    half,
    row5H,
    { size: 8 }
  );
  y += row5H;

  // ---- ROW 6: Vessel & Voyage No. (full width) ----
  const row6H = 25;
  boxWithLabel(
    "VESSEL & VOYAGE NO.",
    data.vesselVoyageNo,
    x0,
    y,
    CONTENT_W,
    row6H,
    { size: 8, topPad: 12 }
  );
  y += row6H;

  // ---- ROW 7: Goods table header (5 columns) ----
  const headerH = 18;
  const colWidths = [
    CONTENT_W * 0.16, // container no
    CONTENT_W * 0.18, // marks and number
    CONTENT_W * 0.34, // description of goods
    CONTENT_W * 0.16, // gross weight
    CONTENT_W * 0.16, // measurement
  ];
  const headers = [
    "CONTAINER NO.(S).",
    "MARKS AND NUMBER",
    "DESCRIPTION OF GOODS",
    "GROSS WEIGHT",
    "MEASUREMENT",
  ];
  let cx = x0;
  headers.forEach((h, i) => {
    rect(cx, y, colWidths[i], headerH);
    doc
      .font("Helvetica-Bold")
      .fontSize(6.3)
      .text(h, cx + 3, y + 5, { width: colWidths[i] - 6, height: 10, ellipsis: true });
    cx += colWidths[i];
  });
  y += headerH;

  // ---- ROW 8: Goods data area (single tall box under table header) ----
  const goodsH = 140;
  cx = x0;
  const goodsValues = [
    data.containerNos,
    data.marksAndNumber,
    data.descriptionOfGoods,
    data.grossWeight,
    data.measurement,
  ];
  goodsValues.forEach((v, i) => {
    rect(cx, y, colWidths[i], goodsH);
    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor("#1a1a6e")
      .text(v || "", cx + 4, y + 8, {
        width: colWidths[i] - 8,
        height: goodsH - 14,
        ellipsis: true,
        lineGap: 1,
      });
    doc.fillColor("#000000");
    cx += colWidths[i];
  });
  y += goodsH;

  // ---- ROW 9: "Particulars above furnished by..." centered note ----
  const noteH = 20;
  rect(x0, y, CONTENT_W, noteH);
  doc
    .font("Helvetica")
    .fontSize(7)
    .text(
      "PARTICULARS ABOVE FURNISHED BY CONSIGNEE/ CONSIGNOR",
      x0,
      y + 6,
      { width: CONTENT_W, align: "center" }
    );
  y += noteH;

  // ---- ROW 10: Freight Term | Freight Payable At | No. of Original MTDs | Place & Date of Issue ----
  const row10H = 40;
  const fourColW = CONTENT_W / 4;
  const freightLabels = [
    ["FREIGHT TERM", data.freightTerm],
    ["FREIGHT PAYABLE AT", data.freightPayableAt],
    ["NUMBER OF ORIGINAL MTD (S)", data.numberOfOriginalMTDs],
    ["PLACE AND DATE OF ISSUE:", data.placeAndDateOfIssue],
  ];
  cx = x0;
  freightLabels.forEach(([lbl, val]) => {
    boxWithLabel(lbl, val, cx, y, fourColW, row10H, { size: 7.5 });
    cx += fourColW;
  });
  y += row10H;

  // ---- ROW 11: Other Particulars (left) + For: as agents for the carrier (right) ----
  const row11H = 70;
  const opW = CONTENT_W * 0.6;
  boxWithLabel(
    "OTHER PARTICULARS (IF ANY)",
    data.otherParticulars,
    x0,
    y,
    opW,
    row11H,
    { size: 7.5 }
  );

  const sigX = x0 + opW;
  const sigW = CONTENT_W - opW;
  rect(sigX, y, sigW, row11H);
  doc
    .font("Helvetica")
    .fontSize(7)
    .text("FOR: AS AGENTS FOR THE CARRIER", sigX + 6, y + 6, {
      width: sigW - 12,
    });
  doc
    .font("Helvetica")
    .fontSize(6.5)
    .text("Authorised Signatory", sigX + 6, y + row11H - 14, {
      width: sigW - 12,
    });

  y += row11H;

  // ------------------------------------------------------------------
  // PAGE 2: "Standard Conditions governing Multimodal Transport
  // Documents" — printed on its own page, 3-column dense layout,
  // same visual style as the original printed terms sheet.
  // ------------------------------------------------------------------
  if (data.termsColumn1 || data.termsColumn2 || data.termsColumn3) {
    doc.addPage({ size: "A4", margin: 0 });
    drawTermsPage(doc, data);
  }

  // Every text block above is drawn inside a fixed-size box with
  // { height, ellipsis:true }, so PDFKit never auto-adds an unwanted
  // extra page — the document is always exactly 2 pages (or 1 if no
  // terms/conditions text is supplied).
  return doc;
}

function drawTermsPage(doc, data) {
  const margin = 24;
  const contentW = PAGE_W - margin * 2;
  const contentH = PAGE_H - margin * 2;

  // Title
  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor("#000000")
    .text(data.termsConditionsTitle || "Standard Conditions", margin, margin, {
      width: contentW,
      align: "center",
      height: 24,
      ellipsis: true,
    });

  const bodyTop = margin + 26;
  const bodyH = contentH - 26;

  // 3 fixed columns, one-to-one with the 3 textareas in the form
  const gap = 14;
  const colW = (contentW - gap * 2) / 3;
  const colXs = [margin, margin + colW + gap, margin + (colW + gap) * 2];
  const columnData = [
    data.termsColumn1 || [],
    data.termsColumn2 || [],
    data.termsColumn3 || [],
  ];

  columnData.forEach((colClauses, i) => {
    const text = colClauses.join("\n\n");
    doc
      .font("Helvetica")
      .fontSize(5.6)
      .fillColor("#111111")
      .text(text, colXs[i], bodyTop, {
        width: colW,
        height: bodyH,
        ellipsis: true,
        lineGap: 0.5,
        align: "left",
      });
  });

  // thin column-divider lines for visual authenticity
  doc
    .moveTo(colXs[1] - gap / 2, bodyTop)
    .lineTo(colXs[1] - gap / 2, bodyTop + bodyH)
    .lineWidth(0.5)
    .strokeColor("#cccccc")
    .stroke();
  doc
    .moveTo(colXs[2] - gap / 2, bodyTop)
    .lineTo(colXs[2] - gap / 2, bodyTop + bodyH)
    .stroke();
}

module.exports = { generateBolPDF };
