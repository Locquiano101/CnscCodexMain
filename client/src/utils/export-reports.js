import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
// Import logos
import cnscLogo from "../assets/cnsc_logo.png";
import isoLogo from "../assets/iso.jpg";

/**
 * Format date for display
 */
const formatDate = (date) => {
  if (!date) return "N/A";
  const d = new Date(date);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

/**
 * Add official header to PDF with logos
 */
const addOfficialHeader = (doc, reportTitle) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 8;

  // Add CNSC Logo (left) - slightly smaller and higher
  try {
    doc.addImage(cnscLogo, "PNG", 14, yPosition, 12, 12);
  } catch (e) {
    console.warn("Could not add CNSC logo:", e);
  }

  // Add ISO Logo (left, next to CNSC logo) - wider aspect ratio
  try {
    doc.addImage(isoLogo, "JPEG", 28, yPosition, 30, 12);
  } catch (e) {
    console.warn("Could not add ISO logo:", e);
  }

  // Republic of the Philippines (top right)
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(128, 128, 128);
  doc.text("Republic of the Philippines", pageWidth - 14, yPosition + 2, {
    align: "right",
  });

  // CAMARINES NORTE STATE COLLEGE (main title)
  yPosition += 5;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(169, 113, 113); // Brownish red color
  doc.text("CAMARINES NORTE STATE COLLEGE", pageWidth - 14, yPosition + 2, {
    align: "right",
  });

  // Address
  yPosition += 5;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(
    "F. Pimentel Avenue, Brgy. 2, Daet, Camarines Norte – 4600, Philippines",
    pageWidth - 14,
    yPosition + 2,
    { align: "right" }
  );

  // Horizontal line (positioned after logos)
  yPosition += 5;
  doc.setDrawColor(169, 113, 113);
  doc.setLineWidth(0.5);
  doc.line(14, yPosition, pageWidth - 14, yPosition);

  // OFFICE OF THE STUDENT SERVICES AND DEVELOPMENT
  yPosition += 7;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(169, 113, 113);
  doc.text(
    "OFFICE OF THE STUDENT SERVICES AND DEVELOPMENT",
    pageWidth / 2,
    yPosition,
    { align: "center" }
  );

  // STUDENT DEVELOPMENT UNIT
  yPosition += 7;
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text("STUDENT DEVELOPMENT UNIT", pageWidth / 2, yPosition, {
    align: "center",
  });

  // Report Title (e.g., "APESOC RESULTS" or "ACCOMPLISHMENT REPORT")
  yPosition += 5;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(reportTitle, pageWidth / 2, yPosition, { align: "center" });

  // A.Y. 2025-2026
  yPosition += 5;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("A.Y. 2025-2026", pageWidth / 2, yPosition, { align: "center" });

  return yPosition + 8; // Return next available Y position
};

/**
 * Export Accreditation Report to PDF
 */
