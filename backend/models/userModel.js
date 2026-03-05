import db from "../config/db.js";

// Assurez-vous d'exporter findUserByEmail
export const findUserByEmail = (email, callback) => {
  db.query("SELECT * FROM users WHERE email = ?", [email], callback);
};

export const findUserByName = (nom, callback) => {
  db.query("SELECT * FROM users WHERE nom = ?", [nom], callback);
};

export const createUser = (nom, email, password, callback) => {
  db.query("INSERT INTO users (nom, email, password) VALUES (?, ?, ?)", 
    [nom, email, password], callback);
};