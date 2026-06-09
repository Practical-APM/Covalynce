export function downloadText(
  filename: string,
  content: string,
  mime = "text/plain;charset=utf-8"
) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadCsv(
  filename: string,
  headers: string[],
  rows: Record<string, string>[]
) {
  const escape = (v: string) =>
    v.includes(",") || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v;
  const lines = [
    headers.map(escape).join(","),
    ...rows.map((row) =>
      headers.map((h) => escape(String(row[h] ?? ""))).join(",")
    ),
  ];
  downloadText(filename, lines.join("\n"), "text/csv;charset=utf-8");
}
