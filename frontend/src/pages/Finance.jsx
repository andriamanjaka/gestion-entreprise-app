import { useCallback, useEffect, useMemo, useState } from "react";
import AppLayout from "../components/AppLayout";
import api from "../lib/api";

const formatAr = (value) => `${new Intl.NumberFormat("fr-FR").format(value || 0)} Ar`;

const Finance = () => {
  const [projects, setProjects] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [projectsRes, employesRes] = await Promise.all([
        api.get("/projects"),
        api.get("/employes"),
      ]);
      setProjects(projectsRes.data || []);
      setEmployes(employesRes.data || []);
    } catch (requestError) {
      console.error(requestError);
      setError("Impossible de charger les donnees financieres.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const finance = useMemo(() => {
    const totalBudget = projects.reduce((sum, item) => sum + Number(item.budget || 0), 0);
    const salaryCost = employes.reduce((sum, item) => sum + Number(item.salaire || 0), 0);
    const fixedCharges = totalBudget * 0.12;
    const netMargin = totalBudget - salaryCost - fixedCharges;
    return { totalBudget, salaryCost, fixedCharges, netMargin };
  }, [projects, employes]);

  const ratio = useMemo(() => {
    if (!finance.totalBudget) {
      return { salaries: 0, charges: 0, margin: 0 };
    }
    return {
      salaries: Math.round((finance.salaryCost / finance.totalBudget) * 100),
      charges: Math.round((finance.fixedCharges / finance.totalBudget) * 100),
      margin: Math.round((finance.netMargin / finance.totalBudget) * 100),
    };
  }, [finance]);

  return (
    <AppLayout title="Finances">
      <section className="panel">
        <div className="panel-head panel-head-spread">
          <h2>Resume financier</h2>
          <button type="button" className="btn-secondary" onClick={loadData}>
            Actualiser
          </button>
        </div>
        {error && <p className="alert alert-danger">{error}</p>}
        <div className="stats-grid">
          <article className="stat-card">
            <h3>Volume budgetaire</h3>
            <p>{formatAr(finance.totalBudget)}</p>
          </article>
          <article className="stat-card">
            <h3>Masse salariale</h3>
            <p>{formatAr(finance.salaryCost)}</p>
          </article>
          <article className="stat-card">
            <h3>Charges fixes estimees</h3>
            <p>{formatAr(finance.fixedCharges)}</p>
          </article>
          <article className="stat-card">
            <h3>Marge nette</h3>
            <p>{formatAr(finance.netMargin)}</p>
          </article>
        </div>

        <div className="finance-bars">
          <div className="finance-row">
            <span>Salaires ({ratio.salaries}%)</span>
            <div className="finance-track">
              <div className="finance-fill salaries" style={{ width: `${Math.max(ratio.salaries, 2)}%` }} />
            </div>
          </div>
          <div className="finance-row">
            <span>Charges ({ratio.charges}%)</span>
            <div className="finance-track">
              <div className="finance-fill charges" style={{ width: `${Math.max(ratio.charges, 2)}%` }} />
            </div>
          </div>
          <div className="finance-row">
            <span>Marge ({ratio.margin}%)</span>
            <div className="finance-track">
              <div className="finance-fill margin" style={{ width: `${Math.max(ratio.margin, 2)}%` }} />
            </div>
          </div>
        </div>

        {loading && <p>Chargement...</p>}
      </section>
    </AppLayout>
  );
};

export default Finance;
