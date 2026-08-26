import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { ModalPagamentoMercadoPago } from "../components/pagamento/ModalPagamentoMercadoPago";

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
  const [pacienteLogado, setPacienteLogado] = useState<any>(null);
  const [medico, setMedico] = useState<any>(null);
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
  const [detalhesHorarios, setDetalhesHorarios] = useState<Record<string, DetalheConsulta>>({});

  // Configuração padrão do médico
  const [configMedico, setConfigMedico] = useState<{
    duracaoMinutos: number;
    valorConsulta: number;
    orientacoes?: string;
  }>({
    duracaoMinutos: 45,
    valorConsulta: 180,
    orientacoes: "",
  });

  // Estado do Modal de Pagamento Mercado Pago
  const [isModalPagamentoOpen, setIsModalPagamentoOpen] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<{
    id: string;
    dataHora: string;
    dataHoraFormatada: string;
    valor: number;
    duracao: number;
  } | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("activeAgeUser");
    if (!userStr) {
      navigate("/login");
      return;
    }

    const usuarioLogado = JSON.parse(userStr);
    setPacienteId(usuarioLogado.id);
    setPacienteLogado(usuarioLogado);

    if (medicoId) {
      carregarHorariosLivres();
      carregarDadosMedico();
      carregarConfigMedico();
      carregarDetalhesHorarios();
      carregarAvaliacoes();
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

  const carregarAvaliacoes = async () => {
    const token = localStorage.getItem("activeAgeToken");
    try {
      const res = await fetch(
        `https://active-age-backend.onrender.com/api/agendamentos/medico/${medicoId}/avaliacoes`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (res.ok) {
        setAvaliacoes(await res.json());
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

  // Ao clicar em um horário, primeiro exibe a confirmação padrão e depois abre o Checkout Mercado Pago
  const iniciarAgendamentoComPagamento = (h: Agendamento) => {
    const dataObj = new Date(h.dataHora);
    const diaFormatado = dataObj.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const horaFormatada = dataObj.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const dataHoraLimpa = `${diaFormatado} às ${horaFormatada}`;
    const infoDestaConsulta = obterInfoDesteHorario(h.id, h.dataHora);

    Swal.fire({
      title: "Confirmar Escolha do Horário?",
      html: `
        <div class="text-start p-2">
          <p class="mb-2"><strong>Médico:</strong> ${medico?.nome || "Médico Especialista"}</p>
          <p class="mb-2"><strong>Data e Horário:</strong> <span class="text-capitalize">${dataHoraLimpa}</span></p>
          <p class="mb-2"><strong>Duração:</strong> ${infoDestaConsulta.duracao} minutos</p>
          <p class="mb-3"><strong>Valor da Consulta:</strong> <span class="text-success fw-bold fs-5">R$ ${Number(infoDestaConsulta.valor || 0).toFixed(2)}</span></p>
          ${
            configMedico.orientacoes
              ? `<div class="alert alert-warning small p-2 mb-0"><strong>Orientações:</strong> ${configMedico.orientacoes}</div>`
              : ""
          }
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "var(--aa-green)",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Prosseguir para Pagamento",
      cancelButtonText: "Voltar",
    }).then((result) => {
      if (result.isConfirmed) {
        setAgendamentoSelecionado({
          id: h.id,
          dataHora: h.dataHora,
          dataHoraFormatada: `${dataObj.toLocaleDateString("pt-BR")} às ${horaFormatada}`,
          valor: Number(infoDestaConsulta.valor || 0),
          duracao: Number(infoDestaConsulta.duracao || 45),
        });

        setIsModalPagamentoOpen(true);
      }
    });
  };

  // Callback chamado quando o pagamento no Mercado Pago é concluído com sucesso
  const handlePagamentoSucesso = async (detalhes: any) => {
    if (!agendamentoSelecionado) return;

    try {
      const res = await fetch(
        `https://active-age-backend.onrender.com/api/agendamentos/marcar/${agendamentoSelecionado.id}/paciente/${pacienteId}`,
        { method: "PUT" },
      );

      if (res.ok) {
        setIsModalPagamentoOpen(false);
        Swal.fire({
          icon: "success",
          title: "Teleconsulta Confirmada!",
          html: `
            <div class="text-center">
              <p class="mb-2">O pagamento de <b>R$ ${agendamentoSelecionado.valor.toFixed(2)}</b> foi aprovado via <b>${detalhes.metodo || "Mercado Pago"}</b>.</p>
              <p class="small text-muted mb-0">Horário confirmado: <b>${agendamentoSelecionado.dataHoraFormatada}</b> com <b>${medico?.nome || "seu médico"}</b>.</p>
            </div>
          `,
          confirmButtonColor: "var(--aa-green)",
          confirmButtonText: "Ir para Meu Painel",
        }).then(() => {
          navigate("/dashboard");
        });
      } else {
        const errorData = await res.json().catch(() => null);
        const mensagemErro =
          errorData?.message ||
          "Você já possui uma consulta marcada neste horário!";

        Swal.fire("Não foi possível confirmar o agendamento", mensagemErro, "error");
        carregarHorariosLivres();
      }
    } catch (error) {
      Swal.fire("Erro", "Falha ao confirmar agendamento com o servidor.", "error");
    }
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

  const mediaNotas =
    avaliacoes.length > 0
      ? (
          avaliacoes.reduce((acc, curr) => acc + curr.notaAvaliacao, 0) /
          avaliacoes.length
        ).toFixed(1)
      : "Novo";

  return (
    <main className="container my-5 pb-5 animation-fade-in">
      {/* CABEÇALHO */}
      <header className="mb-4 pb-3 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <Link to="/busca" className="btn btn-outline-secondary mb-2">
            <i className="bi bi-arrow-left me-2"></i>Voltar para Busca
          </Link>
          <h1 className="fw-bold mb-1" style={{ color: "var(--aa-brown)" }}>
            Agendar Teleconsulta
          </h1>
          <p className="fs-6 text-muted mb-0">
            Escolha o horário de atendimento e realize o pagamento seguro via Mercado Pago.
          </p>
        </div>
      </header>

      {/* HERO CARD COM TODAS AS INFORMAÇÕES DO MÉDICO */}
      {medico && (
        <section className="card shadow-sm border-0 rounded-4 p-4 mb-5 bg-white">
          <div className="row g-4 align-items-center">
            <div className="col-12 col-md-auto text-center">
              <img
                src={`https://ui-avatars.com/api/?name=${medico.nome.replace(" ", "+")}&background=e86542&color=fff&size=130`}
                alt="Avatar do Médico"
                className="rounded-circle shadow-sm"
                style={{ width: "120px", height: "120px", border: "4px solid #fff" }}
              />
            </div>

            <div className="col-12 col-md">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                <h3 className="fw-bold mb-0 text-dark">{medico.nome}</h3>
                <span className="badge bg-success bg-opacity-10 text-success border border-success-subtle rounded-pill px-3 py-1 small">
                  <i className="bi bi-patch-check-fill me-1"></i> Médico Verificado
                </span>
              </div>

              <div className="d-flex flex-wrap align-items-center gap-3 text-muted small mb-3">
                <span>
                  <i className="bi bi-award-fill text-primary me-1"></i>
                  <strong>Especialidade:</strong> {medico.especializacao || "Geriatria"}
                </span>
                <span>•</span>
                <span>
                  <i className="bi bi-card-text text-secondary me-1"></i>
                  <strong>CRM:</strong> {medico.crm || "Registrado"}
                </span>
                <span>•</span>
                <span>
                  <i className="bi bi-star-fill text-warning me-1"></i>
                  <strong>Avaliação:</strong> {mediaNotas} ({avaliacoes.length} atendimentos)
                </span>
              </div>

              {medico.biografia && (
                <p className="text-muted small mb-3 fst-italic" style={{ maxWidth: "750px" }}>
                  "{medico.biografia}"
                </p>
              )}

              {/* BOX COM VALOR, DURAÇÃO E ORIENTAÇÕES */}
              <div className="row g-2 mt-1">
                <div className="col-auto">
                  <span className="badge bg-light text-dark border p-2 px-3 rounded-pill small">
                    <i className="bi bi-clock-history text-primary me-1"></i>
                    Duração Média: <strong>{configMedico.duracaoMinutos} min</strong>
                  </span>
                </div>
                <div className="col-auto">
                  <span className="badge bg-success-subtle text-success border border-success-subtle p-2 px-3 rounded-pill small">
                    <i className="bi bi-cash-stack me-1"></i>
                    Valor Padrão: <strong>R$ {Number(configMedico.valorConsulta || 0).toFixed(2)}</strong>
                  </span>
                </div>
              </div>

              {configMedico.orientacoes && (
                <div className="alert alert-warning border-0 small mt-3 mb-0 p-2.5 rounded-3 d-flex align-items-start gap-2">
                  <i className="bi bi-info-circle-fill text-warning fs-5 flex-shrink-0 mt-0.5"></i>
                  <span>
                    <strong>Instruções do Profissional:</strong> {configMedico.orientacoes}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* GRADE DE HORÁRIOS DISPONÍVEIS */}
      <section>
        <div className="card shadow-sm border-0 rounded-4">
          <div className="card-body p-4 p-md-5">
            {horarios.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-calendar-x display-1 text-muted opacity-50 mb-3 d-block"></i>
                <h3 className="fw-bold" style={{ color: "var(--aa-brown)" }}>
                  Nenhum horário disponível no momento
                </h3>
                <p className="text-muted mb-4 fs-5">
                  Infelizmente este médico não possui vagas abertas na agenda no momento.
                </p>
                <button
                  className="btn btn-primary btn-lg px-4 shadow-sm"
                  onClick={demonstrarInteresse}
                >
                  <i className="bi bi-bell-fill me-2"></i> Demonstrar Interesse / Lista de Espera
                </button>
              </div>
            ) : (
              <>
                <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                  <h4 className="fw-bold mb-0" style={{ color: "var(--aa-brown)" }}>
                    <i className="bi bi-calendar2-check-fill me-2 text-primary"></i>
                    Selecione o Horário Desejado
                  </h4>
                  <span className="badge bg-light text-dark border rounded-pill px-3 py-2">
                    {horarios.length} vaga(s) disponível(is)
                  </span>
                </div>

                <div className="row g-3">
                  {horarios.map((h) => {
                    const dataObj = new Date(h.dataHora);
                    const diaSemana = dataObj.toLocaleDateString("pt-BR", { weekday: "long" });
                    const dataStr = dataObj.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
                    const horaStr = dataObj.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    // Busca o preço e a duração individuais desta consulta
                    const infoDesteHorario = obterInfoDesteHorario(h.id, h.dataHora);

                    return (
                      <div className="col-12 col-md-6 col-lg-4" key={h.id}>
                        <div
                          className="card border h-100 bg-white p-3.5 shadow-sm slot-card"
                          style={{
                            borderRadius: "16px",
                            transition: "all 0.25s ease-in-out",
                            cursor: "pointer",
                            border: "1.5px solid #e2e8f0",
                          }}
                          onClick={() => iniciarAgendamentoComPagamento(h)}
                        >
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <span className="text-muted small text-capitalize fw-semibold d-block">
                                {diaSemana}
                              </span>
                              <span className="small fw-bold text-dark">{dataStr}</span>
                            </div>
                            <span className="badge bg-success bg-opacity-10 text-success border border-success-subtle rounded-pill px-2 py-1 small">
                              <i className="bi bi-check-circle me-1"></i>Livre
                            </span>
                          </div>

                          <div className="text-center my-3 py-2 bg-light rounded-3">
                            <span className="display-6 fw-bold text-dark d-block">{horaStr}</span>
                            <small className="text-muted">
                              <i className="bi bi-stopwatch text-warning me-1"></i>
                              Duração: {infoDesteHorario.duracao} min
                            </small>
                          </div>

                          <div className="d-flex justify-content-between align-items-center mt-auto pt-2 border-top">
                            <div>
                              <span className="d-block text-muted" style={{ fontSize: "0.75rem" }}>VALOR DA CONSULTA</span>
                              <span className="fs-5 fw-bold text-success">
                                R$ {Number(infoDesteHorario.valor || 0).toFixed(2)}
                              </span>
                            </div>

                            <button className="btn btn-primary btn-sm px-3 fw-bold rounded-pill shadow-sm">
                              Agendar <i className="bi bi-arrow-right ms-1"></i>
                            </button>
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
      </section>

      {/* MODAL DE PAGAMENTO MERCADO PAGO PARA A CONSULTA */}
      {agendamentoSelecionado && (
        <ModalPagamentoMercadoPago
          isOpen={isModalPagamentoOpen}
          onClose={() => setIsModalPagamentoOpen(false)}
          onSuccess={handlePagamentoSucesso}
          tipoItem="CONSULTA"
          plano={{
            id: agendamentoSelecionado.id,
            nome: `Teleconsulta com ${medico?.nome || "Médico Especialista"}`,
            valor: agendamentoSelecionado.valor,
            tipo: "CONSULTA",
            ciclo: "CONSULTA",
            dataHoraFormatada: agendamentoSelecionado.dataHoraFormatada,
            duracaoMinutos: agendamentoSelecionado.duracao,
          }}
          medico={{
            id: medico?.id,
            nome: medico?.nome,
            email: medico?.email,
            crm: medico?.crm,
          }}
          paciente={{
            id: pacienteLogado?.id,
            nome: pacienteLogado?.nome,
            email: pacienteLogado?.email,
          }}
        />
      )}

      {/* ESTILOS DE INTERATIVIDADE */}
      <style>{`
        .animation-fade-in {
          animation: fadeIn 0.35s ease-in-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .slot-card:hover {
          transform: translateY(-4px);
          border-color: var(--aa-orange) !important;
          box-shadow: 0 10px 25px rgba(232, 101, 66, 0.12) !important;
        }
      `}</style>
    </main>
  );
}
