# Reports Formatting Specification

Based on: `APESOC-RESULT-SAMPLE-FORMAT (1).docx`

## Document Layout
- **Orientation**: Landscape
- **Page Size**: A4 Landscape (16838 x 11906 twips)
- **Font**: Arial, 10pt (20 half-points)
- **Margins**: 1440 twips all around (~1 inch)

## Table Structure for Accreditation Reports

### Column Headers (Row 1)
| Column # | Header | Description |
|----------|--------|-------------|
| 1 | NO. | Sequential number |
| 2 | NAME OF THE ORGANIZATION | Full organization name |
| 3 | NATURE | Organization type/classification |
| 4 | STATUS | Current status (e.g., Active, Inactive) |
| 5 | ADVISER/S | Faculty adviser name(s) |
| 6 | PRESIDENT | Student president name |
| 7 | VALIDITY | Validity period/date |
| 8-10 | APESOC RESULT 2024-25 | Merged header spanning 3 columns |
| 11 | STATUS OF ACCREDITATION | Overall accreditation status |

### Sub-headers (Row 2) for APESOC Result
| Column # | Sub-header |
|----------|------------|
| 8 | 1ST SEM |
| 9 | 2ND SEM |
| 10 | TOTAL |

## Formatting Features

### Table Styling
- **Border Style**: Grid (all cells have borders)
- **Header Row**: Bold, centered text
- **Cell Alignment**: Center vertical and horizontal for headers
- **Font Size**: 10pt (20 half-points) for data
- **Cell Merging**: Columns 8-10 in Row 1 are merged for "APESOC RESULT 2024-25"

### Column Widths (approximate in pixels)
1. NO.: ~50px
2. ORGANIZATION: ~120px
3. NATURE: ~80px
4. STATUS: ~80px
5. ADVISER/S: ~90px
6. PRESIDENT: ~95px
7. VALIDITY: ~85px
8. 1ST SEM: ~75px
9. 2ND SEM: ~75px
10. TOTAL: ~80px
11. ACCREDITATION STATUS: ~130px

## Key Requirements for Implementation

1. **Sortable Columns**: All column headers should be clickable for sorting
2. **Filters**: 
   - Status filter (dropdown)
   - Department/Nature filter
   - Date range for validity/semester
3. **Export**: Support PDF and Excel/CSV export with same formatting
4. **Responsive**: Maintain readability on different screen sizes
5. **Print-friendly**: Landscape orientation for print

## Data Mapping (Accreditation)

From `/getAllAccreditationId` API response:
- NO. → Sequential index
- NAME OF THE ORGANIZATION → `organizationProfile.orgName`
- NATURE → `organizationProfile.orgClass`
- STATUS → `organizationProfile.status` or accreditation status
- ADVISER/S → From president profile or organization data
- PRESIDENT → `PresidentProfile.firstName + lastName`
- VALIDITY → Date range or academic year
- 1ST SEM → First semester accomplishment points
- 2ND SEM → Second semester accomplishment points  
- TOTAL → Sum of both semesters
- STATUS OF ACCREDITATION → `overallStatus`

## Notes
- Empty rows should have borders but no data
- Maintain consistent row height
- Use center alignment for numerical data
- Left-align text data (organization names, adviser names)
