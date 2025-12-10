import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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

const getAcademicYear = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1; // getMonth() is 0-based

  // If current month is August (8) or later, AY starts this year
  if (month >= 8) {
    return `${year}-${year + 1}`;
  } else {
    // Otherwise, AY started last year
    return `${year - 1}-${year}`;
  }
};

// Add official header to PDF with logos
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

//Export Accreditation Report to PDF
export const exportAccreditationToPDF = (data) => {
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
    margin: { top: yPosition, right: 14, bottom: 20, left: 14 },
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
  const fileName = `Accomplishment_Report_${
    new Date().toISOString().split("T")[0]
  }.pdf`;
  doc.save(fileName);
};

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
  const tableData = data.map((row) => {
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
    margin: { top: yPosition, right: 14, bottom: 20, left: 14 },
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

  const computeStatus = (row) => {
    const plan = row.actionPlan || row.ProposedIndividualActionPlan || {};
    const date = plan.proposedDate ? new Date(plan.proposedDate) : null;
    const today = new Date();

    const approved = row.overallStatus?.toLowerCase() === "approved";
    const cancelled =
      row.overallStatus?.toLowerCase() === "cancelled" ||
      row.overallStatus?.toLowerCase() === "rejected";

    const hasReport = row.hasReport || false;

    // CANCELLED
    if (cancelled) return "CANCELLED";

    if (!date) return "PENDING";

    // FUTURE EVENTS
    if (date > today) {
      if (approved) return "APPROVED";
      return "PENDING";
    }

    // PAST EVENTS
    if (date < today) {
      if (hasReport) return "CONCLUDED";
      return "FOR REPORTING";
    }

    return "PENDING";
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
      computeStatus(row),
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
    startY: yPosition,
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
      6: { cellWidth: 30, halign: "left" }, // SDG
      7: { cellWidth: "auto", halign: "center" }, // Status
    },
    // Alternate row colors like accomplishment
    alternateRowStyles: {
      fillColor: [248, 248, 248],
    },
    margin: { top: yPosition, right: 14, bottom: 20, left: 14 },
    tableWidth: "auto",

    didDrawPage: (data) => {
      // Add header to every page
      if (data.pageNumber > 1) {
        addOfficialHeader(doc, "ACTIVITY CALENDAR REPORT");
      }
    },
    pageBreak: "auto",
    rowPageBreak: "avoid",
    showHead: "everyPage",
  });

  // AFTER autoTable has finished
  const pageCount = doc.internal.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);

    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - 14,
      doc.internal.pageSize.getHeight() - 10,
      { align: "right" }
    );
  }

  const fileName = `Activity_Calendar_Report_${
    new Date().toISOString().split("T")[0]
  }.pdf`;
  doc.save(fileName);
};

export const exportFinancialReportToPDF = (data) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  // Add official header
  let yPosition = addOfficialHeader(doc, "FINANCIAL REPORT");
  const pageWidth = doc.internal.pageSize.getWidth();

  const formatAmount = (num) =>
    `Php ${Number(num || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // Build table rows based on new data structure
  const tableData = data.map((row) => {
    const expected = (row.approvedFee || 0) * (row.payees || 0);
    const collected = row.collectedAmount || 0;
    const variance = collected - expected;
    const rate = expected > 0 ? (collected / expected) * 100 : 0;

    return [
      row.date
        ? new Date(row.date).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })
        : "-",
      row.organization || "N/A",
      row.president || "-", // No department in new data
      row.feeType || "-", // No feeType in new data
      formatAmount(expected),
      row.payees || 0,
      formatAmount(collected),
      formatAmount(variance),
      `${rate.toFixed(1)}%`,
      row.status || "Pending",
    ];
  });

  autoTable(doc, {
    startY: yPosition,
    head: [
      [
        "Date",
        "Organization",
        "President",
        "Fee Type",
        "Approved Amount",
        "Payees",
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

    // Color logic for status column
    didParseCell: (data) => {
      if (data.column.index === 6 && data.section === "body") {
        const status = String(data.cell.raw).toLowerCase();
        if (status.includes("over"))
          data.cell.styles.fillColor = [220, 248, 220]; // green
        else if (status.includes("under"))
          data.cell.styles.fillColor = [255, 230, 230]; // red
        else data.cell.styles.fillColor = [245, 245, 245]; // gray
      }
    },

    didDrawPage: (data) => {
      if (data.pageNumber > 1) addOfficialHeader(doc, "FINANCIAL REPORT");
    },

    margin: { top: yPosition, right: 14, bottom: 20, left: 14 },
    tableWidth: "auto",
    showHead: "everyPage",
  });

  // AFTER autoTable has finished
  const pageCount = doc.internal.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);

    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - 14,
      doc.internal.pageSize.getHeight() - 10,
      { align: "right" }
    );
  }

  const fileName = `Financial_Report_${
    new Date().toISOString().split("T")[0]
  }.pdf`;
  doc.save(fileName);
};

export const exportRQATToPDF = (data) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  const academicYear = getAcademicYear();
  const headerText = `LIST OF ACCREDITED/RECOGNIZED/AUTHORIZED STUDENT ORGANIZATION/COUNCIL/GOVERNMENT AND STUDENT ACTIVITIES\nas of Academic Year (AY) ${academicYear}`;

  // --- FUNCTION: DRAW HEADER ---
  const drawHeader = () => {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");

    const lines = doc.splitTextToSize(headerText, pageWidth - 28);
    let y = 14;

    lines.forEach((line) => {
      doc.text(line, pageWidth / 2, y, { align: "center" });
      y += 6;
    });

    return y + 4; // return the new Y position
  };

  // Draw the header on the first page
  const headerBottomY = drawHeader();

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

  // Prepare table rows
  const tableData = data.map((org) => [
    org.organizationName || "-",
    org.yearsOfExistence != null ? org.yearsOfExistence : "-",
    org.accreditedSince ? formatDate(org.accreditedSince) : "-",
    org.adviserName || "-",
    org.presidentName || "-",
    org.specialization || "-",
    org.collectedFeeTitles?.length
      ? org.collectedFeeTitles.map((t) => `• ${t}`).join("\n\n")
      : "-",
    org.programsUndertaken?.length
      ? org.programsUndertaken.map((p) => `• ${p}`).join("\n\n")
      : "-",
  ]);

  autoTable(doc, {
    startY: headerBottomY,
    head: [
      [
        "ORGANIZATION NAME",
        "YEARS OF EXISTENCE",
        "ACCREDITED SINCE",
        "NAME OF FACULTY ADVISER",
        "PRESIDENT NAME",
        "SPECIALIZATION",
        "FEES COLLECTED",
        "PROGRAMS/ACTIVITIES UNDERTAKEN",
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
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { halign: "left" },
      1: { halign: "center" },
      2: { halign: "center" },
      3: { halign: "left" },
      4: { halign: "left" },
      5: { halign: "left" },
      6: { cellWidth: 30, halign: "left" },
      7: { cellWidth: 60, halign: "left" },
    },
    margin: { top: headerBottomY, left: 14, right: 14, bottom: 20 },

    didDrawPage: (data) => {
      if (data.pageNumber > 1) {
        drawHeader(); // draw the same centered header for every page
      }
    },

    showHead: "everyPage",
  });

  // AFTER autoTable has finished
  const pageCount = doc.internal.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);

    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - 14,
      doc.internal.pageSize.getHeight() - 10,
      { align: "right" }
    );
  }

  const fileName = `RQAT_Report_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
};

