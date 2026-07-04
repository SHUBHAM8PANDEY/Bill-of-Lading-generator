Bill of Lading / MTD Generator (EJS + Express + PDFKit)

This project generates a Bill of Lading / Multimodal Transport Document (MTD) similar to the format used by Committed Cargo Care Limited. It provides an EJS-based web form where users can fill in the required details and download a single-page A4 PDF with one click.

The generated PDF always remains exactly one A4 page. Even if users enter long text, the content is clipped or truncated with an ellipsis (...) within the designated field, preventing any overflow onto a second page.

Folder Structure
bol-app/
├── server.js              # Express application entry point
├── package.json
├── routes/
│   └── bolRoutes.js       # GET / (form) and POST /download-pdf routes
├── views/
│   └── index.ejs          # Form UI (designed to resemble the actual document)
├── public/
│   └── style.css          # Styling for the screen preview
└── utils/
    ├── defaultData.js     # Default/sample company information
    └── generatePDF.js     # Generates an exact single-page A4 PDF using PDFKit
Getting Started

Install the dependencies:

npm install

Start the server:

npm start

Open your browser and visit:

http://localhost:3000

Fill out the form and click "Download A4 PDF (Single Page)" to automatically download the generated PDF.

Why Does the PDF Always Stay on One Page?

Traditional HTML-to-PDF tools such as Puppeteer or wkhtmltopdf rely on browser rendering, which can easily create additional pages when the content exceeds the available space.

This project uses PDFKit instead. Every field and box is drawn manually using fixed x, y, width, and height coordinates. Text is rendered using the height and ellipsis: true options.

As a result:

Text that exceeds the available space is automatically clipped or truncated with an ellipsis (...).
PDFKit never adds an extra page automatically.
Every generated document is guaranteed to remain a single A4 page.

If you need to display longer content (such as full addresses or detailed descriptions) without truncation, you can increase the height of the corresponding field (e.g., goodsH, row2H, etc.) in utils/generatePDF.js. Just ensure that the total layout height does not exceed the A4 page height of 841.89 points.

Customizing Company Information

Default company information such as the company name, address, GSTIN, registration number, and other details is stored in:

utils/defaultData.js

These values can also be modified directly from the form before generating the PDF. The submitted values will be used in the final PDF.

Available Fields
Consigner/Shipper
Consignee (or Order)
Notify Address
Place of Acceptance
Port of Loading
Port of Discharge
Place of Delivery
Vessel & Voyage Number
Container Number(s)
Marks and Numbers
Description of Goods
Gross Weight
Measurement
Freight Term
Freight Payable At
Number of Original MTD(s)
Place and Date of Issue
Other Particulars
Bill of Lading Number
Delivery Instructions ("For Delivery of Goods Please Apply To")