export const exportAccreditationToPDF = (data, fileLabel = "Accreditation") => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Add official header with logos
  let yPosition = addOfficialHeader(doc, "APESOC RESULTS");

  // Add filter information if any
  // doc.setFontSize(8);
  // doc.setTextColor(0, 0, 0);
  // if (filters.status || filters.department || filters.dateFrom || filters.dateTo) {
  //   doc.text('Filters Applied:', 14, yPosition);
  //   yPosition += 4;

  //   if (filters.status) {
  //     doc.text(`• Status: ${filters.status}`, 16, yPosition);
  //     yPosition += 3;
  //   }
  //   if (filters.department) {
  //     doc.text(`• Department: ${filters.department}`, 16, yPosition);
  //     yPosition += 3;
  //   }
  //   if (filters.dateFrom || filters.dateTo) {
  //     const dateRange = `${filters.dateFrom || 'Start'} to ${filters.dateTo || 'End'}`;
  //     doc.text(`• Date Range: ${dateRange}`, 16, yPosition);
  //     yPosition += 3;
  //   }
  //   yPosition += 2;
  // }

  // Prepare table data
  const tableData = data.map((row, index) => {
    const startDate = row.updatedAt ? new Date(row.updatedAt) : null;
    const endDate = startDate
      ? new Date(
          startDate.getFullYear() + 1,
          startDate.getMonth(),
          startDate.getDate()
        )
      : null;

    const validityText =
      startDate && endDate
        ? `${formatDate(startDate)}\nto\n${formatDate(endDate)}`
        : "N/A";

    return [
      index + 1,
      row.organizationProfile?.orgName || "N/A",
      row.organizationProfile?.orgClass || "-",
      row.overallStatus || "Pending",
      row.organizationProfile?.adviser?.name || "-",
      row.PresidentProfile?.name || "-",
      validityText,
      row.accomplishmentData?.firstSemPoints || 0,
      row.accomplishmentData?.secondSemPoints || 0,
      row.accomplishmentData?.grandTotal || 0,
      row.calculatedAccreditationStatus || "N/A",
    ];
  });

  // Configure table
  autoTable(doc, {
    startY: yPosition,
    head: [
      [
        { content: "NO.", rowSpan: 2 },
        { content: "NAME OF THE ORGANIZATION", rowSpan: 2 },
        { content: "NATURE", rowSpan: 2 },
        { content: "STATUS", rowSpan: 2 },
        { content: "ADVISER/S", rowSpan: 2 },
        { content: "PRESIDENT", rowSpan: 2 },
        { content: "VALIDITY", rowSpan: 2 },
        { content: "APESOC RESULT 2024-25", colSpan: 3 },
        { content: "STATUS OF ACCREDITATION", rowSpan: 2 },
      ],
      ["1ST SEM", "2ND SEM", "TOTAL"],
    ],
    body: tableData,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 2,
      halign: "center",
      valign: "middle",
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" }, // NO.
      1: { cellWidth: 45, halign: "left" }, // Organization
      2: { cellWidth: 20, halign: "center" }, // Nature
      3: { cellWidth: 18, halign: "center" }, // Status
      4: { cellWidth: 25, halign: "left" }, // Adviser
      5: { cellWidth: 25, halign: "left" }, // President
      6: { cellWidth: 35, halign: "center", fontSize: 7 }, // Validity
      7: { cellWidth: 18, halign: "center" }, // 1st Sem
      8: { cellWidth: 18, halign: "center" }, // 2nd Sem
      9: { cellWidth: 18, halign: "center" }, // Total
      10: { cellWidth: 35, halign: "center" }, // Status of Accreditation
    },
    margin: { top: 10, right: 14, bottom: 10, left: 14 },
    tableWidth: "auto",
    horizontalPageBreak: true,
    horizontalPageBreakRepeat: 0,
    didDrawPage: (data) => {
      // Add header on each page
      if (data.pageNumber > 1) {
        addOfficialHeader(doc, "APESOC RESULTS");
      }

      // Add page number
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      // Add generation date
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        pageWidth - 14,
        doc.internal.pageSize.getHeight() - 10,
        { align: "right" }
      );
    },
  });

  // Save the PDF
  const fileName = `${fileLabel}_Report_${
    new Date().toISOString().split("T")[0]
  }.pdf`;
  doc.save(fileName);
};

/**
 * Export Accreditation Report to Excel
 */
