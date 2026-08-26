import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { ModalPagamentoMercadoPago } from "../components/pagamento/ModalPagamentoMercadoPago";

// =========================================================================
// 📋 INTERFACES DE DADOS PARA O EXTRATO DE ASSINATURA
// =========================================================================
export interface Fatura {
  id: string;
  competencia: string;
  dataEmissao: string;
  dataPagamento?: string;
  valor: number;
  status: "PAGA" | "PENDENTE" | "PROCESSANDO" | "CANCELADA";
  metodo: string;
  codigoTransacao: string;
}

export interface AssinaturaMedico {
  id: string;
  medicoId: string;
  medicoNome: string;
  medicoCrm: string;
  medicoEmail: string;
  medicoTelefone?: string;
  planoId: string;
  planoNome: string;
  ciclo: "MENSAL" | "ANUAL";
  valor: number;
  status: "ATIVA" | "PENDENTE" | "CANCELADA" | "ATRASADA";
  dataInicio: string;
  proximaCobranca: string;
  formaPagamento: string;
  faturas: Fatura[];
}

// =========================================================================
// 💼 DADOS DE IDENTIFICAÇÃO / MOCK (FÁCIL DE EDITAR OU INTEGRAR COM API)
// =========================================================================
const ASSINATURAS_INICIAIS: AssinaturaMedico[] = [
  {
    id: "sub-1001",
    medicoId: "med-1",
    medicoNome: "Dr. Carlos Eduardo Silva",
    medicoCrm: "123456/SP",
    medicoEmail: "carlos.silva@exemplo.com",
    medicoTelefone: "(11) 98765-4321",
    planoId: "plano-pro",
    planoNome: "Plano Profissional / Pro",
    ciclo: "MENSAL",
    valor: 199.0,
    status: "ATIVA",
    dataInicio: "15/03/2026",
    proximaCobranca: "15/09/2026",
    formaPagamento: "Cartão de Crédito Mastercard •••• 4242",
    faturas: [
      {
        id: "FAT-2026-0801",
        competencia: "Agosto / 2026",
        dataEmissao: "15/08/2026",
        dataPagamento: "15/08/2026 10:32",
        valor: 199.0,
        status: "PAGA",
        metodo: "Cartão de Crédito",
        codigoTransacao: "TX-99881122",
      },
      {
        id: "FAT-2026-0701",
        competencia: "Julho / 2026",
        dataEmissao: "15/07/2026",
        dataPagamento: "15/07/2026 09:15",
        valor: 199.0,
        status: "PAGA",
        metodo: "Cartão de Crédito",
        codigoTransacao: "TX-77665544",
      },
      {
        id: "FAT-2026-0601",
        competencia: "Junho / 2026",
        dataEmissao: "15/06/2026",
        dataPagamento: "15/06/2026 14:02",
        valor: 199.0,
        status: "PAGA",
        metodo: "Cartão de Crédito",
        codigoTransacao: "TX-55443322",
      },
    ],
  },
  {
    id: "sub-1002",
    medicoId: "med-2",
    medicoNome: "Dra. Mariana Albuquerque",
    medicoCrm: "654321/RJ",
    medicoEmail: "mariana.albuquerque@exemplo.com",
    medicoTelefone: "(21) 99887-1122",
    planoId: "plano-clinica",
    planoNome: "Plano Clínica / Premium",
    ciclo: "ANUAL",
    valor: 279.0,
    status: "ATIVA",
    dataInicio: "10/01/2026",
    proximaCobranca: "10/01/2027",
    formaPagamento: "PIX Automático",
    faturas: [
      {
        id: "FAT-2026-0102",
        competencia: "Anual 2026 / 2027",
        dataEmissao: "10/01/2026",
        dataPagamento: "10/01/2026 16:45",
        valor: 3348.0,
        status: "PAGA",
        metodo: "PIX",
        codigoTransacao: "PIX-12348765",
      },
    ],
  },
  {
    id: "sub-1003",
    medicoId: "med-3",
    medicoNome: "Dr. Roberto Mendes",
    medicoCrm: "789012/MG",
    medicoEmail: "roberto.mendes@exemplo.com",
    medicoTelefone: "(31) 97654-3210",
    planoId: "plano-start",
    planoNome: "Plano Básico / Start",
    ciclo: "MENSAL",
    valor: 99.0,
    status: "PENDENTE",
    dataInicio: "01/08/2026",
    proximaCobranca: "01/09/2026",
    formaPagamento: "Boleto Bancário",
    faturas: [
      {
        id: "FAT-2026-0803",
        competencia: "Agosto / 2026",
        dataEmissao: "01/08/2026",
        valor: 99.0,
        status: "PENDENTE",
        metodo: "Boleto Bancário",
        codigoTransacao: "BOL-98712345",
      },
    ],
  },
];

