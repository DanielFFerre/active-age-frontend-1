import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { ModalPagamentoMercadoPago } from "../components/pagamento/ModalPagamentoMercadoPago";

// =========================================================================
// 📝 CONFIGURAÇÃO DOS PLANOS DO CONSULTÓRIO VIRTUAL
// Você pode alterar livremente os nomes, preços, descrições e recursos abaixo:
// =========================================================================
interface PlanoConsultorio {
  id: string;
  nome: string;
  badge?: string;
  destaque?: boolean;
  icone: string;
  precoMensal: string; // Ex: "99" ou "99,90"
  precoAnual: string;  // Ex: "79" ou "79,90" (valor mensal no plano anual)
  descricao: string;
  recursos: string[];
  recursosNaoInclusos?: string[];
  textoBotao: string;
}

const PLANOS_DISPONIVEIS: PlanoConsultorio[] = [
  {
    id: "plano-start",
    nome: "Plano Básico / Start",
    icone: "bi-rocket-takeoff-fill",
    precoMensal: "99",
    precoAnual: "79",
    descricao: "Ideal para médicos que estão iniciando seus atendimentos online na geriatria.",
    recursos: [
      "Até 30 teleconsultas por mês",
      "Sala virtual criptografada com vídeo HD",
      "Prontuário eletrônico básico do paciente",
      "Agenda de horários customizável",
      "Suporte por e-mail em dias úteis",
    ],
    recursosNaoInclusos: [
      "Prescrição digital com assinatura ICP-Brasil",
      "Lembretes automáticos por WhatsApp",
      "Destaque na lista de buscas",
    ],
    textoBotao: "Assinar Plano Start",
  },
  {
    id: "plano-pro",
    nome: "Plano Profissional / Pro",
    badge: "MAIS ESCOLHIDO",
    destaque: true,
    icone: "bi-star-fill",
    precoMensal: "199",
    precoAnual: "159",
    descricao: "Consultório virtual completo para médicos com atendimento frequente.",
    recursos: [
      "Teleconsultas ILIMITADAS em alta definição",
      "Sala virtual com integração ZegoCloud e chat",
      "Prontuário eletrônico completo e histórico",
      "Emissão de receitas, laudos e atestados digitais",
      "Lembretes automáticos de consulta por WhatsApp",
      "Selo de Médico Verificado e destaque na busca",
      "Suporte prioritário via WhatsApp",
    ],
    recursosNaoInclusos: [
      "Múltiplos acessos para secretária/recepção",
    ],
    textoBotao: "Assinar Plano Profissional",
  },
  {
    id: "plano-clinica",
    nome: "Plano Clínica / Premium",
    badge: "MULTI-USUÁRIOS",
    icone: "bi-buildings-fill",
    precoMensal: "349",
    precoAnual: "279",
    descricao: "Para consultórios consolidados, clínicas geriátricas e equipes multidisciplinares.",
    recursos: [
      "Tudo do Plano Profissional",
      "Teleconsultas ILIMITADAS para toda a equipe",
      "Até 3 consultórios virtuais simultâneos",
      "Acesso dedicado para secretária e recepção",
      "Relatórios financeiros e métricas de atendimento",
      "Personalização visual com a marca da clínica",
      "Gerente de conta e suporte VIP 24/7",
    ],
    textoBotao: "Assinar Plano Clínica",
  },
];

// =========================================================================
// ❓ PERGUNTAS FREQUENTES (FAQ)
// Adicione ou edite perguntas e respostas comuns para os médicos:
// =========================================================================
const PERGUNTAS_FREQUENTES = [
  {
    pergunta: "Preciso ter meu CRM validado para assinar um plano?",
    resposta:
      "Você pode conhecer e selecionar seu plano a qualquer momento. A liberação para abrir horários e realizar atendimentos ao vivo requer a validação prévia do seu CRM pelo administrador.",
  },
  {
    pergunta: "Como funciona a cobrança (Mensal vs Anual)?",
    resposta:
      "No plano mensal, o valor é debitado a cada 30 dias. No plano anual, você garante um desconto especial no valor mensal com cobrança única ou parcelada no cartão de crédito.",
  },
  {
    pergunta: "Posso cancelar ou trocar de plano quando quiser?",
    resposta:
      "Sim! Você pode fazer upgrade, downgrade ou cancelamento da sua assinatura diretamente pelo painel a qualquer momento, sem fidelidade oculta.",
  },
  {
    pergunta: "A teleconsulta atende às normas do CFM e da LGPD?",
    resposta:
      "Sim, toda a infraestrutura do Active Age foi desenvolvida em total conformidade com as resoluções do Conselho Federal de Medicina (CFM) e requisitos de segurança da LGPD.",
  },
];

