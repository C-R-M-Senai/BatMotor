import { NavLink, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import DashboardPage from "./pages/DashboardPage";
import MaterialsPage from "./pages/MaterialsPage";
import ProductsPage from "./pages/ProductsPage";
import SuppliersPage from "./pages/SuppliersPage";
import MovementsPage from "./pages/MovementsPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import UsersPage from "./pages/UsersPage";
import LoginPage from "./pages/auth/LoginPage";
import { loginRequest } from "@/api";
import { ACCOUNT_KIND } from "@/constants/registerRoles";
import { PermissionsProvider } from "@/context/PermissionsContext";
import { USER_AVATAR_STORAGE_KEY } from "@/constants/userAvatar";
import PillAvatar from "./components/PillAvatar";
import batmotorLogo from "@/assets/TextoDALOGO (1).svg";

const BATMOTOR_USER_ID_KEY = "batmotor-user-id";

/** CSS do template AdminLTE/Bootstrap — conflita com o login; remove-se em /login. */
const BATMOTOR_TEMPLATE_CSS_MARKER = "main.min.css";

function removeTemplateStylesheets() {
  document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    const href = link.getAttribute("href") || "";
    if (href.includes(BATMOTOR_TEMPLATE_CSS_MARKER)) {
      link.remove();
    }
  });
}

function ensureTemplateStylesheet() {
  const already = [...document.querySelectorAll('link[rel="stylesheet"]')].some((link) =>
    (link.getAttribute("href") || "").includes(BATMOTOR_TEMPLATE_CSS_MARKER)
  );
  if (already) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "/assets/main.min.css";
  document.head.appendChild(link);
}

function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function sidebarNavClass({ isActive }) {
  return `app-sidebar-link${isActive ? " is-active" : ""}`;
}

