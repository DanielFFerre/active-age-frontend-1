import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userTipo, setUserTipo] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const paginasInstitucionais = [
    "/privacidade",
    "/termos",
    "/quem-somos",
    "/servicos",
  ];
  const isInstitucional = paginasInstitucionais.includes(location.pathname);

  const isCadastro = location.pathname === "/cadastro";
  const isLogin = location.pathname === "/login";

  useEffect(() => {
    const token = localStorage.getItem("activeAgeToken");
    const userJSON = localStorage.getItem("activeAgeUser");

    if (token && userJSON) {
      setIsLoggedIn(true);
      const user = JSON.parse(userJSON);
      setUserName(user.nome);
      setUserTipo(user.tipo || "");
    } else {
      setIsLoggedIn(false);
      setUserName("");
      setUserTipo("");
    }
  }, [location.pathname]);

  const handleLogout = () => {
    Swal.fire({
      title: "Sair da conta?",
      text: "Tem certeza que deseja encerrar a sua sessão?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sim, sair",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("activeAgeToken");
        localStorage.removeItem("activeAgeUser");
        setIsLoggedIn(false);
        navigate("/");
      }
    });
  };

  return (
    <nav className="navbar navbar-expand-lg bg-white shadow-sm py-3 d-print-none">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img
            src="/logo.png"
            alt="Active Age Logo"
            height="100"
            className="me-2"
          />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div
          className="collapse navbar-collapse justify-content-end"
          id="navbarNav"
        >
          <ul className="navbar-nav align-items-lg-center mt-3 mt-lg-0">
            {isInstitucional ? (
              <li className="nav-item">
                <Link className="btn btn-outline-secondary" to="/">
                  Voltar para Home
                </Link>
              </li>
            ) : isLoggedIn ? (
              <>
                <li className="nav-item d-flex align-items-center me-lg-4 mb-3 mb-lg-0 mt-3 mt-lg-0">
                  <span className="navbar-text fs-5 d-flex align-items-center gap-2">
                    Olá,{" "}
                    <strong style={{ color: "var(--aa-brown)" }}>
                      {userName}
                    </strong>
                    {userTipo === "ADMIN" && (
                      <span className="badge bg-dark text-white rounded-pill px-2 py-1 small">
                        Admin
                      </span>
                    )}
                  </span>
                </li>
                <li className="nav-item me-lg-3 mb-2 mb-lg-0">
                  <Link
                    className="btn btn-primary btn-lg px-4 w-100 shadow-sm"
                    to="/dashboard"
                  >
                    <i
                      className={`bi ${
                        userTipo === "ADMIN" ? "bi-shield-check" : "bi-grid-fill"
                      } me-2`}
                    ></i>
                    {userTipo === "ADMIN" ? "Painel Admin" : "Meu Painel"}
                  </Link>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-outline-danger btn-lg px-4 w-100"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i> Sair
                  </button>
                </li>
              </>
            ) : (
              <>
                {!isLogin && (
                  <li className="nav-item me-lg-3 mb-2 mb-lg-0">
                    <Link
                      className="btn btn-outline-secondary btn-lg px-4 w-100"
                      to="/login"
                    >
                      Fazer Login
                    </Link>
                  </li>
                )}
                {!isCadastro && (
                  <li className="nav-item">
                    <Link
                      className="btn btn-primary btn-lg px-4 w-100"
                      to="/cadastro"
                    >
                      Cadastre-se
                    </Link>
                  </li>
                )}
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
