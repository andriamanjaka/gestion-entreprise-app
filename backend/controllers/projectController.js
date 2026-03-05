import {
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
  getProjectById,
} from "../models/projectModel.js";

const parseDate = (dateString) => {
  if (!dateString) return null;
  if (dateString instanceof Date) {
    if (Number.isNaN(dateString.getTime())) return null;
    const normalized = new Date(dateString);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }

  const raw = String(dateString).trim();
  const datePart = raw.includes("T") ? raw.split("T")[0] : raw.slice(0, 10);
  const date = new Date(`${datePart}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

const computeProjectStatus = (dateDebut, dateFin) => {
  const start = parseDate(dateDebut);
  const end = parseDate(dateFin);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!start && !end) return "En attente";
  if (start && today < start) return "En attente";
  if (end && today > end) return "Termine";
  return "En cours";
};

const withComputedStatus = (project) => ({
  ...project,
  statut: computeProjectStatus(project.date_debut, project.date_fin),
});

// LISTE
export const getProjects = (req, res) => {
  getAllProjects((err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results.map(withComputedStatus));
  });
};

// AJOUT
export const addProject = (req, res) => {
  const data = {
    ...req.body,
    statut: computeProjectStatus(req.body.date_debut, req.body.date_fin),
  };

  createProject(data, (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Projet ajoute avec succes" });
  });
};

// DETAIL
export const getOneProject = (req, res) => {
  const { id } = req.params;

  getProjectById(id, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results[0] ? withComputedStatus(results[0]) : null);
  });
};

// UPDATE
export const editProject = (req, res) => {
  const { id } = req.params;
  const data = {
    ...req.body,
    statut: computeProjectStatus(req.body.date_debut, req.body.date_fin),
  };

  updateProject(id, data, (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Projet modifie" });
  });
};

// DELETE
export const removeProject = (req, res) => {
  const { id } = req.params;

  deleteProject(id, (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Projet supprime" });
  });
};
