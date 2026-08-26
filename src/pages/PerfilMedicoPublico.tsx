import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

export function PerfilMedicoPublico() {
  const { medicoId } = useParams();
  const navigate = useNavigate();
  const [medico, setMedico] = useState<any>(null);
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [configMedico, setConfigMedico] = useState<{
    duracaoMinutos: number;
    valorConsulta: number;
    orientacoes?: string;
  }>({
    duracaoMinutos: 45,
    valorConsulta: 180,
    orientacoes: "",
  });

  useEffect(() => {
    carregarPerfil();
    carregarConfigMedico();
  }, [medicoId]);

  const carregarConfigMedico = () => {
    if (!medicoId) return;
    const salvo = localStorage.getItem(`activeAgeMedicoConfig_${medicoId}`);
    if (salvo) {
      try {
        setConfigMedico(JSON.parse(salvo));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const carregarPerfil = async () => {
    if (!medicoId) {
      Swal.fire("Erro de Rota", "O ID do médico não veio na URL.", "error");
      return;
    }

    const token = localStorage.getItem("activeAgeToken");

    try {
      const resMedico = await fetch(
        `https://active-age-backend.onrender.com/api/usuarios/${medicoId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (resMedico.ok) {
        setMedico(await resMedico.json());
      } else {
        console.error("Erro do Java:", resMedico.status, resMedico.statusText);
        Swal.fire(
          "Erro",
          `Acesso negado ou médico não encontrado (Erro ${resMedico.status}).`,
          "error",
        ).then(() => navigate(-1));
        return;
      }

      const resAvaliacoes = await fetch(
        `https://active-age-backend.onrender.com/api/agendamentos/medico/${medicoId}/avaliacoes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (resAvaliacoes.ok) {
        setAvaliacoes(await resAvaliacoes.json());
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Erro", "Servidor Spring Boot parece estar offline.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !medico)
    return (
      <div className="text-center py-5 mt-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );

  const mediaNotas =
    avaliacoes.length > 0
      ? (
          avaliacoes.reduce((acc, curr) => acc + curr.notaAvaliacao, 0) /
          avaliacoes.length
        ).toFixed(1)
      : "Novo";

  return (
    <main className="container my-5 pb-5 animation-fade-in">
      <button
        className="btn btn-outline-secondary mb-4"
        onClick={() => navigate(-1)}
      >
        <i className="bi bi-arrow-left me-2"></i>Voltar
      </button>

      <div className="row g-4">
        {/* CARD LATERAL DO MÉDICO */}
        <div className="col-lg-4">
          <div
            className="card shadow-sm border-0 text-center p-4"
            style={{
              borderRadius: "18px",
              borderTop: "5px solid var(--aa-orange)",
            }}
          >
            <img
              src={`https://ui-avatars.com/api/?name=${medico.nome.replace(" ", "+")}&background=e86542&color=fff&size=150`}
              alt="Avatar Médico"
              className="rounded-circle shadow mx-auto mb-3"
              style={{ width: "130px", border: "4px solid white" }}
            />
            <h3 className="fw-bold mb-1" style={{ color: "var(--aa-brown)" }}>
              {medico.nome}
            </h3>
            <p className="text-muted fw-semibold mb-3">
              {medico.especializacao || "Geriatria"}
            </p>

            <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
              <i className="bi bi-star-fill text-warning fs-5"></i>
              <span className="fs-5 fw-bold">{mediaNotas}</span>
              <span className="text-muted small">
                ({avaliacoes.length} avaliações)
              </span>
            </div>

            <p className="badge bg-light text-dark border p-2 w-100 fs-6 mb-4">
              CRM: {medico.crm}
            </p>

            {/* BOX DE PREÇO E DURAÇÃO DA TELECONSULTA */}
            <div className="bg-light p-3 rounded-3 border text-start mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small text-muted fw-bold text-uppercase">Teleconsulta</span>
                <span className="fs-5 fw-bold text-success">
                  R$ {Number(configMedico.valorConsulta).toFixed(2)}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center small text-muted">
                <span>Duração estimada:</span>
                <span className="fw-bold text-dark">{configMedico.duracaoMinutos} min</span>
              </div>
            </div>

            <Link
              to={`/agendar/${medico.id}`}
              className="btn btn-primary btn-lg w-100 fw-bold shadow-sm py-2"
              style={{ borderRadius: "12px" }}
            >
              <i className="bi bi-calendar2-check-fill me-2"></i>
              Agendar Consulta
            </Link>
          </div>
        </div>

        {/* COLUNA PRINCIPAL: SOBRE E AVALIAÇÕES */}
        <div className="col-lg-8 d-flex flex-column gap-4">
          <div
            className="card shadow-sm border-0"
            style={{ borderRadius: "18px" }}
          >
            <div className="card-body p-4 p-md-5">
              <h4 className="fw-bold mb-3" style={{ color: "var(--aa-brown)" }}>
                <i className="bi bi-person-lines-fill me-2 text-primary"></i>
                Sobre o Profissional
              </h4>
              <p
                className="text-muted"
                style={{ lineHeight: "1.8", whiteSpace: "pre-wrap" }}
              >
                {medico.biografia ||
                  "Este profissional ainda não adicionou uma biografia ao seu perfil."}
              </p>

              {configMedico.orientacoes && (
                <div className="alert alert-light border mt-4 p-3 rounded-3">
                  <h6 className="fw-bold text-dark mb-1">
                    <i className="bi bi-info-circle-fill text-primary me-2"></i>
                    Orientações de Atendimento
                  </h6>
                  <p className="text-muted small mb-0">{configMedico.orientacoes}</p>
                </div>
              )}
            </div>
          </div>

          <div
            className="card shadow-sm border-0"
            style={{ borderRadius: "18px" }}
          >
            <div className="card-body p-4 p-md-5">
              <h4 className="fw-bold mb-4" style={{ color: "var(--aa-brown)" }}>
                <i className="bi bi-chat-quote-fill me-2 text-warning"></i>
                Avaliações dos Pacientes
              </h4>

              {avaliacoes.length === 0 ? (
                <div className="alert alert-light border text-center py-4 rounded-3">
                  <p className="text-muted mb-0">
                    Nenhuma avaliação recebida ainda. Seja o primeiro a avaliar
                    após uma consulta!
                  </p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {avaliacoes.map((av) => (
                    <div key={av.id} className="p-3 border rounded-3 bg-light">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-bold text-dark">
                          <i className="bi bi-person-circle me-2 text-secondary"></i>
                          {av.pacienteNome || "Paciente"}
                        </span>
                        <span className="text-warning small">
                          {"⭐".repeat(av.notaAvaliacao)}
                        </span>
                      </div>
                      <p className="text-muted mb-0 small fst-italic">
                        "{av.comentarioAvaliacao || "Sem comentários."}"
                      </p>
                      <div className="text-end mt-2">
                        <span
                          className="text-muted"
                          style={{ fontSize: "0.7rem" }}
                        >
                          {new Date(av.dataHora).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`.animation-fade-in { animation: fadeIn 0.4s ease-in-out; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </main>
  );
}
