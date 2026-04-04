const colLetter = (i) => {
  let s = "";
  let n = i;
  while (n >= 0) {
    s = String.fromCharCode(65 + n % 26) + s;
    n = Math.floor(n / 26) - 1;
  }
  return s;
};
const esc = (v) => {
  if (v === null || v === void 0 || v === "") return "&nbsp;";
  return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
};
async function excelToTable(worksheet) {
  const XLSX = await import("xlsx");
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
  if (rows.length === 0) {
    return {
      html: "<table><tbody><tr><td>&nbsp;</td></tr></tbody></table>",
      rowCount: 0,
      colCount: 0
    };
  }
  const colCount = rows.reduce((max, row) => Math.max(max, row.length), 0);
  const rowCount = rows.length;
  const parts = [];
  parts.push("<table>");
  parts.push("<thead><tr>");
  parts.push('<th class="excel-row-num"></th>');
  for (let c = 0; c < colCount; c++) {
    parts.push(`<th class="excel-col-hdr">${colLetter(c)}</th>`);
  }
  parts.push("</tr></thead>");
  parts.push("<tbody>");
  for (let r = 0; r < rowCount; r++) {
    const row = rows[r];
    parts.push("<tr>");
    parts.push(`<td class="excel-row-num">${r + 1}</td>`);
    for (let c = 0; c < colCount; c++) {
      const val = c < row.length ? row[c] : "";
      const isNum = typeof val === "number";
      parts.push(`<td${isNum ? ' class="excel-num"' : ""}>${esc(val)}</td>`);
    }
    parts.push("</tr>");
  }
  parts.push("</tbody></table>");
  const DOMPurify = (await import("dompurify")).default;
  return {
    html: DOMPurify.sanitize(parts.join("")),
    rowCount,
    colCount
  };
}
export {
  excelToTable
};
//# sourceMappingURL=excelToTable.js.map