function roleLabel(accountKind) {
  if (accountKind === "admin") return "Admin";
  if (accountKind === "manager") return "Gerente";
  if (accountKind === "employee") return "Funcionário";
  return "—";
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => Boolean(localStorage.getItem("batmotor-token"))
  );
  const [userName, setUserName] = useState(
    () => localStorage.getItem("batmotor-user") || "Mei Ling"
  );
  const [profileRole, setProfileRole] = useState(
    () => localStorage.getItem("batmotor-profile-role") || ""
  );
  const [accountKind, setAccountKind] = useState(
    () => localStorage.getItem("batmotor-account-kind") || ""
  );
  const [userAvatar, setUserAvatar] = useState(
    () => localStorage.getItem(USER_AVATAR_STORAGE_KEY) || ""
  );
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem("batmotor-email") || "");

  const headerPageTitle = useMemo(() => {
    const p = location.pathname;
    const titles = {
      "/": "Painel",
      "/produtos": "Produtos",
      "/estoque": "Estoque",
      "/fornecedores": "Fornecedores",
      "/movimentacoes": "Movimentações",
      "/relatorios": "Relatórios",
      "/sistema": "Sistema",
      "/usuarios": "Usuários"
    };
    return p in titles ? titles[p] : "Painel";
  }, [location.pathname]);

  const applySessionFromLogin = useMemo(
    () => (result) => {
      if (!result?.token) return;
      localStorage.setItem("batmotor-token", result.token);
      if (result.user?.id != null && result.user.id !== "") {
        localStorage.setItem(BATMOTOR_USER_ID_KEY, String(result.user.id));
      } else {
        localStorage.removeItem(BATMOTOR_USER_ID_KEY);
      }
      if (result.user?.name) {
        localStorage.setItem("batmotor-user", result.user.name);
        setUserName(result.user.name);
      }
      if (result.user?.email) {
        const em = String(result.user.email).trim().toLowerCase();
        localStorage.setItem("batmotor-email", em);
        setUserEmail(em);
      }
      if (result.user?.accountKind) {
        localStorage.setItem("batmotor-account-kind", result.user.accountKind);
        setAccountKind(result.user.accountKind);
      } else {
        localStorage.removeItem("batmotor-account-kind");
        setAccountKind("");
      }
      const pr = result.user?.profileRole ? String(result.user.profileRole) : "";
      if (pr) {
        localStorage.setItem("batmotor-profile-role", pr);
      } else {
        localStorage.removeItem("batmotor-profile-role");
      }
      setProfileRole(pr);
    },
    []
  );

  const saveProfile = useMemo(
    () =>
      ({ displayName, displayEmail, avatarDataUrl }) => {
        const nextName = displayName?.trim();
        if (nextName) {
          localStorage.setItem("batmotor-user", nextName);
          setUserName(nextName);
        }
        if (displayEmail !== undefined) {
          const nextEmail = String(displayEmail || "").trim();
          if (nextEmail) {
            localStorage.setItem("batmotor-email", nextEmail);
            setUserEmail(nextEmail);
          } else {
            localStorage.removeItem("batmotor-email");
            setUserEmail("");
          }
        }
        if (avatarDataUrl === null) {
          localStorage.removeItem(USER_AVATAR_STORAGE_KEY);
          setUserAvatar("");
        } else if (avatarDataUrl !== undefined && avatarDataUrl) {
          localStorage.setItem(USER_AVATAR_STORAGE_KEY, avatarDataUrl);
          setUserAvatar(avatarDataUrl);
        }
      },
    []
  );

  const authActions = useMemo(
    () => ({
      login: async ({ email, password, fallbackName }) => {
        const result = await loginRequest(email, password);
        const displayName = result.user?.name || fallbackName || "Usuário";
        const loginEmail = result.user?.email || email;
        applySessionFromLogin({
          ...result,
          user: {
            ...result.user,
            name: displayName,
            email: loginEmail
          }
        });
        setIsAuthenticated(true);
        navigate("/");
      },
      logout: () => {
        localStorage.removeItem("batmotor-token");
        localStorage.removeItem("batmotor-user");
        localStorage.removeItem(BATMOTOR_USER_ID_KEY);
        localStorage.removeItem("batmotor-account-kind");
        localStorage.removeItem("batmotor-profile-role");
        localStorage.removeItem("batmotor-email");
        localStorage.removeItem(USER_AVATAR_STORAGE_KEY);
        setProfileRole("");
        setAccountKind("");
        setUserAvatar("");
        setUserEmail("");
        setIsAuthenticated(false);
        navigate("/login");
      }
    }),
    [applySessionFromLogin, navigate]
  );

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileNavOpen]);

  useLayoutEffect(() => {
    const authRoute =
      location.pathname === "/login" ||
      location.pathname === "/cadastro" ||
      location.pathname.startsWith("/login/");
    if (authRoute) {
      removeTemplateStylesheets();
    } else {
      ensureTemplateStylesheet();
    }
  }, [location.pathname]);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <LoginPage onLogin={authActions.login} />
        }
      />
      <Route path="/cadastro" element={<Navigate to="/login" replace />} />

      <Route
        path="*"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <PermissionsProvider accountKind={accountKind}>
            <div className="page-wrapper">
              <button
                type="button"
                className={`sidebar-backdrop d-lg-none${mobileNavOpen ? " is-visible" : ""}`}
                aria-label="Fechar menu"
                tabIndex={mobileNavOpen ? 0 : -1}
                onClick={() => setMobileNavOpen(false)}
              />
              <div className="main-container">
                <aside
                  id="app-sidebar"
                  className={`app-sidebar-panel app-sidebar-panel--estocae${mobileNavOpen ? " app-sidebar-panel--open" : ""}`}
                >
                  <div className="estocae-sidebar-brand px-3 pt-3 pb-2">
                    <div className="estocae-sidebar-brand__row d-flex align-items-center gap-3 w-100 min-w-0">
                      <button
                        type="button"
                        className="sidebar-brand-logo-btn d-lg-none flex-shrink-0"
                        aria-label="Fechar menu de navegacao"
                        onClick={() => setMobileNavOpen(false)}
                      >
                        <img src={batmotorLogo} className="estocae-sidebar-brand__logo-img" alt="" aria-hidden />
                      </button>
                      <img
                        src={batmotorLogo}
                        className="estocae-sidebar-brand__mark d-none d-lg-block flex-shrink-0"
                        alt=""
                        decoding="async"
                      />
                      <div className="estocae-sidebar-brand__titles min-w-0">
                        <span className="estocae-sidebar-brand__wordmark">BATMOTOR</span>
                        <span className="estocae-sidebar-brand__tagline">Motores e Baterias</span>
                      </div>
                    </div>
                  </div>

                  <div className="estocae-sidebar-rule mx-3" />

                  <div className="app-sidebar-scroll">
                    <p className="app-sidebar-section-label">Menu principal</p>
                    <ul className="app-sidebar-nav app-sidebar-nav--estocae">
                      <li>
                        <NavLink to="/" end className={sidebarNavClass} onClick={() => setMobileNavOpen(false)}>
                          <i className="ri-home-5-line" aria-hidden />
                          <span className="app-sidebar-label">Dashboard</span>
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/produtos"
                          className={sidebarNavClass}
                          onClick={() => setMobileNavOpen(false)}
                        >
                          <i className="ri-inbox-2-line" aria-hidden />
                          <span className="app-sidebar-label">Produtos</span>
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/estoque"
                          className={sidebarNavClass}
                          onClick={() => setMobileNavOpen(false)}
                        >
                          <i className="ri-store-2-line" aria-hidden />
                          <span className="app-sidebar-label">Estoque</span>
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/fornecedores"
                          className={sidebarNavClass}
                          onClick={() => setMobileNavOpen(false)}
                        >
                          <i className="ri-truck-line" aria-hidden />
                          <span className="app-sidebar-label">Fornecedores</span>
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/movimentacoes"
                          className={sidebarNavClass}
                          onClick={() => setMobileNavOpen(false)}
                        >
                          <i className="ri-bill-line" aria-hidden />
                          <span className="app-sidebar-label">Movimentações</span>
                        </NavLink>
                      </li>
                    </ul>

                    <p className="app-sidebar-section-label">Configurações</p>
                    <ul className="app-sidebar-nav app-sidebar-nav--estocae">
                      <li>
                        <NavLink
                          to="/sistema"
                          className={sidebarNavClass}
                          onClick={() => setMobileNavOpen(false)}
                        >
                          <i className="ri-settings-3-line" aria-hidden />
                          <span className="app-sidebar-label">Sistema</span>
                        </NavLink>
                      </li>
                      {(accountKind === ACCOUNT_KIND.admin || accountKind === ACCOUNT_KIND.manager) && (
                        <li>
                          <NavLink
                            to="/usuarios"
                            className={sidebarNavClass}
                            onClick={() => setMobileNavOpen(false)}
                          >
                            <i className="ri-group-line" aria-hidden />
                            <span className="app-sidebar-label">Usuários</span>
                          </NavLink>
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="estocae-sidebar-rule mx-3" />

                  <footer className="estocae-sidebar-user">
                    <PillAvatar profileRole={profileRole} userPhotoDataUrl={userAvatar} className="estocae-sidebar-user__avatar" />
                    <div className="estocae-sidebar-user__text min-w-0">
                      <strong className="estocae-sidebar-user__name d-block text-truncate" title={userName}>
                        {userName}
                      </strong>
                      <span className="estocae-sidebar-user__role">{roleLabel(accountKind)}</span>
                    </div>
                    <button
                      type="button"
                      className="estocae-sidebar-user__logout"
                      onClick={authActions.logout}
                      title="Sair"
                      aria-label="Sair da conta"
                    >
                      <i className="ri-logout-box-r-line" aria-hidden />
                    </button>
                  </footer>
                </aside>

                <div className="app-container">
                  <header className="app-header app-header--overview">
                    <div className="app-header-overview__row">
                      <div className="app-header-overview__left">
                        {!mobileNavOpen ? (
                          <button
                            type="button"
                            className="app-header-logo-menu-btn d-lg-none"
                            aria-expanded={false}
                            aria-controls="app-sidebar"
                            aria-label="Abrir menu de navegacao"
                            onClick={() => setMobileNavOpen(true)}
                          >
                            <img src={batmotorLogo} className="estocae-header-logo-sm" alt="" aria-hidden />
                          </button>
                        ) : null}
                        <h1 className="app-header-overview__title">{headerPageTitle}</h1>
                      </div>
                      <div className="app-header-overview__right">
                        <div className="app-header-search-pill">
                          <i className="ri-search-line app-header-search-pill__icon" aria-hidden />
                          <input
                            type="search"
                            className="app-header-search-pill__input"
                            placeholder="Pesquisar"
                            aria-label="Pesquisar no painel"
                          />
                        </div>
                        <button
                          type="button"
                          className="app-header-icon-btn"
                          aria-label="Notificações"
                        >
                          <i className="ri-notification-3-line" aria-hidden />
                        </button>
                      </div>
                    </div>
                  </header>

                  <main className="app-body app-body--responsive px-2 px-sm-3 py-3">
                    <Routes>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/materias-primas" element={<Navigate to="/produtos" replace />} />
                      <Route path="/produtos" element={<ProductsPage />} />
                      <Route path="/estoque" element={<MaterialsPage />} />
                      <Route path="/fornecedores" element={<SuppliersPage />} />
                      <Route path="/movimentacoes" element={<MovementsPage />} />
                      <Route path="/relatorios" element={<ReportsPage />} />
                      <Route
                        path="/sistema"
                        element={
                          <SettingsPage
                            userName={userName}
                            userEmail={userEmail}
                            profileRole={profileRole}
                            accountKind={accountKind}
                            userAvatar={userAvatar}
                            onSaveProfile={saveProfile}
                            onSessionRefreshed={applySessionFromLogin}
                          />
                        }
                      />
                      <Route
                        path="/usuarios"
                        element={
                          accountKind === ACCOUNT_KIND.admin || accountKind === ACCOUNT_KIND.manager ? (
                            <UsersPage />
                          ) : (
                            <Navigate to="/" replace />
                          )
                        }
                      />
                      <Route path="/perfil" element={<Navigate to="/sistema" replace />} />
                    </Routes>
                  </main>
                  <div className="app-footer px-3 py-2">
                    <span className="text-muted">Batmotor Dashboard</span>
                    <span className="ms-2">2026</span>
                  </div>
                </div>
              </div>
            </div>
            </PermissionsProvider>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
