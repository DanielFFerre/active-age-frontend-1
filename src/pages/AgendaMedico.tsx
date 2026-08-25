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

export function AgendaMedico() {
  const navigate = useNavigate();
  const [user, setUser] = useState<Usuario | null>(null);
  const [horarios, setHorarios] = useState<Agendamento[]>([]);
  const [dataNova, setDataNova] = useState("");
  const [horaNova, setHoraNova] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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
  }, [navigate]);

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

  const handleCriarHorario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataNova || !horaNova) {
      Swal.fire("Atenção", "Selecione data e hora válidas.", "warning");
      return;
    }

    const novoHorarioIso = `${dataNova}T${horaNova}:00`;
    const dataHoraNova = new Date(novoHorarioIso);

    const temConflito = horarios.some((h) => {
      if (h.status === "CANCELADO_PELO_MEDICO") return false;

      const dataExistente = new Date(h.dataHora);
      const diffEmMinutos = Math.abs(
        (dataHoraNova.getTime() - dataExistente.getTime()) / (1000 * 60),
      );

      return diffEmMinutos < 40;
    });

    if (temConflito) {
      Swal.fire({
        title: "Conflito de Horário",
        text: "Cada consulta deve ter um intervalo mínimo de 40 minutos entre si para garantir a qualidade do atendimento.",
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
        Swal.fire(
          "Sucesso",
          "Horário disponibilizado para os pacientes!",
          "success",
        );
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

  const cancelarHorario = async (id: string) => {
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
      <header className="mb-5 pb-3 border-bottom">
        <Link to="/dashboard" className="btn btn-outline-secondary mb-3">
          <i className="bi bi-arrow-left me-2"></i>Voltar
        </Link>
        <h1 className="fw-bold mb-1" style={{ color: "var(--aa-brown)" }}>
          Configurar Agenda
        </h1>
        <p className="fs-5 text-muted mb-0">
          Disponibilize seus horários para atendimento.
        </p>
      </header>

      <div className="row g-4">
        <div className="col-lg-4 mb-4">
          <div
            className="card shadow-sm border-0"
            style={{ borderRadius: "15px" }}
          >
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4" style={{ color: "var(--aa-brown)" }}>
                <i className="bi bi-plus-circle me-2"></i>Novo Horário
              </h5>
              <form onSubmit={handleCriarHorario}>
                <div className="mb-3">
                  <label className="form-label text-muted">Data</label>
                  <input
                    type="date"
                    className="form-control"
                    required
                    value={dataNova}
                    onChange={(e) => setDataNova(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label text-muted">Hora</label>
                  <input
                    type="time"
                    className="form-control"
                    required
                    value={horaNova}
                    onChange={(e) => setHoraNova(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100 fw-bold shadow-sm py-2"
                >
                  <i className="bi bi-calendar-plus me-2"></i>Adicionar à Agenda
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div
            className="card shadow-sm border-0"
            style={{ borderRadius: "15px" }}
          >
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4" style={{ color: "var(--aa-brown)" }}>
                <i className="bi bi-calendar-week me-2"></i>Meus Horários
                Disponíveis
              </h5>

              {datasOrdenadas.length === 0 ? (
                <div className="alert alert-light border text-center py-4">
                  <i className="bi bi-inbox fs-1 text-muted opacity-50 mb-2"></i>
                  <p className="mb-0 text-muted">
                    Você não possui horários livres ou agendamentos futuros.
                  </p>
                </div>
              ) : (
                datasOrdenadas.map((dataKey) => (
                  <div key={dataKey} className="mb-4">
                    <h6 className="bg-light p-2 rounded fw-bold text-muted mb-3 d-flex align-items-center">
                      <i className="bi bi-calendar-event me-2"></i> {dataKey}
                    </h6>
                    <div className="d-flex flex-wrap gap-2">
                      {agendaAgrupada[dataKey]
                        .sort(
                          (a: any, b: any) =>
                            new Date(a.dataHora).getTime() -
                            new Date(b.dataHora).getTime(),
                        )
                        .map((h: any) => (
                          <div
                            key={h.id}
                            className={`p-3 border shadow-sm d-flex flex-column align-items-center justify-content-center position-relative ${h.status === "AGENDADO" ? "bg-primary text-white border-primary" : "bg-white text-dark"}`}
                            style={{
                              borderRadius: "12px",
                              minWidth: "110px",
                              transition: "all 0.2s",
                            }}
                          >
                            <span className="fw-bold fs-5">
                              {new Date(h.dataHora).toLocaleTimeString(
                                "pt-BR",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </span>
                            <span className="small opacity-75">
                              {h.status === "AGENDADO" ? "Ocupado" : "Livre"}
                            </span>
                            <button
                              onClick={() => cancelarHorario(h.id)}
                              className={`btn btn-sm position-absolute top-0 end-0 p-1 ${h.status === "AGENDADO" ? "text-white" : "text-danger"}`}
                              title="Cancelar"
                            >
                              <i className="bi bi-x-circle-fill"></i>
                            </button>
                          </div>
                        ))}
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
