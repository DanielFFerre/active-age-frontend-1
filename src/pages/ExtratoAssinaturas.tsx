import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { ModalPagamentoMercadoPago } from "../components/pagamento/ModalPagamentoMercadoPago";

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

export function ExtratoAssinaturas() {
  const navigate = useNavigate();
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);
  const [listaAssinaturas, setListaAssinaturas] = useState<AssinaturaMedico[]>([]);

  // Modal de Detalhes da Fatura / Comprovante
  const [faturaVisualizada, setFaturaVisualizada] = useState<{
    fatura: Fatura;
    medicoNome: string;
    medicoCrm: string;
    planoNome: string;
  } | null>(null);

  // Modal de Pagamento Mercado Pago
  const [faturaParaPagar, setFaturaParaPagar] = useState<Fatura | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("activeAgeUser");
    if (!userStr) {
      navigate("/login");
      return;
    }
    const user = JSON.parse(userStr);
    setUsuarioLogado(user);

    // Carregar assinaturas reais salvas no localStorage
    const assinaturasSalvas = localStorage.getItem("activeAgeAssinaturas");
    if (assinaturasSalvas) {
      try {
        const parsed = JSON.parse(assinaturasSalvas);
        // Remove quaisquer dados de teste mockados (sub-1001, sub-meu-perfil, faturas fakes)
        const reais = Array.isArray(parsed)
          ? parsed.filter(
              (ass: AssinaturaMedico) =>
                !ass.id.startsWith("sub-100") && ass.id !== "sub-meu-perfil"
            )
          : [];
        setListaAssinaturas(reais);
        localStorage.setItem("activeAgeAssinaturas", JSON.stringify(reais));
      } catch (e) {
        console.error(e);
      }
    }
  }, [navigate]);

  // Identificar a assinatura real do médico atualmente logado
  const minhaAssinatura = useMemo(() => {
    if (!usuarioLogado) return null;
    const encontrada = listaAssinaturas.find(
      (a) =>
        a.medicoId === usuarioLogado.id ||
        a.medicoEmail === usuarioLogado.email
    );
    return encontrada || null;
  }, [usuarioLogado, listaAssinaturas]);

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
              CONSULTÓRIO VIRTUAL
            </span>
          </div>
          <h1 className="fw-bold mb-1 text-dark">
            Extrato e Histórico da Minha Assinatura
          </h1>
          <p className="text-muted mb-0">
            Visualize os dados do seu plano atual, próximas cobranças e histórico de faturas do seu consultório.
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

      {/* CASO O MÉDICO NÃO TENHA PLANO CONTRATADO */}
      {!minhaAssinatura ? (
        <div className="card shadow-sm border-0 rounded-4 p-5 text-center bg-white my-4">
          <div
            className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
            style={{
              width: "80px",
              height: "80px",
              backgroundColor: "rgba(232, 101, 66, 0.12)",
              color: "var(--aa-orange)",
            }}
          >
            <i className="bi bi-rocket-takeoff fs-1"></i>
          </div>
          <h3 className="fw-bold mb-2 text-dark">
            Você ainda não possui uma assinatura ativa
          </h3>
          <p className="text-muted mx-auto mb-4" style={{ maxWidth: "600px" }}>
            Escolha um dos planos para o seu Consultório Virtual Active Age para começar a atender pacientes online, emitir receitas e gerenciar sua agenda.
          </p>
          <div>
            <Link
              to="/planos-medico"
              className="btn btn-primary btn-lg px-4 shadow-sm fw-bold"
            >
              <i className="bi bi-check-circle me-2"></i> Conhecer os Planos Disponíveis
            </Link>
          </div>
        </div>
      ) : (
        <div>
          {/* CARD DO PLANO ATUAL DO MÉDICO */}
          <div className="card shadow-sm border-0 rounded-4 mb-4 overflow-hidden">
            <div
              className="card-header p-4 text-dark d-flex justify-content-between align-items-center flex-wrap gap-3"
              style={{ backgroundColor: "var(--aa-green)" }}
            >
              <div>
                <span className="badge bg-warning text-dark px-3 py-1 rounded-pill fw-bold mb-2">
                  PLANO ATIVO
                </span>
                <h3 className="fw-bold mb-0 text-dark">
                  {minhaAssinatura.planoNome}
                </h3>
              </div>

              <div className="d-flex align-items-center gap-3">
                <div className="text-end">
                  <span className="text-dark small d-block fw-semibold" style={{ opacity: 0.85 }}>
                    VALOR DA ASSINATURA
                  </span>
                  <span
                    className="fs-3 fw-bold"
                    style={{ color: "var(--aa-orange)" }}
                  >
                    R$ {minhaAssinatura.valor.toFixed(2)}
                  </span>
                  <span className="text-dark fw-semibold" style={{ opacity: 0.85 }}>
                    /{minhaAssinatura.ciclo === "MENSAL" ? "mês" : "ano"}
                  </span>
                </div>
              </div>
            </div>

            <div className="card-body p-4 bg-white">
              <div className="row g-4 align-items-center">
                <div className="col-12 col-md-6 border-end-md">
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

                <div className="col-12 col-md-6">
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
              </div>
            </div>
          </div>

          {/* TABELA DE HISTÓRICO DE FATURAS DO MÉDICO */}
          <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
            <div className="card-header bg-light p-3 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0 text-dark">
                <i className="bi bi-receipt me-2 text-success"></i>Histórico de Faturas e
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
                  {minhaAssinatura.faturas.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-5 text-muted">
                        <i className="bi bi-inbox fs-2 d-block mb-2 text-secondary"></i>
                        Nenhuma fatura encontrada até o momento.
                      </td>
                    </tr>
                  ) : (
                    minhaAssinatura.faturas.map((fatura) => (
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: COMPROVANTE / RECIBO DE FATURA */}
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
                style={{ backgroundColor: "var(--aa-green)" }}
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
                    className="fw-bold mb-0 text-dark"
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
                      : f
                  ),
                };
              }
              return a;
            });
            setListaAssinaturas(atualizadas);
            localStorage.setItem(
              "activeAgeAssinaturas",
              JSON.stringify(atualizadas)
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
