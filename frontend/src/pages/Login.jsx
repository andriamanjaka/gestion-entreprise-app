import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";

const Login = () => {
  const [nom, setNom] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nom || !password) {
      setMessage("Remplissez tous les champs.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      const { data } = await api.post("/auth/login", { nom, password });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <h1>GestionPro</h1>
          <p>Plateforme de gestion d'entreprise</p>
        </div>

        <h2>Connexion</h2>
        {message && <p className="alert alert-danger">{message}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Nom d'utilisateur</label>
          <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} />

          <label>Mot de passe</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="auth-link">
          Nouveau compte ? <Link to="/registre">Creer un compte</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
