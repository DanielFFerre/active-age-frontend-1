import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AdminValidacaoMedicos } from "../components/admin/AdminValidacaoMedicos";
import Swal from "sweetalert2";

export function AdminValidacoes() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("activeAgeUser");
    if (!userStr) {
      navigate("/login");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.tipo !== "ADMIN") {
        Swal.fire({
          icon: "error",
          title: "Acesso Negado",
          text: "Esta área é restrita aos administradores da plataforma Active Age.",
          confirmButtonColor: "var(--aa-orange)",
        });
        navigate("/dashboard");
        return;
      }
      setIsAdmin(true);
    } catch {
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <main className="container my-5 pb-5">
      <div className="mb-4 pb-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <Link to="/dashboard" className="btn btn-outline-secondary btn-sm" title="Voltar ao Painel Geral">
            <i className="bi bi-arrow-left me-1"></i> Painel Geral
          </Link>
          <span className="text-muted">|</span>
          <span className="fw-bold" style={{ color: "var(--aa-brown)" }}>
            Módulo de Validação Cadastral
          </span>
        </div>
      </div>

      <AdminValidacaoMedicos />
    </main>
  );
}
