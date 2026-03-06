import { useCallback, useEffect, useMemo, useState } from "react";
import AppLayout from "../components/AppLayout";
import api from "../lib/api";

const formatAr = (value) => `${new Intl.NumberFormat("fr-FR").format(value || 0)} Ar`;

const getStatusClass = (statut = "") => {
  const normalized = statut.toLowerCase();
  if (normalized.includes("term")) return "termine";
  if (normalized.includes("cours")) return "en-cours";
  return "en-attente";
};

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [projectRes, employeRes] = await Promise.all([
        api.get("/projects"),
        api.get("/employes"),
      ]);
      setProjects(projectRes.data || []);
      setEmployes(employeRes.data || []);
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
    const totalBudget = projects.reduce((sum, item) => sum + Number(item.budget || 0), 0);
    const salaryTotal = employes.reduce((sum, item) => sum + Number(item.salaire || 0), 0);
    const activeProjects = projects.filter((item) => getStatusClass(item.statut) === "en-cours").length;
    const completedProjects = projects.filter((item) => getStatusClass(item.statut) === "termine").length;

    return [
      { title: "Projets actifs", value: String(activeProjects) },
      { title: "Projets termines", value: String(completedProjects) },
      { title: "Employes", value: String(employes.length) },
      { title: "Budget total", value: formatAr(totalBudget) },
      { title: "Masse salariale", value: formatAr(salaryTotal) },
      { title: "Marge brute estimee", value: formatAr(totalBudget - salaryTotal) },
    ];
  }, [projects, employes]);

  const recentProjects = useMemo(
    () => [...projects].sort((a, b) => Number(b.id || 0) - Number(a.id || 0)).slice(0, 6),
    [projects]
  );

  return (
    <AppLayout title="Dashboard">
      <section className="stats-grid dashboard-stats-grid">
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
          <button type="button" className="btn-secondary" onClick={loadData}>
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
                  recentProjects.map((project) => (
                    <tr key={project.id}>
                      <td>{project.nom}</td>
                      <td>{formatAr(Number(project.budget || 0))}</td>
                      <td>{project.date_debut?.slice(0, 10) || "-"}</td>
                      <td>{project.date_fin?.slice(0, 10) || "-"}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(project.statut)}`}>
                          {project.statut || "En attente"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="empty-row">
                      Aucun projet disponible.
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
