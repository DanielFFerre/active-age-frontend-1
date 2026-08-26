import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Swal from "sweetalert2";

interface Agendamento {
  id: string;
  dataHora: string;
  status: string;
}

export interface DetalheConsulta {
  valor: number;
  duracao: number;
}

export function AgendarConsulta() {
  const navigate = useNavigate();
  const { medicoId } = useParams();

  const [horarios, setHorarios] = useState<Agendamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pacienteId, setPacienteId] = useState("");
  const [medico, setMedico] = useState<any>(null);
  const [detalhesHorarios, setDetalhesHorarios] = useState<Record<string, DetalheConsulta>>({});
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
    const userStr = localStorage.getItem("activeAgeUser");
    if (!userStr) {
      navigate("/login");
      return;
    }

    const usuarioLogado = JSON.parse(userStr);
    setPacienteId(usuarioLogado.id);

    if (medicoId) {
      carregarHorariosLivres();
      carregarDadosMedico();
      carregarConfigMedico();
      carregarDetalhesHorarios();
    }
  }, [medicoId]);

  const carregarDetalhesHorarios = () => {
    if (!medicoId) return;
    const salvos = localStorage.getItem(`activeAgeHorariosDetalhes_${medicoId}`);
    if (salvos) {
      try {
        setDetalhesHorarios(JSON.parse(salvos));
      } catch (e) {
        console.error(e);
      }
    }
  };

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

  const carregarDadosMedico = async () => {
    const token = localStorage.getItem("activeAgeToken");
    try {
      const res = await fetch(
        `https://active-age-backend.onrender.com/api/usuarios/${medicoId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (res.ok) {
        setMedico(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

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

  const obterInfoDesteHorario = (id: string, dataHora: string): DetalheConsulta => {
    if (detalhesHorarios[id]) return detalhesHorarios[id];
    if (detalhesHorarios[dataHora]) return detalhesHorarios[dataHora];
    return {
      valor: configMedico.valorConsulta || 180,
      duracao: configMedico.duracaoMinutos || 45,
    };
  };

  const marcarConsulta = async (agendamentoId: string, dataStr: string) => {
    const dataObj = new Date(dataStr);
    const diaFormatado = dataObj.toLocaleDateString("pt-BR");
    const horaFormatada = dataObj.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const dataLimpa = `${diaFormatado} às ${horaFormatada}`;

    const infoDestaConsulta = obterInfoDesteHorario(agendamentoId, dataStr);

    Swal.fire({
      title: "Confirmar Agendamento?",
      html: `
        <div class="text-start p-2">
          <p class="mb-2"><strong>Data e Horário:</strong> ${dataLimpa}</p>
          <p class="mb-2"><strong>Duração:</strong> ${infoDestaConsulta.duracao} minutos</p>
          <p class="mb-2"><strong>Valor Desta Consulta:</strong> <span class="text-success fw-bold">R$ ${Number(infoDestaConsulta.valor).toFixed(2)}</span></p>
          ${
            configMedico.orientacoes
              ? `<div class="alert alert-warning small p-2 mt-2"><strong>Aviso do Médico:</strong> ${configMedico.orientacoes}</div>`
              : ""
          }
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "var(--aa-green)",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Confirmar Agendamento",
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
              "Sua teleconsulta foi confirmada com sucesso.",
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
      <div className="text-center py-5 mt-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );

  return (
    <main className="container my-5 pb-5">
      <header className="mb-4 pb-3 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <Link to="/busca" className="btn btn-outline-secondary mb-2">
            <i className="bi bi-arrow-left me-2"></i>Voltar para Busca
          </Link>
          <h1 className="fw-bold mb-1" style={{ color: "var(--aa-brown)" }}>
            Agenda de Teleconsulta {medico?.nome ? `• ${medico.nome}` : ""}
          </h1>
          <p className="fs-6 text-muted mb-0">
            Selecione o melhor horário para o seu atendimento online.
          </p>
        </div>
      </header>

      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div
            className="card shadow-sm border-0"
            style={{ borderRadius: "18px" }}
          >
            <div className="card-body p-4 p-md-5">
              {horarios.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-calendar-x display-1 text-muted opacity-50 mb-3 d-block"></i>
                  <h3 className="fw-bold" style={{ color: "var(--aa-brown)" }}>
                    Nenhum horário disponível
                  </h3>
                  <p className="text-muted mb-4 fs-5">
                    Infelizmente, este médico não possui horários abertos no momento.
                  </p>
                  <button
                    className="btn btn-primary btn-lg px-4 shadow-sm"
                    onClick={demonstrarInteresse}
                  >
                    <i className="bi bi-bell-fill me-2"></i> Demonstrar Interesse
                  </button>
                </div>
              ) : (
                <>
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <h5 className="fw-bold mb-0" style={{ color: "var(--aa-brown)" }}>
                      <i className="bi bi-calendar-check me-2 text-primary"></i>
                      Horários Livres para Agendamento
                    </h5>
                    <span className="badge bg-light text-dark border rounded-pill px-3 py-2">
                      {horarios.length} vaga(s) disponível(is)
                    </span>
                  </div>

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

                      // Preço e duração específicos deste horário
                      const infoDesteHorario = obterInfoDesteHorario(h.id, h.dataHora);

                      return (
                        <div className="col-md-6 col-lg-4" key={h.id}>
                          <div
                            className="card border h-100 bg-light p-3 text-center cursor-pointer shadow-sm hover-card"
                            style={{
                              borderRadius: "14px",
                              transition: "all 0.2s ease-in-out",
                              cursor: "pointer",
                            }}
                            onClick={() => marcarConsulta(h.id, h.dataHora)}
                          >
                            <span className="text-muted small text-capitalize fw-semibold d-block mb-1">
                              {dia}
                            </span>
                            <h3 className="fw-bold mb-2 text-dark">{hora}</h3>

                            <div className="d-flex flex-column gap-1 align-items-center">
                              <span className="badge bg-success bg-opacity-10 text-success border border-success-subtle rounded-pill py-1 px-2.5 small">
                                <i className="bi bi-check-circle me-1"></i>
                                {infoDesteHorario.duracao} min
                              </span>
                              <span className="fw-bold text-success fs-6 mt-1">
                                R$ {Number(infoDesteHorario.valor || 0).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .hover-card:hover {
          transform: translateY(-4px);
          border-color: var(--aa-orange) !important;
          background-color: white !important;
        }
      `}</style>
    </main>
  );
}