export const exportAccreditationToExcel = (
  data,
  filters = {},
  fileLabel = "Accreditation"
) => {
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();

  // Prepare header rows
  const headerRow1 = [
    "NO.",
    "NAME OF THE ORGANIZATION",
    "NATURE",
    "STATUS",
    "ADVISER/S",
    "PRESIDENT",
    "VALIDITY",
    "APESOC RESULT 2024-25",
    "",
    "", // Merged cells
    "STATUS OF ACCREDITATION",
  ];

  const headerRow2 = [
    "",
    "",
    "",
    "",
    "",
    "",
    "", // Empty cells for merged headers
    "1ST SEM",
    "2ND SEM",
    "TOTAL",
    "",
  ];

  // Prepare data rows
  const dataRows = data.map((row, index) => {
    const startDate = row.updatedAt ? new Date(row.updatedAt) : null;
    const endDate = startDate
      ? new Date(
          startDate.getFullYear() + 1,
          startDate.getMonth(),
          startDate.getDate()
        )
      : null;

    const validityText =
      startDate && endDate
        ? `${formatDate(startDate)} to ${formatDate(endDate)}`
        : "N/A";

    return [
      index + 1,
      row.organizationProfile?.orgName || "N/A",
      row.organizationProfile?.orgClass || "-",
      row.overallStatus || "Pending",
      row.organizationProfile?.adviser?.name || "-",
      row.PresidentProfile?.name || "-",
      validityText,
      row.accomplishmentData?.firstSemPoints || 0,
      row.accomplishmentData?.secondSemPoints || 0,
      row.accomplishmentData?.grandTotal || 0,
      row.calculatedAccreditationStatus || "N/A",
    ];
  });

  // Add title and info rows
  const titleRow = ["ACCREDITATION REPORT"];
  const academicYearRow = ["Academic Year 2024-2025"];
  const emptyRow = [""];

  // Combine all rows
  const allRows = [titleRow, academicYearRow, emptyRow];

  // Add filter info if applicable
  if (
    filters.status ||
    filters.department ||
    filters.dateFrom ||
    filters.dateTo
  ) {
    allRows.push(["Filters Applied:"]);
    if (filters.status) allRows.push([`Status: ${filters.status}`]);
    if (filters.department) allRows.push([`Department: ${filters.department}`]);
    if (filters.dateFrom || filters.dateTo) {
      allRows.push([
        `Date Range: ${filters.dateFrom || "Start"} to ${
          filters.dateTo || "End"
        }`,
      ]);
    }
    allRows.push(emptyRow);
  }

  // Add headers and data
  allRows.push(headerRow1, headerRow2, ...dataRows);

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(allRows);

  // Set column widths
  ws["!cols"] = [
    { wch: 5 }, // NO.
    { wch: 30 }, // Organization
    { wch: 15 }, // Nature
    { wch: 12 }, // Status
    { wch: 20 }, // Adviser
    { wch: 20 }, // President
    { wch: 30 }, // Validity
    { wch: 12 }, // 1st Sem
    { wch: 12 }, // 2nd Sem
    { wch: 12 }, // Total
    { wch: 30 }, // Status of Accreditation
  ];

  // Merge cells for header
  const headerRowIndex = allRows.length - dataRows.length - 2; // Position of headerRow1
  ws["!merges"] = [
    // Title merge
    { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } },
    // Academic year merge
    { s: { r: 1, c: 0 }, e: { r: 1, c: 10 } },
    // APESOC RESULT merge
    { s: { r: headerRowIndex, c: 7 }, e: { r: headerRowIndex, c: 9 } },
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, `${fileLabel} Report`);

  // Generate Excel file
  const fileName = `${fileLabel}_Report_${
    new Date().toISOString().split("T")[0]
  }.xlsx`;
  XLSX.writeFile(wb, fileName);
};

/**
 * Export Accomplishment Report to PDF
 */
