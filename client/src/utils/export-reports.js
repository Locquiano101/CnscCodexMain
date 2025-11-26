import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Import logos
import cnscLogo from '../assets/cnsc_logo.png';
import isoLogo from '../assets/iso.jpg';

/**
 * Format date for display
 */
const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December'];
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
    doc.addImage(cnscLogo, 'PNG', 14, yPosition, 12, 12);
  } catch (e) {
    console.warn('Could not add CNSC logo:', e);
  }
  
  // Add ISO Logo (left, next to CNSC logo) - wider aspect ratio
  try {
    doc.addImage(isoLogo, 'JPEG', 28, yPosition, 30, 12);
  } catch (e) {
    console.warn('Could not add ISO logo:', e);
  }
  
  // Republic of the Philippines (top right)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(128, 128, 128);
  doc.text('Republic of the Philippines', pageWidth - 14, yPosition + 2, { align: 'right' });
  
  // CAMARINES NORTE STATE COLLEGE (main title)
  yPosition += 5;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(169, 113, 113); // Brownish red color
  doc.text('CAMARINES NORTE STATE COLLEGE', pageWidth - 14, yPosition + 2, { align: 'right' });
  
  // Address
  yPosition += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('F. Pimentel Avenue, Brgy. 2, Daet, Camarines Norte – 4600, Philippines', pageWidth - 14, yPosition + 2, { align: 'right' });
  
  // Horizontal line (positioned after logos)
  yPosition += 5;
  doc.setDrawColor(169, 113, 113);
  doc.setLineWidth(0.5);
  doc.line(14, yPosition, pageWidth - 14, yPosition);
  
  // OFFICE OF THE STUDENT SERVICES AND DEVELOPMENT
  yPosition += 7;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(169, 113, 113);
  doc.text('OFFICE OF THE STUDENT SERVICES AND DEVELOPMENT', pageWidth / 2, yPosition, { align: 'center' });
  
  // STUDENT DEVELOPMENT UNIT
  yPosition += 7;
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text('STUDENT DEVELOPMENT UNIT', pageWidth / 2, yPosition, { align: 'center' });
  
  // Report Title (e.g., "APESOC RESULTS" or "ACCOMPLISHMENT REPORT")
  yPosition += 5;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(reportTitle, pageWidth / 2, yPosition, { align: 'center' });
  
  // A.Y. 2025-2026
  yPosition += 5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('A.Y. 2025-2026', pageWidth / 2, yPosition, { align: 'center' });
  
  return yPosition + 8; // Return next available Y position
};

/**
 * Export Accreditation Report to PDF
 */
