import db from "../config/db.js";

export const getAllProjects = (callback) => {
  const sql = "SELECT * FROM projects ORDER BY id DESC";
  db.query(sql, callback);
};

export const getProjectById = (id, callback) => {
  const sql = "SELECT * FROM projects WHERE id = ?";
  db.query(sql, [id], callback);
};

export const createProject = (data, callback) => {
  const sql = `
    INSERT INTO projects (nom, description, budget, date_debut, date_fin, statut)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      data.nom,
      data.description,
      data.budget,
      data.date_debut,
      data.date_fin,
      data.statut,
    ],
    callback
  );
};

export const updateProject = (id, data, callback) => {
  const sql = `
    UPDATE projects 
    SET nom=?, description=?, budget=?, date_debut=?, date_fin=?, statut=?
    WHERE id=?
  `;

  db.query(
    sql,
    [
      data.nom,
      data.description,
      data.budget,
      data.date_debut,
      data.date_fin,
      data.statut,
      id,
    ],
    callback
  );
};

export const deleteProject = (id, callback) => {
  const sql = "DELETE FROM projects WHERE id=?";
  db.query(sql, [id], callback);
};
