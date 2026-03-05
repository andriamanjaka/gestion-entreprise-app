import AppLayout from "../components/AppLayout";
import { useState } from "react";

const STORAGE_KEY = "gestionpro_settings";
const defaultSettings = {
  companyName: "GestionPro SARL",
  currency: "Ariary (Ar)",
  timezone: "Europe/Paris",
  contactEmail: "contact@gestionpro.mg",
};

const loadInitialSettings = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return defaultSettings;
  try {
    return { ...defaultSettings, ...JSON.parse(saved) };
  } catch (error) {
    console.error(error);
    return defaultSettings;
  }
};

const Settings = () => {
  const [settings, setSettings] = useState(loadInitialSettings);
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setMessage("Parametres enregistres avec succes.");
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <AppLayout title="Parametres">
      <section className="panel">
        <div className="panel-head">
          <h2>Configuration</h2>
        </div>

        {message && <p className="alert alert-success">{message}</p>}

        <form onSubmit={handleSubmit}>
          <div className="settings-grid">
            <div className="setting-item">
              <h3>Societe</h3>
              <input
                name="companyName"
                value={settings.companyName}
                onChange={handleChange}
                className="setting-input"
              />
            </div>
            <div className="setting-item">
              <h3>Devise</h3>
              <input
                name="currency"
                value={settings.currency}
                onChange={handleChange}
                className="setting-input"
              />
            </div>
            <div className="setting-item">
              <h3>Fuseau horaire</h3>
              <input
                name="timezone"
                value={settings.timezone}
                onChange={handleChange}
                className="setting-input"
              />
            </div>
          </div>

          <div className="settings-contact">
            <div className="form-group">
              <label>Email de contact</label>
              <input
                type="email"
                name="contactEmail"
                value={settings.contactEmail}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="settings-actions">
            <button type="submit" className="btn-primary">
              Sauvegarder les parametres
            </button>
          </div>
        </form>
      </section>
    </AppLayout>
  );
};

export default Settings;
