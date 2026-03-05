import { useCallback, useEffect, useMemo, useState } from "react";
import AppLayout from "../components/AppLayout";
import api from "../lib/api";

const getProjectStatus = (value = "") => {
  const normalized = value.toLowerCase();
  if (normalized.includes("term")) return "termine";
  if (normalized.includes("cours")) return "en-cours";
  if (normalized.includes("suspend")) return "suspendu";
  return "en-attente";
};

const formatAr = (value) => `${new Intl.NumberFormat("fr-FR").format(value || 0)} Ar`;

const Dashboard = () => {
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
      setError("Impossible de charger les donnees du dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    const totalBudget = projects.reduce((sum, p) => sum + Number(p.budget || 0), 0);
    const totalSalaire = employes.reduce((sum, e) => sum + Number(e.salaire || 0), 0);
    const projetsActifs = projects.filter((p) => getProjectStatus(p.statut) === "en-cours").length;

    return [
      { title: "Projets actifs", value: String(projetsActifs) },
      { title: "Employes", value: String(employes.length) },
      { title: "Budget projets", value: formatAr(totalBudget) },
      { title: "Masse salariale", value: formatAr(totalSalaire) },
    ];
  }, [projects, employes]);

  const recentProjects = useMemo(
    () => [...projects].sort((a, b) => Number(b.id || 0) - Number(a.id || 0)).slice(0, 6),
    [projects]
  );

  return (
    <AppLayout title="Dashboard">
      <section className="stats-grid">
        {stats.map((item) => (
          <article className="stat-card" key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.value}</p>
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="panel-head panel-head-spread">
          <h2>Projets recents</h2>
          <button className="btn-secondary" onClick={loadData} type="button">
            Actualiser
          </button>
        </div>
        {error && <p className="alert alert-danger">{error}</p>}
        <div className="table-wrap">
          {loading ? (
            <p>Chargement...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Projet</th>
                  <th>Budget</th>
                  <th>Date debut</th>
                  <th>Date fin</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.length > 0 ? (
                  recentProjects.map((row) => {
                    const status = getProjectStatus(row.statut);
                    return (
                      <tr key={row.id}>
                        <td>{row.nom}</td>
                        <td>{formatAr(Number(row.budget || 0))}</td>
                        <td>{row.date_debut?.slice(0, 10) || "-"}</td>
                        <td>{row.date_fin?.slice(0, 10) || "-"}</td>
                        <td>
                          <span className={`status-badge ${status}`}>
                            {row.statut || "En attente"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="empty-row">
                      Aucun projet recent.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </AppLayout>
  );
};

export default Dashboard;