export const exportRQATOfficersToPDF = (data) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const academicYear = getAcademicYear();
  // Custom header text
  const headerText = `LIST OF ACCREDITED/RECOGNIZED/AUTHORIZED STUDENT ORGANIZATION/COUNCIL/GOVERNMENT AND STUDENT ACTIVITIES\nas of Academic Year (AY) ${academicYear}`;

  // --- FUNCTION: DRAW HEADER ---
  const drawHeader = () => {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");

    const lines = doc.splitTextToSize(headerText, pageWidth - 28);
    let y = 14;

    lines.forEach((line) => {
      doc.text(line, pageWidth / 2, y, { align: "center" });
      y += 6;
    });

    return y + 4; // return the new Y position
  };
  // Add official header (centered)
  const yPosition = (() => {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const lines = doc.splitTextToSize(headerText, pageWidth - 28); // 14mm margin each side
    let y = 14; // starting y position
    lines.forEach((line) => {
      doc.text(line, pageWidth / 2, y, { align: "center" });
      y += 6; // line height
    });
    return y + 4; // space after header
  })();

  // Prepare table rows
  const tableData = [];

  const organizations = Array.isArray(data) ? data : [data];

  organizations.forEach((org) => {
    let officers = org.officers || [];

    if (officers.length === 0) return;

    // Sort officers: president first
    const sortedOfficers = [...officers].sort((a, b) => {
      if (a.position?.toLowerCase() === "president") return -1;
      if (b.position?.toLowerCase() === "president") return 1;
      return 0;
    });

    sortedOfficers.forEach((officer, idx) => {
      const courseYear =
        officer.course && officer.year
          ? `${officer.course} (${officer.year})`
          : "-";

      tableData.push([
        idx === 0 ? org.organizationName || "-" : "", // Organization Name only on first row
        officer.position || "-", // Officer Position
        officer.name || "-", // Officer Name
        courseYear, // Course + Year
        officer.contactNumber || "-", // Contact Number
      ]);
    });

    // Add empty row for spacing after each organization
    tableData.push(["", "", "", "", ""]);
  });

  autoTable(doc, {
    startY: yPosition,
    head: [
      [
        "Organization",
        "Position",
        "Officer Name",
        "Course & Year",
        "Contact Number",
      ],
    ],
    body: tableData,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 2,
      valign: "middle",
      overflow: "linebreak",
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { cellWidth: "auto" },
      2: { cellWidth: "auto" },
      3: { cellWidth: "auto" },
      4: { cellWidth: "auto" },
    },
    didParseCell: (data) => {
      // Bold position and name if president
      if (
        data.section === "body" &&
        data.row.cells[1].raw.toLowerCase() === "president"
      ) {
        data.cell.styles.fontStyle = "bold";
      }
    },
    margin: { top: yPosition, right: 14, bottom: 20, left: 14 },
    didDrawPage: (data) => {
      if (data.pageNumber > 1) {
        drawHeader(); // draw the same centered header for every page
      }
    },

    showHead: "everyPage",
  });

  // AFTER autoTable has finished
  const pageCount = doc.internal.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);

    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - 14,
      doc.internal.pageSize.getHeight() - 10,
      { align: "right" }
    );
  }

  const fileName = `RQAT_Officers_Report_${
    new Date().toISOString().split("T")[0]
  }.pdf`;
  doc.save(fileName);
};