export function ExtratoAssinaturas() {
  const navigate = useNavigate();
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);
  const [listaAssinaturas, setListaAssinaturas] =
    useState<AssinaturaMedico[]>(ASSINATURAS_INICIAIS);
  const [termoBusca, setTermoBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroPlano, setFiltroPlano] = useState("");

  // Modal de Detalhes da Fatura / Comprovante
  const [faturaVisualizada, setFaturaVisualizada] = useState<{
    fatura: Fatura;
    medicoNome: string;
    medicoCrm: string;
    planoNome: string;
  } | null>(null);

  // Modal de Pagamento Mercado Pago
  const [faturaParaPagar, setFaturaParaPagar] = useState<Fatura | null>(null);

  // Modal de Extrato Completo de um Médico específico (para o Admin)
  const [medicoExtratoModal, setMedicoExtratoModal] =
    useState<AssinaturaMedico | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("activeAgeUser");
    if (!userStr) {
      navigate("/login");
      return;
    }
    const user = JSON.parse(userStr);
    setUsuarioLogado(user);

    // Se for médico e tiver registro salvo ou logado, sincroniza
    const assinaturasSalvas = localStorage.getItem("activeAgeAssinaturas");
    if (assinaturasSalvas) {
      try {
        setListaAssinaturas(JSON.parse(assinaturasSalvas));
      } catch (e) {
        console.error(e);
      }
    }
  }, [navigate]);

  const isAdmin = usuarioLogado?.tipo === "ADMIN";
  const isMedico = usuarioLogado?.tipo === "MEDICO";

  // Identificar a assinatura do médico atualmente logado
  const minhaAssinatura = useMemo(() => {
    if (!usuarioLogado) return null;
    const encontrada = listaAssinaturas.find(
      (a) =>
        a.medicoId === usuarioLogado.id ||
        a.medicoEmail === usuarioLogado.email,
    );
    if (encontrada) return encontrada;

    // Se o médico estiver logado mas ainda não constar na lista mock, cria uma assinatura padrão
    return {
      id: "sub-meu-perfil",
      medicoId: usuarioLogado.id,
      medicoNome: usuarioLogado.nome,
      medicoCrm: usuarioLogado.crm || "Pendente",
      medicoEmail: usuarioLogado.email,
      planoId: "plano-pro",
      planoNome: "Plano Profissional / Pro",
      ciclo: "MENSAL" as const,
      valor: 199.0,
      status: "ATIVA" as const,
      dataInicio: "18/08/2026",
      proximaCobranca: "18/09/2026",
      formaPagamento: "Cartão de Crédito •••• 5544",
      faturas: [
        {
          id: "FAT-2026-0818",
          competencia: "Agosto / 2026",
          dataEmissao: "18/08/2026",
          dataPagamento: "18/08/2026 10:15",
          valor: 199.0,
          status: "PAGA" as const,
          metodo: "Cartão de Crédito",
          codigoTransacao: "TX-AUT-102938",
        },
      ],
    };
  }, [usuarioLogado, listaAssinaturas]);

  // Filtros da visualização do Admin
  const assinaturasFiltradasAdmin = useMemo(() => {
    return listaAssinaturas.filter((item) => {
      if (termoBusca.trim()) {
        const termo = termoBusca.toLowerCase().trim();
        const matchNome = item.medicoNome.toLowerCase().includes(termo);
        const matchCrm = item.medicoCrm.toLowerCase().includes(termo);
        const matchEmail = item.medicoEmail.toLowerCase().includes(termo);
        if (!matchNome && !matchCrm && !matchEmail) return false;
      }
      if (filtroStatus && item.status !== filtroStatus) {
        return false;
      }
      if (filtroPlano && item.planoId !== filtroPlano) {
        return false;
      }
      return true;
    });
  }, [listaAssinaturas, termoBusca, filtroStatus, filtroPlano]);

  // KPIs para o Admin
  const statsAdmin = useMemo(() => {
    let mrr = 0;
    let ativas = 0;
    let pendentes = 0;

    listaAssinaturas.forEach((a) => {
      if (a.status === "ATIVA") {
        mrr += a.valor;
        ativas++;
      } else if (a.status === "PENDENTE" || a.status === "ATRASADA") {
        pendentes++;
      }
    });

    return {
      mrr,
      ativas,
      pendentes,
      total: listaAssinaturas.length,
    };
  }, [listaAssinaturas]);

  const handleCancelarAssinatura = () => {
    Swal.fire({
      title: "Deseja cancelar sua assinatura?",
      text: "Seu consultório virtual continuará ativo até o final do período vigente atual.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sim, cancelar",
      cancelButtonText: "Manter Plano",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: "info",
          title: "Assinatura Cancelada",
          text: "O cancelamento foi agendado para o fim do período vigente.",
          confirmButtonColor: "var(--aa-brown)",
        });
      }
    });
  };

  const handleSimularPagamentoAdmin = (medicoId: string, faturaId: string) => {
    const atualizadas = listaAssinaturas.map((a) => {
      if (a.medicoId === medicoId) {
        return {
          ...a,
          status: "ATIVA" as const,
          faturas: a.faturas.map((f) =>
            f.id === faturaId
              ? {
                  ...f,
                  status: "PAGA" as const,
                  dataPagamento: new Date().toLocaleString("pt-BR"),
                }
              : f,
          ),
        };
      }
      return a;
    });

    setListaAssinaturas(atualizadas);
    localStorage.setItem("activeAgeAssinaturas", JSON.stringify(atualizadas));

    if (medicoExtratoModal?.medicoId === medicoId) {
      setMedicoExtratoModal(
        atualizadas.find((a) => a.medicoId === medicoId) || null,
      );
    }

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Fatura marcada como Paga!",
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const renderBadgeStatusAssinatura = (status: string) => {
    switch (status) {
      case "ATIVA":
        return (
          <span
            className="badge px-3 py-2 rounded-pill fw-semibold"
            style={{
              backgroundColor: "rgba(144, 194, 141, 0.2)",
              color: "var(--aa-green)",
              border: "1px solid var(--aa-green)",
            }}
          >
            <i className="bi bi-check-circle-fill me-1"></i> Ativa
          </span>
        );
      case "PENDENTE":
        return (
          <span
            className="badge px-3 py-2 rounded-pill fw-semibold"
            style={{
              backgroundColor: "rgba(232, 101, 66, 0.12)",
              color: "var(--aa-orange)",
              border: "1px solid var(--aa-orange)",
            }}
          >
            <i className="bi bi-hourglass-split me-1"></i> Pendente
          </span>
        );
      case "CANCELADA":
        return (
          <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-3 py-2 rounded-pill fw-semibold">
            <i className="bi bi-slash-circle me-1"></i> Cancelada
          </span>
        );
      case "ATRASADA":
        return (
          <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-2 rounded-pill fw-semibold">
            <i className="bi bi-exclamation-triangle-fill me-1"></i> Atrasada
          </span>
        );
      default:
        return <span className="badge bg-light text-dark">{status}</span>;
    }
  };

  const renderBadgeStatusFatura = (status: string) => {
    switch (status) {
      case "PAGA":
        return (
          <span
            className="badge text-white px-2 py-1 rounded"
            style={{ backgroundColor: "var(--aa-green)" }}
          >
            <i className="bi bi-check-lg me-1"></i> Paga
          </span>
        );
      case "PENDENTE":
        return (
          <span
            className="badge text-white px-2 py-1 rounded"
            style={{ backgroundColor: "var(--aa-orange)" }}
          >
            <i className="bi bi-clock me-1"></i> Aguardando
          </span>
        );
      case "PROCESSANDO":
        return (
          <span className="badge bg-info text-white px-2 py-1 rounded">
            <i className="bi bi-arrow-repeat me-1"></i> Processando
          </span>
        );
      default:
        return (
          <span className="badge bg-secondary px-2 py-1 rounded">{status}</span>
        );
    }
  };

  return (
    <main className="container my-5 pb-5 animation-fade-in">
      {/* CABEÇALHO DA PÁGINA */}
      <div className="mb-4 pb-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-dark text-white rounded-pill px-3 py-1 small">
              {isAdmin ? "PAINEL ADMINISTRATIVO" : "CONSULTÓRIO VIRTUAL"}
            </span>
          </div>
          <h1 className="fw-bold mb-1" style={{ color: "var(--aa-brown)" }}>
            {isAdmin
              ? "Gestão e Extrato de Assinaturas dos Médicos"
              : "Extrato e Histórico da Minha Assinatura"}
          </h1>
          <p className="text-muted mb-0">
            {isAdmin
              ? "Acompanhe a situação financeira, planos ativos e histórico de pagamentos de cada profissional."
              : "Visualize os dados do seu plano atual, próximas cobranças e histórico de faturas do seu consultório."}
          </p>
        </div>

        <div className="d-flex gap-2">
          <Link to="/dashboard" className="btn btn-outline-secondary px-3">
            <i className="bi bi-arrow-left me-1"></i> Voltar ao Painel
          </Link>
          <Link to="/planos-medico" className="btn btn-primary px-3 shadow-sm">
            <i className="bi bi-rocket-takeoff me-1"></i> Ver Todos os Planos
          </Link>
        </div>
      </div>

      {/* ========================================================
          VISÃO DO MÉDICO (MEU EXTRATO)
          ======================================================== */}
      {(!isAdmin || isMedico) && minhaAssinatura && (
        <div>
          {/* CARD DO PLANO ATUAL DO MÉDICO */}
          <div className="card shadow-sm border-0 rounded-4 mb-4 overflow-hidden">
            <div
              className="card-header p-4 text-white d-flex justify-content-between align-items-center flex-wrap gap-3"
              style={{ backgroundColor: "var(--aa-brown)" }}
            >
              <div>
                <span className="badge bg-warning text-dark px-3 py-1 rounded-pill fw-bold mb-2">
                  PLANO ATIVO
                </span>
                <h3 className="fw-bold mb-0 text-white">
                  {minhaAssinatura.planoNome}
                </h3>
              </div>

              <div className="d-flex align-items-center gap-3">
                <div className="text-end">
                  <span className="text-white-50 small d-block">
                    VALOR DA ASSINATURA
                  </span>
                  <span
                    className="fs-3 fw-bold"
                    style={{ color: "var(--aa-orange)" }}
                  >
                    R$ {minhaAssinatura.valor.toFixed(2)}
                  </span>
                  <span className="text-white-50">
                    /{minhaAssinatura.ciclo === "MENSAL" ? "mês" : "ano"}
                  </span>
                </div>
              </div>
            </div>

            <div className="card-body p-4 bg-white">
              <div className="row g-4 align-items-center">
                <div className="col-12 col-md-4 border-end-md">
                  <span className="text-muted small fw-bold d-block text-uppercase mb-1">
                    Status da Assinatura:
                  </span>
                  <div className="mb-2">
                    {renderBadgeStatusAssinatura(minhaAssinatura.status)}
                  </div>
                  <small className="text-muted">
                    Ativa desde {minhaAssinatura.dataInicio}
                  </small>
                </div>

                <div className="col-12 col-md-4 border-end-md">
                  <span className="text-muted small fw-bold d-block text-uppercase mb-1">
                    Próxima Cobrança:
                  </span>
                  <h5 className="fw-bold text-dark mb-1">
                    <i
                      className="bi bi-calendar-check me-2"
                      style={{ color: "var(--aa-green)" }}
                    ></i>
                    {minhaAssinatura.proximaCobranca}
                  </h5>
                  <small className="text-muted">
                    Renovação automática no {minhaAssinatura.formaPagamento}
                  </small>
                </div>

                <div className="col-12 col-md-4 text-md-end">
                  <div className="d-flex flex-column flex-md-row justify-content-md-end gap-2">
                    <Link
                      to="/planos-medico"
                      className="btn btn-outline-secondary fw-bold"
                    >
                      <i className="bi bi-arrow-repeat me-1"></i> Alterar Plano
                    </Link>
                    <button
                      className="btn btn-outline-danger"
                      onClick={handleCancelarAssinatura}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TABELA DE HISTÓRICO DE FATURAS DO MÉDICO */}
          <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
            <div className="card-header bg-light p-3 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0" style={{ color: "var(--aa-brown)" }}>
                <i className="bi bi-receipt me-2"></i>Histórico de Faturas e
                Comprovantes
              </h5>
              <span className="text-muted small">
                {minhaAssinatura.faturas.length} registro(s) encontrado(s)
              </span>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th scope="col" className="ps-4">
                      Código / ID
                    </th>
                    <th scope="col">Competência</th>
                    <th scope="col">Data Pagamento</th>
                    <th scope="col">Forma de Pagamento</th>
                    <th scope="col">Valor</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="text-end pe-4">
                      Comprovante
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {minhaAssinatura.faturas.map((fatura) => (
                    <tr key={fatura.id}>
                      <td className="ps-4 fw-bold font-monospace text-dark">
                        {fatura.id}
                      </td>
                      <td>{fatura.competencia}</td>
                      <td>
                        <span className="small text-muted">
                          {fatura.dataPagamento || "Aguardando pagamento"}
                        </span>
                      </td>
                      <td>
                        <i className="bi bi-credit-card me-1 text-muted"></i>
                        {fatura.metodo}
                      </td>
                      <td className="fw-bold text-dark">
                        R$ {fatura.valor.toFixed(2)}
                      </td>
                      <td>{renderBadgeStatusFatura(fatura.status)}</td>
                      <td className="text-end pe-4">
                        {fatura.status !== "PAGA" && (
                          <button
                            className="btn btn-sm btn-primary fw-bold me-1 shadow-sm"
                            onClick={() => setFaturaParaPagar(fatura)}
                            title="Pagar Fatura com Mercado Pago"
                          >
                            <i className="bi bi-wallet2 me-1"></i> Pagar
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() =>
                            setFaturaVisualizada({
                              fatura,
                              medicoNome: minhaAssinatura.medicoNome,
                              medicoCrm: minhaAssinatura.medicoCrm,
                              planoNome: minhaAssinatura.planoNome,
                            })
                          }
                          title="Visualizar Comprovante / Recibo"
                        >
                          <i className="bi bi-file-earmark-text me-1"></i>{" "}
                          Recibo
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          VISÃO DO ADMINISTRADOR (PAINEL GERAL DE ASSINANTES)
          ======================================================== */}
      {isAdmin && (
        <div className="mt-4">
          {/* CARDS DE KPIS DO ADMIN */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="admin-stat-card stat-total p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted fw-semibold small text-uppercase">
                      Receita Mensal (MRR)
                    </span>
                    <h3
                      className="fw-bold my-1"
                      style={{ color: "var(--aa-orange)" }}
                    >
                      R$ {statsAdmin.mrr.toFixed(2)}
                    </h3>
                    <small className="text-muted">
                      Assinaturas recorrentes
                    </small>
                  </div>
                  <div className="admin-stat-icon icon-total">
                    <i className="bi bi-cash-stack"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="admin-stat-card stat-approved p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted fw-semibold small text-uppercase">
                      Assinaturas Ativas
                    </span>
                    <h3
                      className="fw-bold my-1"
                      style={{ color: "var(--aa-green)" }}
                    >
                      {statsAdmin.ativas}
                    </h3>
                    <small className="text-muted">Médicos em dia</small>
                  </div>
                  <div className="admin-stat-icon icon-approved">
                    <i className="bi bi-check-circle-fill"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="admin-stat-card stat-pending p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted fw-semibold small text-uppercase">
                      Pendentes / Atrasadas
                    </span>
                    <h3
                      className="fw-bold my-1"
                      style={{ color: "var(--aa-orange)" }}
                    >
                      {statsAdmin.pendentes}
                    </h3>
                    <small className="text-muted">Aguardando confirmação</small>
                  </div>
                  <div className="admin-stat-icon icon-pending">
                    <i className="bi bi-clock-history"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div
                className="admin-stat-card stat-total p-3"
                style={{ borderLeftColor: "var(--aa-orange)" }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted fw-semibold small text-uppercase">
                      Total de Médicos
                    </span>
                    <h3
                      className="fw-bold my-1"
                      style={{ color: "var(--aa-orange)" }}
                    >
                      {statsAdmin.total}
                    </h3>
                    <small className="text-muted">Cadastros monitorados</small>
                  </div>
                  <div
                    className="admin-stat-icon"
                    style={{
                      backgroundColor: "rgba(232, 101, 66, 0.12)",
                      color: "var(--aa-orange)",
                    }}
                  >
                    <i className="bi bi-person-badge-fill"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BARRA DE FILTRO DO ADMIN */}
          <div className="admin-filter-bar mb-4">
            <div className="row g-2 align-items-center">
              <div className="col-12 col-md-5">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 text-muted">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Buscar médico por nome, CRM ou e-mail..."
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                  />
                  {termoBusca && (
                    <button
                      className="btn btn-outline-secondary border-start-0"
                      type="button"
                      onClick={() => setTermoBusca("")}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  )}
                </div>
              </div>

              <div className="col-6 col-md-3">
                <select
                  className="form-select"
                  value={filtroPlano}
                  onChange={(e) => setFiltroPlano(e.target.value)}
                >
                  <option value="">Todos os Planos</option>
                  <option value="plano-start">Plano Start</option>
                  <option value="plano-pro">Plano Profissional</option>
                  <option value="plano-clinica">Plano Clínica</option>
                </select>
              </div>

              <div className="col-6 col-md-2">
                <select
                  className="form-select"
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                >
                  <option value="">Todos os Status</option>
                  <option value="ATIVA">Ativa</option>
                  <option value="PENDENTE">Pendente</option>
                  <option value="ATRASADA">Atrasada</option>
                  <option value="CANCELADA">Cancelada</option>
                </select>
              </div>

              <div className="col-12 col-md-2 text-md-end">
                <button
                  className="btn btn-outline-secondary w-100"
                  onClick={() => {
                    setTermoBusca("");
                    setFiltroPlano("");
                    setFiltroStatus("");
                  }}
                >
                  Limpar
                </button>
              </div>
            </div>
          </div>

          {/* TABELA DE TODOS OS MÉDICOS E SUAS ASSINATURAS */}
          <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th scope="col" className="ps-4">
                      Médico
                    </th>
                    <th scope="col">CRM</th>
                    <th scope="col">Plano Assinado</th>
                    <th scope="col">Valor / Ciclo</th>
                    <th scope="col">Status</th>
                    <th scope="col">Próxima Cobrança</th>
                    <th scope="col" className="text-end pe-4">
                      Extrato & Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {assinaturasFiltradasAdmin.map((item) => (
                    <tr key={item.id}>
                      <td className="ps-4">
                        <div>
                          <span className="fw-bold d-block text-dark">
                            {item.medicoNome}
                          </span>
                          <small className="text-muted">
                            {item.medicoEmail}
                          </small>
                        </div>
                      </td>
                      <td>
                        <span className="crm-badge-pill">{item.medicoCrm}</span>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {item.planoNome}
                        </span>
                      </td>
                      <td>
                        <span
                          className="fw-bold"
                          style={{ color: "var(--aa-orange)" }}
                        >
                          R$ {item.valor.toFixed(2)}
                        </span>
                        <span className="text-muted small">
                          /{item.ciclo === "MENSAL" ? "mês" : "ano"}
                        </span>
                      </td>
                      <td>{renderBadgeStatusAssinatura(item.status)}</td>
                      <td>
                        <span className="small text-muted">
                          {item.proximaCobranca}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setMedicoExtratoModal(item)}
                          title="Ver Extrato e Faturas do Médico"
                        >
                          <i className="bi bi-clock-history me-1"></i> Ver
                          Extrato ({item.faturas.length})
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: COMPROVANTE / RECIBO DE FATURA
          ======================================================== */}
      {faturaVisualizada && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.55)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div
                className="modal-header text-white p-3"
                style={{ backgroundColor: "var(--aa-brown)" }}
              >
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-receipt-cutoff me-2"></i> Recibo de
                  Pagamento
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setFaturaVisualizada(null)}
                ></button>
              </div>

              <div className="modal-body p-4 bg-light">
                <div className="card border p-4 bg-white rounded-3 shadow-sm text-center mb-3">
                  <img
                    src="/logo.png"
                    alt="Active Age"
                    height="50"
                    className="mx-auto mb-2"
                  />
                  <h6
                    className="fw-bold mb-0"
                    style={{ color: "var(--aa-brown)" }}
                  >
                    Active Age Consultório Virtual
                  </h6>
                  <small className="text-muted">
                    Comprovante Eletrônico de Quitação
                  </small>

                  <hr className="my-3" />

                  <div className="text-start small">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Médico Titular:</span>
                      <strong>{faturaVisualizada.medicoNome}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">CRM:</span>
                      <strong>{faturaVisualizada.medicoCrm}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Plano:</span>
                      <strong>{faturaVisualizada.planoNome}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Competência:</span>
                      <strong>{faturaVisualizada.fatura.competencia}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Código da Fatura:</span>
                      <span className="font-monospace">
                        {faturaVisualizada.fatura.id}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Data/Hora:</span>
                      <span>
                        {faturaVisualizada.fatura.dataPagamento ||
                          faturaVisualizada.fatura.dataEmissao}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Método:</span>
                      <span>{faturaVisualizada.fatura.metodo}</span>
                    </div>

                    <div className="p-2 bg-light rounded text-center my-3 border">
                      <span className="text-muted small d-block">
                        VALOR PAGO
                      </span>
                      <span className="fs-4 fw-bold text-success">
                        R$ {faturaVisualizada.fatura.valor.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light p-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setFaturaVisualizada(null)}
                >
                  Fechar
                </button>
                <button
                  type="button"
                  className="btn btn-primary fw-bold"
                  onClick={() => window.print()}
                >
                  <i className="bi bi-printer me-1"></i> Imprimir Recibo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: EXTRATO COMPLETO DE UM MÉDICO (PARA O ADMIN)
          ======================================================== */}
      {medicoExtratoModal && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.55)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div
                className="modal-header text-white p-4"
                style={{ backgroundColor: "var(--aa-brown)" }}
              >
                <div>
                  <h5 className="modal-title fw-bold mb-1">
                    <i className="bi bi-clock-history me-2"></i>
                    Extrato de Assinatura: {medicoExtratoModal.medicoNome}
                  </h5>
                  <span className="text-white-50 small">
                    CRM: {medicoExtratoModal.medicoCrm} |{" "}
                    {medicoExtratoModal.medicoEmail}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setMedicoExtratoModal(null)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded-3">
                      <small className="text-muted d-block text-uppercase fw-bold">
                        Plano Atual
                      </small>
                      <strong className="fs-6">
                        {medicoExtratoModal.planoNome}
                      </strong>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded-3">
                      <small className="text-muted d-block text-uppercase fw-bold">
                        Valor / Ciclo
                      </small>
                      <strong className="fs-6 text-dark">
                        R$ {medicoExtratoModal.valor.toFixed(2)} (
                        {medicoExtratoModal.ciclo})
                      </strong>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded-3">
                      <small className="text-muted d-block text-uppercase fw-bold">
                        Status
                      </small>
                      <div>
                        {renderBadgeStatusAssinatura(medicoExtratoModal.status)}
                      </div>
                    </div>
                  </div>
                </div>

                <h6
                  className="fw-bold mb-3"
                  style={{ color: "var(--aa-brown)" }}
                >
                  <i className="bi bi-receipt me-2"></i>Faturas e Cobranças
                  Geradas
                </h6>

                <div className="table-responsive border rounded-3">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th scope="col" className="ps-3">
                          ID Fatura
                        </th>
                        <th scope="col">Competência</th>
                        <th scope="col">Data</th>
                        <th scope="col">Valor</th>
                        <th scope="col">Status</th>
                        <th scope="col" className="text-end pe-3">
                          Ações Admin
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicoExtratoModal.faturas.map((fat) => (
                        <tr key={fat.id}>
                          <td className="ps-3 font-monospace small">
                            {fat.id}
                          </td>
                          <td>{fat.competencia}</td>
                          <td className="small">
                            {fat.dataPagamento || fat.dataEmissao}
                          </td>
                          <td className="fw-bold">R$ {fat.valor.toFixed(2)}</td>
                          <td>{renderBadgeStatusFatura(fat.status)}</td>
                          <td className="text-end pe-3">
                            {fat.status !== "PAGA" ? (
                              <button
                                className="btn btn-sm btn-success fw-bold me-1"
                                onClick={() =>
                                  handleSimularPagamentoAdmin(
                                    medicoExtratoModal.medicoId,
                                    fat.id,
                                  )
                                }
                                title="Confirmar pagamento manualmente"
                              >
                                <i className="bi bi-check2"></i> Marcar Paga
                              </button>
                            ) : null}

                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() =>
                                setFaturaVisualizada({
                                  fatura: fat,
                                  medicoNome: medicoExtratoModal.medicoNome,
                                  medicoCrm: medicoExtratoModal.medicoCrm,
                                  planoNome: medicoExtratoModal.planoNome,
                                })
                              }
                            >
                              <i className="bi bi-eye"></i> Recibo
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="modal-footer bg-light p-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setMedicoExtratoModal(null)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE PAGAMENTO MERCADO PAGO PARA FATURA PENDENTE */}
      {faturaParaPagar && minhaAssinatura && (
        <ModalPagamentoMercadoPago
          isOpen={!!faturaParaPagar}
          onClose={() => setFaturaParaPagar(null)}
          onSuccess={(detalhes) => {
            setFaturaParaPagar(null);
            // Atualizar status da fatura para paga
            const atualizadas = listaAssinaturas.map((a) => {
              if (a.medicoId === minhaAssinatura.medicoId) {
                return {
                  ...a,
                  status: "ATIVA" as const,
                  faturas: a.faturas.map((f) =>
                    f.id === faturaParaPagar.id
                      ? {
                          ...f,
                          status: "PAGA" as const,
                          dataPagamento: new Date().toLocaleString("pt-BR"),
                        }
                      : f,
                  ),
                };
              }
              return a;
            });
            setListaAssinaturas(atualizadas);
            localStorage.setItem(
              "activeAgeAssinaturas",
              JSON.stringify(atualizadas),
            );
            Swal.fire({
              icon: "success",
              title: "Fatura Paga com Sucesso!",
              text: `O pagamento da fatura ${faturaParaPagar.id} foi confirmado pelo Mercado Pago.`,
              confirmButtonColor: "var(--aa-green)",
            });
          }}
          plano={{
            id: minhaAssinatura.planoId,
            nome: `${minhaAssinatura.planoNome} (${faturaParaPagar.competencia})`,
            valor: faturaParaPagar.valor,
            ciclo: minhaAssinatura.ciclo,
          }}
          medico={{
            id: minhaAssinatura.medicoId,
            nome: minhaAssinatura.medicoNome,
            email: minhaAssinatura.medicoEmail,
            crm: minhaAssinatura.medicoCrm,
          }}
        />
      )}
    </main>
  );
}
