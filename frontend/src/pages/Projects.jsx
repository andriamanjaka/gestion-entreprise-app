import { useCallback, useEffect, useMemo, useState } from "react";
import AppLayout from "../components/AppLayout";
import UiIcon from "../components/UiIcon";
import api from "../lib/api";

const emptyProject = {
  nom: "",
  description: "",
  budget: "",
  date_debut: "",
  date_fin: "",
};
const getStatusClass = (statut = "") => {
  const normalized = statut.toLowerCase();
  if (normalized.includes("term")) return "termine";
  if (normalized.includes("cours")) return "en-cours";
  return "en-attente";
};

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [apiError, setApiError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentProject, setCurrentProject] = useState(emptyProject);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setApiError("");
      const res = await api.get("/projects");
      setProjects(res.data || []);
    } catch (requestError) {
      console.error(requestError);
      setApiError("Impossible de charger les projets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return projects;
    return projects.filter((item) =>
      [item.nom, item.description, item.statut].join(" ").toLowerCase().includes(normalized)
    );
  }, [projects, searchTerm]);

  const openAddModal = () => {
    setModalMode("add");
    setCurrentProject(emptyProject);
    setError("");
    setShowModal(true);
  };

  const openEditModal = (project) => {
    setModalMode("edit");
    setCurrentProject({
      ...project,
      budget: project.budget ?? "",
      date_debut: project.date_debut?.slice(0, 10) || "",
      date_fin: project.date_fin?.slice(0, 10) || "",
    });
    setError("");
    setShowModal(true);
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setCurrentProject((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!currentProject.nom.trim()) return "Le nom du projet est requis.";
    if (currentProject.budget !== "" && Number(currentProject.budget) < 0) {
      return "Le budget doit etre positif.";
    }
    if (currentProject.date_debut && currentProject.date_fin && currentProject.date_fin < currentProject.date_debut) {
      return "La date de fin doit etre apres la date de debut.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError("");
    const payload = {
      ...currentProject,
      nom: currentProject.nom.trim(),
      description: currentProject.description.trim(),
      budget: currentProject.budget === "" ? null : Number(currentProject.budget),
    };

    try {
      if (modalMode === "add") {
        await api.post("/projects", payload);
      } else {
        await api.put(`/projects/${currentProject.id}`, payload);
      }

      setShowModal(false);
      fetchProjects();
    } catch (requestError) {
      console.error(requestError);
      setError(requestError.response?.data?.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce projet ?")) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch (requestError) {
      console.error(requestError);
      setApiError(requestError.response?.data?.message || "Suppression impossible.");
    }
  };

  return (
    <AppLayout title="Gestion des Projets">
      <section className="panel">
        <div className="panel-head panel-head-spread">
          <h2>Liste des projets</h2>
          <div className="toolbar">
            <input
              type="text"
              value={searchTerm}
              placeholder="Rechercher un projet"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn-primary" onClick={openAddModal}>
              <UiIcon name="plus" />
              Ajouter projet
            </button>
          </div>
        </div>

        {apiError && <p className="alert alert-danger">{apiError}</p>}

        <div className="table-wrap">
          {loading ? (
            <p>Chargement...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Budget</th>
                  <th>Date debut</th>
                  <th>Date fin</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <tr key={project.id}>
                      <td>{project.nom}</td>
                      <td>{project.budget ? `${new Intl.NumberFormat("fr-FR").format(project.budget)} Ar` : "-"}</td>
                      <td>{project.date_debut?.slice(0, 10) || "-"}</td>
                      <td>{project.date_fin?.slice(0, 10) || "-"}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(project.statut)}`}>
                          {project.statut || "-"}
                        </span>
                      </td>
                      <td className="actions">
                        <button className="btn-action edit" onClick={() => openEditModal(project)}>
                          <UiIcon name="edit" />
                          Editer
                        </button>
                        <button className="btn-action delete" onClick={() => handleDelete(project.id)}>
                          <UiIcon name="trash" />
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-row">
                      Aucun projet trouve.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{modalMode === "add" ? "Ajouter projet" : "Modifier projet"}</h3>
              <button type="button" className="icon-btn" onClick={() => setShowModal(false)}>
                x
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <p className="alert alert-danger">{error}</p>}

                <div className="form-group">
                  <label>Nom</label>
                  <input name="nom" value={currentProject.nom} onChange={handleInput} />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea name="description" value={currentProject.description} onChange={handleInput} />
                </div>
                <div className="form-group">
                  <label>Budget</label>
                  <input type="number" name="budget" value={currentProject.budget} onChange={handleInput} />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Date debut</label>
                    <input type="date" name="date_debut" value={currentProject.date_debut} onChange={handleInput} />
                  </div>
                  <div className="form-group">
                    <label>Date fin</label>
                    <input type="date" name="date_fin" value={currentProject.date_fin} onChange={handleInput} />
                  </div>
                </div>
                <p className="alert">
                  Le statut est calcule automatiquement a partir des dates (debut/fin).
                </p>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} disabled={submitting}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "En cours..." : modalMode === "add" ? "Ajouter" : "Sauvegarder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Projects;
