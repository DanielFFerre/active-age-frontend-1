import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export interface PlanoPagamento {
  id: string;
  nome: string;
  valor: number;
  ciclo?: "MENSAL" | "ANUAL" | "AVULSO" | "CONSULTA";
  tipo?: "PLANO" | "CONSULTA";
  dataHoraFormatada?: string;
  duracaoMinutos?: number;
}

interface ModalPagamentoMercadoPagoProps {
  plano: PlanoPagamento;
  medico?: {
    id?: string;
    nome?: string;
    email?: string;
    crm?: string;
  };
  paciente?: {
    id?: string;
    nome?: string;
    email?: string;
  };
  tipoItem?: "PLANO" | "CONSULTA";
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (detalhesTransacao: any) => void;
}

export function ModalPagamentoMercadoPago({
  plano,
  medico,
  paciente,
  tipoItem = "PLANO",
  isOpen,
  onClose,
  onSuccess,
}: ModalPagamentoMercadoPagoProps) {
  const isConsulta = tipoItem === "CONSULTA" || plano.tipo === "CONSULTA" || plano.ciclo === "CONSULTA";

  const [metodoSelecionado, setMetodoSelecionado] = useState<"PIX" | "CREDITO" | "DEBITO">("PIX");
  const [isProcessando, setIsProcessando] = useState(false);
  const [etapa, setEtapa] = useState<"FORMULARIO" | "PIX_GERADO" | "SUCESSO">("FORMULARIO");

  // Dados do Cartão de Crédito
  const [numeroCartao, setNumeroCartao] = useState("");
  const [nomeTitular, setNomeTitular] = useState(paciente?.nome || medico?.nome || "");
  const [validade, setValidade] = useState("");
  const [cvv, setCvv] = useState("");
  const [cpfTitular, setCpfTitular] = useState("");
  const [parcelas, setParcelas] = useState("1");
  const [bandeiraCartao, setBandeiraCartao] = useState<"visa" | "mastercard" | "elo" | "outro">("mastercard");

  // Dados do Cartão de Débito
  const [numeroDebito, setNumeroDebito] = useState("");
  const [nomeDebito, setNomeDebito] = useState(paciente?.nome || medico?.nome || "");
  const [validadeDebito, setValidadeDebito] = useState("");
  const [cvvDebito, setCvvDebito] = useState("");
  const [cpfDebito, setCpfDebito] = useState("");

  // Dados do PIX
  const [codigoPixCopiaCola, setCodigoPixCopiaCola] = useState("");
  const [tempoRestantePix, setTempoRestantePix] = useState(900); // 15 minutos em segundos
  const [transacaoId, setTransacaoId] = useState("");

  useEffect(() => {
    if (isOpen) {
      setEtapa("FORMULARIO");
      setIsProcessando(false);
      setTransacaoId(`MP-${Math.floor(10000000 + Math.random() * 90000000)}`);
      setTempoRestantePix(900);
      setNomeTitular(paciente?.nome || medico?.nome || "");
      setNomeDebito(paciente?.nome || medico?.nome || "");
    }
  }, [isOpen, plano, paciente, medico]);

  // Contagem regressiva do PIX
  useEffect(() => {
    let interval: any = null;
    if (etapa === "PIX_GERADO" && tempoRestantePix > 0) {
      interval = setInterval(() => {
        setTempoRestantePix((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [etapa, tempoRestantePix]);

  if (!isOpen) return null;

  // Formatador de minutos e segundos
  const formatarTempo = (segundos: number) => {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${min.toString().padStart(2, "0")}:${seg.toString().padStart(2, "0")}`;
  };

  // Detectar bandeira pelo número
  const handleNumeroCartaoChange = (val: string) => {
    const limpo = val.replace(/\D/g, "").substring(0, 16);
    const formatado = limpo.replace(/(\d{4})(?=\d)/g, "$1 ");
    setNumeroCartao(formatado);

    if (limpo.startsWith("4")) {
      setBandeiraCartao("visa");
    } else if (limpo.startsWith("5") || limpo.startsWith("2")) {
      setBandeiraCartao("mastercard");
    } else if (limpo.startsWith("6")) {
      setBandeiraCartao("elo");
    } else {
      setBandeiraCartao("outro");
    }
  };

  const handleValidadeChange = (val: string) => {
    const limpo = val.replace(/\D/g, "").substring(0, 4);
    if (limpo.length >= 3) {
      setValidade(`${limpo.substring(0, 2)}/${limpo.substring(2)}`);
    } else {
      setValidade(limpo);
    }
  };

  const handleCpfChange = (val: string, setFn: (v: string) => void) => {
    const limpo = val.replace(/\D/g, "").substring(0, 11);
    let formatado = limpo;
    if (limpo.length > 9) {
      formatado = `${limpo.substring(0, 3)}.${limpo.substring(3, 6)}.${limpo.substring(6, 9)}-${limpo.substring(9)}`;
    } else if (limpo.length > 6) {
      formatado = `${limpo.substring(0, 3)}.${limpo.substring(3, 6)}.${limpo.substring(6)}`;
    } else if (limpo.length > 3) {
      formatado = `${limpo.substring(0, 3)}.${limpo.substring(3)}`;
    }
    setFn(formatado);
  };

  // Gerar PIX dinâmico
  const handleGerarPix = async () => {
    setIsProcessando(true);
    try {
      // Código PIX padrão BR Code Mercado Pago
      const pixPayload = `00020101021226840014br.gov.bcb.pix2562mercadopago.com.br/pix/${transacaoId}520400005303986540${plano.valor.toFixed(
        2
      )}5802BR5910ACTIVE AGE6009SAO PAULO62070503***6304`;
      setCodigoPixCopiaCola(pixPayload);
      setEtapa("PIX_GERADO");
    } finally {
      setIsProcessando(false);
    }
  };

  // Processar pagamento com Cartão
  const handleProcessarCartao = async (tipo: "CREDITO" | "DEBITO") => {
    if (tipo === "CREDITO") {
      if (numeroCartao.replace(/\D/g, "").length < 16) {
        Swal.fire("Atenção", "Informe um número de cartão de crédito válido com 16 dígitos.", "warning");
        return;
      }
      if (!nomeTitular.trim() || !validade || !cvv || !cpfTitular) {
        Swal.fire("Atenção", "Preencha todos os campos do cartão de crédito.", "warning");
        return;
      }
    } else {
      if (numeroDebito.replace(/\D/g, "").length < 16) {
        Swal.fire("Atenção", "Informe um número de cartão de débito válido com 16 dígitos.", "warning");
        return;
      }
      if (!nomeDebito.trim() || !validadeDebito || !cvvDebito || !cpfDebito) {
        Swal.fire("Atenção", "Preencha todos os campos do cartão de débito.", "warning");
        return;
      }
    }

    setIsProcessando(true);

    try {
      // Conclui com sucesso
      finalizarPagamentoSucesso({
        transacaoId,
        metodo: tipo === "CREDITO" ? "Cartão de Crédito" : "Cartão de Débito",
        planoNome: plano.nome,
        valor: plano.valor,
        detalhes:
          tipo === "CREDITO"
            ? `${parcelas}x de R$ ${(plano.valor / parseInt(parcelas)).toFixed(2)}`
            : "Débito à vista",
      });
    } catch {
      Swal.fire("Erro", "Não foi possível processar o pagamento com a operadora.", "error");
    } finally {
      setIsProcessando(false);
    }
  };

  const finalizarPagamentoSucesso = (detalhes: any) => {
    setEtapa("SUCESSO");

    if (!isConsulta) {
      // Salvar na memória/localStorage para refletir no Extrato de Assinaturas do Médico
      const userStr = localStorage.getItem("activeAgeUser");
      let userNome = medico?.nome || "Médico Titular";
      let userCrm = medico?.crm || "Não informado";
      let userEmail = medico?.email || "medico@activeage.com";

      if (userStr) {
        const u = JSON.parse(userStr);
        userNome = u.nome || userNome;
        userCrm = u.crm || userCrm;
        userEmail = u.email || userEmail;
      }

      const novaFatura = {
        id: `FAT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        competencia: `${new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`,
        dataEmissao: new Date().toLocaleDateString("pt-BR"),
        dataPagamento: `${new Date().toLocaleDateString("pt-BR")} ${new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        valor: plano.valor,
        status: "PAGA" as const,
        metodo: detalhes.metodo,
        codigoTransacao: detalhes.transacaoId,
      };

      const novaAssinatura = {
        id: `sub-${Math.floor(1000 + Math.random() * 9000)}`,
        medicoId: medico?.id || "med-1",
        medicoNome: userNome,
        medicoCrm: userCrm,
        medicoEmail: userEmail,
        planoId: plano.id,
        planoNome: plano.nome,
        ciclo: plano.ciclo || "MENSAL",
        valor: plano.valor,
        status: "ATIVA" as const,
        dataInicio: new Date().toLocaleDateString("pt-BR"),
        proximaCobranca: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR"),
        formaPagamento: detalhes.metodo,
        faturas: [novaFatura],
      };

      const salvas = localStorage.getItem("activeAgeAssinaturas");
      let lista = salvas ? JSON.parse(salvas) : [];
      lista = [novaAssinatura, ...lista.filter((item: any) => item.medicoEmail !== userEmail)];
      localStorage.setItem("activeAgeAssinaturas", JSON.stringify(lista));
    }

    onSuccess(detalhes);
  };

  const copiarCodigoPix = () => {
    navigator.clipboard.writeText(codigoPixCopiaCola);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Código PIX copiado!",
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const urlQrCode = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    codigoPixCopiaCola || "00020101021226840014br.gov.bcb.pix"
  )}`;

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{ backgroundColor: "rgba(0, 0, 0, 0.65)", backdropFilter: "blur(5px)", zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* TOPO COM IDENTIDADE VISUAL MERCADO PAGO */}
          <div
            className="p-3 text-white d-flex justify-content-between align-items-center"
            style={{ backgroundColor: "#009ee3" }}
          >
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-shield-lock-fill fs-4"></i>
              <div>
                <h5 className="fw-bold mb-0">Mercado Pago Checkout</h5>
                <small className="text-white-50">Ambiente 100% Criptografado & Seguro</small>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={isProcessando}
            ></button>
          </div>

          {/* CORPO DO MODAL */}
          <div className="modal-body p-4 bg-light">
            {/* ETAPA: SUCESSO */}
            {etapa === "SUCESSO" ? (
              <div className="text-center py-4">
                <div
                  className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle text-success"
                  style={{ width: "80px", height: "80px", backgroundColor: "#e8f5e9", fontSize: "2.5rem" }}
                >
                  <i className="bi bi-check-circle-fill"></i>
                </div>
                <h3 className="fw-bold mb-2 text-dark">Pagamento Aprovado com Sucesso!</h3>
                <p className="text-muted mb-4">
                  {isConsulta
                    ? `Sua teleconsulta com ${medico?.nome || "o médico"} foi confirmada e quitada.`
                    : `Seu consultório virtual no ${plano.nome} foi ativado com sucesso.`}
                </p>

                <div className="bg-white p-3 rounded-3 border text-start mb-4 max-w-400 mx-auto small">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Código da Transação:</span>
                    <strong className="font-monospace">{transacaoId}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">{isConsulta ? "Serviço:" : "Plano:"}</span>
                    <strong>{plano.nome}</strong>
                  </div>
                  {isConsulta && plano.dataHoraFormatada && (
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Data e Horário:</span>
                      <strong>{plano.dataHoraFormatada}</strong>
                    </div>
                  )}
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Valor Quitado:</span>
                    <strong className="text-success">R$ {Number(plano.valor || 0).toFixed(2)}</strong>
                  </div>
                </div>

                <div className="d-flex justify-content-center gap-2">
                  <button className="btn btn-primary px-4 fw-bold shadow-sm" onClick={onClose}>
                    <i className="bi bi-arrow-right me-1"></i> {isConsulta ? "Ver Minhas Consultas" : "Acessar Meu Consultório"}
                  </button>
                </div>
              </div>
            ) : etapa === "PIX_GERADO" ? (
              /* ETAPA: PIX GERADO */
              <div className="text-center py-2">
                <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                  <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill fw-bold">
                    <i className="bi bi-qr-code-scan me-1"></i> PIX Mercado Pago Gerado
                  </span>
                </div>

                <h4 className="fw-bold mb-1" style={{ color: "var(--aa-brown)" }}>
                  Pague R$ {Number(plano.valor || 0).toFixed(2)} via PIX
                </h4>
                <p className="text-muted small mb-3">
                  Abra o aplicativo do seu banco, escolha a opção <strong>PIX</strong> e aponte a câmera para o QR Code
                  abaixo:
                </p>

                {/* QR CODE DISPLAY */}
                <div className="bg-white p-3 rounded-4 shadow-sm border d-inline-block mb-3">
                  <img
                    src={urlQrCode}
                    alt="QR Code PIX Mercado Pago"
                    style={{ width: "200px", height: "200px" }}
                    className="img-fluid rounded"
                  />
                  <div className="mt-2 small text-muted d-flex align-items-center justify-content-center gap-1">
                    <i className="bi bi-clock-history text-warning"></i>
                    <span>Expira em: </span>
                    <strong className="text-danger">{formatarTempo(tempoRestantePix)}</strong>
                  </div>
                </div>

                {/* COPIA E COLA */}
                <div className="mb-4 text-start">
                  <label className="form-label fw-bold small text-muted text-uppercase">
                    Ou use o Código PIX Copia e Cola:
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control font-monospace small bg-white"
                      value={codigoPixCopiaCola}
                      readOnly
                    />
                    <button className="btn btn-primary fw-bold px-3" type="button" onClick={copiarCodigoPix}>
                      <i className="bi bi-clipboard me-1"></i> Copiar Código
                    </button>
                  </div>
                </div>

                {/* AÇÃO SIMULADA DE APROVAÇÃO INSTANTÂNEA */}
                <div className="d-flex justify-content-center gap-2">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setEtapa("FORMULARIO")}
                    disabled={isProcessando}
                  >
                    Voltar / Alterar Método
                  </button>
                  <button
                    className="btn btn-success fw-bold px-4 shadow-sm"
                    onClick={() =>
                      finalizarPagamentoSucesso({
                        transacaoId,
                        metodo: "PIX Mercado Pago",
                        planoNome: plano.nome,
                        valor: plano.valor,
                        detalhes: "Chave PIX Instantânea",
                      })
                    }
                  >
                    <i className="bi bi-check-circle me-1"></i> Já Realizei o Pagamento
                  </button>
                </div>
              </div>
            ) : (
              /* ETAPA: FORMULÁRIO DE SELEÇÃO DE MÉTODO */
              <div className="row g-4">
                {/* COLUNA ESQUERDA: RESUMO DO PEDIDO */}
                <div className="col-12 col-md-5 order-md-2">
                  <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
                    <h6 className="fw-bold mb-3" style={{ color: "var(--aa-brown)" }}>
                      <i className="bi bi-cart-check me-2 text-primary"></i>Resumo do Pedido
                    </h6>

                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted small">{isConsulta ? "Serviço:" : "Plano:"}</span>
                      <strong className="text-dark text-truncate" style={{ maxWidth: "160px" }}>
                        {plano.nome}
                      </strong>
                    </div>

                    {isConsulta ? (
                      <>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-muted small">Médico:</span>
                          <span className="small text-truncate fw-semibold" style={{ maxWidth: "160px" }}>
                            {medico?.nome || "Médico Especialista"}
                          </span>
                        </div>

                        {medico?.crm && (
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="text-muted small">CRM:</span>
                            <span className="badge bg-light text-dark border small">{medico.crm}</span>
                          </div>
                        )}

                        {plano.dataHoraFormatada && (
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="text-muted small">Horário:</span>
                            <span className="small text-dark fw-semibold">{plano.dataHoraFormatada}</span>
                          </div>
                        )}

                        {plano.duracaoMinutos && (
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="text-muted small">Duração:</span>
                            <span className="badge bg-light text-dark border">
                              {plano.duracaoMinutos} min
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-muted small">Modalidade:</span>
                          <span className="badge bg-light text-dark border">
                            {plano.ciclo === "MENSAL" ? "Mensal Recorrente" : "Anual (com Desconto)"}
                          </span>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-muted small">Médico Titular:</span>
                          <span className="small text-truncate" style={{ maxWidth: "160px" }}>
                            {medico?.nome || "Titular da Conta"}
                          </span>
                        </div>
                      </>
                    )}

                    <hr className="my-2" />

                    <div className="d-flex justify-content-between align-items-center my-2">
                      <span className="fw-bold">Total a Pagar:</span>
                      <span className="fs-4 fw-bold" style={{ color: "var(--aa-orange)" }}>
                        R$ {Number(plano.valor || 0).toFixed(2)}
                      </span>
                    </div>

                    <div className="p-2 bg-light rounded text-center small text-muted mt-2 border">
                      <i className="bi bi-shield-check text-success me-1"></i>
                      Ambiente seguro processado via Mercado Pago.
                    </div>
                  </div>
                </div>

                {/* COLUNA DIREITA: ABAS E FORMULÁRIO DE PAGAMENTO */}
                <div className="col-12 col-md-7 order-md-1">
                  {/* TABS DE SELEÇÃO */}
                  <div className="d-flex gap-2 p-1 bg-white rounded-3 border mb-3">
                    <button
                      type="button"
                      className={`btn flex-grow-1 fw-bold btn-sm py-2 d-flex align-items-center justify-content-center gap-1 ${
                        metodoSelecionado === "PIX" ? "btn-success" : "btn-light text-muted"
                      }`}
                      onClick={() => setMetodoSelecionado("PIX")}
                    >
                      <i className="bi bi-qr-code"></i> PIX
                    </button>

                    <button
                      type="button"
                      className={`btn flex-grow-1 fw-bold btn-sm py-2 d-flex align-items-center justify-content-center gap-1 ${
                        metodoSelecionado === "CREDITO" ? "btn-primary" : "btn-light text-muted"
                      }`}
                      onClick={() => setMetodoSelecionado("CREDITO")}
                    >
                      <i className="bi bi-credit-card"></i> Crédito
                    </button>

                    <button
                      type="button"
                      className={`btn flex-grow-1 fw-bold btn-sm py-2 d-flex align-items-center justify-content-center gap-1 ${
                        metodoSelecionado === "DEBITO" ? "btn-primary" : "btn-light text-muted"
                      }`}
                      onClick={() => setMetodoSelecionado("DEBITO")}
                    >
                      <i className="bi bi-credit-card-2-front"></i> Débito
                    </button>
                  </div>

                  {/* FORMULÁRIO DO MÉTODO: PIX */}
                  {metodoSelecionado === "PIX" && (
                    <div className="card border-0 shadow-sm p-4 bg-white rounded-3 text-center">
                      <div
                        className="mx-auto mb-2 d-flex align-items-center justify-content-center rounded-circle text-success"
                        style={{ width: "54px", height: "54px", backgroundColor: "#e8f5e9", fontSize: "1.8rem" }}
                      >
                        <i className="bi bi-lightning-charge-fill"></i>
                      </div>
                      <h5 className="fw-bold mb-1 text-dark">Pagamento Instantâneo via PIX</h5>
                      <p className="text-muted small mb-3">
                        {isConsulta
                          ? "Confirmação imediata da sua consulta após o pagamento."
                          : "Liberação imediata do seu consultório virtual após a confirmação."}
                      </p>

                      <div className="alert alert-success border-0 small text-start mb-4 py-2">
                        <i className="bi bi-check2-circle me-1"></i>
                        Sem taxas adicionais • Disponível 24 horas por dia • Notificação automática
                      </div>

                      <button
                        className="btn btn-success btn-lg w-100 fw-bold shadow-sm"
                        onClick={handleGerarPix}
                        disabled={isProcessando}
                      >
                        {isProcessando ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Gerando QR Code...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-qr-code-scan me-2"></i>
                            Gerar Chave e QR Code PIX
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* FORMULÁRIO DO MÉTODO: CARTÃO DE CRÉDITO */}
                  {metodoSelecionado === "CREDITO" && (
                    <div className="card border-0 shadow-sm p-3 p-md-4 bg-white rounded-3">
                      {/* PREVIEW DO CARTÃO VIRTUAL */}
                      <div
                        className="p-3 text-white rounded-3 mb-3 shadow-sm position-relative overflow-hidden"
                        style={{
                          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                          minHeight: "140px",
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="badge bg-warning text-dark text-uppercase small">Crédito</span>
                          <span className="fw-bold text-uppercase small">{bandeiraCartao}</span>
                        </div>
                        <div className="fs-5 font-monospace text-center my-2 tracking-widest">
                          {numeroCartao || "•••• •••• •••• ••••"}
                        </div>
                        <div className="d-flex justify-content-between small text-white-50 mt-2">
                          <div>
                            <span className="d-block" style={{ fontSize: "0.65rem" }}>TITULAR</span>
                            <span className="text-white text-uppercase">{nomeTitular || "NOME DO TITULAR"}</span>
                          </div>
                          <div>
                            <span className="d-block" style={{ fontSize: "0.65rem" }}>VALIDADE</span>
                            <span className="text-white">{validade || "MM/AA"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">NÚMERO DO CARTÃO</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light"><i className="bi bi-credit-card-2-back"></i></span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="0000 0000 0000 0000"
                            value={numeroCartao}
                            onChange={(e) => handleNumeroCartaoChange(e.target.value)}
                            maxLength={19}
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">NOME IMPRESSO NO CARTÃO</label>
                        <input
                          type="text"
                          className="form-control text-uppercase"
                          placeholder="COMO NO CARTÃO"
                          value={nomeTitular}
                          onChange={(e) => setNomeTitular(e.target.value)}
                        />
                      </div>

                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <label className="form-label text-muted small fw-bold">VALIDADE</label>
                          <input
                            type="text"
                            className="form-control text-center"
                            placeholder="MM/AA"
                            value={validade}
                            onChange={(e) => handleValidadeChange(e.target.value)}
                            maxLength={5}
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label text-muted small fw-bold">CVV</label>
                          <input
                            type="password"
                            className="form-control text-center"
                            placeholder="123"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").substring(0, 4))}
                            maxLength={4}
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">CPF DO TITULAR</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="000.000.000-00"
                          value={cpfTitular}
                          onChange={(e) => handleCpfChange(e.target.value, setCpfTitular)}
                          maxLength={14}
                        />
                      </div>

                      <div className="mb-4">
                        <label className="form-label text-muted small fw-bold">PARCELAMENTO</label>
                        <select
                          className="form-select"
                          value={parcelas}
                          onChange={(e) => setParcelas(e.target.value)}
                        >
                          <option value="1">1x de R$ {plano.valor.toFixed(2)} (sem juros)</option>
                          <option value="2">2x de R$ {(plano.valor / 2).toFixed(2)} (sem juros)</option>
                          <option value="3">3x de R$ {(plano.valor / 3).toFixed(2)} (sem juros)</option>
                          <option value="6">6x de R$ {(plano.valor / 6).toFixed(2)} (sem juros)</option>
                          <option value="12">12x de R$ {(plano.valor / 12).toFixed(2)} (sem juros)</option>
                        </select>
                      </div>

                      <button
                        className="btn btn-primary btn-lg w-100 fw-bold shadow-sm"
                        onClick={() => handleProcessarCartao("CREDITO")}
                        disabled={isProcessando}
                      >
                        {isProcessando ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Processando Pagamento...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-shield-check me-2"></i>
                            Pagar R$ {plano.valor.toFixed(2)}
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* FORMULÁRIO DO MÉTODO: CARTÃO DE DÉBITO */}
                  {metodoSelecionado === "DEBITO" && (
                    <div className="card border-0 shadow-sm p-3 p-md-4 bg-white rounded-3">
                      <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">NÚMERO DO CARTÃO DE DÉBITO</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light"><i className="bi bi-credit-card-2-front"></i></span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="0000 0000 0000 0000"
                            value={numeroDebito}
                            onChange={(e) => {
                              const limpo = e.target.value.replace(/\D/g, "").substring(0, 16);
                              const formatado = limpo.replace(/(\d{4})(?=\d)/g, "$1 ");
                              setNumeroDebito(formatado);
                            }}
                            maxLength={19}
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">NOME IMPRESSO NO CARTÃO</label>
                        <input
                          type="text"
                          className="form-control text-uppercase"
                          placeholder="COMO NO CARTÃO"
                          value={nomeDebito}
                          onChange={(e) => setNomeDebito(e.target.value)}
                        />
                      </div>

                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <label className="form-label text-muted small fw-bold">VALIDADE</label>
                          <input
                            type="text"
                            className="form-control text-center"
                            placeholder="MM/AA"
                            value={validadeDebito}
                            onChange={(e) => {
                              const limpo = e.target.value.replace(/\D/g, "").substring(0, 4);
                              if (limpo.length >= 3) {
                                setValidadeDebito(`${limpo.substring(0, 2)}/${limpo.substring(2)}`);
                              } else {
                                setValidadeDebito(limpo);
                              }
                            }}
                            maxLength={5}
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label text-muted small fw-bold">CVV</label>
                          <input
                            type="password"
                            className="form-control text-center"
                            placeholder="123"
                            value={cvvDebito}
                            onChange={(e) => setCvvDebito(e.target.value.replace(/\D/g, "").substring(0, 4))}
                            maxLength={4}
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="form-label text-muted small fw-bold">CPF DO TITULAR</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="000.000.000-00"
                          value={cpfDebito}
                          onChange={(e) => handleCpfChange(e.target.value, setCpfDebito)}
                          maxLength={14}
                        />
                      </div>

                      <button
                        className="btn btn-primary btn-lg w-100 fw-bold shadow-sm"
                        onClick={() => handleProcessarCartao("DEBITO")}
                        disabled={isProcessando}
                      >
                        {isProcessando ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Processando Débito...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-lock-fill me-2"></i>
                            Pagar à Vista R$ {plano.valor.toFixed(2)}
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