export function PlanosMedico() {
  const navigate = useNavigate();
  const [cicloCobranca, setCicloCobranca] = useState<"MENSAL" | "ANUAL">("MENSAL");
  const [planoSelecionado, setPlanoSelecionado] = useState<PlanoConsultorio | null>(null);
  const [isModalPagamentoOpen, setIsModalPagamentoOpen] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("activeAgeUser");
    if (userStr) {
      try {
        setUsuarioLogado(JSON.parse(userStr));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleAssinar = (plano: PlanoConsultorio) => {
    setPlanoSelecionado(plano);
    setIsModalPagamentoOpen(true);
  };

  const handlePagamentoSucesso = (detalhes: any) => {
    setIsModalPagamentoOpen(false);
    Swal.fire({
      icon: "success",
      title: "Assinatura Confirmada!",
      text: `O pagamento do ${detalhes.planoNome} foi processado com sucesso pelo Mercado Pago.`,
      confirmButtonColor: "var(--aa-green)",
      confirmButtonText: "Ver Extrato & Faturas",
    }).then(() => {
      navigate("/extrato-assinaturas");
    });
  };

  return (
    <main className="container my-5 pb-5 animation-fade-in">
      {/* CABEÇALHO HERO */}
      <header className="text-center mb-5">
        <div className="d-inline-flex align-items-center gap-2 px-3 py-1 bg-light rounded-pill border mb-3">
          <i className="bi bi-shield-fill-check text-success"></i>
          <span className="small fw-bold text-muted text-uppercase">
            Consultório Virtual Active Age
          </span>
        </div>
        <h1 className="fw-bold mb-3" style={{ color: "var(--aa-brown)" }}>
          Planos de Assinatura para Médicos
        </h1>
        <p className="lead text-muted mx-auto" style={{ maxWidth: "750px" }}>
          Abra o seu consultório virtual, atenda pacientes da terceira idade com
          tecnologia acessível e faça a gestão completa da sua clínica online.
        </p>

        {/* TOGGLE MENSAL / ANUAL */}
        <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
          <span
            className={`fw-bold cursor-pointer ${
              cicloCobranca === "MENSAL" ? "text-dark" : "text-muted"
            }`}
            onClick={() => setCicloCobranca("MENSAL")}
            role="button"
          >
            Mensal
          </span>

          <div className="form-check form-switch fs-4 m-0 d-flex align-items-center">
            <input
              className="form-check-input cursor-pointer"
              type="checkbox"
              role="switch"
              id="switchCiclo"
              checked={cicloCobranca === "ANUAL"}
              onChange={(e) =>
                setCicloCobranca(e.target.checked ? "ANUAL" : "MENSAL")
              }
              style={{ backgroundColor: cicloCobranca === "ANUAL" ? "var(--aa-orange)" : "" }}
            />
          </div>

          <span
            className={`fw-bold cursor-pointer d-flex align-items-center gap-2 ${
              cicloCobranca === "ANUAL" ? "text-dark" : "text-muted"
            }`}
            onClick={() => setCicloCobranca("ANUAL")}
            role="button"
          >
            Anual
            <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2 py-1 small">
              Economize 20%
            </span>
          </span>
        </div>
      </header>

      {/* GRADE DE PLANOS / CARDS */}
      <div className="row g-4 justify-content-center align-items-stretch mb-5">
        {PLANOS_DISPONIVEIS.map((plano) => {
          const preco =
            cicloCobranca === "MENSAL" ? plano.precoMensal : plano.precoAnual;

          return (
            <div key={plano.id} className="col-12 col-md-6 col-lg-4">
              <div
                className={`card h-100 border-0 shadow-sm position-relative ${
                  plano.destaque ? "pricing-card-featured" : "pricing-card-standard"
                }`}
                style={{
                  borderRadius: "18px",
                  transition: "all 0.3s ease",
                  border: plano.destaque
                    ? "2px solid var(--aa-orange)"
                    : "1px solid #e2e8f0",
                }}
              >
                {/* BADGE DESTAQUE */}
                {plano.badge && (
                  <div
                    className="position-absolute top-0 start-50 translate-middle badge rounded-pill px-3 py-2 fw-bold shadow-sm"
                    style={{
                      backgroundColor: plano.destaque ? "var(--aa-orange)" : "var(--aa-brown)",
                      color: "white",
                      fontSize: "0.8rem",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {plano.badge}
                  </div>
                )}

                <div className="card-body p-4 p-xl-5 d-flex flex-column">
                  {/* ÍCONE E TÍTULO */}
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div
                      className="rounded-3 d-flex align-items-center justify-content-center"
                      style={{
                        width: "48px",
                        height: "48px",
                        backgroundColor: plano.destaque
                          ? "rgba(232, 101, 66, 0.12)"
                          : "rgba(90, 58, 45, 0.08)",
                        color: plano.destaque ? "var(--aa-orange)" : "var(--aa-brown)",
                        fontSize: "1.4rem",
                      }}
                    >
                      <i className={`bi ${plano.icone}`}></i>
                    </div>
                    <div>
                      <h4 className="fw-bold mb-0 text-dark">{plano.nome}</h4>
                    </div>
                  </div>

                  <p className="text-muted small mb-4">{plano.descricao}</p>

                  {/* PREÇO */}
                  <div className="mb-4 pb-3 border-bottom">
                    <div className="d-flex align-items-baseline">
                      <span className="fs-5 fw-bold text-muted me-1">R$</span>
                      <span
                        className="display-5 fw-bold"
                        style={{
                          color: plano.destaque ? "var(--aa-orange)" : "var(--aa-brown)",
                        }}
                      >
                        {preco}
                      </span>
                      <span className="text-muted ms-2 fw-semibold">/mês</span>
                    </div>
                    <small className="text-muted">
                      {cicloCobranca === "ANUAL"
                        ? "Cobrado anualmente (20% OFF)"
                        : "Cobrança mensal recorrente"}
                    </small>
                  </div>

                  {/* LISTA DE BENEFÍCIOS */}
                  <div className="mb-4 flex-grow-1">
                    <span className="text-muted small fw-bold text-uppercase d-block mb-3">
                      Recursos Inclusos:
                    </span>
                    <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
                      {plano.recursos.map((rec, i) => (
                        <li key={i} className="d-flex align-items-start gap-2 small">
                          <i className="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i>
                          <span>{rec}</span>
                        </li>
                      ))}

                      {plano.recursosNaoInclusos?.map((rec, i) => (
                        <li
                          key={i}
                          className="d-flex align-items-start gap-2 small text-muted opacity-50"
                        >
                          <i className="bi bi-x-circle mt-1 flex-shrink-0"></i>
                          <span className="text-decoration-line-through">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* BOTÃO DE AÇÃO */}
                  <button
                    className={`btn btn-lg w-100 fw-bold py-3 shadow-sm ${
                      plano.destaque
                        ? "btn-primary"
                        : "btn-outline-secondary"
                    }`}
                    style={{ borderRadius: "12px" }}
                    onClick={() => handleAssinar(plano)}
                  >
                    {plano.textoBotao}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* BENEFÍCIOS DO CONSULTÓRIO VIRTUAL */}
      <section className="my-5 py-4 bg-white rounded-4 shadow-sm border p-4 p-md-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold" style={{ color: "var(--aa-brown)" }}>
            Por que ter seu Consultório no Active Age?
          </h2>
          <p className="text-muted">
            Projetado especialmente para facilitar a rotina do médico e a experiência do idoso.
          </p>
        </div>

        <div className="row g-4 text-center">
          <div className="col-12 col-md-6 col-lg-3">
            <div className="p-3">
              <div
                className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: "64px",
                  height: "64px",
                  backgroundColor: "rgba(144, 194, 141, 0.2)",
                  color: "#2e7d32",
                  fontSize: "1.8rem",
                }}
              >
                <i className="bi bi-shield-check"></i>
              </div>
              <h5 className="fw-bold mb-2" style={{ color: "var(--aa-brown)" }}>
                Conformidade CFM & LGPD
              </h5>
              <p className="text-muted small">
                Segurança total com teleconsultas criptografadas e prontuário em nuvem segura.
              </p>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <div className="p-3">
              <div
                className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: "64px",
                  height: "64px",
                  backgroundColor: "rgba(232, 101, 66, 0.15)",
                  color: "var(--aa-orange)",
                  fontSize: "1.8rem",
                }}
              >
                <i className="bi bi-heart-pulse-fill"></i>
              </div>
              <h5 className="fw-bold mb-2" style={{ color: "var(--aa-brown)" }}>
                Focado no Idoso
              </h5>
              <p className="text-muted small">
                Telas simplificadas e botões grandes para que o paciente geriátrico acesse sem dificuldades.
              </p>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <div className="p-3">
              <div
                className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: "64px",
                  height: "64px",
                  backgroundColor: "rgba(90, 58, 45, 0.12)",
                  color: "var(--aa-brown)",
                  fontSize: "1.8rem",
                }}
              >
                <i className="bi bi-calendar2-week-fill"></i>
              </div>
              <h5 className="fw-bold mb-2" style={{ color: "var(--aa-brown)" }}>
                Agenda Automatizada
              </h5>
              <p className="text-muted small">
                Defina seus horários livres e receba confirmações e lembretes automáticos.
              </p>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <div className="p-3">
              <div
                className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: "64px",
                  height: "64px",
                  backgroundColor: "rgba(30, 136, 229, 0.15)",
                  color: "#1e88e5",
                  fontSize: "1.8rem",
                }}
              >
                <i className="bi bi-headset"></i>
              </div>
              <h5 className="fw-bold mb-2" style={{ color: "var(--aa-brown)" }}>
                Suporte Humanizado
              </h5>
              <p className="text-muted small">
                Equipe disponível para auxiliar você e seus pacientes antes e durante as consultas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO DE DÚVIDAS FREQUENTES (FAQ) */}
      <section className="my-5">
        <div className="text-center mb-4">
          <h3 className="fw-bold" style={{ color: "var(--aa-brown)" }}>
            Dúvidas Frequentes sobre a Assinatura
          </h3>
          <p className="text-muted">
            Principais perguntas de médicos e especialistas da saúde.
          </p>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="accordion accordion-flush shadow-sm rounded-4 overflow-hidden border" id="faqAccordion">
              {PERGUNTAS_FREQUENTES.map((faq, index) => (
                <div key={index} className="accordion-item">
                  <h2 className="accordion-header" id={`faq-heading-${index}`}>
                    <button
                      className={`accordion-button fw-bold ${index !== 0 ? "collapsed" : ""}`}
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={`#faq-collapse-${index}`}
                      aria-expanded={index === 0 ? "true" : "false"}
                      aria-controls={`faq-collapse-${index}`}
                      style={{ color: "var(--aa-brown)" }}
                    >
                      {faq.pergunta}
                    </button>
                  </h2>
                  <div
                    id={`faq-collapse-${index}`}
                    className={`accordion-collapse collapse ${index === 0 ? "show" : ""}`}
                    aria-labelledby={`faq-heading-${index}`}
                    data-bs-parent="#faqAccordion"
                  >
                    <div className="accordion-body text-muted">
                      {faq.resposta}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BANNER CTA INFERIOR */}
      <section className="cta-section text-center p-5 rounded-4 mt-5 text-white shadow-sm">
        <h3 className="fw-bold mb-2">Pronto para começar seu atendimento digital?</h3>
        <p className="lead mb-4 opacity-90">
          Cadastre seu CRM e tenha seu consultório virtual funcionando em minutos.
        </p>
        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <Link to="/perfil" className="btn btn-light btn-lg px-4 fw-bold text-dark shadow-sm">
            <i className="bi bi-person-lines-fill me-2"></i> Completar Meu Perfil
          </Link>
          <Link to="/dashboard" className="btn btn-outline-light btn-lg px-4 fw-bold">
            <i className="bi bi-grid-fill me-2"></i> Ir para o Meu Painel
          </Link>
        </div>
      </section>

      {/* MODAL DE CHECKOUT MERCADO PAGO */}
      {planoSelecionado && (
        <ModalPagamentoMercadoPago
          isOpen={isModalPagamentoOpen}
          onClose={() => setIsModalPagamentoOpen(false)}
          onSuccess={handlePagamentoSucesso}
          plano={{
            id: planoSelecionado.id,
            nome: planoSelecionado.nome,
            valor: parseFloat(
              cicloCobranca === "MENSAL"
                ? planoSelecionado.precoMensal
                : planoSelecionado.precoAnual
            ),
            ciclo: cicloCobranca,
          }}
          medico={{
            id: usuarioLogado?.id,
            nome: usuarioLogado?.nome,
            email: usuarioLogado?.email,
            crm: usuarioLogado?.crm,
          }}
        />
      )}

      {/* ESTILOS ESPECÍFICOS DOS CARDS DE PREÇO */}
      <style>{`
        .pricing-card-featured {
          transform: scale(1.03);
          box-shadow: 0 12px 30px rgba(232, 101, 66, 0.15) !important;
          z-index: 2;
        }
        @media (max-width: 991px) {
          .pricing-card-featured {
            transform: none;
          }
        }
        .pricing-card-standard:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(90, 58, 45, 0.08) !important;
        }
      `}</style>
    </main>
  );
}
