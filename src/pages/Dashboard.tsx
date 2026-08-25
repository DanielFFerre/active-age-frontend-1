import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { AdminValidacaoMedicos } from "../components/admin/AdminValidacaoMedicos";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipo: "PACIENTE" | "MEDICO" | "ADMIN";
  crm?: string;
  statusValidacao?: string;
  mensagemValidacao?: string;
}

interface Agendamento {
  id: string;
  dataHora: string;
  status: string;
  linkTeleconsulta?: string;
  medicoNome?: string;
  medicoCrm?: string;
  medicoEspecializacao?: string;
  pacienteNome?: string;
  medicoId?: string;
  notaAvaliacao?: number;
  comentarioAvaliacao?: string;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<Usuario | null>(null);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [pedidosAdmin, setPedidosAdmin] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const historicoRef = useRef<HTMLDivElement>(null);
  const agendaPacienteRef = useRef<HTMLDivElement>(null);
  const agendaMedicoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("activeAgeUser");
    if (!userStr) {
      navigate("/login");
      return;
    }
    const usuarioLogado: Usuario = JSON.parse(userStr);

    if (usuarioLogado.tipo === "MEDICO" && !usuarioLogado.statusValidacao) {
      usuarioLogado.statusValidacao = "PENDENTE";
    }

    setUser(usuarioLogado);

