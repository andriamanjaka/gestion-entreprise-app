import { useCallback, useEffect, useMemo, useState } from "react";
import AppLayout from "../components/AppLayout";
import UiIcon from "../components/UiIcon";
import api from "../lib/api";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+0-9\s().-]{8,20}$/;

const emptyEmploye = {
  nom: "",
  prenom: "",
  email: "",
  telephone: "",
  poste: "",
  salaire: "",
};

const Employer = () => {
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [currentEmploye, setCurrentEmploye] = useState(emptyEmploye);
  const [error, setError] = useState("");
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [posteFilter, setPosteFilter] = useState("");

  const fetchEmployes = useCallback(async () => {
    try {
      setLoading(true);
      setApiError("");
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (posteFilter) params.poste = posteFilter;

      const response = await api.get("/employes", { params });
      setEmployes(response.data || []);
    } catch (requestError) {
      console.error("Erreur lors du chargement:", requestError);
      setApiError("Impossible de charger les employes.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, posteFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => fetchEmployes(), 250);
    return () => clearTimeout(timeout);
  }, [fetchEmployes]);

  const postes = useMemo(() => {
    const values = employes.map((item) => item.poste).filter(Boolean);
    return [...new Set(values)].sort((a, b) => a.localeCompare(b));
  }, [employes]);

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet employe ?")) return;

    try {
      await api.delete(`/employes/${id}`);
      setSuccessMessage("Employe supprime avec succes.");
      fetchEmployes();
    } catch (requestError) {
      console.error("Erreur lors de la suppression:", requestError);
      setApiError(requestError.response?.data?.message || "Erreur lors de la suppression.");
    }
  };

  const openAddModal = () => {
    setModalMode("add");
    setCurrentEmploye(emptyEmploye);
    setError("");
    setShowModal(true);
  };

  const openEditModal = (employe) => {
    setModalMode("edit");
    setCurrentEmploye({
      ...employe,
      salaire: employe.salaire ?? "",
      telephone: employe.telephone ?? "",
      poste: employe.poste ?? "",
    });
    setError("");
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentEmploye((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!currentEmploye.nom.trim()) return "Le nom est requis";
    if (!currentEmploye.prenom.trim()) return "Le prenom est requis";
    if (!currentEmploye.email.trim()) return "L'email est requis";
    if (!EMAIL_REGEX.test(currentEmploye.email)) return "Email invalide";
    if (currentEmploye.telephone.trim() && !PHONE_REGEX.test(currentEmploye.telephone.trim())) {
      return "Telephone invalide";
    }
    if (currentEmploye.salaire !== "") {
      const salary = Number(currentEmploye.salaire);
      if (Number.isNaN(salary)) return "Le salaire doit etre un nombre";
      if (salary < 0) return "Le salaire doit etre positif";
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
    setApiError("");

    const payload = {
      ...currentEmploye,
      nom: currentEmploye.nom.trim(),
      prenom: currentEmploye.prenom.trim(),
      email: currentEmploye.email.trim().toLowerCase(),
      telephone: currentEmploye.telephone.trim(),
      poste: currentEmploye.poste.trim(),
      salaire: currentEmploye.salaire === "" ? null : Number(currentEmploye.salaire),
    };

    try {
      if (modalMode === "add") {
        await api.post("/employes", payload);
        setSuccessMessage("Employe ajoute avec succes.");
      } else {
        await api.put(`/employes/${currentEmploye.id}`, payload);
        setSuccessMessage("Employe modifie avec succes.");
      }

      setShowModal(false);
      setCurrentEmploye(emptyEmploye);
      fetchEmployes();
    } catch (requestError) {
      console.error("Erreur:", requestError);
      setError(requestError.response?.data?.message || "Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  };

  const formatSalaire = (value) => {
    if (value === null || value === undefined || value === "") return "-";
    return `${new Intl.NumberFormat("fr-FR").format(value)} Ar`;
  };

  return (
    <AppLayout title="Gestion des Employes">
      <section className="panel">
        <div className="panel-head panel-head-spread">
          <h2>Liste des employes</h2>
          <div className="toolbar">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher nom, prenom, email"
            />
            <select value={posteFilter} onChange={(e) => setPosteFilter(e.target.value)}>
              <option value="">Tous les postes</option>
              {postes.map((poste) => (
                <option key={poste} value={poste}>
                  {poste}
                </option>
              ))}
            </select>
            <button onClick={openAddModal} className="btn-primary">
              <UiIcon name="plus" />
              Ajouter employe
            </button>
          </div>
        </div>

        {successMessage && <p className="alert alert-success">{successMessage}</p>}
        {apiError && <p className="alert alert-danger">{apiError}</p>}

        <div className="table-wrap">
          {loading ? (
            <p>Chargement...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Prenom</th>
                  <th>Email</th>
                  <th>Telephone</th>
                  <th>Poste</th>
                  <th>Salaire</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employes.length > 0 ? (
                  employes.map((employe) => (
                    <tr key={employe.id}>
                      <td>{employe.nom}</td>
                      <td>{employe.prenom}</td>
                      <td>{employe.email}</td>
                      <td>{employe.telephone || "-"}</td>
                      <td>{employe.poste || "-"}</td>
                      <td>{formatSalaire(employe.salaire)}</td>
                      <td className="actions">
                        <button className="btn-action edit" onClick={() => openEditModal(employe)}>
                          <UiIcon name="edit" />
                          Editer
                        </button>
                        <button className="btn-action delete" onClick={() => handleDelete(employe.id)}>
                          <UiIcon name="trash" />
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="empty-row">
                      Aucun employe trouve.
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
              <h3>{modalMode === "add" ? "Ajouter un employe" : "Modifier un employe"}</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)} type="button">
                x
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <p className="alert alert-danger">{error}</p>}

                <div className="form-grid">
                  <div className="form-group">
                    <label>Nom *</label>
                    <input type="text" name="nom" value={currentEmploye.nom} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label>Prenom *</label>
                    <input type="text" name="prenom" value={currentEmploye.prenom} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" name="email" value={currentEmploye.email} onChange={handleInputChange} required />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Telephone</label>
                    <input type="tel" name="telephone" value={currentEmploye.telephone} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>Poste</label>
                    <input type="text" name="poste" value={currentEmploye.poste} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Salaire (Ar)</label>
                  <input
                    type="number"
                    name="salaire"
                    value={currentEmploye.salaire}
                    onChange={handleInputChange}
                    min="0"
                    step="1000"
                  />
                </div>
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

export default Employer;