export const exportAccreditationToPDF = (data, filters = {}) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Add official header with logos
  let yPosition = addOfficialHeader(doc, 'APESOC RESULTS');

  
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
    const endDate = startDate ? new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate()) : null;
    
    const validityText = startDate && endDate 
      ? `${formatDate(startDate)}\nto\n${formatDate(endDate)}`
      : 'N/A';

    return [
      index + 1,
      row.organizationProfile?.orgName || 'N/A',
      row.organizationProfile?.orgClass || '-',
      row.overallStatus || 'Pending',
      row.organizationProfile?.adviser?.name || '-',
      row.PresidentProfile?.name || '-',
      validityText,
      row.accomplishmentData?.firstSemPoints || 0,
      row.accomplishmentData?.secondSemPoints || 0,
      row.accomplishmentData?.grandTotal || 0,
      row.calculatedAccreditationStatus || 'N/A'
    ];
  });

  // Configure table
  autoTable(doc, {
    startY: yPosition,
    head: [
      [
        { content: 'NO.', rowSpan: 2 },
        { content: 'NAME OF THE ORGANIZATION', rowSpan: 2 },
        { content: 'NATURE', rowSpan: 2 },
        { content: 'STATUS', rowSpan: 2 },
        { content: 'ADVISER/S', rowSpan: 2 },
        { content: 'PRESIDENT', rowSpan: 2 },
        { content: 'VALIDITY', rowSpan: 2 },
        { content: 'APESOC RESULT 2024-25', colSpan: 3 },
        { content: 'STATUS OF ACCREDITATION', rowSpan: 2 }
      ],
      [
        '1ST SEM',
        '2ND SEM',
        'TOTAL'
      ]
    ],
    body: tableData,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2,
      halign: 'center',
      valign: 'middle',
      lineWidth: 0.1,
      lineColor: [0, 0, 0]
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      lineWidth: 0.1,
      lineColor: [0, 0, 0]
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },  // NO.
      1: { cellWidth: 45, halign: 'left' },     // Organization
      2: { cellWidth: 20, halign: 'center' },   // Nature
      3: { cellWidth: 18, halign: 'center' },   // Status
      4: { cellWidth: 25, halign: 'left' },     // Adviser
      5: { cellWidth: 25, halign: 'left' },     // President
      6: { cellWidth: 35, halign: 'center', fontSize: 7 }, // Validity
      7: { cellWidth: 18, halign: 'center' },   // 1st Sem
      8: { cellWidth: 18, halign: 'center' },   // 2nd Sem
      9: { cellWidth: 18, halign: 'center' },   // Total
      10: { cellWidth: 35, halign: 'center' }   // Status of Accreditation
    },
    margin: { top: 10, right: 14, bottom: 10, left: 14 },
    tableWidth: 'auto',
    horizontalPageBreak: true,
    horizontalPageBreakRepeat: 0,
    didDrawPage: (data) => {
      // Add header on each page
      if (data.pageNumber > 1) {
        addOfficialHeader(doc, 'APESOC RESULTS');
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
        { align: 'right' }
      );
    }
  });

  // Save the PDF
  const fileName = `Accreditation_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

/**
 * Export Accreditation Report to Excel
 */
export const exportAccreditationToExcel = (data, filters = {}) => {
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  
  // Prepare header rows
  const headerRow1 = [
    'NO.',
    'NAME OF THE ORGANIZATION',
    'NATURE',
    'STATUS',
    'ADVISER/S',
    'PRESIDENT',
    'VALIDITY',
    'APESOC RESULT 2024-25', '', '', // Merged cells
    'STATUS OF ACCREDITATION'
  ];
  
  const headerRow2 = [
    '', '', '', '', '', '', '', // Empty cells for merged headers
    '1ST SEM',
    '2ND SEM',
    'TOTAL',
    ''
  ];

  // Prepare data rows
  const dataRows = data.map((row, index) => {
    const startDate = row.updatedAt ? new Date(row.updatedAt) : null;
    const endDate = startDate ? new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate()) : null;
    
    const validityText = startDate && endDate 
      ? `${formatDate(startDate)} to ${formatDate(endDate)}`
      : 'N/A';

    return [
      index + 1,
      row.organizationProfile?.orgName || 'N/A',
      row.organizationProfile?.orgClass || '-',
      row.overallStatus || 'Pending',
      row.organizationProfile?.adviser?.name || '-',
      row.PresidentProfile?.name || '-',
      validityText,
      row.accomplishmentData?.firstSemPoints || 0,
      row.accomplishmentData?.secondSemPoints || 0,
      row.accomplishmentData?.grandTotal || 0,
      row.calculatedAccreditationStatus || 'N/A'
    ];
  });

  // Add title and info rows
  const titleRow = ['ACCREDITATION REPORT'];
  const academicYearRow = ['Academic Year 2024-2025'];
  const emptyRow = [''];
  
  // Combine all rows
  const allRows = [
    titleRow,
    academicYearRow,
    emptyRow
  ];

  // Add filter info if applicable
  if (filters.status || filters.department || filters.dateFrom || filters.dateTo) {
    allRows.push(['Filters Applied:']);
    if (filters.status) allRows.push([`Status: ${filters.status}`]);
    if (filters.department) allRows.push([`Department: ${filters.department}`]);
    if (filters.dateFrom || filters.dateTo) {
      allRows.push([`Date Range: ${filters.dateFrom || 'Start'} to ${filters.dateTo || 'End'}`]);
    }
    allRows.push(emptyRow);
  }

  // Add headers and data
  allRows.push(headerRow1, headerRow2, ...dataRows);

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(allRows);

  // Set column widths
  ws['!cols'] = [
    { wch: 5 },   // NO.
    { wch: 30 },  // Organization
    { wch: 15 },  // Nature
    { wch: 12 },  // Status
    { wch: 20 },  // Adviser
    { wch: 20 },  // President
    { wch: 30 },  // Validity
    { wch: 12 },  // 1st Sem
    { wch: 12 },  // 2nd Sem
    { wch: 12 },  // Total
    { wch: 30 }   // Status of Accreditation
  ];

  // Merge cells for header
  const headerRowIndex = allRows.length - dataRows.length - 2; // Position of headerRow1
  ws['!merges'] = [
    // Title merge
    { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } },
    // Academic year merge
    { s: { r: 1, c: 0 }, e: { r: 1, c: 10 } },
    // APESOC RESULT merge
    { s: { r: headerRowIndex, c: 7 }, e: { r: headerRowIndex, c: 9 } }
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Accreditation Report');

  // Generate Excel file
  const fileName = `Accreditation_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

/**
 * Export Accomplishment Report to PDF
 */
