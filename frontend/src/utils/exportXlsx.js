import * as XLSX from "xlsx";

/**
 * Gera arquivo .xlsx no browser a partir de linhas ({...} por coluna) e lista de chaves como cabeçalho.
 * @param {string} filename - ex: relatorio.xlsx
 * @param {string} sheetName
 * @param {Record<string, string>} columns - { chaveObjeto: "Rótulo coluna" }
 * @param {object[]} rows
 */
export function downloadXlsx(filename, sheetName, columns, rows) {
  const keys = Object.keys(columns);
  const header = keys.map((k) => columns[k]);
  const body = (Array.isArray(rows) ? rows : []).map((row) =>
    keys.map((k) => {
      const v = row[k];
      if (v === null || v === undefined) return "";
      if (typeof v === "object") return JSON.stringify(v);
      return v;
    })
  );
  const aoa = [header, ...body];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31) || "Dados");
  XLSX.writeFile(wb, filename);
}

/**
 * Livro com várias folhas — útil para relatório + alertas.
 * @param {string} filename
 * @param {{ name: string; columns: Record<string, string>; rows: object[] }[]} sheets
 */
export function downloadXlsxWorkbook(filename, sheets) {
  const wb = XLSX.utils.book_new();
  for (const sh of sheets) {
    const keys = Object.keys(sh.columns);
    const header = keys.map((k) => sh.columns[k]);
    const body = (Array.isArray(sh.rows) ? sh.rows : []).map((row) =>
      keys.map((k) => {
        const v = row[k];
        if (v === null || v === undefined) return "";
        if (typeof v === "object") return JSON.stringify(v);
        return v;
      })
    );
    const ws = XLSX.utils.aoa_to_sheet([header, ...body]);
    XLSX.utils.book_append_sheet(wb, ws, sh.name.slice(0, 31) || "Sheet");
  }
  XLSX.writeFile(wb, filename);
}
