import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ExportColumn {
  header: string;
  key: string;
}

export function exportToCsv(
  data: Record<string, any>[],
  columns: ExportColumn[],
  filename: string,
) {
  const BOM = "\uFEFF";
  const headers = columns.map((c) => c.header).join(";");
  const rows = data.map((row) =>
    columns.map((c) => {
      const val = row[c.key];
      if (val == null) return "";
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    }).join(";"),
  );

  const csv = BOM + [headers, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `${filename}.csv`);
}

export function exportToPdf(
  data: Record<string, any>[],
  columns: ExportColumn[],
  title: string,
  filename: string,
  filterDescription?: string,
) {
  const doc = new jsPDF({ orientation: "landscape" });

  // Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("GadoApp", 14, 15);

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text(title, 14, 24);

  if (filterDescription) {
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(filterDescription, 14, 30);
    doc.setTextColor(0, 0, 0);
  }

  const startY = filterDescription ? 36 : 30;

  // Table (functional API)
  autoTable(doc, {
    startY,
    head: [columns.map((c) => c.header)],
    body: data.map((row) => columns.map((c) => row[c.key] ?? "")),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: {
      fillColor: [34, 97, 58],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Gerado por GadoApp em ${new Date().toLocaleDateString("pt-BR")} - Página ${i}/${pageCount}`,
      14,
      doc.internal.pageSize.height - 10,
    );
  }

  doc.save(`${filename}.pdf`);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
