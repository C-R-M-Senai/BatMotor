/**
 * =============================================================================
 * App.jsx — “Cérebro” da SPA Batmotor
 * =============================================================================
 * O QUE ESTE FICHEIRO FAZ (ordem de leitura sugerida):
 *
 * 1) ROTAS PÚBLICAS vs PROTEGIDAS
 *    - `/login` : quem não está autenticado vê só o ecrã de login.
 *    - Demais URLs : envoltório `<ProtectedRoute>` — sem `batmotor-token` no localStorage,
 *      redirecciona para `/login`.
 *
 * 2) ESTADO DE SESSÃO (memória + localStorage)
 *    - Token JWT, id do utilizador, nome, e-mail, `accountKind` (admin | manager | employee),
 *      `profileRole` (slug para avatar), foto em base64.
 *    - `applySessionFromLogin` : chamado após `loginRequest` bem-sucedido; sincroniza estado React
 *      com o que o backend devolveu.
 *
 * 3) PERMISSÕES NA UI
 *    - `<PermissionsProvider accountKind={...}>` alimenta `usePermissions()` nas páginas
 *      (ex.: esconder exportação PDF para funcionário).
 *
 * 4) LAYOUT AUTENTICADO
 *    - Sidebar: cada `<NavLink to="...">` é um item de menu (navegação sem recarregar a página).
 *    - Cabeçalho: título da rota actual, busca decorativa, atalhos para `/relatorios`.
 *    - `<Routes>`: cada `<Route path="..." element={<.../>} />` associa URL → componente em `pages/`.
 *
 * 5) CSS DO TEMPLATE
 *    - Em `/login` remove-se temporariamente o `main.min.css` do AdminLTE para não conflitar
 *      com o design da página de autenticação; nas rotas internas o link é recriado.
 *
 * Documentação global: `docs/GUIA_PEDAGOGICO_BATMOTOR.md`
 * =============================================================================
 */
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
import { fetchMinStockAlerts, loginRequest } from "@/api";
import { clearSessionStorage } from "@/api/client";
import { ACCOUNT_KIND } from "@/constants/registerRoles";
import { PermissionsProvider } from "@/context/PermissionsContext";
import { HeaderSearchProvider, useHeaderSearch } from "@/context/HeaderSearchContext";
import {
  loadUserAvatarFromStorage,
  persistUserAvatarToStorage
} from "@/constants/userAvatar";
import PillAvatar from "./components/PillAvatar";
import batmotorLogo from "@/assets/LOGO.svg";

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

function AppHeaderSearchInput() {
  const { query, setQuery } = useHeaderSearch();
  return (
    <input
      type="search"
      className="app-header-search-pill__input"
      placeholder="Pesquisar"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      aria-label="Pesquisar e filtrar o conteúdo da página atual"
    />
  );
}