    if (usuarioLogado.tipo === "ADMIN") {
      setIsLoading(false);
    } else {
      carregarDados(usuarioLogado);
    }
  }, [navigate]);

  const carregarDados = async (u: Usuario) => {
    try {
      const rota =
        u.tipo === "PACIENTE" ? `paciente/${u.id}` : `medico/${u.id}/todos`;
      const res = await fetch(`https://active-age-backend.onrender.com/api/agendamentos/${rota}`);
      if (res.ok) {
        const data = await res.json();
        setAgendamentos(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const carregarPendentes = async () => {
    try {
      const res = await fetch("https://active-age-backend.onrender.com/api/validacoes/pendentes");
      if (res.ok) {
        const data = await res.json();
        setPedidosAdmin(data);
      }
    } catch (error) {
      console.error("Erro ao buscar pendentes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const scroll = (
    ref: React.RefObject<HTMLDivElement>,
    direction: "left" | "right",
  ) => {
    if (ref.current) {
      const scrollAmount = 350;
      ref.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const solicitarValidacao = async () => {
    if (!user) return;
    try {
      const res = await fetch(
        `https://active-age-backend.onrender.com/api/validacoes/solicitar/${user.id}`,
        { method: "POST" },
      );
      if (res.ok) {
        const usuarioAtualizado = await res.json();
        Swal.fire({
          icon: "success",
          title: "Enviado!",
          text: "Dados enviados para análise.",
          confirmButtonColor: "var(--aa-green)",
        });
        setUser(usuarioAtualizado);
        localStorage.setItem(
          "activeAgeUser",
          JSON.stringify(usuarioAtualizado),
        );
      }
    } catch (error) {
      Swal.fire("Erro", "Falha na conexão.", "error");
    }
  };

  const enviarAvaliacaoSistema = async (
    id: string,
    nome: string,
    status: string,
    mensagem: string,
  ) => {
    try {
      const res = await fetch(
        `https://active-age-backend.onrender.com/api/validacoes/avaliar/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, mensagem }),
        },
      );
      if (res.ok) {
        setPedidosAdmin(pedidosAdmin.filter((p) => p.id !== id));
        Swal.fire(
          status === "APROVADO" ? "Aprovado!" : "Reprovado!",
          status === "APROVADO" ? "CRM validado." : `Médico notificado.`,
          "success",
        );
      }
    } catch (error) {
      Swal.fire("Erro", "Não foi possível enviar a avaliação.", "error");
    }
  };

  const aprovarMedico = (id: string, nome: string) => {
    Swal.fire({
      title: `Aprovar ${nome}?`,
      text: "Terá acesso total.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "var(--aa-green)",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sim, aprovar!",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed)
        enviarAvaliacaoSistema(id, nome, "APROVADO", "Aprovado com sucesso.");
    });
  };

  const reprovarMedico = (id: string, nome: string) => {
    Swal.fire({
      title: `Reprovar ${nome}?`,
      input: "textarea",
      inputLabel: "Motivo da reprovação",
      showCancelButton: true,
      confirmButtonColor: "var(--aa-orange)",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Enviar Reprovação",
      cancelButtonText: "Cancelar",
      preConfirm: (feedback) => {
        if (!feedback) {
          Swal.showValidationMessage("O feedback é obrigatório.");
        }
        return feedback;
      },
    }).then((result) => {
      if (result.isConfirmed)
        enviarAvaliacaoSistema(id, nome, "REPROVADO", result.value);
    });
  };

  const handleCancelar = async (id: string) => {
    Swal.fire({
      title: "Deseja cancelar?",
      text:
        user?.tipo === "PACIENTE"
          ? "O horário voltará para a agenda do médico."
          : "Este horário será invalidado.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Sim, cancelar",
      cancelButtonText: "Voltar",
    }).then(async (result) => {
      if (result.isConfirmed && user) {
        setAgendamentos((prev) => prev.filter((a) => a.id !== id));
        try {
          const res = await fetch(
            `https://active-age-backend.onrender.com/api/agendamentos/cancelar/${id}/usuario/${user.id}`,
            { method: "PUT" },
          );
          if (res.ok) {
            Swal.fire(
              "Cancelado",
              "Consulta cancelada com sucesso.",
              "success",
            );
          } else {
            carregarDados(user);
            Swal.fire(
              "Erro",
              "Não foi possível cancelar no servidor.",
              "error",
            );
          }
        } catch (error) {
          carregarDados(user);
        }
      }
    });
  };

  const avaliarConsulta = async (agendamentoId: string, medicoNome: string) => {
    const { value: formValues } = await Swal.fire({
      title: `Avaliar Dr(a). ${medicoNome}`,
      html: `
        <div class="mb-3 text-start">
          <label class="form-label fw-bold small">Sua Nota (1 a 5)</label>
          <select id="swal-nota" class="form-select border-warning">
            <option value="5">⭐⭐⭐⭐⭐ (5) Excelente</option>
            <option value="4">⭐⭐⭐⭐ (4) Muito Bom</option>
            <option value="3">⭐⭐⭐ (3) Bom</option>
            <option value="2">⭐⭐ (2) Regular</option>
            <option value="1">⭐ (1) Ruim</option>
          </select>
        </div>
        <div class="text-start">
          <label class="form-label fw-bold small">Seu Comentário</label>
          <textarea id="swal-comentario" class="form-control" rows="3" placeholder="Como foi o atendimento?..."></textarea>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: "var(--aa-green)",
      confirmButtonText: "Enviar Avaliação",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const nota = (document.getElementById("swal-nota") as HTMLSelectElement)
          .value;
        const comentario = (
          document.getElementById("swal-comentario") as HTMLTextAreaElement
        ).value;
        return { nota: parseInt(nota), comentario };
      },
    });

    if (formValues && user) {
      try {
        const res = await fetch(
          `https://active-age-backend.onrender.com/api/agendamentos/${agendamentoId}/avaliar`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formValues),
          },
        );
        if (res.ok) {
          Swal.fire("Sucesso!", "Sua avaliação foi publicada.", "success");
          carregarDados(user);
        }
      } catch (error) {
        Swal.fire("Erro", "Não foi possível enviar a avaliação.", "error");
      }
    }
  };

  const getPrimeiroNome = (n: string) => {
    const p = n.trim().split(" ");
    return p[0].toLowerCase() === "dr." || p[0].toLowerCase() === "dra."
      ? p.length > 1
        ? `${p[0]} ${p[1]}`
        : p[0]
      : p[0];
  };

  const formatarDataHora = (iso: string) => {
    const d = new Date(iso);
    return {
      dia: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      hora: d.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const renderHistoricoClinico = () => {
    const historico = agendamentos
      .filter((a) => a.status === "CONCLUIDO")
      .sort(
        (a, b) =>
          new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime(),
      );

    if (historico.length === 0) return null;

    return (
      <div
        className="card shadow-sm border-0 mt-4"
        style={{ borderRadius: "15px" }}
      >
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 style={{ color: "var(--aa-brown)" }} className="mb-0">
              <i className="bi bi-clock-history me-2"></i>Histórico Clínico
            </h5>
            <div>
              <button
                className="btn btn-sm btn-light border rounded-circle me-2"
                onClick={() => scroll(historicoRef, "left")}
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <button
                className="btn btn-sm btn-light border rounded-circle"
                onClick={() => scroll(historicoRef, "right")}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>

          <div className="horizontal-scroll gap-3 pb-2" ref={historicoRef}>
            {historico.map((a) => (
              <div
                key={a.id}
                className="p-4 border shadow-sm bg-white d-flex flex-column gap-3 border-start border-4 border-success"
                style={{
                  borderRadius: "12px",
                  minWidth: "350px",
                  flex: "0 0 auto",
                }}
              >
                <div className="border-bottom pb-3">
                  <h6 className="fw-bold mb-1 text-dark">
                    Consulta em{" "}
                    {new Date(a.dataHora).toLocaleDateString("pt-BR")}
                  </h6>
                  <div className="text-muted small fw-semibold">
                    {user?.tipo === "PACIENTE" ? (
                      <>
                        <i className="bi bi-hospital me-1"></i> Médico:{" "}
                        {a.medicoNome}
                      </>
                    ) : (
                      <>
                        <i className="bi bi-person me-1"></i> Paciente:{" "}
                        {a.pacienteNome}
                      </>
                    )}
                  </div>
                </div>

                {user?.tipo === "PACIENTE" && a.medicoId && (
                  <div className="d-flex flex-wrap gap-2">
                    <Link
                      to={`/medico/${a.medicoId}`}
                      className="btn btn-sm btn-outline-secondary fw-bold shadow-sm flex-grow-1"
                    >
                      <i className="bi bi-person-badge me-1"></i> Perfil
                    </Link>
                    {!a.notaAvaliacao ? (
                      <button
                        className="btn btn-sm btn-warning shadow-sm fw-bold text-dark flex-grow-1"
                        onClick={() => avaliarConsulta(a.id, a.medicoNome!)}
                      >
                        <i className="bi bi-star-fill me-1"></i> Avaliar
                      </button>
                    ) : (
                      <span
                        className="badge bg-light text-warning border border-warning fs-6 shadow-sm flex-grow-1 d-flex align-items-center justify-content-center"
                        title={`Você avaliou com ${a.notaAvaliacao} estrelas.`}
                      >
                        {"⭐".repeat(a.notaAvaliacao)}
                      </span>
                    )}
                  </div>
                )}

                <div>
                  <p className="small text-muted fw-bold mb-2">Documentos:</p>
                  <div className="d-flex flex-wrap gap-2">
                    <Link
                      to={`/documento/${a.id}/prontuario`}
                      className="btn btn-sm btn-outline-primary fw-bold shadow-sm flex-grow-1"
                    >
                      Prontuário
                    </Link>
                    <Link
                      to={`/documento/${a.id}/receita`}
                      className="btn btn-sm btn-outline-success fw-bold shadow-sm flex-grow-1"
                    >
                      Receita
                    </Link>
                    <Link
                      to={`/documento/${a.id}/atestado`}
                      className="btn btn-sm btn-outline-warning text-dark fw-bold shadow-sm flex-grow-1"
                    >
                      Atestado
                    </Link>
                    <Link
                      to={`/documento/${a.id}/pedidos`}
                      className="btn btn-sm btn-outline-info text-dark fw-bold shadow-sm flex-grow-1"
                    >
                      Pedidos
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading || !user)
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );

  const agendamentosFuturos = agendamentos
    .filter(
      (a) => a.status === "AGENDADO" && new Date(a.dataHora) >= new Date(),
    )
    .sort(
      (a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime(),
    );
  const proxima =
    agendamentosFuturos.length > 0 ? agendamentosFuturos[0] : null;
  const outrasConsultas = agendamentosFuturos.filter(
    (a) => a.id !== proxima?.id,
  );

  const renderPaciente = () => (
    <div className="row g-4 animation-fade-in">
      <div className="col-lg-8">
        <div
          className="card shadow-sm border-0 mb-4"
          style={{
            borderRadius: "15px",
            borderLeft: "5px solid var(--aa-orange)",
          }}
        >
          <div className="card-body p-4 d-flex flex-column justify-content-center">
            <h4 style={{ color: "var(--aa-brown)" }}>
              <i className="bi bi-calendar-event me-2"></i>Sua Próxima Consulta
            </h4>
            {proxima ? (
              <div className="mt-3 p-4 bg-light rounded d-flex justify-content-between align-items-center flex-wrap gap-3 shadow-sm border">
                <div>
                  <h5 className="mb-1 fw-bold">
                    {proxima.medicoNome || "Profissional não identificado"}
                  </h5>
                  <p className="mb-2 text-muted small fw-semibold">
                    <i className="bi bi-star-fill text-warning me-1"></i>
                    {proxima.medicoEspecializacao || "Geriatria"} | CRM:{" "}
                    {proxima.medicoCrm || "N/A"}
                  </p>
                  <p className="badge bg-primary bg-opacity-10 text-primary border border-primary fs-6 px-3 py-2 rounded-pill">
                    <i className="bi bi-clock-fill text-primary me-2"></i>
                    {formatarDataHora(proxima.dataHora).dia} às{" "}
                    {formatarDataHora(proxima.dataHora).hora}
                  </p>
                </div>
                <div className="d-flex flex-column gap-2 align-items-stretch">
                  <Link
                    to={`/sala/${proxima.id}`}
                    className="btn btn-primary shadow-sm btn-lg fw-bold"
                  >
                    <i className="bi bi-camera-video me-2"></i>Entrar na Sala
                  </Link>
                  <button
                    className="btn btn-outline-danger shadow-sm"
                    onClick={() => handleCancelar(proxima.id)}
                  >
                    <i className="bi bi-x-circle me-2"></i>Cancelar Consulta
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <i className="bi bi-calendar2-x fs-1 text-muted opacity-50 mb-2 d-block"></i>
                <p className="text-muted mb-0">
                  Você não tem consultas agendadas para os próximos dias.
                </p>
              </div>
            )}
          </div>
        </div>

        <div
          className="card shadow-sm border-0"
          style={{ borderRadius: "15px" }}
        >
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 style={{ color: "var(--aa-brown)" }} className="mb-0">
                <i className="bi bi-list-ul me-2"></i>Minha Agenda
              </h5>
              {outrasConsultas.length > 0 && (
                <div>
                  <button
                    className="btn btn-sm btn-light border rounded-circle me-2"
                    onClick={() => scroll(agendaPacienteRef, "left")}
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-light border rounded-circle"
                    onClick={() => scroll(agendaPacienteRef, "right")}
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              )}
            </div>

            {outrasConsultas.length > 0 ? (
              <div
                className="horizontal-scroll gap-3 pb-2"
                ref={agendaPacienteRef}
              >
                {outrasConsultas.map((a) => (
                  <div
                    key={a.id}
                    className="p-4 border shadow-sm bg-white d-flex flex-column justify-content-between gap-3"
                    style={{
                      borderRadius: "12px",
                      minWidth: "320px",
                      flex: "0 0 auto",
                    }}
                  >
                    <div>
                      <h5
                        className="fw-bold mb-1"
                        style={{ color: "var(--aa-brown)" }}
                      >
                        {a.medicoNome}
                      </h5>
                      <div className="text-muted small mb-3 fw-semibold">
                        <i className="bi bi-star-fill text-warning me-1"></i>{" "}
                        {a.medicoEspecializacao || "Geriatria"} &nbsp;|&nbsp;
                        CRM: {a.medicoCrm || "N/A"}
                      </div>
                      <span className="badge bg-primary bg-opacity-10 text-primary border border-primary fs-6 px-3 py-2 rounded-pill d-inline-block w-100 text-center">
                        <i className="bi bi-clock-fill me-2"></i>
                        {formatarDataHora(a.dataHora).dia} às{" "}
                        {formatarDataHora(a.dataHora).hora}
                      </span>
                    </div>
                    <div>
                      <button
                        className="btn btn-outline-danger px-4 shadow-sm w-100 fw-bold"
                        onClick={() => handleCancelar(a.id)}
                      >
                        <i className="bi bi-x-circle me-2"></i>Cancelar Consulta
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="alert alert-light text-center border mb-0">
                <p className="text-muted small mb-0">
                  Sem outros compromissos na agenda.
                </p>
              </div>
            )}
          </div>
        </div>

        {renderHistoricoClinico()}
      </div>

      <div className="col-lg-4 align-self-start d-flex flex-column gap-4">
        <Link to="/busca" className="text-decoration-none">
          <div
            className="card shadow-sm border-0 service-feature bg-white"
            style={{ borderRadius: "15px" }}
          >
            <div className="card-body text-center p-4">
              <i
                className="bi bi-search display-4"
                style={{ color: "var(--aa-green)" }}
              ></i>
              <h4 style={{ color: "var(--aa-brown)" }} className="mt-3">
                Agendar Consulta
              </h4>
              <p className="text-muted mb-0">Encontre especialistas.</p>
            </div>
          </div>
        </Link>
        <Link to="/exames" className="text-decoration-none">
          <div
            className="card shadow-sm border-0 service-feature bg-white"
            style={{
              borderRadius: "15px",
              borderBottom: "5px solid var(--aa-orange)",
            }}
          >
            <div className="card-body text-center p-4">
              <i className="bi bi-folder-plus display-4 text-primary"></i>
              <h4 style={{ color: "var(--aa-brown)" }} className="mt-3">
                Meus Exames
              </h4>
              <p className="text-muted mb-0">Faça upload de exames antigos.</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );

  const renderMedico = () => {
    const statusAtual = user.statusValidacao;

    if (statusAtual === "APROVADO") {
      return (
        <div className="row g-4 animation-fade-in">
          <div className="col-lg-8">
            <div
              className="card shadow-sm border-0 mb-4"
              style={{ borderRadius: "15px" }}
            >
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 style={{ color: "var(--aa-brown)" }} className="mb-0">
                    <i className="bi bi-calendar-check me-2"></i>Meus Próximos
                    Atendimentos
                  </h4>
                  {agendamentos.filter((a) => a.status === "AGENDADO").length >
                    0 && (
                    <div>
                      <button
                        className="btn btn-sm btn-light border rounded-circle me-2"
                        onClick={() => scroll(agendaMedicoRef, "left")}
                      >
                        <i className="bi bi-chevron-left"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-light border rounded-circle"
                        onClick={() => scroll(agendaMedicoRef, "right")}
                      >
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </div>
                  )}
                </div>

                {agendamentos.filter((a) => a.status === "AGENDADO").length >
                0 ? (
                  <div
                    className="horizontal-scroll gap-3 pb-2"
                    ref={agendaMedicoRef}
                  >
                    {agendamentos
                      .filter((a) => a.status === "AGENDADO")
                      .sort(
                        (a, b) =>
                          new Date(a.dataHora).getTime() -
                          new Date(b.dataHora).getTime(),
                      )
                      .map((a) => (
                        <div
                          key={a.id}
                          className="border rounded p-4 shadow-sm bg-white d-flex flex-column justify-content-between gap-4"
                          style={{
                            minWidth: "320px",
                            flex: "0 0 auto",
                            borderLeft: "4px solid var(--aa-orange) !important",
                          }}
                        >
                          <div>
                            <h5 className="fw-bold text-dark mb-2">
                              <i className="bi bi-calendar-event me-2 text-muted"></i>
                              {formatarDataHora(a.dataHora).dia} às{" "}
                              {formatarDataHora(a.dataHora).hora}
                            </h5>
                            <span className="text-muted fw-semibold d-block mt-2">
                              <i className="bi bi-person-fill me-2 text-primary"></i>
                              {a.pacienteNome || "Paciente Identificado"}
                            </span>
                          </div>

                          <div className="d-flex flex-column gap-2">
                            <Link
                              to={`/sala/${a.id}`}
                              className="btn btn-primary w-100 shadow-sm fw-bold"
                            >
                              <i className="bi bi-camera-video me-2"></i>{" "}
                              Iniciar Chamada
                            </Link>
                            <button
                              className="btn btn-outline-danger w-100 shadow-sm fw-bold"
                              onClick={() => handleCancelar(a.id)}
                            >
                              Cancelar Consulta
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-5 bg-light rounded border">
                    <i className="bi bi-inbox fs-1 text-muted opacity-50 mb-3 d-block"></i>
                    <h5 className="fw-bold text-muted mb-0">
                      Agenda livre no momento.
                    </h5>
                  </div>
                )}
              </div>
            </div>

            {renderHistoricoClinico()}
          </div>
          <div className="col-lg-4 d-flex flex-column gap-4 align-self-start">
            <Link to="/agenda-medico" className="text-decoration-none">
              <div
                className="card shadow-sm border-0 service-feature bg-white p-3"
                style={{ borderRadius: "15px" }}
              >
                <h5
                  style={{ color: "var(--aa-brown)" }}
                  className="m-0 text-center py-2"
                >
                  <i className="bi bi-gear me-2"></i>Configurar Agenda
                </h5>
              </div>
            </Link>

            <Link to="/planos-medico" className="text-decoration-none">
              <div
                className="card shadow-sm border-0 service-feature bg-white p-3"
                style={{
                  borderRadius: "15px",
                  borderLeft: "5px solid var(--aa-orange)",
                }}
              >
                <h5
                  style={{ color: "var(--aa-orange)" }}
                  className="m-0 text-center py-2 fw-bold"
                >
                  <i className="bi bi-rocket-takeoff me-2"></i>Planos do Consultório
                </h5>
              </div>
            </Link>

            <Link to="/extrato-assinaturas" className="text-decoration-none">
              <div
                className="card shadow-sm border-0 service-feature bg-white p-3"
                style={{
                  borderRadius: "15px",
                  borderLeft: "5px solid var(--aa-green)",
                }}
              >
                <h5
                  style={{ color: "var(--aa-brown)" }}
                  className="m-0 text-center py-2 fw-bold"
                >
                  <i className="bi bi-receipt me-2 text-success"></i>Extrato de Assinatura
                </h5>
              </div>
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="row justify-content-center animation-fade-in">
        <div className="col-lg-8">
          <div
            className="card shadow-sm border-0"
            style={{
              borderRadius: "15px",
              borderTop: "6px solid var(--aa-orange)",
            }}
          >
            <div className="card-body p-4 p-md-5 text-center">
              {statusAtual === "PENDENTE" && (
                <>
                  <i
                    className="bi bi-shield-lock display-1 mb-3"
                    style={{ color: "var(--aa-orange)" }}
                  ></i>
                  <h2
                    className="fw-bold mb-3"
                    style={{ color: "var(--aa-brown)" }}
                  >
                    Validação Obrigatória
                  </h2>
                  <p className="fs-5 text-muted mb-4">
                    Confira os dados que serão enviados para a equipe de
                    moderação avaliar e validar o seu registo médico (CRM).
                  </p>
                  <div
                    className="card bg-light border-0 shadow-sm text-start mx-auto mb-5"
                    style={{ maxWidth: "400px", borderRadius: "15px" }}
                  >
                    <div className="card-body p-4">
                      <h6 className="fw-bold mb-3 text-muted border-bottom pb-2">
                        <i className="bi bi-person-vcard me-2"></i>Meus Dados
                        para Validação
                      </h6>
                      <p className="mb-2">
                        <strong>Nome Completo:</strong> <br />
                        {user.nome}
                      </p>
                      <p className="mb-2">
                        <strong>E-mail:</strong> <br />
                        {user.email}
                      </p>
                      <p className="mb-0">
                        <strong>CRM:</strong> <br />
                        {user.crm || "Não informado, edite o seu perfil antes!"}
                      </p>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary btn-lg px-5 shadow-sm"
                    onClick={solicitarValidacao}
                    disabled={!user.crm}
                    title={
                      !user.crm ? "Preencha o CRM no seu Perfil primeiro." : ""
                    }
                  >
                    <i className="bi bi-send-check me-2"></i> Enviar para
                    Análise
                  </button>
                </>
              )}
              {statusAtual === "EM_ANALISE" && (
                <>
                  <i className="bi bi-hourglass-split display-1 mb-3 text-warning"></i>
                  <h2
                    className="fw-bold mb-3"
                    style={{ color: "var(--aa-brown)" }}
                  >
                    Documentos em Análise
                  </h2>
                  <p className="fs-5 text-muted">
                    A sua solicitação está a ser analisada pela equipe
                    administrativa.
                  </p>
                </>
              )}
              {statusAtual === "REPROVADO" && (
                <>
                  <i className="bi bi-x-octagon display-1 mb-3 text-danger"></i>
                  <h2 className="fw-bold mb-3 text-danger">
                    Validação Recusada
                  </h2>
                  <div className="alert alert-danger text-start p-3 mb-4">
                    <strong>Feedback:</strong> "{user.mensagemValidacao}"
                  </div>
                  <button
                    className="btn btn-outline-danger btn-lg px-5"
                    onClick={() => navigate("/perfil")}
                  >
                    <i className="bi bi-pencil-square me-2"></i> Editar Meus
                    Dados
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAdmin = () => (
    <AdminValidacaoMedicos />
  );

  return (
    <main className="container my-5 pb-5">
      <div className="mb-5 pb-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 className="fw-bold mb-1" style={{ color: "var(--aa-brown)" }}>
            Olá, {getPrimeiroNome(user.nome)}! 👋
          </h1>
          <p className="fs-5 text-muted mb-0">
            {user.tipo === "PACIENTE" && "Bem-vindo ao Active Age."}
            {user.tipo === "MEDICO" &&
              "Área restrita para profissionais da saúde."}
            {user.tipo === "ADMIN" && "Painel Administrativo Active Age."}
          </p>
        </div>
        {user.tipo !== "ADMIN" && (
          <Link to="/perfil" className="btn btn-outline-secondary px-4">
            <i className="bi bi-person-lines-fill me-2"></i>Editar Perfil
          </Link>
        )}
      </div>

      {user.tipo === "PACIENTE" && renderPaciente()}
      {user.tipo === "MEDICO" && renderMedico()}
      {user.tipo === "ADMIN" && renderAdmin()}

      <style>{`
        .animation-fade-in { animation: fadeIn 0.4s ease-in-out; } 
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .horizontal-scroll {
          display: flex;
          overflow-x: auto;
          scroll-behavior: smooth;
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .horizontal-scroll::-webkit-scrollbar {
          display: none; /* Chrome, Safari and Opera */
        }
      `}</style>
    </main>
  );
}
