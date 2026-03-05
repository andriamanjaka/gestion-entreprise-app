import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";

const Registre = () => {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nom || !email || !password) {
      setMessage("Remplissez tous les champs.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      await api.post("/auth/register", { nom, email, password });
      navigate("/login");
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Erreur serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <h1>GestionPro</h1>
          <p>Creation de compte</p>
        </div>

        <h2>Inscription</h2>
        {message && <p className="alert alert-danger">{message}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Nom utilisateur</label>
          <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} />

          <label>Adresse email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

          <label>Mot de passe</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creation..." : "S'inscrire"}
          </button>
        </form>

        <p className="auth-link">
          Deja un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
};

export default Registre;
