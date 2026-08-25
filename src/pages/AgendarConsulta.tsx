import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Swal from "sweetalert2";

interface Agendamento {
  id: string;
  dataHora: string;
  status: string;
}

export function AgendarConsulta() {
  const navigate = useNavigate();
  const { medicoId } = useParams();

  const [horarios, setHorarios] = useState<Agendamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pacienteId, setPacienteId] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem("activeAgeUser");
    if (!userStr) {
      navigate("/login");
      return;
    }

    const usuarioLogado = JSON.parse(userStr);
    setPacienteId(usuarioLogado.id);

    carregarHorariosLivres();
  }, [medicoId]);

  const carregarHorariosLivres = async () => {
    try {
      const response = await fetch(
        `https://active-age-backend.onrender.com/api/agendamentos/disponiveis/${medicoId}`,
      );
      if (response.ok) {
        const data = await response.json();
        setHorarios(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const marcarConsulta = async (agendamentoId: string, dataStr: string) => {
    const dataObj = new Date(dataStr);
    const diaFormatado = dataObj.toLocaleDateString("pt-BR");
    const horaFormatada = dataObj.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const dataLimpa = `${diaFormatado} às ${horaFormatada}`;

    Swal.fire({
      title: "Confirmar Agendamento?",
      html: `Você está agendando uma teleconsulta para<br><b>${dataLimpa}</b>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "var(--aa-green)",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Confirmar",
      cancelButtonText: "Voltar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(
            `https://active-age-backend.onrender.com/api/agendamentos/marcar/${agendamentoId}/paciente/${pacienteId}`,
            { method: "PUT" },
          );
          if (res.ok) {
            Swal.fire(
              "Agendado!",
              "Sua consulta foi confirmada com sucesso.",
              "success",
            ).then(() => navigate("/dashboard"));
          } else {
            const errorData = await res.json().catch(() => null);
            const mensagemErro =
              errorData?.message ||
              "Você já tem uma consulta marcada nesse hórario!";

            Swal.fire("Não foi possível agendar", mensagemErro, "error");
            carregarHorariosLivres();
          }
        } catch (error) {
          Swal.fire("Erro", "Servidor offline.", "error");
        }
      }
    });
  };

  const demonstrarInteresse = () => {
    Swal.fire({
      title: "Lista de Espera",
      text: "O médico será notificado do seu interesse e avisaremos por e-mail quando novos horários surgirem.",
      icon: "success",
      confirmButtonColor: "var(--aa-orange)",
    });
  };

  if (isLoading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );

  return (
    <main className="container my-5 pb-5">
      <header className="mb-5 pb-3 border-bottom">
        <Link to="/busca" className="btn btn-outline-secondary mb-3">
          <i className="bi bi-arrow-left me-2"></i>Voltar para Busca
        </Link>
        <h1 className="fw-bold mb-1" style={{ color: "var(--aa-brown)" }}>
          Agenda do Médico
        </h1>
        <p className="fs-5 text-muted mb-0">
          Selecione o melhor horário para a sua teleconsulta.
        </p>
      </header>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div
            className="card shadow-sm border-0"
            style={{ borderRadius: "15px" }}
          >
            <div className="card-body p-4 p-md-5">
              {horarios.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-calendar-x display-1 text-muted opacity-50 mb-3 d-block"></i>
                  <h3 className="fw-bold" style={{ color: "var(--aa-brown)" }}>
                    Nenhum horário disponível
                  </h3>
                  <p className="text-muted mb-4 fs-5">
                    Infelizmente, este médico não possui horários abertos no
                    momento.
                  </p>
                  <button
                    className="btn btn-primary btn-lg px-4 shadow-sm"
                    onClick={demonstrarInteresse}
                  >
                    <i className="bi bi-bell-fill me-2"></i> Demonstrar
                    Interesse
                  </button>
                </div>
              ) : (
                <div className="row g-3">
                  {horarios.map((h) => {
                    const dataObj = new Date(h.dataHora);
                    const dia = dataObj.toLocaleDateString("pt-BR", {
                      weekday: "long",
                      day: "2-digit",
                      month: "long",
                    });
                    const hora = dataObj.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <div className="col-md-6" key={h.id}>
                        <div
                          className="card border h-100 bg-light"
                          style={{
                            borderRadius: "10px",
                            transition: "all 0.2s",
                            cursor: "pointer",
                          }}
                          onClick={() => marcarConsulta(h.id, h.dataHora)}
                        >
                          <div className="card-body text-center p-4">
                            <i className="bi bi-calendar-check fs-2 text-primary mb-2 d-block"></i>
                            <h5
                              className="fw-bold text-capitalize mb-1"
                              style={{ color: "var(--aa-brown)" }}
                            >
                              {dia}
                            </h5>
                            <h3 className="fw-bold mb-0 text-dark">{hora}</h3>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