export const exportAccomplishmentToPDF = (data) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Add official header with logos (use Accreditation title as requested)
  let yPosition = addOfficialHeader(doc, "ACCREDITATION REPORT");

  // Helper: format date text
  const fmt = (date) => {
    const d = new Date(date);
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  // Helper: derive accreditation status like in the table fallback
  const getAccredStatus = (row) => {
    if (row.calculatedAccreditationStatus)
      return row.calculatedAccreditationStatus;
    const pts = row.accomplishmentData?.grandTotal ?? row.grandTotal ?? 0;
    if (pts >= 90) return "Outstanding & Fully Accredited";
    if (pts >= 70) return "Eligible for Renewal";
    return "Ineligible for Renewal";
  };

  // Prepare table data to match the on-screen table
  const tableData = data.map((row, index) => {
    // Validity: start from updatedAt/orgProfile.updatedAt/createdAt; end = +1y
    const sourceDate =
      row.updatedAt ||
      row.organizationProfile?.updatedAt ||
      row.organizationProfile?.createdAt;
    const startText = sourceDate ? fmt(sourceDate) : "N/A";
    let validityText = "N/A";
    if (sourceDate) {
      const end = new Date(sourceDate);
      end.setFullYear(end.getFullYear() + 1);
      validityText = `${startText}\nto\n${fmt(end)}`;
    }

    const dateOfSubmission = row.createdAt ? fmt(row.createdAt) : "N/A";

    return [
      // 1 Org ID No.
      row.organizationProfile?.orgID ||
        (row.organizationProfile?._id
          ? row.organizationProfile._id.toString()
          : "N/A"),
      // 2 Name of the Organization
      row.organizationProfile?.orgName || "N/A",
      // 3 Nature
      row.organizationProfile?.orgClass || "-",
      // 4 Status of Accreditation
      getAccredStatus(row),
      // 5 Total Members
      row.totalMembers ?? 0,
      // 6 Total No. of Officers
      row.totalOfficers ?? 0,
      // 7 Adviser/s
      row.adviserName || row.organizationProfile?.adviser?.name || "-",
      // 8 President
      row.presidentName || row.organizationProfile?.orgPresident?.name || "-",
      // 9 APESOC Results (Total)
      row.accomplishmentData?.grandTotal ?? row.grandTotal ?? 0,
      // 10 Date of Submission
      dateOfSubmission,
      // 11 Validity of Accreditation
      validityText,
    ];
  });

  // Configure table to include all columns
  autoTable(doc, {
    startY: yPosition + 8,
    head: [
      [
        "ORG ID NO.",
        "NAME OF THE ORGANIZATION",
        "NATURE",
        "STATUS OF ACCREDITATION",
        "TOTAL MEMBERS",
        "TOTAL NO. OF OFFICERS",
        "ADVISER/S",
        "PRESIDENT",
        "APESOC TOTAL",
        "DATE OF SUBMISSION",
        "VALIDITY OF ACCREDITATION",
      ],
    ],
    body: tableData,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 2,
      halign: "center",
      valign: "middle",
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "center",
      fontSize: 8,
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
    },
    columnStyles: {
      0: { cellWidth: 22, halign: "left" }, // Org ID
      1: { cellWidth: 35, halign: "left" }, // Name
      2: { cellWidth: 23, halign: "center" }, // Nature
      3: { cellWidth: 28, halign: "center" }, // Status of Accreditation
      4: { cellWidth: 20, halign: "center" }, // Total Members
      5: { cellWidth: 20, halign: "center" }, // Total Officers
      6: { cellWidth: 24, halign: "left" }, // Adviser/s
      7: { cellWidth: 24, halign: "left" }, // President
      8: { cellWidth: 16, halign: "center" }, // APESOC Total
      9: { cellWidth: 24, halign: "center" }, // Date of Submission
      10: { cellWidth: 32, halign: "center" }, // Validity (multi-line)
    },
    margin: { top: 10, right: 14, bottom: 10, left: 14 },
    tableWidth: "auto",
    didDrawPage: (data) => {
      if (data.pageNumber > 1) {
        addOfficialHeader(doc, "ACCOMPLISHMENT REPORT");
      }
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        pageWidth - 14,
        doc.internal.pageSize.getHeight() - 10,
        { align: "right" }
      );
    },
  });

  const fileName = `Accreditation_Report_${
    new Date().toISOString().split("T")[0]
  }.pdf`;
  doc.save(fileName);
};

/**
 * Export Accomplishment Report to Excel
 */