/** Cada troca de rota reinicia o texto da pesquisa (escopo é a página visível). */
function HeaderSearchResetOnNavigate() {
  const location = useLocation();
  const { setQuery } = useHeaderSearch();
  useEffect(() => {
    setQuery("");
  }, [location.pathname, setQuery]);
  return null;
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
  const [userAvatar, setUserAvatar] = useState(() =>
    loadUserAvatarFromStorage(localStorage.getItem(BATMOTOR_USER_ID_KEY) || "")
  );
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem("batmotor-email") || "");
  const [headerAlertCount, setHeaderAlertCount] = useState(0);
  const [sessionNotice, setSessionNotice] = useState("");

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
      const uidForAvatar =
        result.user?.id != null && result.user.id !== "" ? String(result.user.id) : "";
      setUserAvatar(loadUserAvatarFromStorage(uidForAvatar));
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
        const uid = localStorage.getItem(BATMOTOR_USER_ID_KEY) || "";
        if (avatarDataUrl === null) {
          persistUserAvatarToStorage(uid, null);
          setUserAvatar("");
        } else if (avatarDataUrl !== undefined && avatarDataUrl) {
          persistUserAvatarToStorage(uid, avatarDataUrl);
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
        clearSessionStorage();
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
    const token = localStorage.getItem("batmotor-token");
    if (!token) {
      setIsAuthenticated(false);
      setAccountKind("");
      return;
    }
    setIsAuthenticated(true);
    setUserName(localStorage.getItem("batmotor-user") || "Usuário");
    setUserEmail(localStorage.getItem("batmotor-email") || "");
    setProfileRole(localStorage.getItem("batmotor-profile-role") || "");
    setAccountKind(localStorage.getItem("batmotor-account-kind") || "");
    setUserAvatar(loadUserAvatarFromStorage(localStorage.getItem(BATMOTOR_USER_ID_KEY) || ""));
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "batmotor-token") {
        setIsAuthenticated(Boolean(localStorage.getItem("batmotor-token")));
      }
      if (e.key === "batmotor-account-kind") {
        setAccountKind(localStorage.getItem("batmotor-account-kind") || "");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (location.pathname !== "/login") return;
    const mark = sessionStorage.getItem("batmotor-session-expired");
    if (!mark) return;
    setSessionNotice("Sua sessão expirou. Faça login novamente.");
    sessionStorage.removeItem("batmotor-session-expired");
  }, [location.pathname]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isAuthenticated) {
      setHeaderAlertCount(0);
      return undefined;
    }
    let cancelled = false;
    fetchMinStockAlerts()
      .then((rows) => {
        if (!cancelled) setHeaderAlertCount(Array.isArray(rows) ? rows.length : 0);
      })
      .catch(() => {
        if (!cancelled) setHeaderAlertCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, location.pathname]);

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
          isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <LoginPage onLogin={authActions.login} initialNotice={sessionNotice} />
          )
        }
      />
      <Route path="/cadastro" element={<Navigate to="/login" replace />} />

      <Route
        path="*"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <PermissionsProvider accountKind={accountKind}>
            <HeaderSearchProvider>
            <HeaderSearchResetOnNavigate />
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
                        <img
                          src={batmotorLogo}
                          className="estocae-sidebar-brand__logo-img"
                          alt=""
                          aria-hidden
                          decoding="async"
                        />
                      </button>
                      <img
                        src={batmotorLogo}
                        className="estocae-sidebar-brand__logo-primary d-none d-lg-block"
                        alt=""
                        aria-hidden
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
                            <img
                              src={batmotorLogo}
                              className="estocae-header-logo-sm"
                              alt="Batmotor"
                              decoding="async"
                            />
                          </button>
                        ) : null}
                        <h1 className="app-header-overview__title">{headerPageTitle}</h1>
                      </div>
                      <div className="app-header-overview__right">
                        <div className="app-header-search-pill">
                          <i className="ri-search-line app-header-search-pill__icon" aria-hidden />
                          <AppHeaderSearchInput />
                        </div>
                        <div className="d-flex align-items-center gap-1 flex-shrink-0">
                          <div className="app-header-icon-slot">
                            <button
                              type="button"
                              className="app-header-icon-btn"
                              aria-label="Alertas de compras e relatório de estoque"
                              onClick={() => navigate("/relatorios")}
                            >
                              <i className="ri-mail-line" aria-hidden />
                            </button>
                            {headerAlertCount > 0 ? (
                              <span className="app-header-icon-badge" aria-hidden>
                                {headerAlertCount > 99 ? "99+" : headerAlertCount}
                              </span>
                            ) : null}
                          </div>
                          <div className="app-header-icon-slot">
                            <button
                              type="button"
                              className="app-header-icon-btn"
                              aria-label="Notificações"
                              onClick={() => navigate("/relatorios")}
                            >
                              <i className="ri-notification-3-line" aria-hidden />
                            </button>
                            {headerAlertCount > 0 ? (
                              <span className="app-header-icon-badge" aria-hidden>
                                {headerAlertCount > 99 ? "99+" : headerAlertCount}
                              </span>
                            ) : null}
                          </div>
                        </div>
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
            </HeaderSearchProvider>
            </PermissionsProvider>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
