import db from '../config/db.js';

const ALLOWED_SORT_FIELDS = ['id', 'nom', 'prenom', 'email', 'poste', 'salaire'];

const buildFilters = (filters = {}) => {
  const conditions = [];
  const values = [];

  if (filters.search) {
    conditions.push('(nom LIKE ? OR prenom LIKE ? OR email LIKE ?)');
    const pattern = `%${filters.search}%`;
    values.push(pattern, pattern, pattern);
  }

  if (filters.poste) {
    conditions.push('poste = ?');
    values.push(filters.poste);
  }

  if (filters.minSalaire !== undefined) {
    conditions.push('salaire >= ?');
    values.push(filters.minSalaire);
  }

  if (filters.maxSalaire !== undefined) {
    conditions.push('salaire <= ?');
    values.push(filters.maxSalaire);
  }

  return {
    whereClause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    values,
  };
};

const Employe = {
  getAll: (filters, callback) => {
    const { whereClause, values } = buildFilters(filters);
    const sortBy = ALLOWED_SORT_FIELDS.includes(filters?.sortBy) ? filters.sortBy : 'id';
    const sortOrder = filters?.sortOrder === 'asc' ? 'ASC' : 'DESC';
    const sql = `SELECT * FROM employes ${whereClause} ORDER BY ${sortBy} ${sortOrder}`;

    db.query(sql, values, callback);
  },

  getById: (id, callback) => {
    db.query('SELECT * FROM employes WHERE id = ?', [id], callback);
  },

  emailExists: (email, excludeId, callback) => {
    const sql =
      excludeId !== undefined && excludeId !== null
        ? 'SELECT id FROM employes WHERE email = ? AND id <> ? LIMIT 1'
        : 'SELECT id FROM employes WHERE email = ? LIMIT 1';
    const values =
      excludeId !== undefined && excludeId !== null
        ? [email, excludeId]
        : [email];

    db.query(sql, values, callback);
  },

  create: (employe, callback) => {
    const { nom, prenom, email, telephone, poste, salaire } = employe;
    db.query(
      'INSERT INTO employes (nom, prenom, email, telephone, poste, salaire) VALUES (?, ?, ?, ?, ?, ?)',
      [nom, prenom, email, telephone, poste, salaire],
      callback
    );
  },

  update: (id, employe, callback) => {
    const { nom, prenom, email, telephone, poste, salaire } = employe;
    db.query(
      'UPDATE employes SET nom = ?, prenom = ?, email = ?, telephone = ?, poste = ?, salaire = ? WHERE id = ?',
      [nom, prenom, email, telephone, poste, salaire, id],
      callback
    );
  },

  delete: (id, callback) => {
    db.query('DELETE FROM employes WHERE id = ?', [id], callback);
  }
};

export default Employe;
