import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

export interface MedicoValidacao {
  id: string;
  nome: string;
  email: string;
  crm?: string;
  telefone?: string;
  especializacao?: string;
  biografia?: string;
  statusValidacao?:
    | "PENDENTE"
    | "EM_ANALISE"
    | "APROVADO"
    | "REPROVADO"
    | string;
  mensagemValidacao?: string;
  dataCadastro?: string;
}

const TEMPLATES_REPROVACAO = [
  {
    titulo: "CRM Não Encontrado no CFM",
    mensagem:
      "O número de CRM informado não foi localizado no cadastro oficial do Conselho Federal de Medicina (CFM) ou consta como inativo/cancelado.",
  },
  {
    titulo: "Divergência de Estado (UF)",
    mensagem:
      "A Unidade Federativa (UF) indicada no seu cadastro diverge da região de registro ativo no Conselho Regional de Medicina.",
  },
  {
    titulo: "Especialidade sem RQE",
    mensagem:
      "A especialidade médica informada não possui comprovação de Registro de Qualificação de Especialista (RQE) ativo no CFM.",
  },
  {
    titulo: "Inconsistência Cadastral",
    mensagem:
      "Foram encontradas inconsistências entre o nome completo informado e o titular registrado no CRM informado.",
  },
  {
    titulo: "Outro Motivo",
    mensagem: "",
  },
];

const CORES_AVATAR = [
  "var(--aa-orange)",
  "var(--aa-brown)",
  "var(--aa-green)",
  "var(--aa-orange)",
  "var(--aa-brown)",
  "var(--aa-green)",
  "var(--aa-orange)",
  "var(--aa-brown)",
];

