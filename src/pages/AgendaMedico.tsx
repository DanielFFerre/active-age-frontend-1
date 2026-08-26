import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

interface Agendamento {
  id: string;
  dataHora: string;
  status: string;
  pacienteId: string | null;
}

interface Usuario {
  id: string;
  nome: string;
  tipo: string;
}

export interface DetalheConsulta {
  valor: number;
  duracao: number;
}

export function AgendaMedico() {
  const navigate = useNavigate();
  const [user, setUser] = useState<Usuario | null>(null);
  const [horarios, setHorarios] = useState<Agendamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mapa com o preço e a duração individuais de CADA horário/consulta
  // Chave: ID do agendamento ou string ISO dataHora
  const [detalhesHorarios, setDetalhesHorarios] = useState<Record<string, DetalheConsulta>>({});

  // Campos do formulário de criação de horário
  const [dataNova, setDataNova] = useState("");
  const [horaNova, setHoraNova] = useState("");
  const [duracaoMinutos, setDuracaoMinutos] = useState<number | string>(45);
  const [valorConsulta, setValorConsulta] = useState<string>("180");

  useEffect(() => {
    const userStr = localStorage.getItem("activeAgeUser");
    if (!userStr) {
      navigate("/login");
      return;
    }

    const usuarioLogado = JSON.parse(userStr);
    if (usuarioLogado.tipo !== "MEDICO") {
      navigate("/dashboard");
      return;
    }

    setUser(usuarioLogado);
    carregarAgenda(usuarioLogado.id);
    carregarDetalhesHorarios(usuarioLogado.id);
  }, [navigate]);

  const carregarDetalhesHorarios = (medicoId: string) => {
    const salvos = localStorage.getItem(`activeAgeHorariosDetalhes_${medicoId}`);
    if (salvos) {
      try {
        setDetalhesHorarios(JSON.parse(salvos));
      } catch (e) {
        console.error("Erro ao carregar detalhes dos horários:", e);
      }
    }
  };

  const carregarAgenda = async (medicoId: string) => {
    try {
      const response = await fetch(
        `https://active-age-backend.onrender.com/api/agendamentos/medico/${medicoId}/todos`,
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

  // Função que busca o preço e a duração individual de um horário específico
  const obterInfoDesteHorario = (id: string, dataHora: string): DetalheConsulta => {
    if (detalhesHorarios[id]) return detalhesHorarios[id];
    if (detalhesHorarios[dataHora]) return detalhesHorarios[dataHora];
    return {
      valor: parseFloat(valorConsulta) || 180,
      duracao: Number(duracaoMinutos) || 45,
    };
  };

  const handleCriarHorario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataNova || !horaNova) {
      Swal.fire("Atenção", "Selecione data e hora válidas.", "warning");
      return;
    }

    const duracaoNum = Number(duracaoMinutos);
    if (!duracaoNum || duracaoNum <= 0) {
      Swal.fire("Atenção", "Informe uma duração válida em minutos.", "warning");
      return;
    }

    const valorNum = valorConsulta === "" ? 0 : parseFloat(valorConsulta);
    if (isNaN(valorNum) || valorNum < 0) {
      Swal.fire("Atenção", "Informe um valor válido para a consulta.", "warning");
      return;
    }

    const novoHorarioIso = `${dataNova}T${horaNova}:00`;
    const dataHoraNova = new Date(novoHorarioIso);

    // Validação de conflito baseada na duração da consulta
    const temConflito = horarios.some((h) => {
      if (h.status === "CANCELADO_PELO_MEDICO") return false;

      const dataExistente = new Date(h.dataHora);
      const diffEmMinutos = Math.abs(
        (dataHoraNova.getTime() - dataExistente.getTime()) / (1000 * 60),
      );

      // Checa a duração específica configurada
      const infoExistente = obterInfoDesteHorario(h.id, h.dataHora);
      const intervaloNecessario = Math.max(duracaoNum, infoExistente.duracao);

      return diffEmMinutos < intervaloNecessario;
    });

    if (temConflito) {
      Swal.fire({
        title: "Conflito de Horário",
        text: `Cada consulta tem sua própria duração configurada (${duracaoNum} min). Escolha um horário com intervalo suficiente para evitar sobreposição de atendimentos.`,
        icon: "error",
        confirmButtonColor: "var(--aa-orange)",
      });
      return;
    }

    try {
      const response = await fetch(
        `https://active-age-backend.onrender.com/api/agendamentos/medico/${user?.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ horarios: [novoHorarioIso] }),
        },
      );

      if (response.ok) {
        // Salvar o preço e a duração individuais desta consulta específica
        if (user) {
          const novosDetalhes: Record<string, DetalheConsulta> = {
            ...detalhesHorarios,
            [novoHorarioIso]: {
              valor: valorNum,
              duracao: duracaoNum,
            },
          };
          setDetalhesHorarios(novosDetalhes);
          localStorage.setItem(
            `activeAgeHorariosDetalhes_${user.id}`,
            JSON.stringify(novosDetalhes)
          );

          // Salvar também como padrão do médico
          localStorage.setItem(
            `activeAgeMedicoConfig_${user.id}`,
            JSON.stringify({
              duracaoMinutos: duracaoNum,
              valorConsulta: valorNum,
            })
          );
        }

        Swal.fire({
          icon: "success",
          title: "Horário Criado!",
          html: `
            <div class="text-center">
              <p class="mb-1"><strong>${new Date(novoHorarioIso).toLocaleDateString("pt-BR")} às ${horaNova}</strong></p>
              <span class="badge bg-success fs-6 px-3 py-1">Valor Desta Consulta: R$ ${valorNum.toFixed(2)}</span><br>
              <small class="text-muted mt-2 d-inline-block">Duração: ${duracaoNum} minutos</small>
            </div>
          `,
          confirmButtonColor: "var(--aa-green)",
        });

        setDataNova("");
        setHoraNova("");
        carregarAgenda(user!.id);
      } else {
        const erroMsg = await response.json().catch(() => null);
        Swal.fire(
          "Erro",
          erroMsg?.message || "Não foi possível salvar o horário.",
          "error",
        );
      }
    } catch (error) {
      Swal.fire("Erro", "Servidor offline.", "error");
    }
  };

  const cancelarHorario = async (id: string, dataHora: string) => {
    Swal.fire({
      title: "Cancelar horário?",
      text: "Os pacientes não poderão mais agendar neste horário. Ele será removido da sua agenda.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "var(--aa-brown)",
      confirmButtonText: "Sim, cancelar",
      cancelButtonText: "Voltar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(
            `https://active-age-backend.onrender.com/api/agendamentos/cancelar/${id}/usuario/${user?.id}`,
            { method: "PUT" },
          );
          if (res.ok) {
            setHorarios((prev) => prev.filter((h) => h.id !== id));

            // Remove detalhes se existirem
            if (user) {
              const copia = { ...detalhesHorarios };
              delete copia[id];
              delete copia[dataHora];
              setDetalhesHorarios(copia);
              localStorage.setItem(
                `activeAgeHorariosDetalhes_${user.id}`,
                JSON.stringify(copia)
              );
            }

            Swal.fire(
              "Cancelado!",
              "O horário foi removido com sucesso.",
              "success",
            );
          }
        } catch (error) {
          Swal.fire("Erro", "Não foi possível cancelar.", "error");
        }
      }
    });
  };

  if (isLoading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );

  const horariosValidos = horarios.filter(
    (h) => h.status === "DISPONIVEL" || h.status === "AGENDADO",
  );

  const agendaAgrupada = horariosValidos.reduce((acc: any, item) => {
    const dataKey = new Date(item.dataHora).toLocaleDateString("pt-BR");
    if (!acc[dataKey]) acc[dataKey] = [];
    acc[dataKey].push(item);
    return acc;
  }, {});

  const datasOrdenadas = Object.keys(agendaAgrupada).sort((a, b) => {
    const dateA = a.split("/").reverse().join("-");
    const dateB = b.split("/").reverse().join("-");
    return new Date(dateA).getTime() - new Date(dateB).getTime();
  });

  return (
    <main className="container my-5 pb-5">
      <header className="mb-4 pb-3 border-bottom">
        <Link to="/dashboard" className="btn btn-outline-secondary mb-3">
          <i className="bi bi-arrow-left me-2"></i>Voltar
        </Link>
        <h1 className="fw-bold mb-1" style={{ color: "var(--aa-brown)" }}>
          Configurar Agenda
        </h1>
        <p className="fs-5 text-muted mb-0">
          Disponibilize seus horários de atendimento definindo o tempo e o preço de cada consulta individual.
        </p>
      </header>

      <div className="row g-4">
        {/* COLUNA ESQUERDA: FORMULÁRIO COM PREÇO E DURAÇÃO DESTA CONSULTA ESPECÍFICA */}
        <div className="col-lg-5 col-xl-4 mb-4">
          <div
            className="card shadow-sm border-0"
            style={{ borderRadius: "15px", borderTop: "5px solid var(--aa-orange)" }}
          >
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3" style={{ color: "var(--aa-brown)" }}>
                <i className="bi bi-plus-circle me-2"></i>Novo Horário
              </h5>
              <p className="small text-muted mb-4">
                Defina a data, o horário, a duração e o <strong>preço específico</strong> para esta consulta.
              </p>

              <form onSubmit={handleCriarHorario}>
                {/* DATA DO ATENDIMENTO */}
                <div className="mb-3">
                  <label className="form-label text-muted fw-semibold small">
                    <i className="bi bi-calendar-event me-1 text-primary"></i>
                    Data do Atendimento
                  </label>
                  <input
                    type="date"
                    className="form-control form-control-lg fs-6"
                    required
                    value={dataNova}
                    onChange={(e) => setDataNova(e.target.value)}
                  />
                </div>

                {/* HORÁRIO DE INÍCIO */}
                <div className="mb-3">
                  <label className="form-label text-muted fw-semibold small">
                    <i className="bi bi-clock me-1 text-primary"></i>
                    Horário de Início
                  </label>
                  <input
                    type="time"
                    className="form-control form-control-lg fs-6"
                    required
                    value={horaNova}
                    onChange={(e) => setHoraNova(e.target.value)}
                  />
                </div>

                {/* DURAÇÃO DESTA CONSULTA (LIVRE) */}
                <div className="mb-3">
                  <label className="form-label text-muted fw-semibold small">
                    <i className="bi bi-stopwatch me-1 text-warning"></i>
                    Duração desta Consulta (minutos)
                  </label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control form-control-lg fs-6"
                      min="1"
                      placeholder="Ex: 45"
                      required
                      value={duracaoMinutos}
                      onChange={(e) =>
                        setDuracaoMinutos(e.target.value === "" ? "" : Number(e.target.value))
                      }
                    />
                    <span className="input-group-text bg-light text-muted">
                      minutos
                    </span>
                  </div>
                  <div className="form-text small">
                    Tempo estimado para esta consulta.
                  </div>
                </div>

                {/* PREÇO DESTA CONSULTA (LIVRE) */}
                <div className="mb-4">
                  <label className="form-label text-muted fw-semibold small">
                    <i className="bi bi-cash-stack me-1 text-success"></i>
                    Preço Cobrado nesta Consulta (R$)
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light fw-bold text-success">
                      R$
                    </span>
                    <input
                      type="number"
                      className="form-control form-control-lg fs-6"
                      min="0"
                      step="any"
                      placeholder="0,00"
                      required
                      value={valorConsulta}
                      onChange={(e) => setValorConsulta(e.target.value)}
                    />
                  </div>
                  <div className="form-text small">
                    Cada consulta pode ter seu próprio valor personalizado.
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 fw-bold shadow-sm py-2.5"
                  style={{ borderRadius: "10px" }}
                >
                  <i className="bi bi-calendar-plus me-2"></i>Adicionar à Agenda
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: HORÁRIOS DISPONÍVEIS COM O PREÇO ESPECÍFICO DE CADA UM */}
        <div className="col-lg-7 col-xl-8">
          <div
            className="card shadow-sm border-0"
            style={{ borderRadius: "15px" }}
          >
            <div className="card-body p-4 p-md-5">
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <h5 className="fw-bold mb-0" style={{ color: "var(--aa-brown)" }}>
                  <i className="bi bi-calendar-week me-2"></i>Meus Horários Disponíveis
                </h5>
                <span className="badge bg-light text-dark border rounded-pill px-3 py-2">
                  {horariosValidos.length} horário(s) cadastrado(s)
                </span>
              </div>

              {datasOrdenadas.length === 0 ? (
                <div className="alert alert-light border text-center py-5 rounded-4">
                  <i className="bi bi-inbox fs-1 text-muted opacity-50 mb-3 d-block"></i>
                  <p className="mb-0 text-muted fs-6">
                    Você não possui horários livres ou agendamentos futuros.
                  </p>
                  <small className="text-muted">
                    Preencha o formulário ao lado para abrir novos horários com valores personalizados.
                  </small>
                </div>
              ) : (
                datasOrdenadas.map((dataKey) => (
                  <div key={dataKey} className="mb-4">
                    <h6 className="bg-light p-2.5 px-3 rounded-3 fw-bold text-dark mb-3 d-flex align-items-center border">
                      <i className="bi bi-calendar-event text-primary me-2"></i> {dataKey}
                    </h6>
                    <div className="d-flex flex-wrap gap-3">
                      {agendaAgrupada[dataKey]
                        .sort(
                          (a: any, b: any) =>
                            new Date(a.dataHora).getTime() -
                            new Date(b.dataHora).getTime(),
                        )
                        .map((h: any) => {
                          // Busca o preço e a duração individuais gravados para ESTE horário
                          const infoDesteHorario = obterInfoDesteHorario(h.id, h.dataHora);

                          return (
                            <div
                              key={h.id}
                              className={`p-3 border shadow-sm d-flex flex-column align-items-center justify-content-between position-relative ${
                                h.status === "AGENDADO"
                                  ? "bg-primary text-white border-primary"
                                  : "bg-white text-dark"
                              }`}
                              style={{
                                borderRadius: "14px",
                                minWidth: "160px",
                                transition: "all 0.2s ease-in-out",
                              }}
                            >
                              {/* HORÁRIO */}
                              <span className="fw-bold fs-4 mb-1">
                                {new Date(h.dataHora).toLocaleTimeString(
                                  "pt-BR",
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </span>

                              {/* STATUS: LIVRE OU OCUPADO */}
                              <span
                                className={`badge mb-2 ${
                                  h.status === "AGENDADO"
                                    ? "bg-white bg-opacity-25 text-white"
                                    : "bg-success bg-opacity-10 text-success border border-success-subtle"
                                } px-2.5 py-1 rounded-pill small`}
                              >
                                {h.status === "AGENDADO" ? "Ocupado" : "Livre"}
                              </span>

                              {/* DURAÇÃO E PREÇO ESPECÍFICO DESTE HORÁRIO */}
                              <div className="w-100 border-top pt-2 mt-1 d-flex flex-column gap-1 text-center">
                                <div
                                  className={`small d-flex align-items-center justify-content-center gap-1 ${
                                    h.status === "AGENDADO" ? "text-white opacity-90" : "text-muted"
                                  }`}
                                >
                                  <i className="bi bi-clock-history text-primary"></i>
                                  <span>{infoDesteHorario.duracao} min</span>
                                </div>
                                <div
                                  className={`fw-bold ${
                                    h.status === "AGENDADO" ? "text-white" : "text-success"
                                  }`}
                                  style={{ fontSize: "1.05rem" }}
                                >
                                  R$ {Number(infoDesteHorario.valor || 0).toFixed(2)}
                                </div>
                              </div>

                              {/* BOTÃO REMOVER */}
                              <button
                                onClick={() => cancelarHorario(h.id, h.dataHora)}
                                className={`btn btn-sm position-absolute top-0 end-0 p-1 m-1 ${
                                  h.status === "AGENDADO" ? "text-white" : "text-danger"
                                }`}
                                title="Remover horário"
                              >
                                <i className="bi bi-x-circle-fill"></i>
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
