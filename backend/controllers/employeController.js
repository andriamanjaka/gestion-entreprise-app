import Employe from "../models/employeModel.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+0-9\s().-]{8,20}$/;

const normalizeEmployeInput = (payload = {}) => ({
  nom: payload.nom?.trim(),
  prenom: payload.prenom?.trim(),
  email: payload.email?.trim().toLowerCase(),
  telephone: payload.telephone?.trim(),
  poste: payload.poste?.trim(),
  salaire:
    payload.salaire === '' || payload.salaire === undefined || payload.salaire === null
      ? null
      : Number(payload.salaire),
});

const validateEmploye = (payload, { isUpdate = false } = {}) => {
  if (!isUpdate || payload.nom !== undefined) {
    if (!payload.nom) return "Le nom est requis";
  }

  if (!isUpdate || payload.prenom !== undefined) {
    if (!payload.prenom) return "Le prenom est requis";
  }

  if (!isUpdate || payload.email !== undefined) {
    if (!payload.email) return "L'email est requis";
    if (!EMAIL_REGEX.test(payload.email)) return "Format d'email invalide";
  }

  if (payload.telephone && !PHONE_REGEX.test(payload.telephone)) {
    return "Format de telephone invalide";
  }

  if (payload.salaire !== null && payload.salaire !== undefined) {
    if (Number.isNaN(payload.salaire)) return "Le salaire doit etre un nombre";
    if (payload.salaire < 0) return "Le salaire ne peut pas etre negatif";
  }

  return null;
};

const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

// Recuperer tous les employes
export const getAllEmployes = (req, res) => {
  const filters = {
    search: req.query.search?.trim(),
    poste: req.query.poste?.trim(),
    sortBy: req.query.sortBy,
    sortOrder: req.query.sortOrder,
  };

  if (req.query.minSalaire !== undefined && req.query.minSalaire !== "") {
    filters.minSalaire = Number(req.query.minSalaire);
  }

  if (req.query.maxSalaire !== undefined && req.query.maxSalaire !== "") {
    filters.maxSalaire = Number(req.query.maxSalaire);
  }

  if (
    (filters.minSalaire !== undefined && Number.isNaN(filters.minSalaire)) ||
    (filters.maxSalaire !== undefined && Number.isNaN(filters.maxSalaire))
  ) {
    return res.status(400).json({ message: "Les filtres de salaire sont invalides" });
  }

  Employe.getAll(filters, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    res.json(results);
  });
};

// Recuperer un employe par ID
export const getEmployeById = (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: "Identifiant employe invalide" });

  Employe.getById(id, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Employe non trouve" });
    }
    res.json(results[0]);
  });
};

// Creer un employe
export const createEmploye = (req, res) => {
  const employe = normalizeEmployeInput(req.body);

  const validationError = validateEmploye(employe);
  if (validationError) return res.status(400).json({ message: validationError });

  Employe.emailExists(employe.email, null, (emailErr, emailRows) => {
    if (emailErr) {
      console.error(emailErr);
      return res.status(500).json({ message: "Erreur serveur" });
    }

    if (emailRows.length > 0) {
      return res.status(409).json({ message: "Cet email est deja utilise" });
    }

    Employe.create(employe, (err, result) => {
      if (err) {
        console.error(err);
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).json({ message: "Cet email est deja utilise" });
        }
        return res.status(500).json({ message: "Erreur lors de la creation" });
      }

      res.status(201).json({
        id: result.insertId,
        ...employe,
        message: "Employe cree avec succes",
      });
    });
  });
};

// Mettre a jour un employe
export const updateEmploye = (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: "Identifiant employe invalide" });

  const input = normalizeEmployeInput(req.body);

  Employe.getById(id, (findErr, rows) => {
    if (findErr) {
      console.error(findErr);
      return res.status(500).json({ message: "Erreur serveur" });
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: "Employe non trouve" });
    }

    const existing = rows[0];
    const employe = {
      nom: input.nom ?? existing.nom,
      prenom: input.prenom ?? existing.prenom,
      email: input.email ?? existing.email,
      telephone: input.telephone ?? existing.telephone,
      poste: input.poste ?? existing.poste,
      salaire: input.salaire ?? existing.salaire,
    };

    const validationError = validateEmploye(employe, { isUpdate: true });
    if (validationError) return res.status(400).json({ message: validationError });

    Employe.emailExists(employe.email, id, (emailErr, emailRows) => {
      if (emailErr) {
        console.error(emailErr);
        return res.status(500).json({ message: "Erreur serveur" });
      }

      if (emailRows.length > 0) {
        return res.status(409).json({ message: "Cet email est deja utilise" });
      }

      Employe.update(id, employe, (err, result) => {
        if (err) {
          console.error(err);
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "Cet email est deja utilise" });
          }
          return res.status(500).json({ message: "Erreur lors de la mise a jour" });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Employe non trouve" });
        }
        res.json({ message: "Employe mis a jour avec succes" });
      });
    });
  });
};

// Supprimer un employe
export const deleteEmploye = (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: "Identifiant employe invalide" });

  Employe.delete(id, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur lors de la suppression" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Employe non trouve" });
    }
    res.json({ message: "Employe supprime avec succes" });
  });
};