export const exportAccomplishmentToExcel = (data, filters = {}) => {
  const wb = XLSX.utils.book_new();

  const headerRow = [
    "NO.",
    "ORGANIZATION",
    "NATURE",
    "ACCOMPLISHMENT COUNT",
    "TOTAL POINTS",
    "ORGANIZATIONAL DEVELOPMENT",
    "ORGANIZATIONAL PERFORMANCE",
    "SERVICE TO COMMUNITY",
  ];

  const dataRows = data.map((row, index) => [
    index + 1,
    row.organizationProfile?.orgName || "N/A",
    row.organizationProfile?.orgClass || "-",
    row.accomplishments?.length || 0,
    row.grandTotal || 0,
    row.totalOrganizationalDevelopment || 0,
    row.totalOrganizationalPerformance || 0,
    row.totalServiceCommunity || 0,
  ]);

  const titleRow = ["ACCOMPLISHMENT REPORT"];
  const academicYearRow = ["Academic Year 2024-2025"];
  const emptyRow = [""];

  const allRows = [titleRow, academicYearRow, emptyRow];

  if (
    filters.status ||
    filters.department ||
    filters.dateFrom ||
    filters.dateTo
  ) {
    allRows.push(["Filters Applied:"]);
    if (filters.status) allRows.push([`Status: ${filters.status}`]);
    if (filters.department) allRows.push([`Department: ${filters.department}`]);
    if (filters.dateFrom || filters.dateTo) {
      allRows.push([
        `Date Range: ${filters.dateFrom || "Start"} to ${
          filters.dateTo || "End"
        }`,
      ]);
    }
    allRows.push(emptyRow);
  }

  allRows.push(headerRow, ...dataRows);

  const ws = XLSX.utils.aoa_to_sheet(allRows);

  ws["!cols"] = [
    { wch: 5 },
    { wch: 35 },
    { wch: 15 },
    { wch: 18 },
    { wch: 15 },
    { wch: 25 },
    { wch: 25 },
    { wch: 25 },
  ];

  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Accomplishment Report");

  const fileName = `Accomplishment_Report_${
    new Date().toISOString().split("T")[0]
  }.xlsx`;
  XLSX.writeFile(wb, fileName);
};

