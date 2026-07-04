# Bill of Lading / MTD Generator (EJS + Express + PDFKit)

Yeh project "Committed Cargo Care Limited" jaisa Bill of Lading / Multimodal
Transport Document (MTD) form banata hai — ek EJS web form jisme fields bharo,
aur ek click me **A4 size, single-page** PDF download ho jata hai. PDF me kabhi
bhi extra/2nd page nahi aata, chahe fields me kitna bhi text bhar do (lamba
text box ke andar hi clip/ellipsis ho jata hai, page overflow nahi hota).

## Folder Structure
```
bol-app/
├── server.js              # Express app entry point
├── package.json
├── routes/
│   └── bolRoutes.js        # GET / (form) and POST /download-pdf routes
├── views/
│   └── index.ejs           # Form UI (screen par bhi document jaisa dikhta hai)
├── public/
│   └── style.css           # Screen preview styling
└── utils/
    ├── defaultData.js       # Sample/default values (company info etc.)
    └── generatePDF.js       # PDFKit se exact single-page A4 PDF banata hai
```

## Kaise Chalayein

```bash
npm install
npm start
```

Fir browser me kholo: **http://localhost:3000**

Form bhar ke "Download A4 PDF (Single Page)" button dabao — PDF file
automatically download ho jayegi.

## Important: PDF ek page hi kyun rehta hai?

Normal HTML-to-PDF tools (jaise Puppeteer/wkhtmltopdf) browser render pe
depend karte hain, jisse content thoda bhi zyada hone par easily doosra page
ban jata hai. Isliye yahan **PDFKit** use kiya gaya hai — har box/field ko
fixed `x, y, width, height` coordinates par khud draw kiya jata hai, aur har
text field `{ height, ellipsis: true }` option ke sath likha jata hai. Iska
matlab:

- Agar text box se bada hoga, to wo clip/truncate ho jayega (... lag jayega)
- Kabhi bhi PDFKit automatically naya page add nahi karega
- Result: hamesha exactly 1 A4 page

Agar aapko lamba text (jaise poora address ya lambi description) bina
truncate kiye chahiye, to `utils/generatePDF.js` me us field ka box height
(`goodsH`, `row2H`, etc.) badha sakte ho — bas dhyan rahe total height A4 ki
841.89pt se zyada na ho.

## Customize Company Info

`utils/defaultData.js` me company ka naam, address, GSTIN, registration
number waghera default set hai (form ke top wale fields se edit bhi kar sakte
ho, submit karte waqt wahi values PDF me chali jayengi).

## Fields Available

- Consigner/Shipper, Consignee (or Order), Notify Address
- Place of Acceptance, Port of Loading, Port of Discharge, Place of Delivery
- Vessel & Voyage No.
- Container No.(s), Marks and Number, Description of Goods, Gross Weight, Measurement
- Freight Term, Freight Payable At, Number of Original MTD(s), Place and Date of Issue
- Other Particulars, Bill of Lading No.
- For Delivery of Goods Please Apply To