export const exportAccomplishmentToPDF = (data, filters = {}) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Add official header with logos
  let yPosition = addOfficialHeader(doc, 'ACCOMPLISHMENT REPORT');
  
  yPosition += 8;
  
  // Add filter information
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  if (filters.status || filters.department || filters.dateFrom || filters.dateTo) {
    doc.text('Filters Applied:', 14, yPosition);
    yPosition += 4;
    
    if (filters.status) {
      doc.text(`• Status: ${filters.status}`, 16, yPosition);
      yPosition += 3;
    }
    if (filters.department) {
      doc.text(`• Department: ${filters.department}`, 16, yPosition);
      yPosition += 3;
    }
    if (filters.dateFrom || filters.dateTo) {
      const dateRange = `${filters.dateFrom || 'Start'} to ${filters.dateTo || 'End'}`;
      doc.text(`• Date Range: ${dateRange}`, 16, yPosition);
      yPosition += 3;
    }
    yPosition += 2;
  }

  // Prepare table data
  const tableData = data.map((row, index) => [
    index + 1,
    row.organizationProfile?.orgName || 'N/A',
    row.organizationProfile?.orgClass || '-',
    row.accomplishments?.length || 0,
    row.grandTotal || 0,
    row.totalOrganizationalDevelopment || 0,
    row.totalOrganizationalPerformance || 0,
    row.totalServiceCommunity || 0
  ]);

  // Configure table
  autoTable(doc, {
    startY: yPosition,
    head: [[
      'NO.',
      'ORGANIZATION',
      'NATURE',
      'COUNT',
      'TOTAL POINTS',
      'ORG. DEV.',
      'ORG. PERF.',
      'SERVICE'
    ]],
    body: tableData,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 3,
      halign: 'center',
      valign: 'middle'
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 70, halign: 'left' },
      2: { cellWidth: 30, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 25, halign: 'center' },
      5: { cellWidth: 25, halign: 'center' },
      6: { cellWidth: 25, halign: 'center' },
      7: { cellWidth: 25, halign: 'center' }
    },
    margin: { top: 10, right: 14, bottom: 10, left: 14 },
    tableWidth: 'auto',
    didDrawPage: (data) => {
      // Add header on each page
      if (data.pageNumber > 1) {
        addOfficialHeader(doc, 'ACCOMPLISHMENT REPORT');
      }
      
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
      doc.text(
        `Generated on: ${new Date().toLocaleDateString()}`,
        pageWidth - 14,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'right' }
      );
    }
  });

  const fileName = `Accomplishment_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

/**
 * Export Accomplishment Report to Excel
 */
export const exportAccomplishmentToExcel = (data, filters = {}) => {
  const wb = XLSX.utils.book_new();
  
  const headerRow = [
    'NO.',
    'ORGANIZATION',
    'NATURE',
    'ACCOMPLISHMENT COUNT',
    'TOTAL POINTS',
    'ORGANIZATIONAL DEVELOPMENT',
    'ORGANIZATIONAL PERFORMANCE',
    'SERVICE TO COMMUNITY'
  ];

  const dataRows = data.map((row, index) => [
    index + 1,
    row.organizationProfile?.orgName || 'N/A',
    row.organizationProfile?.orgClass || '-',
    row.accomplishments?.length || 0,
    row.grandTotal || 0,
    row.totalOrganizationalDevelopment || 0,
    row.totalOrganizationalPerformance || 0,
    row.totalServiceCommunity || 0
  ]);

  const titleRow = ['ACCOMPLISHMENT REPORT'];
  const academicYearRow = ['Academic Year 2024-2025'];
  const emptyRow = [''];
  
  const allRows = [titleRow, academicYearRow, emptyRow];

  if (filters.status || filters.department || filters.dateFrom || filters.dateTo) {
    allRows.push(['Filters Applied:']);
    if (filters.status) allRows.push([`Status: ${filters.status}`]);
    if (filters.department) allRows.push([`Department: ${filters.department}`]);
    if (filters.dateFrom || filters.dateTo) {
      allRows.push([`Date Range: ${filters.dateFrom || 'Start'} to ${filters.dateTo || 'End'}`]);
    }
    allRows.push(emptyRow);
  }

  allRows.push(headerRow, ...dataRows);

  const ws = XLSX.utils.aoa_to_sheet(allRows);

  ws['!cols'] = [
    { wch: 5 },
    { wch: 35 },
    { wch: 15 },
    { wch: 18 },
    { wch: 15 },
    { wch: 25 },
    { wch: 25 },
    { wch: 25 }
  ];

  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Accomplishment Report');

  const fileName = `Accomplishment_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};
