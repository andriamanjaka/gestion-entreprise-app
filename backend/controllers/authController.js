import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createUser, findUserByName } from "../models/userModel.js";

// ================= REGISTER =================
export const register = (req, res) => {
  const { nom, email, password } = req.body;

  // Vérification champs
  if (!nom || !email || !password) {
    return res.status(400).json({ message: "Champs requis manquants" });
  }

  findUserByName(nom, async (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Erreur serveur" });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: "Utilisateur existe déjà" });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      createUser(nom, email, hashedPassword, (err) => {
        if (err) {
          return res.status(500).json({ message: "Erreur création utilisateur" });
        }

        res.json({ message: "Inscription réussie" });
      });

    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });
};


// ================= LOGIN =================
export const login = (req, res) => {
  const { nom, password } = req.body;

  if (!nom || !password) {
    return res.status(400).json({ message: "Champs requis" });
  }

  findUserByName(nom, async (err, results) => {

    if (err) {
      return res.status(500).json({ message: "Erreur serveur" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    try {
      const user = results[0];

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Mot de passe incorrect" });
      }

      const token = jwt.sign(
        { id: user.id, nom: user.nom },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.json({
        message: "Connexion réussie",
        token,
        user: {
          id: user.id,
          nom: user.nom,
          email: user.email
        }
      });

    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }

  });
};