function getAvatarColor(nome: string = "") {
  let hash = 0;
  for (let i = 0; i < nome.length; i++) {
    hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CORES_AVATAR[Math.abs(hash) % CORES_AVATAR.length];
}

function getIniciais(nome: string = "") {
  const partes = nome.trim().split(" ").filter(Boolean);
  if (partes.length === 0) return "DR";
  if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

function formatarTelefone(telefone?: string) {
  if (!telefone) return "Não informado";
  const nums = telefone.replace(/\D/g, "");
  if (nums.length === 11) {
    return `(${nums.substring(0, 2)}) ${nums.substring(2, 7)}-${nums.substring(7)}`;
  }
  if (nums.length === 10) {
    return `(${nums.substring(0, 2)}) ${nums.substring(2, 6)}-${nums.substring(6)}`;
  }
  return telefone;
}

export function AdminValidacaoMedicos() {
  const [medicos, setMedicos] = useState<MedicoValidacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Filtros e controles
  const [tabAtiva, setTabAtiva] = useState<
    "PENDENTES" | "APROVADOS" | "REPROVADOS" | "TODOS"
  >("PENDENTES");
  const [termoBusca, setTermoBusca] = useState("");
  const [filtroEspecialidade, setFiltroEspecialidade] = useState("");
  const [filtroUf, setFiltroUf] = useState("");
  const [modoExibicao, setModoExibicao] = useState<"cards" | "tabela">("cards");
  const [ordenacao, setOrdenacao] = useState<"nome" | "crm">("nome");

  // Modais
  const [medicoDetalhes, setMedicoDetalhes] = useState<MedicoValidacao | null>(
    null,
  );
  const [medicoParaAprovar, setMedicoParaAprovar] =
    useState<MedicoValidacao | null>(null);
  const [mensagemAprovacao, setMensagemAprovacao] = useState(
    "Documentos e CRM verificados com sucesso. Seja bem-vindo(a) ao corpo clínico do Active Age!",
  );

  const [medicoParaReprovar, setMedicoParaReprovar] =
    useState<MedicoValidacao | null>(null);
  const [templateSelecionado, setTemplateSelecionado] = useState<number>(0);
  const [motivoReprovacao, setMotivoReprovacao] = useState(
    TEMPLATES_REPROVACAO[0].mensagem,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setIsRefreshing(true);
    try {
      // 1. Busca todos os médicos cadastrados
      const resMedicos = await fetch(
        "https://active-age-backend.onrender.com/api/usuarios/medicos",
      );
      let listaTodos: MedicoValidacao[] = [];
      if (resMedicos.ok) {
        listaTodos = await resMedicos.json();
      }

      // 2. Busca solicitações pendentes
      const resPendentes = await fetch(
        "https://active-age-backend.onrender.com/api/validacoes/pendentes",
      );
      let listaPendentes: MedicoValidacao[] = [];
      if (resPendentes.ok) {
        listaPendentes = await resPendentes.json();
      }

      // Mapear e normalizar status
      const pendentesMap = new Map<string, MedicoValidacao>();
      listaPendentes.forEach((p) => pendentesMap.set(p.id, p));

      const listaCombinada = listaTodos.map((m) => {
        if (pendentesMap.has(m.id)) {
          return { ...m, statusValidacao: "EM_ANALISE" };
        }
        if (!m.statusValidacao) {
          return { ...m, statusValidacao: "PENDENTE" };
        }
        return m;
      });

      // Se houver algum pendente que não estava na lista geral
      listaPendentes.forEach((p) => {
        if (!listaCombinada.some((m) => m.id === p.id)) {
          listaCombinada.push({ ...p, statusValidacao: "EM_ANALISE" });
        }
      });

      setMedicos(listaCombinada);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Erro ao carregar validações:", error);
      Swal.fire({
        icon: "error",
        title: "Erro de Conexão",
        text: "Não foi possível carregar os dados atualizados dos médicos.",
        confirmButtonColor: "var(--aa-orange)",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Extrair lista de UFs e Especialidades únicas para filtros
  const { ufsDisponiveis, especialidadesDisponiveis } = useMemo(() => {
    const ufs = new Set<string>();
    const esp = new Set<string>();

    medicos.forEach((m) => {
      if (m.crm) {
        const partes = m.crm.split("/");
        if (partes.length === 2 && partes[1].trim()) {
          ufs.add(partes[1].trim().toUpperCase());
        }
      }
      if (m.especializacao) {
        m.especializacao
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .forEach((item) => esp.add(item));
      }
    });

    return {
      ufsDisponiveis: Array.from(ufs).sort(),
      especialidadesDisponiveis: Array.from(esp).sort(),
    };
  }, [medicos]);

  // Contadores de KPIs
  const stats = useMemo(() => {
    let pendentes = 0;
    let aprovados = 0;
    let reprovados = 0;

    medicos.forEach((m) => {
      const st = m.statusValidacao?.toUpperCase();
      if (st === "PENDENTE" || st === "EM_ANALISE") {
        pendentes++;
      } else if (st === "APROVADO") {
        aprovados++;
      } else if (st === "REPROVADO") {
        reprovados++;
      }
    });

    return {
      pendentes,
      aprovados,
      reprovados,
      total: medicos.length,
    };
  }, [medicos]);

  // Filtragem da lista
  const medicosFiltrados = useMemo(() => {
    return medicos
      .filter((m) => {
        const st = m.statusValidacao?.toUpperCase() || "PENDENTE";

        // Filtro por Tab de Status
        if (
          tabAtiva === "PENDENTES" &&
          st !== "PENDENTE" &&
          st !== "EM_ANALISE"
        ) {
          return false;
        }
        if (tabAtiva === "APROVADOS" && st !== "APROVADO") {
          return false;
        }
        if (tabAtiva === "REPROVADOS" && st !== "REPROVADO") {
          return false;
        }

        // Filtro por termo de busca
        if (termoBusca.trim()) {
          const termo = termoBusca.toLowerCase().trim();
          const matchNome = m.nome?.toLowerCase().includes(termo);
          const matchCrm = m.crm?.toLowerCase().includes(termo);
          const matchEmail = m.email?.toLowerCase().includes(termo);
          const matchEsp = m.especializacao?.toLowerCase().includes(termo);
          if (!matchNome && !matchCrm && !matchEmail && !matchEsp) {
            return false;
          }
        }

        // Filtro por Especialidade
        if (
          filtroEspecialidade &&
          !m.especializacao
            ?.toLowerCase()
            .includes(filtroEspecialidade.toLowerCase())
        ) {
          return false;
        }

        // Filtro por UF
        if (filtroUf) {
          const ufCrm = m.crm?.split("/")[1]?.trim().toUpperCase();
          if (ufCrm !== filtroUf) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (ordenacao === "nome") {
          return (a.nome || "").localeCompare(b.nome || "");
        }
        if (ordenacao === "crm") {
          return (a.crm || "").localeCompare(b.crm || "");
        }
        return 0;
      });
  }, [medicos, tabAtiva, termoBusca, filtroEspecialidade, filtroUf, ordenacao]);

  // Ações de validação
  const handleAprovar = async () => {
    if (!medicoParaAprovar) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(
        `https://active-age-backend.onrender.com/api/validacoes/avaliar/${medicoParaAprovar.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "APROVADO",
            mensagem: mensagemAprovacao.trim() || "CRM validado com sucesso.",
          }),
        },
      );

      if (res.ok) {
        // Atualizar lista local
        setMedicos((prev) =>
          prev.map((m) =>
            m.id === medicoParaAprovar.id
              ? {
                  ...m,
                  statusValidacao: "APROVADO",
                  mensagemValidacao: mensagemAprovacao,
                }
              : m,
          ),
        );

        if (medicoDetalhes?.id === medicoParaAprovar.id) {
          setMedicoDetalhes((prev) =>
            prev
              ? {
                  ...prev,
                  statusValidacao: "APROVADO",
                  mensagemValidacao: mensagemAprovacao,
                }
              : null,
          );
        }

        Swal.fire({
          icon: "success",
          title: "Médico Aprovado!",
          text: `O cadastro de ${medicoParaAprovar.nome} foi aprovado e o acesso aos atendimentos está liberado.`,
          confirmButtonColor: "var(--aa-green)",
        });

        setMedicoParaAprovar(null);
      } else {
        throw new Error("Erro na resposta do servidor");
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Erro ao Aprovar",
        text: "Não foi possível comunicar a aprovação ao servidor. Verifique a conexão.",
        confirmButtonColor: "var(--aa-orange)",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReprovar = async () => {
    if (!medicoParaReprovar) return;
    if (!motivoReprovacao.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Justificativa Obrigatória",
        text: "Informe o motivo da reprovação para orientar o médico.",
        confirmButtonColor: "var(--aa-orange)",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(
        `https://active-age-backend.onrender.com/api/validacoes/avaliar/${medicoParaReprovar.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "REPROVADO",
            mensagem: motivoReprovacao.trim(),
          }),
        },
      );

      if (res.ok) {
        setMedicos((prev) =>
          prev.map((m) =>
            m.id === medicoParaReprovar.id
              ? {
                  ...m,
                  statusValidacao: "REPROVADO",
                  mensagemValidacao: motivoReprovacao,
                }
              : m,
          ),
        );

        if (medicoDetalhes?.id === medicoParaReprovar.id) {
          setMedicoDetalhes((prev) =>
            prev
              ? {
                  ...prev,
                  statusValidacao: "REPROVADO",
                  mensagemValidacao: motivoReprovacao,
                }
              : null,
          );
        }

        Swal.fire({
          icon: "info",
          title: "Solicitação Reprovada",
          text: `O médico ${medicoParaReprovar.nome} foi notificado com o motivo indicado.`,
          confirmButtonColor: "var(--aa-brown)",
        });

        setMedicoParaReprovar(null);
      } else {
        throw new Error("Erro no servidor");
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Erro ao Reprovar",
        text: "Não foi possível registrar a reprovação no servidor.",
        confirmButtonColor: "var(--aa-orange)",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copiarCrm = (crm?: string) => {
    if (!crm) return;
    navigator.clipboard.writeText(crm);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: `CRM ${crm} copiado!`,
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const abrirConsultaCfm = (crm?: string) => {
    if (crm) {
      copiarCrm(crm);
    }
    window.open("https://portal.cfm.org.br/busca-medicos/", "_blank");
  };

  const selecionarTemplate = (index: number) => {
    setTemplateSelecionado(index);
    if (TEMPLATES_REPROVACAO[index].mensagem) {
      setMotivoReprovacao(TEMPLATES_REPROVACAO[index].mensagem);
    } else {
      setMotivoReprovacao("");
    }
  };

  const renderStatusBadge = (status?: string) => {
    const st = status?.toUpperCase();
    if (st === "APROVADO") {
      return (
        <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill fw-semibold">
          <i className="bi bi-check-circle-fill me-1"></i> Aprovado
        </span>
      );
    }
    if (st === "REPROVADO") {
      return (
        <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-2 rounded-pill fw-semibold">
          <i className="bi bi-x-circle-fill me-1"></i> Reprovado
        </span>
      );
    }
    return (
      <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-3 py-2 rounded-pill fw-semibold pulse-badge">
        <i className="bi bi-hourglass-split me-1"></i> Aguardando Validação
      </span>
    );
  };

  return (
    <div className="animation-fade-in">
      {/* BANNER PRINCIPAL DO ADMIN */}
      <div className="admin-hero-banner mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-dark text-white px-3 py-2 rounded-pill fw-bold">
                <i className="bi bi-shield-check me-1"></i> ADMINISTRAÇÃO
              </span>
              <span className="text-muted small">
                <i className="bi bi-clock-history me-1"></i>
                Última sincronização: {lastUpdated.toLocaleTimeString("pt-BR")}
              </span>
            </div>
            <h2 className="fw-bold mb-1" style={{ color: "var(--aa-brown)" }}>
              Central de Validação de CRM Médico
            </h2>
            <p className="text-muted mb-0">
              Analise, audite e aprove os cadastros de novos médicos da
              plataforma com checagem oficial no CFM.
            </p>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <Link
              to="/admin/assinaturas"
              className="btn btn-outline-success px-3 py-2 d-flex align-items-center gap-2 fw-semibold"
              title="Acessar Gestão e Extrato de Assinaturas dos Médicos"
            >
              <i className="bi bi-cash-stack"></i>
              Extrato de Assinaturas
            </Link>
            <button
              className="btn btn-outline-secondary px-3 py-2 d-flex align-items-center gap-2"
              onClick={carregarDados}
              disabled={isRefreshing}
              title="Recarregar lista de médicos"
            >
              <i
                className={`bi bi-arrow-clockwise ${isRefreshing ? "spin" : ""}`}
              ></i>
              {isRefreshing ? "Atualizando..." : "Sincronizar"}
            </button>
            <button
              className="btn btn-outline-secondary px-3 py-2 d-flex align-items-center gap-2"
              onClick={() => abrirConsultaCfm()}
              title="Acessar portal público de busca de médicos do CFM"
            >
              <i className="bi bi-box-arrow-up-right"></i>
              Portal do CFM
            </button>
          </div>
        </div>
      </div>

      {/* CARDS DE ESTATÍSTICAS / KPIS */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="admin-stat-card stat-pending p-3 cursor-pointer"
            onClick={() => setTabAtiva("PENDENTES")}
            role="button"
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted fw-semibold small text-uppercase">
                  Pendentes de Análise
                </span>
                <h3 className="fw-bold my-1 text-dark">{stats.pendentes}</h3>
                <small className="text-warning fw-semibold">
                  {stats.pendentes > 0 ? "Ação recomendada" : "Tudo em dia"}
                </small>
              </div>
              <div className="admin-stat-icon icon-pending">
                <i className="bi bi-hourglass-top"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="admin-stat-card stat-approved p-3 cursor-pointer"
            onClick={() => setTabAtiva("APROVADOS")}
            role="button"
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted fw-semibold small text-uppercase">
                  Médicos Aprovados
                </span>
                <h3 className="fw-bold my-1 text-success">{stats.aprovados}</h3>
                <small className="text-muted">Acesso total liberado</small>
              </div>
              <div className="admin-stat-icon icon-approved">
                <i className="bi bi-patch-check-fill"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="admin-stat-card stat-rejected p-3 cursor-pointer"
            onClick={() => setTabAtiva("REPROVADOS")}
            role="button"
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted fw-semibold small text-uppercase">
                  Solicitações Recusadas
                </span>
                <h3 className="fw-bold my-1 text-danger">{stats.reprovados}</h3>
                <small className="text-muted">Com feedback enviado</small>
              </div>
              <div className="admin-stat-icon icon-rejected">
                <i className="bi bi-x-octagon-fill"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="admin-stat-card stat-total p-3 cursor-pointer"
            onClick={() => setTabAtiva("TODOS")}
            role="button"
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
                  {stats.total}
                </h3>
                <small className="text-muted">Cadastros no sistema</small>
              </div>
              <div className="admin-stat-icon icon-total">
                <i className="bi bi-people-fill"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BARRA DE FILTROS E CONTROLES */}
      <div className="admin-filter-bar mb-4">
        {/* TABS DE STATUS */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 pb-3 border-bottom mb-3">
          <div className="d-flex flex-wrap gap-2">
            <button
              className={`admin-tab-btn ${tabAtiva === "PENDENTES" ? "active" : ""}`}
              onClick={() => setTabAtiva("PENDENTES")}
            >
              <i className="bi bi-hourglass-split"></i>
              Pendentes
              <span className="badge bg-warning text-dark rounded-pill ms-1">
                {stats.pendentes}
              </span>
            </button>

            <button
              className={`admin-tab-btn ${tabAtiva === "APROVADOS" ? "active" : ""}`}
              onClick={() => setTabAtiva("APROVADOS")}
            >
              <i className="bi bi-check-circle-fill"></i>
              Aprovados
              <span className="badge bg-secondary rounded-pill ms-1">
                {stats.aprovados}
              </span>
            </button>

            <button
              className={`admin-tab-btn ${tabAtiva === "REPROVADOS" ? "active" : ""}`}
              onClick={() => setTabAtiva("REPROVADOS")}
            >
              <i className="bi bi-x-circle-fill"></i>
              Reprovados
              <span className="badge bg-secondary rounded-pill ms-1">
                {stats.reprovados}
              </span>
            </button>

            <button
              className={`admin-tab-btn ${tabAtiva === "TODOS" ? "active" : ""}`}
              onClick={() => setTabAtiva("TODOS")}
            >
              <i className="bi bi-grid-fill"></i>
              Todos os Médicos
              <span className="badge bg-secondary rounded-pill ms-1">
                {stats.total}
              </span>
            </button>
          </div>

          {/* ALTERNADOR DE VISUALIZAÇÃO (CARDS vs TABELA) */}
          <div className="btn-group shadow-sm" role="group">
            <button
              type="button"
              className={`btn btn-sm ${
                modoExibicao === "cards" ? "btn-dark" : "btn-outline-secondary"
              }`}
              onClick={() => setModoExibicao("cards")}
              title="Visualização em Cards"
            >
              <i className="bi bi-grid me-1"></i> Cards
            </button>
            <button
              type="button"
              className={`btn btn-sm ${
                modoExibicao === "tabela" ? "btn-dark" : "btn-outline-secondary"
              }`}
              onClick={() => setModoExibicao("tabela")}
              title="Visualização em Tabela"
            >
              <i className="bi bi-table me-1"></i> Tabela
            </button>
          </div>
        </div>

        {/* INPUTS DE FILTRO AVANÇADO */}
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Buscar por nome, CRM, e-mail ou especialidade..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
              />
              {termoBusca && (
                <button
                  className="btn btn-outline-secondary border-start-0"
                  type="button"
                  onClick={() => setTermoBusca("")}
                  title="Limpar busca"
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
          </div>

          <div className="col-6 col-md-3">
            <select
              className="form-select"
              value={filtroEspecialidade}
              onChange={(e) => setFiltroEspecialidade(e.target.value)}
            >
              <option value="">Todas Especialidades</option>
              {especialidadesDisponiveis.map((esp) => (
                <option key={esp} value={esp}>
                  {esp}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6 col-md-2">
            <select
              className="form-select"
              value={filtroUf}
              onChange={(e) => setFiltroUf(e.target.value)}
            >
              <option value="">Todos Estados (UF)</option>
              {ufsDisponiveis.map((uf) => (
                <option key={uf} value={uf}>
                  CRM / {uf}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-2">
            <select
              className="form-select"
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value as "nome" | "crm")}
            >
              <option value="nome">Ordenar: Nome (A-Z)</option>
              <option value="crm">Ordenar: CRM</option>
            </select>
          </div>
        </div>
      </div>

      {/* LISTA PRINCIPAL (CARDS OU TABELA) */}
      {isLoading ? (
        <div className="text-center py-5">
          <div
            className="spinner-border text-warning"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="text-muted mt-3">
            Carregando cadastros médicos para análise...
          </p>
        </div>
      ) : medicosFiltrados.length === 0 ? (
        <div className="card shadow-sm border-0 text-center py-5 px-3 rounded-4">
          <div className="card-body">
            <div
              className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
              style={{
                width: "80px",
                height: "80px",
                backgroundColor: "rgba(144, 194, 141, 0.15)",
                color: "var(--aa-green)",
                fontSize: "2.5rem",
              }}
            >
              <i className="bi bi-shield-check"></i>
            </div>
            <h4 className="fw-bold" style={{ color: "var(--aa-brown)" }}>
              {tabAtiva === "PENDENTES"
                ? "Nenhuma validação pendente no momento!"
                : "Nenhum médico encontrado com os filtros aplicados."}
            </h4>
            <p className="text-muted max-w-500 mx-auto">
              {tabAtiva === "PENDENTES"
                ? "Todas as solicitações de CRM enviadas foram analisadas. Você será notificado quando novos médicos se cadastrarem."
                : "Tente ajustar os termos de busca ou selecionar outra aba de status."}
            </p>
            {(termoBusca || filtroEspecialidade || filtroUf) && (
              <button
                className="btn btn-outline-secondary btn-sm mt-2"
                onClick={() => {
                  setTermoBusca("");
                  setFiltroEspecialidade("");
                  setFiltroUf("");
                }}
              >
                <i className="bi bi-x-circle me-1"></i> Limpar Filtros
              </button>
            )}
          </div>
        </div>
      ) : modoExibicao === "cards" ? (
        /* MODO CARDS */
        <div className="row g-4">
          {medicosFiltrados.map((medico) => {
            const statusUpper =
              medico.statusValidacao?.toUpperCase() || "PENDENTE";
            const isPendente =
              statusUpper === "PENDENTE" || statusUpper === "EM_ANALISE";
            const isAprovado = statusUpper === "APROVADO";
            const isReprovado = statusUpper === "REPROVADO";

            return (
              <div key={medico.id} className="col-12 col-md-6 col-xl-4">
                <div
                  className="card card-doctor-item h-100 p-3"
                  style={{
                    borderLeft: isPendente
                      ? "5px solid #f59e0b"
                      : isAprovado
                        ? "5px solid var(--aa-green)"
                        : "5px solid #ef4444",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="doctor-avatar-circle"
                        style={{ backgroundColor: getAvatarColor(medico.nome) }}
                      >
                        {getIniciais(medico.nome)}
                      </div>
                      <div>
                        <h5
                          className="fw-bold mb-1 text-truncate"
                          style={{ maxWidth: "200px" }}
                        >
                          {medico.nome}
                        </h5>
                        <div className="d-flex align-items-center gap-2">
                          {renderStatusBadge(medico.statusValidacao)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* INFORMAÇÕES CHAVE */}
                  <div className="bg-light p-3 rounded-3 mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted small fw-bold">
                        CRM INFORMADO:
                      </span>
                      <div className="d-flex align-items-center gap-1">
                        <span className="crm-badge-pill">
                          <i className="bi bi-card-heading text-secondary"></i>
                          {medico.crm || "Não informado"}
                        </span>
                        {medico.crm && (
                          <button
                            className="btn btn-sm btn-link text-decoration-none p-1 text-muted"
                            onClick={() => copiarCrm(medico.crm)}
                            title="Copiar CRM"
                          >
                            <i className="bi bi-clipboard"></i>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted small fw-bold">E-MAIL:</span>
                      <span
                        className="small text-truncate text-end ms-2"
                        style={{ maxWidth: "180px" }}
                      >
                        {medico.email || "Não informado"}
                      </span>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="text-muted small fw-bold">
                        TELEFONE:
                      </span>
                      <span className="small">
                        {formatarTelefone(medico.telefone)}
                      </span>
                    </div>
                  </div>

                  {/* ESPECIALIDADES */}
                  <div className="mb-3">
                    <span className="text-muted small fw-bold d-block mb-1">
                      ESPECIALIDADES DECLARADAS:
                    </span>
                    <div className="d-flex flex-wrap gap-1">
                      {medico.especializacao ? (
                        medico.especializacao.split(",").map((esp, i) => (
                          <span
                            key={i}
                            className="badge bg-secondary-subtle text-secondary border px-2 py-1 rounded"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {esp.trim()}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted small fst-italic">
                          Clínica Geral / Não informada
                        </span>
                      )}
                    </div>
                  </div>

                  {/* FEEDBACK ANTERIOR SE REPROVADO */}
                  {isReprovado && medico.mensagemValidacao && (
                    <div className="alert alert-danger p-2 mb-3 small">
                      <strong>Motivo da Reprovação:</strong> "
                      {medico.mensagemValidacao}"
                    </div>
                  )}

                  {/* AÇÕES NO CARD */}
                  <div className="mt-auto pt-2 border-top">
                    {isPendente ? (
                      <div className="d-flex flex-column gap-2">
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-success flex-grow-1 fw-bold shadow-sm"
                            onClick={() => {
                              setMedicoParaAprovar(medico);
                              setMensagemAprovacao(
                                "Documentos e CRM verificados com sucesso. Seja bem-vindo(a) ao corpo clínico do Active Age!",
                              );
                            }}
                          >
                            <i className="bi bi-check-lg me-1"></i> Aprovar
                          </button>
                          <button
                            className="btn btn-outline-danger flex-grow-1 fw-bold"
                            onClick={() => {
                              setMedicoParaReprovar(medico);
                              selecionarTemplate(0);
                            }}
                          >
                            <i className="bi bi-x-lg me-1"></i> Reprovar
                          </button>
                        </div>

                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-outline-secondary btn-sm flex-grow-1"
                            onClick={() => setMedicoDetalhes(medico)}
                          >
                            <i className="bi bi-eye me-1"></i> Dossiê Completo
                          </button>
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => abrirConsultaCfm(medico.crm)}
                            title="Checar no CFM oficial"
                          >
                            <i className="bi bi-search me-1"></i> Checar CFM
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="d-flex justify-content-between align-items-center">
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => setMedicoDetalhes(medico)}
                        >
                          <i className="bi bi-eye me-1"></i> Ver Detalhes
                        </button>

                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-light btn-sm"
                            style={{ color: "var(--aa-orange)" }}
                            onClick={() => abrirConsultaCfm(medico.crm)}
                            title="Consultar no CFM"
                          >
                            <i className="bi bi-box-arrow-up-right me-1"></i>{" "}
                            CFM
                          </button>
                          {isReprovado && (
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => {
                                setMedicoParaAprovar(medico);
                                setMensagemAprovacao(
                                  "Reavaliação aprovada com sucesso.",
                                );
                              }}
                              title="Reverter e Aprovar"
                            >
                              <i className="bi bi-arrow-repeat me-1"></i>{" "}
                              Reavaliar
                            </button>
                          )}
                          {isAprovado && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => {
                                setMedicoParaReprovar(medico);
                                selecionarTemplate(0);
                              }}
                              title="Revogar Acesso"
                            >
                              <i className="bi bi-shield-x me-1"></i> Suspender
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* MODO TABELA */
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col" className="py-3 ps-4">
                    Médico
                  </th>
                  <th scope="col" className="py-3">
                    CRM / UF
                  </th>
                  <th scope="col" className="py-3">
                    Especialidades
                  </th>
                  <th scope="col" className="py-3">
                    Contato
                  </th>
                  <th scope="col" className="py-3">
                    Status
                  </th>
                  <th scope="col" className="py-3 text-end pe-4">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {medicosFiltrados.map((medico) => {
                  const statusUpper =
                    medico.statusValidacao?.toUpperCase() || "PENDENTE";
                  const isPendente =
                    statusUpper === "PENDENTE" || statusUpper === "EM_ANALISE";

                  return (
                    <tr key={medico.id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="doctor-avatar-circle"
                            style={{
                              width: "42px",
                              height: "42px",
                              fontSize: "1rem",
                              backgroundColor: getAvatarColor(medico.nome),
                            }}
                          >
                            {getIniciais(medico.nome)}
                          </div>
                          <div>
                            <span className="fw-bold d-block text-dark">
                              {medico.nome}
                            </span>
                            <small className="text-muted">{medico.email}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="crm-badge-pill">
                          {medico.crm || "N/I"}
                        </span>
                        {medico.crm && (
                          <button
                            className="btn btn-sm btn-link text-decoration-none text-muted p-1 ms-1"
                            onClick={() => copiarCrm(medico.crm)}
                            title="Copiar CRM"
                          >
                            <i className="bi bi-clipboard"></i>
                          </button>
                        )}
                      </td>

                      <td>
                        <div
                          className="d-flex flex-wrap gap-1"
                          style={{ maxWidth: "250px" }}
                        >
                          {medico.especializacao ? (
                            medico.especializacao
                              .split(",")
                              .slice(0, 2)
                              .map((esp, i) => (
                                <span
                                  key={i}
                                  className="badge bg-light text-dark border"
                                  style={{ fontSize: "0.75rem" }}
                                >
                                  {esp.trim()}
                                </span>
                              ))
                          ) : (
                            <span className="text-muted small">
                              Clínica Geral
                            </span>
                          )}
                          {medico.especializacao &&
                            medico.especializacao.split(",").length > 2 && (
                              <span
                                className="badge bg-secondary-subtle text-muted"
                                style={{ fontSize: "0.75rem" }}
                              >
                                +{medico.especializacao.split(",").length - 2}
                              </span>
                            )}
                        </div>
                      </td>

                      <td>
                        <div className="small">
                          <div>
                            <i className="bi bi-telephone text-muted me-1"></i>
                            {formatarTelefone(medico.telefone)}
                          </div>
                        </div>
                      </td>

                      <td>{renderStatusBadge(medico.statusValidacao)}</td>

                      <td className="text-end pe-4">
                        <div className="d-flex justify-content-end gap-1">
                          {isPendente ? (
                            <>
                              <button
                                className="btn btn-sm btn-success fw-bold"
                                onClick={() => {
                                  setMedicoParaAprovar(medico);
                                  setMensagemAprovacao(
                                    "Documentos e CRM verificados com sucesso. Seja bem-vindo(a) ao corpo clínico do Active Age!",
                                  );
                                }}
                                title="Aprovar Médico"
                              >
                                <i className="bi bi-check-lg"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => {
                                  setMedicoParaReprovar(medico);
                                  selecionarTemplate(0);
                                }}
                                title="Reprovar Solicitação"
                              >
                                <i className="bi bi-x-lg"></i>
                              </button>
                            </>
                          ) : null}

                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setMedicoDetalhes(medico)}
                            title="Ver Dossiê"
                          >
                            <i className="bi bi-eye"></i>
                          </button>

                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => abrirConsultaCfm(medico.crm)}
                            title="Consultar no CFM"
                          >
                            <i className="bi bi-box-arrow-up-right"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL DE DOSSIÊ / DETALHES COMPLETOS DO MÉDICO
          ======================================================== */}
      {medicoDetalhes && (
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
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="doctor-avatar-circle"
                    style={{
                      width: "56px",
                      height: "56px",
                      backgroundColor: getAvatarColor(medicoDetalhes.nome),
                    }}
                  >
                    {getIniciais(medicoDetalhes.nome)}
                  </div>
                  <div>
                    <h4 className="modal-title fw-bold mb-1">
                      {medicoDetalhes.nome}
                    </h4>
                    <span className="text-white-50 small">
                      ID de Cadastro: {medicoDetalhes.id}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setMedicoDetalhes(null)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="row g-4">
                  {/* COLUNA ESQUERDA: DADOS DE CRM E CONTATO */}
                  <div className="col-md-6">
                    <div className="bg-light p-3 rounded-4 mb-3">
                      <h6
                        className="fw-bold mb-3"
                        style={{ color: "var(--aa-brown)" }}
                      >
                        <i className="bi bi-shield-check me-2"></i>Credenciais
                        Médicas
                      </h6>

                      <div className="mb-3">
                        <label className="text-muted small fw-bold d-block mb-1">
                          CRM CADASTRADO
                        </label>
                        <div className="d-flex align-items-center gap-2">
                          <span className="crm-badge-pill fs-6 px-3 py-2">
                            {medicoDetalhes.crm || "Não informado"}
                          </span>
                          {medicoDetalhes.crm && (
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => copiarCrm(medicoDetalhes.crm)}
                              title="Copiar CRM"
                            >
                              <i className="bi bi-clipboard me-1"></i> Copiar
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="text-muted small fw-bold d-block mb-1">
                          STATUS DE VALIDAÇÃO
                        </label>
                        <div>
                          {renderStatusBadge(medicoDetalhes.statusValidacao)}
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded-3 border">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span
                            className="fw-bold small"
                            style={{ color: "var(--aa-orange)" }}
                          >
                            <i className="bi bi-link-45deg me-1"></i>Portal do
                            CFM
                          </span>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: "rgba(232, 101, 66, 0.12)",
                              color: "var(--aa-orange)",
                            }}
                          >
                            Oficial
                          </span>
                        </div>
                        <p className="small text-muted mb-2">
                          Consulte a situação cadastral, especialidades
                          registradas (RQE) e penalidades éticas diretamente no
                          banco de dados do Conselho Federal de Medicina.
                        </p>
                        <button
                          className="btn btn-primary btn-sm w-100"
                          onClick={() => abrirConsultaCfm(medicoDetalhes.crm)}
                        >
                          <i className="bi bi-box-arrow-up-right me-1"></i>{" "}
                          Abrir Busca no CFM
                        </button>
                      </div>
                    </div>

                    <div className="bg-light p-3 rounded-4">
                      <h6
                        className="fw-bold mb-3"
                        style={{ color: "var(--aa-brown)" }}
                      >
                        <i className="bi bi-person-lines-fill me-2"></i>Contatos
                        & Comunicação
                      </h6>

                      <div className="mb-2">
                        <span className="text-muted small d-block">
                          E-mail:
                        </span>
                        <strong>
                          {medicoDetalhes.email || "Não informado"}
                        </strong>
                      </div>

                      <div className="mb-2">
                        <span className="text-muted small d-block">
                          Telefone:
                        </span>
                        <strong>
                          {formatarTelefone(medicoDetalhes.telefone)}
                        </strong>
                        {medicoDetalhes.telefone && (
                          <a
                            href={`https://wa.me/55${medicoDetalhes.telefone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-success ms-2 py-0 px-2"
                            title="Conversar via WhatsApp"
                          >
                            <i className="bi bi-whatsapp"></i>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* COLUNA DIREITA: ESPECIALIDADES, BIO E FEEDBACK */}
                  <div className="col-md-6">
                    <div className="mb-4">
                      <h6
                        className="fw-bold mb-2"
                        style={{ color: "var(--aa-brown)" }}
                      >
                        <i className="bi bi-award me-2"></i>Especialidades
                        Declaradas
                      </h6>
                      <div className="d-flex flex-wrap gap-2">
                        {medicoDetalhes.especializacao ? (
                          medicoDetalhes.especializacao
                            .split(",")
                            .map((esp, i) => (
                              <span
                                key={i}
                                className="badge bg-secondary-subtle text-secondary-emphasis border px-3 py-2 rounded-pill fs-6"
                              >
                                {esp.trim()}
                              </span>
                            ))
                        ) : (
                          <p className="text-muted fst-italic small">
                            Nenhuma especialidade específica declarada.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h6
                        className="fw-bold mb-2"
                        style={{ color: "var(--aa-brown)" }}
                      >
                        <i className="bi bi-file-text me-2"></i>Biografia /
                        Apresentação
                      </h6>
                      <div
                        className="p-3 bg-light rounded-3 text-muted"
                        style={{ minHeight: "100px" }}
                      >
                        {medicoDetalhes.biografia || (
                          <span className="fst-italic">
                            O profissional ainda não preencheu a sua
                            apresentação profissional no perfil.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* MENSAGEM ANTERIOR / FEEDBACK */}
                    {medicoDetalhes.mensagemValidacao && (
                      <div
                        className={`alert ${
                          medicoDetalhes.statusValidacao?.toUpperCase() ===
                          "REPROVADO"
                            ? "alert-danger"
                            : "alert-info"
                        } mb-0`}
                      >
                        <h6 className="alert-heading fw-bold small mb-1">
                          <i className="bi bi-chat-left-dots me-1"></i>
                          Feedback Registrado:
                        </h6>
                        <p className="mb-0 small">
                          "{medicoDetalhes.mensagemValidacao}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light p-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  onClick={() => setMedicoDetalhes(null)}
                >
                  Fechar
                </button>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-danger px-3 fw-bold"
                    onClick={() => {
                      const medico = medicoDetalhes;
                      setMedicoDetalhes(null);
                      setMedicoParaReprovar(medico);
                      selecionarTemplate(0);
                    }}
                  >
                    <i className="bi bi-x-lg me-1"></i> Reprovar Solicitação
                  </button>

                  <button
                    type="button"
                    className="btn btn-success px-4 fw-bold shadow-sm"
                    onClick={() => {
                      const medico = medicoDetalhes;
                      setMedicoDetalhes(null);
                      setMedicoParaAprovar(medico);
                      setMensagemAprovacao(
                        "Documentos e CRM verificados com sucesso. Seja bem-vindo(a) ao corpo clínico do Active Age!",
                      );
                    }}
                  >
                    <i className="bi bi-check-lg me-1"></i> Aprovar CRM
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL DE CONFIRMAÇÃO DE APROVAÇÃO
          ======================================================== */}
      {medicoParaAprovar && (
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
              <div className="modal-header bg-success text-white p-3">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-patch-check-fill me-2"></i> Aprovar
                  Cadastro de Médico
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setMedicoParaAprovar(null)}
                  disabled={isSubmitting}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="text-center mb-3">
                  <div
                    className="doctor-avatar-circle mx-auto mb-2"
                    style={{
                      width: "64px",
                      height: "64px",
                      backgroundColor: getAvatarColor(medicoParaAprovar.nome),
                    }}
                  >
                    {getIniciais(medicoParaAprovar.nome)}
                  </div>
                  <h5 className="fw-bold mb-1">{medicoParaAprovar.nome}</h5>
                  <span className="crm-badge-pill">
                    <i className="bi bi-card-heading me-1"></i>
                    CRM: {medicoParaAprovar.crm || "N/A"}
                  </span>
                </div>

                <div className="alert alert-success border-0 small mb-3">
                  <i className="bi bi-info-circle-fill me-2"></i>
                  Ao aprovar, o médico receberá permissão para abrir agenda de
                  consultas, realizar atendimentos por teleconsulta e emitir
                  prescrições no Active Age.
                </div>

                <div className="mb-2">
                  <label className="form-label fw-semibold small text-muted">
                    Mensagem de Boas-vindas / Validação (Opcional):
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={mensagemAprovacao}
                    onChange={(e) => setMensagemAprovacao(e.target.value)}
                    placeholder="Escreva uma mensagem de boas-vindas..."
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer bg-light p-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setMedicoParaAprovar(null)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-success fw-bold px-4 shadow-sm"
                  onClick={handleAprovar}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      Processando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check2-circle me-1"></i> Confirmar
                      Aprovação
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL DE REPROVAÇÃO COM TEMPLATES
          ======================================================== */}
      {medicoParaReprovar && (
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
              <div className="modal-header bg-danger text-white p-3">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-x-octagon-fill me-2"></i> Reprovar /
                  Solicitar Correção de CRM
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setMedicoParaReprovar(null)}
                  disabled={isSubmitting}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3 mb-3">
                  <div
                    className="doctor-avatar-circle"
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: getAvatarColor(medicoParaReprovar.nome),
                    }}
                  >
                    {getIniciais(medicoParaReprovar.nome)}
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0">{medicoParaReprovar.nome}</h6>
                    <small className="text-muted">
                      CRM: {medicoParaReprovar.crm || "Não informado"} |{" "}
                      {medicoParaReprovar.email}
                    </small>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-5 border-end pe-md-3">
                    <label className="form-label fw-bold small text-muted text-uppercase">
                      Modelos de Motivo Rápido:
                    </label>
                    <div className="d-flex flex-column gap-1">
                      {TEMPLATES_REPROVACAO.map((tpl, idx) => (
                        <div
                          key={idx}
                          className={`reason-template-pill ${
                            templateSelecionado === idx ? "active" : ""
                          }`}
                          onClick={() => selecionarTemplate(idx)}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <span>{tpl.titulo}</span>
                            {templateSelecionado === idx && (
                              <i className="bi bi-check-circle-fill text-danger small"></i>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="col-md-7 ps-md-3">
                    <label className="form-label fw-bold small text-muted text-uppercase">
                      Justificativa enviada ao Médico: *
                    </label>
                    <textarea
                      className="form-control mb-2"
                      rows={5}
                      value={motivoReprovacao}
                      onChange={(e) => setMotivoReprovacao(e.target.value)}
                      placeholder="Descreva detalhadamente o motivo da recusa ou quais dados devem ser corrigidos..."
                    ></textarea>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        Esta mensagem aparecerá no painel do médico para que ele
                        edite seu perfil.
                      </small>
                      <small className="text-muted fw-bold">
                        {motivoReprovacao.length} carac.
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light p-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setMedicoParaReprovar(null)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-danger fw-bold px-4 shadow-sm"
                  onClick={handleReprovar}
                  disabled={isSubmitting || !motivoReprovacao.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send-x me-1"></i> Enviar Reprovação
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ESTILOS ESPECÍFICOS DESTE COMPONENTE */}
      <style>{`
        .spin {
          animation: spinAnimation 1s linear infinite;
        }
        @keyframes spinAnimation {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
