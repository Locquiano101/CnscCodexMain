import PDFDocument from "pdfkit";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Accreditation } from "../models/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// CNSC Color Scheme
const COLORS = {
  primary: "#500000", // Maroon
  secondary: "#ee8f00", // Orange
  accent1: "#003092", // Blue
  accent2: "#00879e", // Teal
  white: "#f1f1f1",
  black: "#4d4d4d",
  darkBlue: "#1c4060",
  success: "#10b981",
  danger: "#ef4444",
};

export const GenerateAccreditationReports = async (req, res) => {
  try {
    const accreditation = await Accreditation.find()
      .populate([
        "organizationProfile",
        "JointStatement",
        "FinancialReport",
        "PledgeAgainstHazing",
        "Roster",
        "ConstitutionAndByLaws",
        "PresidentProfile",
      ])
      .exec();

    const doc = new PDFDocument({
      margin: 50,
      size: "A4",
      bufferPages: true,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=accreditation-report.pdf"
    );
    doc.pipe(res);

    const HEADER_HEIGHT = 100;
    const CONTENT_START = HEADER_HEIGHT + 20;

    // ====== UTILITY FUNCTIONS ======
    const drawHeader = () => {
      // Header background
      doc.save();
      doc.rect(0, 0, 595, HEADER_HEIGHT).fill(COLORS.primary);

      // Decorative stripe
      doc.rect(0, HEADER_HEIGHT - 8, 595, 8).fill(COLORS.secondary);

      // Logo
      const logoPath = path.join(__dirname, "controller", "cnsc-codex.png");
      try {
        doc.image(logoPath, 40, 20, { width: 60, height: 60 });
      } catch {
        console.warn("⚠️ Logo not found");
      }

      // School name and details
      doc
        .fillColor(COLORS.white)
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("CAMARINES NORTE STATE COLLEGE", 110, 25, { width: 450 });

      doc
        .fontSize(9)
        .font("Helvetica")
        .text(
          "F. Pimentel Avenue, Brgy. Calasgasan, Daet, Camarines Norte",
          110,
          45
        )
        .text("Tel: (054) 440-1287 | Email: info@cnsc.edu.ph", 110, 58);

      doc
        .fontSize(8)
        .fillColor(COLORS.secondary)
        .text("Student Services Division", 110, 73);

      doc.restore();
    };

    const drawFooter = (pageNum, totalPages) => {
      doc
        .fontSize(8)
        .fillColor(COLORS.black)
        .text(`Page ${pageNum} of ${totalPages}`, 50, 770, {
          width: 230,
          align: "left",
        })
        .text(`Generated: ${new Date().toLocaleDateString()}`, 315, 770, {
          width: 230,
          align: "right",
        });
    };

    const addSection = (title, icon = "") => {
      if (doc.y > 700) {
        doc.addPage();
        drawHeader();
        doc.y = CONTENT_START;
      }

      doc
        .fillColor(COLORS.primary)
        .fontSize(14)
        .font("Helvetica-Bold")
        .text(icon + title.toUpperCase())
        .moveDown(0.3);

      doc
        .moveTo(50, doc.y)
        .lineTo(250, doc.y)
        .strokeColor(COLORS.secondary)
        .lineWidth(2)
        .stroke();

      doc.moveDown(0.8);
      doc.fillColor(COLORS.black).font("Helvetica");
    };

    const addInfoRow = (label, value, valueColor = COLORS.black) => {
      const startY = doc.y;
      doc
        .fontSize(10)
        .fillColor(COLORS.darkBlue)
        .font("Helvetica-Bold")
        .text(label + ":", 50, startY, { width: 150, continued: false });

      doc
        .fillColor(valueColor)
        .font("Helvetica")
        .text(value || "N/A", 200, startY, { width: 345 });

      doc.moveDown(0.4);
    };

    const drawStatBox = (
      x,
      y,
      width,
      height,
      label,
      value,
      bgColor,
      textColor = COLORS.white
    ) => {
      // Shadow effect
      doc.rect(x + 3, y + 3, width, height).fill("#00000020");

      // Main box
      doc.rect(x, y, width, height).fill(bgColor);

      // Value
      doc
        .fillColor(textColor)
        .fontSize(28)
        .font("Helvetica-Bold")
        .text(value.toString(), x + 10, y + 20, {
          width: width - 20,
          align: "center",
        });

      // Label
      doc
        .fontSize(9)
        .font("Helvetica")
        .text(label, x + 10, y + height - 30, {
          width: width - 20,
          align: "center",
        });
    };

    const drawProgressBar = (x, y, width, percentage, color) => {
      // Background
      doc.rect(x, y, width, 8).fill(COLORS.white);

      // Progress
      const fillWidth = (width * percentage) / 100;
      doc.rect(x, y, fillWidth, 8).fill(color);

      // Border
      doc.rect(x, y, width, 8).stroke(COLORS.black);
    };

    // ====== CALCULATE STATISTICS ======
    const stats = {
      total: accreditation.length,
      active: accreditation.filter((a) => a.isActive).length,
      inactive: accreditation.filter((a) => !a.isActive).length,
      pending: accreditation.filter((a) => a.overallStatus === "Pending")
        .length,
      approved: accreditation.filter((a) => a.overallStatus === "Approved")
        .length,
      byClass: {},
      byDepartment: {},
      withPresident: accreditation.filter((a) => a.PresidentProfile).length,
      withFinancialReport: accreditation.filter((a) => a.FinancialReport)
        .length,
      documentsSubmitted: {
        jointStatement: accreditation.filter((a) => a.JointStatement).length,
        pledge: accreditation.filter((a) => a.PledgeAgainstHazing).length,
        constitution: accreditation.filter((a) => a.ConstitutionAndByLaws)
          .length,
        roster: accreditation.filter((a) => a.Roster).length,
      },
      totalFinancialBalance: 0,
    };

    accreditation.forEach((org) => {
      const profile = org.organizationProfile;
      if (profile?.orgClass) {
        stats.byClass[profile.orgClass] =
          (stats.byClass[profile.orgClass] || 0) + 1;
      }
      if (profile?.orgDepartment) {
        stats.byDepartment[profile.orgDepartment] =
          (stats.byDepartment[profile.orgDepartment] || 0) + 1;
      }
      if (org.FinancialReport?.endingBalance) {
        stats.totalFinancialBalance += org.FinancialReport.endingBalance;
      }
    });

    // ====== COVER PAGE ======
    drawHeader();

    // Decorative elements
    doc.rect(0, 150, 595, 350).fill(COLORS.white);
    doc.rect(0, 150, 595, 8).fill(COLORS.accent1);

    doc
      .fillColor(COLORS.primary)
      .fontSize(42)
      .font("Helvetica-Bold")
      .text("ACCREDITATION", 50, 220, { align: "center", width: 495 });

    doc
      .fillColor(COLORS.secondary)
      .fontSize(38)
      .text("REPORT", 50, 270, { align: "center", width: 495 });

    doc
      .fontSize(14)
      .fillColor(COLORS.darkBlue)
      .font("Helvetica")
      .text(
        `Academic Year ${
          new Date().getFullYear() - 1
        }-${new Date().getFullYear()}`,
        50,
        340,
        { align: "center", width: 495 }
      );

    // Info box
    doc.rect(150, 400, 295, 80).fill(COLORS.accent2);

    doc
      .fillColor(COLORS.white)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(`${stats.total} Organizations`, 150, 420, {
        width: 295,
        align: "center",
      })
      .font("Helvetica")
      .fontSize(10)
      .text(
        `Generated on ${new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`,
        150,
        445,
        { width: 295, align: "center" }
      );

    doc
      .fontSize(8)
      .fillColor(COLORS.black)
      .text(
        "This report contains comprehensive information about all student organizations",
        50,
        650,
        { align: "center", width: 495 }
      )
      .text("seeking accreditation for the current academic year.", {
        align: "center",
        width: 495,
      });

    // ====== EXECUTIVE SUMMARY ======
    doc.addPage();
    drawHeader();
    doc.y = CONTENT_START;

    addSection("EXECUTIVE SUMMARY", "📊 ");

    // Statistics Grid
    const boxWidth = 115;
    const boxHeight = 80;
    const boxSpacing = 10;
    const startX = 50;
    let boxY = doc.y + 10;

    drawStatBox(
      startX,
      boxY,
      boxWidth,
      boxHeight,
      "Total Organizations",
      stats.total,
      COLORS.primary
    );
    drawStatBox(
      startX + boxWidth + boxSpacing,
      boxY,
      boxWidth,
      boxHeight,
      "Active",
      stats.active,
      COLORS.success
    );
    drawStatBox(
      startX + (boxWidth + boxSpacing) * 2,
      boxY,
      boxWidth,
      boxHeight,
      "Inactive",
      stats.inactive,
      COLORS.black
    );
    drawStatBox(
      startX + (boxWidth + boxSpacing) * 3,
      boxY,
      boxWidth,
      boxHeight,
      "Pending Review",
      stats.pending,
      COLORS.secondary
    );

    doc.y = boxY + boxHeight + 30;

    // Organizations by Class
    addSection("ORGANIZATIONS BY CLASS");

    Object.entries(stats.byClass).forEach(([orgClass, count]) => {
      const percentage = ((count / stats.total) * 100).toFixed(1);

      doc
        .fontSize(10)
        .fillColor(COLORS.darkBlue)
        .font("Helvetica-Bold")
        .text(orgClass, 50, doc.y);

      const barY = doc.y + 15;
      drawProgressBar(50, barY, 400, percentage, COLORS.accent1);

      doc
        .fontSize(9)
        .fillColor(COLORS.black)
        .font("Helvetica")
        .text(`${count} (${percentage}%)`, 460, barY - 2);

      doc.y = barY + 20;
    });

    doc.moveDown(1);

    // Organizations by Department
    addSection("ORGANIZATIONS BY DEPARTMENT");

    Object.entries(stats.byDepartment).forEach(([dept, count]) => {
      const percentage = ((count / stats.total) * 100).toFixed(1);

      doc
        .fontSize(9)
        .fillColor(COLORS.darkBlue)
        .font("Helvetica-Bold")
        .text(dept.substring(0, 40), 50, doc.y, { width: 300 });

      const barY = doc.y + 12;
      drawProgressBar(50, barY, 350, percentage, COLORS.accent2);

      doc
        .fontSize(9)
        .fillColor(COLORS.black)
        .font("Helvetica")
        .text(`${count} (${percentage}%)`, 410, barY - 2);

      doc.y = barY + 18;
    });

    // ====== COMPLIANCE OVERVIEW ======
    doc.addPage();
    drawHeader();
    doc.y = CONTENT_START;

    addSection("DOCUMENTATION COMPLIANCE");

    const complianceData = [
      {
        label: "President Profile",
        count: stats.withPresident,
        color: COLORS.accent1,
      },
      {
        label: "Financial Report",
        count: stats.withFinancialReport,
        color: COLORS.accent2,
      },
      {
        label: "Joint Statement",
        count: stats.documentsSubmitted.jointStatement,
        color: COLORS.primary,
      },
      {
        label: "Pledge Against Hazing",
        count: stats.documentsSubmitted.pledge,
        color: COLORS.secondary,
      },
      {
        label: "Constitution & By-Laws",
        count: stats.documentsSubmitted.constitution,
        color: COLORS.darkBlue,
      },
      {
        label: "Organization Roster",
        count: stats.documentsSubmitted.roster,
        color: COLORS.success,
      },
    ];

    complianceData.forEach((item) => {
      const percentage = ((item.count / stats.total) * 100).toFixed(1);

      doc
        .fontSize(10)
        .fillColor(COLORS.darkBlue)
        .font("Helvetica-Bold")
        .text(item.label, 50, doc.y);

      const barY = doc.y + 15;
      drawProgressBar(50, barY, 400, percentage, item.color);

      doc
        .fontSize(9)
        .fillColor(COLORS.black)
        .font("Helvetica")
        .text(`${item.count}/${stats.total} (${percentage}%)`, 460, barY - 2);

      doc.y = barY + 25;
    });

    // Key Insights Box
    doc.moveDown(1);
    doc.rect(50, doc.y, 495, 150).fill(COLORS.white);
    doc.rect(50, doc.y, 495, 150).stroke(COLORS.primary);

    const insightY = doc.y + 15;
    doc
      .fillColor(COLORS.primary)
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("KEY INSIGHTS", 60, insightY);

    doc
      .fontSize(9)
      .fillColor(COLORS.black)
      .font("Helvetica")
      .text(
        `• ${((stats.active / stats.total) * 100).toFixed(
          1
        )}% of organizations are currently active and operational`,
        60,
        insightY + 25,
        { width: 475 }
      )
      .text(
        `• ${stats.pending} organizations are awaiting approval from the Student Services Division`,
        60,
        doc.y + 5,
        { width: 475 }
      )
      .text(
        `• Documentation compliance rate averages ${(
          (Object.values(stats.documentsSubmitted).reduce((a, b) => a + b, 0) /
            (stats.total * 4)) *
          100
        ).toFixed(1)}%`,
        60,
        doc.y + 5,
        { width: 475 }
      )
      .text(
        `• ${
          Object.keys(stats.byDepartment).length
        } different academic departments are represented`,
        60,
        doc.y + 5,
        { width: 475 }
      );

    // ====== ORGANIZATION PROFILES ======
    doc.addPage();
    drawHeader();
    doc.y = CONTENT_START;

    addSection("ORGANIZATION PROFILES", "🏢 ");

    for (let i = 0; i < accreditation.length; i++) {
      const org = accreditation[i];
      const profile = org.organizationProfile;

      if (!profile) continue;

      // Check for page break
      if (doc.y > 650) {
        doc.addPage();
        drawHeader();
        doc.y = CONTENT_START;
      }

      // Organization card
      const cardY = doc.y;

      // Header bar
      doc.rect(50, cardY, 495, 35).fill(COLORS.primary);

      doc
        .fillColor(COLORS.white)
        .fontSize(13)
        .font("Helvetica-Bold")
        .text(`${i + 1}. ${profile.orgName}`, 60, cardY + 10, { width: 350 });

      // Status badge
      const statusColor = org.isActive ? COLORS.success : COLORS.black;
      doc.rect(460, cardY + 8, 75, 18).fill(statusColor);
      doc
        .fillColor(COLORS.white)
        .fontSize(8)
        .text(org.isActive ? "ACTIVE" : "INACTIVE", 460, cardY + 12, {
          width: 75,
          align: "center",
        });

      doc.y = cardY + 45;

      // Content area
      addInfoRow("Acronym", profile.orgAcronym);
      addInfoRow("Department", profile.orgDepartment);
      addInfoRow("Course", profile.orgCourse);
      addInfoRow("Classification", profile.orgClass);
      addInfoRow(
        "Status",
        org.overallStatus,
        org.overallStatus === "Approved" ? COLORS.success : COLORS.secondary
      );

      // President info
      if (org.PresidentProfile) {
        doc.moveDown(0.3);
        doc
          .fontSize(10)
          .fillColor(COLORS.secondary)
          .font("Helvetica-Bold")
          .text("President:", 50, doc.y);
        doc.moveDown(0.2);

        addInfoRow("  Name", org.PresidentProfile.name);
        addInfoRow("  Year Level", org.PresidentProfile.year);
        addInfoRow("  Contact", org.PresidentProfile.contactNo);
      }

      // Financial summary
      if (org.FinancialReport) {
        doc.moveDown(0.3);
        doc
          .fontSize(10)
          .fillColor(COLORS.accent2)
          .font("Helvetica-Bold")
          .text("Financial Summary:", 50, doc.y);
        doc.moveDown(0.2);

        addInfoRow(
          "  Initial Balance",
          `₱${org.FinancialReport.initialBalance?.toLocaleString() || "0.00"}`
        );
        addInfoRow(
          "  Ending Balance",
          `₱${org.FinancialReport.endingBalance?.toLocaleString() || "0.00"}`
        );
      }

      // Document checklist
      doc.moveDown(0.3);
      doc
        .fontSize(9)
        .fillColor(COLORS.darkBlue)
        .font("Helvetica-Bold")
        .text("Documents:", 50, doc.y);

      const docs = [
        { name: "Joint Statement", status: org.JointStatement },
        { name: "Pledge", status: org.PledgeAgainstHazing },
        { name: "Constitution", status: org.ConstitutionAndByLaws },
        { name: "Roster", status: org.Roster },
      ];

      let docX = 140;
      const docY = doc.y - 10;
      docs.forEach((d) => {
        doc
          .circle(docX, docY + 5, 4)
          .fill(d.status ? COLORS.success : COLORS.danger);
        doc
          .fontSize(7)
          .fillColor(COLORS.black)
          .text(d.name, docX + 8, docY + 1);
        docX += 90;
      });

      doc.y = docY + 15;

      // Separator
      doc.moveDown(0.8);
      doc
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .strokeColor(COLORS.white)
        .lineWidth(1)
        .stroke();
      doc.moveDown(1);
    }

    // Add page numbers
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(i);
      drawFooter(i + 1, range.count);
    }

    doc.end();
  } catch (err) {
    console.error("PDF generation failed:", err);
    if (!res.headersSent) {
      res
        .status(500)
        .json({ error: "Failed to generate report", details: err.message });
    }
  }
};
