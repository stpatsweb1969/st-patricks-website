/**
 * Generic CSV export utility — reusable across admin surfaces.
 * No sacrament-specific logic; takes any rows + column config.
 */

export interface CsvColumn<T> {
  /** Column header label */
  header: string;
  /** Accessor function to extract cell value from a row */
  accessor: (row: T) => string | number | boolean | null | undefined;
}

/**
 * Export rows to a CSV file and trigger browser download.
 * @param rows - Array of data objects (already filtered/sorted)
 * @param columns - Column definitions (header + accessor)
 * @param filename - Download filename (should end in .csv)
 */
export function exportCsv<T>(
  rows: T[],
  columns: CsvColumn<T>[],
  filename: string
): void {
  if (rows.length === 0) return;

  // Build header row
  const headers = columns.map((col) => escapeCsvField(col.header));

  // Build data rows
  const dataRows = rows.map((row) =>
    columns.map((col) => {
      const value = col.accessor(row);
      if (value === null || value === undefined) return "";
      return escapeCsvField(String(value));
    })
  );

  // Combine into CSV string
  const csvContent = [headers.join(","), ...dataRows.map((r) => r.join(","))].join("\n");

  // Create blob and trigger download
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Escape a field value for CSV (RFC 4180 compliant).
 * Wraps in quotes if contains comma, quote, or newline.
 */
function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n") || value.includes("\r")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
