import express from "express";
import PDFDocument from "pdfkit";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 5000;

// Serve React build (if deployed in same project)
app.use(express.static(path.join(__dirname, "client/build")));

app.get("/generateReport", (req, res) => {
  const doc = new PDFDocument({ margin: 50 });

  // Headers for browser download
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=report.pdf");

  // Pipe PDF into response
  doc.pipe(res);

  // === Header Section ===
  const logoPath = path.join(__dirname, "cnsc-codex.png");
  doc
    .image(logoPath, 50, 45, { width: 50 }) // (x, y, size)
    .fontSize(20)
    .text("Accreditation Report", 110, 57) // text beside logo
    .moveDown();

  // Horizontal line after header
  doc.moveTo(50, 100).lineTo(550, 100).stroke();

  // === Body Content ===
  doc.moveDown(2);
  doc.fontSize(12).text("Generated at: " + new Date().toLocaleString());
  doc.moveDown();
  doc.text("Organization: Example Org");
  doc.text("Status: Approved");
  doc.text("Remarks:asddasdsaasd Good standing");

  doc.end();
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