export const exportActionPlanToPDF = (data, filters = {}) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Add official header - use "ACTION PLAN REPORT" as title
  let yPosition = addOfficialHeader(doc, "ACTIVITY CALENDAR REPORT");

  // Helper: format date text (same as accomplishment)
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const d = new Date(dateString);
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    } catch (e) {
      return "N/A";
    }
  };

  // Helper: get SDG list
  const getSDGs = (row) => {
    const sdgData =
      row.actionPlan?.alignedSDG ||
      row.ProposedIndividualActionPlan?.alignedSDG;
    if (!sdgData) return "";

    try {
      let parsed = sdgData;
      if (typeof sdgData[0] === "string" && sdgData[0].includes("SDG")) {
        parsed = JSON.parse(sdgData[0]);
      }
      return parsed
        .map((s) => s.replace(/\D/g, ""))
        .filter((n) => n.length > 0)
        .join(", ");
    } catch {
      return "";
    }
  };

  // Budget formatting (same as before but without compact format)
  const formatBudget = (value) => {
    if (!value) return "₱0.00";

    let v = String(value);

    // REMOVE ± explicitly
    v = v.replace(/±/g, "");

    // Remove everything except numbers and decimal point
    v = v.replace(/[^\d.]/g, "");

    const num = parseFloat(v);
    const safeNum = isNaN(num) ? 0 : num;

    return `Php ${safeNum.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Prepare table data (similar structure to accomplishment)
  const tableData = data.map((row) => {
    const plan = row.actionPlan || row.ProposedIndividualActionPlan || {};

    return [
      // 1 Date
      plan.proposedDate ? formatDate(plan.proposedDate) : "N/A",
      // 2 Organization
      row.organizationProfile?.orgName || "N/A",
      // 3 Nature
      // row.organizationProfile?.orgClass || '-',
      // 4 President
      row.organizationProfile?.orgPresident?.name || "-",
      // 5 Activity Title
      plan.activityTitle || "-",
      // 6 Venue
      plan.venue || "-",
      // 7 Budget
      formatBudget(plan.budgetaryRequirements),
      // 8 SDG
      getSDGs(row),
      // 9 Status
      row.overallStatus || "Pending",
    ];
  });

  // Add filters info if any (similar to accomplishment but more compact)
  if (
    filters.status ||
    filters.department ||
    filters.dateFrom ||
    filters.dateTo
  ) {
    let filterText = "Filters Applied: ";
    const filtersArray = [];

    if (filters.status) filtersArray.push(`Status: ${filters.status}`);
    if (filters.department)
      filtersArray.push(`Department: ${filters.department}`);
    if (filters.dateFrom || filters.dateTo) {
      const from = filters.dateFrom ? formatDate(filters.dateFrom) : "Start";
      const to = filters.dateTo ? formatDate(filters.dateTo) : "End";
      filtersArray.push(`Date Range: ${from} to ${to}`);
    }

    doc.setFontSize(10);
    doc.text(filterText + filtersArray.join(" | "), 14, yPosition + 5);
    yPosition += 8;
  }

  // Configure table (matching accomplishment style)
  autoTable(doc, {
    startY: yPosition + 8,
    head: [
      [
        "DATE",
        "ORGANIZATION",
        "PRESIDENT",
        "ACTIVITY TITLE",
        "VENUE",
        "BUDGET",
        "SDG",
        "STATUS",
      ],
    ],
    body: tableData,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 2,
      halign: "center",
      valign: "middle",
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "center",
      fontSize: 8,
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
    },
    // Column widths adjusted to fit landscape A4
    columnStyles: {
      0: { cellWidth: "auto", halign: "center" }, // Date
      1: { cellWidth: "auto", halign: "left" }, // Organization
      2: { cellWidth: "auto", halign: "left" }, // President
      3: { cellWidth: "auto", halign: "left" }, // Activity Title
      4: { cellWidth: "auto", halign: "left" }, // Venue
      5: { cellWidth: 30, halign: "left" }, // Budget
      6: { cellWidth: "auto", halign: "left" }, // SDG
      7: { cellWidth: "auto", halign: "center" }, // Status
    },
    // Alternate row colors like accomplishment
    alternateRowStyles: {
      fillColor: [248, 248, 248],
    },
    margin: { top: 10, right: 14, bottom: 10, left: 14 },
    tableWidth: "auto",
    didParseCell: (data) => {
      // Ensure budget is right-aligned
      if (data.column.index === 6) {
        data.cell.styles.halign = "right";
      }

      // STATUS COLORING (same color scheme as before but with accent colors)
      if (data.column.index === 8 && data.section === "body") {
        const status = String(data.cell.raw).toLowerCase();

        if (status.includes("approved")) {
          data.cell.styles.fillColor = [232, 246, 232]; // Light green
        } else if (status.includes("reject") || status.includes("denied")) {
          data.cell.styles.fillColor = [255, 235, 235]; // Light red
        } else if (status.includes("pending")) {
          data.cell.styles.fillColor = [255, 250, 205]; // Light yellow
        } else if (status.includes("completed")) {
          data.cell.styles.fillColor = [230, 240, 255]; // Light blue
        } else {
          data.cell.styles.fillColor = [245, 245, 245]; // Light gray
        }
      }
    },
    didDrawPage: (data) => {
      // Add header to every page
      if (data.pageNumber > 1) {
        addOfficialHeader(doc, "ACTIVITY CALENDAR REPORT");
      }
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        pageWidth - 14,
        doc.internal.pageSize.getHeight() - 10,
        { align: "right" }
      );
    },
    pageBreak: "auto",
    rowPageBreak: "avoid",
    showHead: "everyPage",
  });

  const fileName = `Action_Plan_Report_${
    new Date().toISOString().split("T")[0]
  }.pdf`;
  doc.save(fileName);
};
/*
 * Export Action Plan Report to Excel
 */
export const exportActionPlanToExcel = (data, filters = {}) => {
  const wb = XLSX.utils.book_new();

  const headerRow = [
    "NO.",
    "ORGANIZATION",
    "ACTIVITY TITLE",
    "PROPOSED DATE",
    "VENUE",
    "BUDGET",
    "OBJECTIVES",
    "ALIGNED SDGs",
    "STATUS",
  ];

  const dataRows = data.map((row, index) => [
    index + 1,
    row.organizationProfile?.orgName || "N/A",
    row.actionPlan?.activityTitle ||
      row.ProposedIndividualActionPlan?.activityTitle ||
      "N/A",
    row.actionPlan?.proposedDate ||
    row.ProposedIndividualActionPlan?.proposedDate
      ? new Date(
          row.actionPlan?.proposedDate ||
            row.ProposedIndividualActionPlan?.proposedDate
        ).toLocaleDateString()
      : "N/A",
    row.actionPlan?.venue || row.ProposedIndividualActionPlan?.venue || "N/A",
    row.actionPlan?.budgetaryRequirements ||
    row.ProposedIndividualActionPlan?.budgetaryRequirements
      ? `₱${(
          row.actionPlan?.budgetaryRequirements ||
          row.ProposedIndividualActionPlan?.budgetaryRequirements
        ).toLocaleString()}`
      : "₱0",
    row.actionPlan?.alignedObjectives?.length ||
      row.ProposedIndividualActionPlan?.AlignedObjective?.split("\r\n")
        ?.length ||
      0,
    row.actionPlan?.alignedSDG?.length ||
      JSON.parse(row.ProposedIndividualActionPlan?.alignedSDG?.[0] || "[]")
        ?.length ||
      0,
    row.overallStatus || "Pending",
  ]);

  const titleRow = ["ACTION PLANS REPORT"];
  const academicYearRow = ["Academic Year 2024-2025"];
  const emptyRow = [""];

  const allRows = [titleRow, academicYearRow, emptyRow];

  if (
    filters.status ||
    filters.department ||
    filters.dateFrom ||
    filters.dateTo
  ) {
    allRows.push(["Filters Applied:"]);
    if (filters.status) allRows.push([`Status: ${filters.status}`]);
    if (filters.department) allRows.push([`Department: ${filters.department}`]);
    if (filters.dateFrom || filters.dateTo) {
      allRows.push([
        `Date Range: ${filters.dateFrom || "Start"} to ${
          filters.dateTo || "End"
        }`,
      ]);
    }
    allRows.push(emptyRow);
  }

  allRows.push(headerRow, ...dataRows);

  const ws = XLSX.utils.aoa_to_sheet(allRows);

  ws["!cols"] = [
    { wch: 5 }, // NO.
    { wch: 25 }, // ORGANIZATION
    { wch: 40 }, // ACTIVITY TITLE
    { wch: 15 }, // PROPOSED DATE
    { wch: 20 }, // VENUE
    { wch: 15 }, // BUDGET
    { wch: 10 }, // OBJECTIVES COUNT
    { wch: 10 }, // SDG COUNT
    { wch: 15 }, // STATUS
  ];

  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }, // Title merge
    { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } }, // Academic Year merge
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Action Plans Report");

  const fileName = `Action_Plans_Report_${
    new Date().toISOString().split("T")[0]
  }.xlsx`;
  XLSX.writeFile(wb, fileName);
};

export const exportFinancialReportToPDF = (data, filters = {}) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Add official header
  let yPosition = addOfficialHeader(doc, "FINANCIAL REPORT");

  const formatAmount = (num) =>
    `Php ${Number(num || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const tableData = data.map((row) => [
    row.organizationProfile?.orgName || "N/A",
    row.organizationProfile?.orgDepartment || "-",
    formatAmount(row.totalCollectible),
    formatAmount(row.totalCollected),
    formatAmount(row.variance),
    `${row.collectionRate?.toFixed(1) || 0}%`,
    row.status || "Pending",
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [
      [
        "Organization",
        "Department",
        "Expected Amount",
        "Collected Amount",
        "Variance",
        "Collection Rate",
        "Status",
      ],
    ],
    body: tableData,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 2,
      halign: "center",
      valign: "middle",
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "center",
      fontSize: 8,
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
    },
    columnStyles: {
      0: { halign: "left", cellWidth: "auto" },
      1: { halign: "left", cellWidth: "auto" },
      2: { halign: "right", cellWidth: "auto" },
      3: { halign: "right", cellWidth: "auto" },
      4: { halign: "right", cellWidth: "auto" },
      5: { halign: "center", cellWidth: "auto" },
      6: { halign: "center", cellWidth: "auto" },
    },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    didParseCell: (data) => {
      if (data.column.index === 6 && data.section === "body") {
        const status = String(data.cell.raw).toLowerCase();
        if (status.includes("over"))
          data.cell.styles.fillColor = [220, 248, 220];
        else if (status.includes("under"))
          data.cell.styles.fillColor = [255, 230, 230];
        else data.cell.styles.fillColor = [245, 245, 245];
      }
    },
    didDrawPage: (data) => {
      // Add header for every page
      if (data.pageNumber > 1) addOfficialHeader(doc, "FINANCIAL REPORT");

      // Page numbers
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        pageWidth - 14,
        doc.internal.pageSize.getHeight() - 10,
        { align: "right" }
      );
    },
    margin: { top: 10, right: 14, bottom: 10, left: 14 },
    tableWidth: "auto",
    showHead: "everyPage",
  });

  const fileName = `Financial_Report_${
    new Date().toISOString().split("T")[0]
  }.pdf`;
  doc.save(fileName);
};

