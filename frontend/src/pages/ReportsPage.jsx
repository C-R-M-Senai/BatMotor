import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect, useMemo, useState } from "react";
import { fetchMinStockAlerts, fetchStockSummary } from "@/api";
import { downloadXlsxWorkbook } from "@/utils/exportXlsx";

function ReportsPage() {
  const [summary, setSummary] = useState({ totalItems: 0, totalStock: 0, byMaterial: [] });
  const [alertCount, setAlertCount] = useState(0);
  const [alertRows, setAlertRows] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchStockSummary()
      .then((data) => setSummary(data))
      .catch(() => setSummary({ totalItems: 0, totalStock: 0, byMaterial: [] }));
    fetchMinStockAlerts()
      .then((rows) => {
        const list = Array.isArray(rows) ? rows : [];
        setAlertRows(list);
        setAlertCount(list.length);
      })
      .catch(() => {
        setAlertRows([]);
        setAlertCount(0);
      });
  }, []);

  const categoryCount = useMemo(() => {
    const cats = new Set((summary.byMaterial || []).map((m) => m.category).filter(Boolean));
    return cats.size;
  }, [summary.byMaterial]);

  const metrics = useMemo(
    () => [
      {
        title: "Itens cadastrados",
        value: summary.totalItems,
        subtitle: "Produtos na base",
        tone: "primary",
        icon: "ri-file-list-3-line"
      },
      {
        title: "Estoque total",
        value: summary.totalStock,
        subtitle: "Soma das quantidades",
        tone: "success",
        icon: "ri-stack-line"
      },
      {
        title: "Categorias",
        value: categoryCount,
        subtitle: "Distintas no relatorio",
        tone: "warning",
        icon: "ri-price-tag-3-line"
      },
      {
        title: "Alertas de minimo",
        value: alertCount,
        subtitle: "Itens abaixo do minimo",
        tone: "danger",
        icon: "ri-alert-line"
      }
    ],
    [alertCount, categoryCount, summary.totalItems, summary.totalStock]
  );

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = summary.byMaterial || [];
    if (!q) return rows;
    return rows.filter(
      (item) =>
        String(item.name || "")
          .toLowerCase()
          .includes(q) ||
        String(item.category || "")
          .toLowerCase()
          .includes(q)
    );
  }, [summary.byMaterial, search]);

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Relatorio de Estoque - Batmotor", 14, 16);
    doc.setFontSize(11);
    doc.text(`Total de itens: ${summary.totalItems}`, 14, 24);
    doc.text(`Estoque total: ${summary.totalStock}`, 14, 30);
    doc.text(`Alertas abaixo do minimo: ${alertCount}`, 14, 36);
    let y = 42;
    autoTable(doc, {
      startY: y,
      head: [["Materia-prima", "Categoria", "Qtd", "Minimo"]],
      body: (summary.byMaterial || []).map((item) => [
        item.name,
        item.category,
        String(item.quantity),
        String(item.minStock ?? "—")
      ])
    });
    y = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 12 : y + 40;
    doc.setFontSize(12);
    doc.text("Itens abaixo do estoque minimo (compras)", 14, y);
    y += 6;
    autoTable(doc, {
      startY: y,
      head: [["Materia-prima", "Categoria", "Atual", "Minimo", "Deficit"]],
      body: (alertRows || []).map((a) => [
        a.name,
        a.category,
        String(a.currentStock),
        String(a.minStock),
        String(a.deficit != null ? a.deficit : Math.max(0, Number(a.minStock) - Number(a.currentStock)))
      ])
    });
    doc.save(`relatorio-estoque-batmotor-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const exportXlsx = () => {
    const day = new Date().toISOString().slice(0, 10);
    downloadXlsxWorkbook(`relatorio-estoque-batmotor-${day}.xlsx`, [
      {
        name: "Resumo",
        columns: {
          name: "Materia-prima",
          category: "Categoria",
          quantity: "Quantidade",
          minStock: "Estoque minimo"
        },
        rows: (summary.byMaterial || []).map((item) => ({
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          minStock: item.minStock
        }))
      },
      {
        name: "Alertas_minimo",
        columns: {
          name: "Materia-prima",
          category: "Categoria",
          currentStock: "Quantidade atual",
          minStock: "Minimo",
          deficit: "Deficit"
        },
        rows: (alertRows || []).map((a) => ({
          name: a.name,
          category: a.category,
          currentStock: a.currentStock,
          minStock: a.minStock,
          deficit:
            a.deficit != null ? a.deficit : Math.max(0, Number(a.minStock) - Number(a.currentStock))
        }))
      },
      {
        name: "Indicadores",
        columns: { k: "Indicador", v: "Valor" },
        rows: [
          { k: "Total itens", v: summary.totalItems },
          { k: "Estoque total", v: summary.totalStock },
          { k: "Alertas minimos", v: alertCount }
        ]
      }
    ]);
  };

  return (
    <div className="inventory-page">
      <header className="inventory-page__hero">
        <div>
          <p className="inventory-page__eyebrow">Analiticos</p>
          <h4 className="inventory-page__title">Relatorios de estoque</h4>
          <p className="inventory-page__subtitle">
            Exportacao em PDF e Excel (XLSX): estoque por materia-prima, indicadores e alertas abaixo do minimo.
          </p>
        </div>
        <div className="d-flex flex-column align-items-end gap-2 flex-shrink-0">
          <div className="d-flex flex-wrap gap-2 justify-content-end">
            <button type="button" className="btn btn-outline-primary" onClick={exportXlsx}>
              <i className="ri-file-excel-2-line me-1" aria-hidden />
              Baixar Excel
            </button>
            <button type="button" className="btn btn-primary" onClick={exportPdf}>
              <i className="ri-file-pdf-line me-1" aria-hidden />
              Baixar PDF
            </button>
          </div>
          <div className="inventory-page__hero-tag inventory-page__hero-tag--accent">
            <i className="ri-file-chart-line" aria-hidden />
            <span>Resumo por materia-prima</span>
          </div>
        </div>
      </header>

      <section className="row g-3 mb-3">
        {metrics.map((metric) => (
          <div key={metric.title} className="col-xxl-3 col-sm-6 col-12">
            <article className={`inventory-stat inventory-stat--${metric.tone}`}>
              <div className="inventory-stat__icon">
                <i className={metric.icon} aria-hidden />
              </div>
              <div>
                <span className="inventory-stat__label">{metric.title}</span>
                <strong className="inventory-stat__value">{metric.value}</strong>
                <small className="inventory-stat__note">{metric.subtitle}</small>
              </div>
            </article>
          </div>
        ))}
      </section>

      <section className="card inventory-toolbar mb-3">
        <div className="inventory-toolbar__row inventory-toolbar__row--reports">
          <div className="inventory-toolbar__search">
            <i className="ri-search-line" aria-hidden />
            <input
              type="search"
              className="form-control"
              placeholder="Pesquisar por nome ou categoria na tabela"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Filtrar tabela de relatorio"
            />
          </div>
        </div>
      </section>

      <section className="card inventory-table-card">
        <div className="inventory-table-card__head">
          <div>
            <h5 className="card-title mb-1">Detalhamento por materia-prima</h5>
            <p className="inventory-table-card__desc mb-0">
              {filteredRows.length} registro(s) — incluidos nos arquivos PDF e Excel.
            </p>
          </div>
          <span className="inventory-table-card__badge">Atualizado agora</span>
        </div>

        <div className="table-responsive">
          <table className="table align-middle mb-0 inventory-table">
            <thead>
              <tr>
                <th scope="col">Materia-prima</th>
                <th scope="col">Categoria</th>
                <th scope="col" className="text-end">
                  Quantidade
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="inventory-table__empty text-center py-4">
                    Nenhum registro encontrado para o filtro atual.
                  </td>
                </tr>
              ) : (
                filteredRows.map((item) => (
                  <tr key={item.id ?? `${item.name}-${item.category}`}>
                    <td className="inventory-table__primary">{item.name}</td>
                    <td className="inventory-table__secondary">{item.category}</td>
                    <td className="text-end">{item.quantity}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default ReportsPage;
