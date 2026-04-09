import { useEffect, useMemo, useState } from "react";
import { fetchMinStockAlerts, fetchStockSummary, fetchSuppliers } from "@/api";
import DashboardKpis from "../components/dashboard/DashboardKpis";
import DashboardChartsSection from "../components/dashboard/DashboardChartsSection";
import DashboardBottomSection from "../components/dashboard/DashboardBottomSection";

function DashboardPage() {
  const [alerts, setAlerts] = useState([]);
  const [suppliersCount, setSuppliersCount] = useState(0);
  const [summary, setSummary] = useState({ totalItems: 0, totalStock: 0, byMaterial: [] });

  useEffect(() => {
    const load = async () => {
      try {
        const [alertsData, summaryData, suppliersData] = await Promise.all([
          fetchMinStockAlerts(),
          fetchStockSummary(),
          fetchSuppliers()
        ]);
        setAlerts(alertsData);
        setSummary(summaryData);
        setSuppliersCount(suppliersData.length);
      } catch (_err) {
        setAlerts([]);
        setSuppliersCount(0);
      }
    };
    load();
  }, []);

  const categoriesData = useMemo(() => {
    const grouped = summary.byMaterial.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + (Number(item.quantity) || 0);
      return acc;
    }, {});

    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [summary.byMaterial]);

  return (
    <div className="dashboard-page dashboard-page--wide container-fluid px-0 py-0">
      <section className="dashboard-section dashboard-section--kpis">
        <DashboardKpis summary={summary} alertsCount={alerts.length} suppliersCount={suppliersCount} />
      </section>
      <section className="dashboard-section dashboard-section--charts-main">
        <DashboardChartsSection categoriesData={categoriesData} summary={summary} />
      </section>
      <section className="dashboard-section dashboard-section--bottom-panels mt-1 mb-4">
        <DashboardBottomSection byMaterial={summary.byMaterial} />
      </section>
    </div>
  );
}

export default DashboardPage;