export const exportRQATToPDF = (data) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Add official header
  let yPosition = addOfficialHeader(doc, "RQAT REPORT");

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  // Prepare table data
  const tableData = data.map((org) => [
    // Organization Name
    org.organizationName || "-",
    // Years of Existence
    org.yearsOfExistence != null ? org.yearsOfExistence : "-",
    // Accredited Since
    org.accreditedSince ? formatDate(org.accreditedSince) : "-",
    // Adviser Name
    org.adviserName || "-",
    // President Name
    org.presidentName || "-",
    // Officers
    org.officers?.length
      ? org.officers.map((o) => `• ${o.name} (${o.position})`).join("\n\n")
      : "-",
    // Specialization
    org.specialization || "-",
    // Specialization Fee
    org.specializationFeeCollected != null
      ? `Php ${org.specializationFeeCollected.toLocaleString("en-PH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "-",
    // Programs Undertaken
    org.programsUndertaken?.length
      ? org.programsUndertaken.map((p) => `• ${p}`).join("\n\n")
      : "-",
  ]);

  // Configure table to match accomplishment report style
  autoTable(doc, {
    startY: yPosition,
    head: [
      [
        "ORGANIZATION NAME",
        "YEARS OF EXISTENCE",
        "ACCREDITED SINCE",
        "ADVISER NAME",
        "PRESIDENT NAME",
        "OFFICERS",
        "SPECIALIZATION",
        "SPECIALIZATION FEE",
        "PROGRAMS UNDERTAKEN",
      ],
    ],
    body: tableData,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 2,
      halign: "center",
      valign: "middle",
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "center",
      fontSize: 8,
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
    },
    columnStyles: {
      0: { cellWidth: "auto", halign: "left" }, // Organization Name
      1: { cellWidth: "auto", halign: "center" }, // Years of Existence
      2: { cellWidth: "auto", halign: "center" }, // Accredited Since
      3: { cellWidth: "auto", halign: "left" }, // Adviser Name
      4: { cellWidth: "auto", halign: "left" }, // President Name
      5: { cellWidth: "auto", halign: "left" }, // Officers (multi-line)
      6: { cellWidth: "auto", halign: "left" }, // Specialization
      7: { cellWidth: "auto", halign: "right" }, // Specialization Fee
      8: { cellWidth: "auto", halign: "left" }, // Programs Undertaken (multi-line)
    },
    margin: { top: 10, right: 14, bottom: 10, left: 14 },
    tableWidth: "auto",
    didDrawPage: (data) => {
      // Add header for every page
      if (data.pageNumber > 1) {
        addOfficialHeader(doc, "RQAT REPORT");
      }
      // Page numbers
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        pageWidth - 14,
        doc.internal.pageSize.getHeight() - 10,
        { align: "right" }
      );
    },
    showHead: "everyPage",
  });

  const fileName = `RQAT_Report_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
};
