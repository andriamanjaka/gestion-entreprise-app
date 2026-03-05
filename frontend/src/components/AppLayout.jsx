import { Link, useLocation } from "react-router-dom";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { path: "/projects", label: "Projets", icon: "projects" },
  { path: "/employer", label: "Employes", icon: "users" },
  { path: "/finance", label: "Finances", icon: "finance" },
  { path: "/settings", label: "Parametres", icon: "settings" },
];

const iconPaths = {
  dashboard: "M3 12l9-9 9 9M5 10v10h14V10",
  projects: "M3 6h7l2 2h9v12H3z",
  users: "M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M16 3a4 4 0 1 1 0 8M9 3a4 4 0 1 1 0 8",
  finance: "M3 17l6-6 4 4 7-7M21 10V3h-7",
  settings: "M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1M12 8a4 4 0 1 1 0 8a4 4 0 0 1 0-8z",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
};

const Icon = ({ name }) => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
    <path d={iconPaths[name]} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AppLayout = ({ title, children }) => {
  const location = useLocation();

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <h2 className="app-logo">GestionPro</h2>
        <p className="app-logo-subtitle">Gestion d'entreprise</p>
        <nav>
          <ul className="app-nav-list">
            {navItems.map((item) => (
              <li key={item.path} className={location.pathname === item.path ? "active" : ""}>
                <Link to={item.path}>
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
            <li className="app-nav-logout">
              <Link to="/login">
                <Icon name="logout" />
                <span>Deconnexion</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="app-main">
        <header className="app-topbar">
          <h1>{title}</h1>
          <div className="app-user-chip">Admin</div>
        </header>
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
