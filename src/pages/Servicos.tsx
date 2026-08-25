import { useNavigate, Link } from "react-router-dom";

export function Servicos() {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <main className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <header className="text-center mb-5">
            <h1 className="fw-bold mb-3" style={{ color: "var(--aa-orange)" }}>
              Nossos Serviços
            </h1>
            <p className="lead text-muted">
              Conectamos você ao cuidado geriátrico especializado, com
              tecnologia e humanidade.
            </p>
          </header>

          <article
            className="card shadow-sm border-0"
            style={{ borderRadius: "15px" }}
          >
            <div className="card-body p-4 p-md-5">
              <div className="d-flex justify-content-end mb-4 d-print-none">
                <button
                  onClick={handlePrint}
                  className="btn btn-outline-secondary"
                  aria-label="Imprimir documento"
                >
                  <i className="bi bi-printer me-2" aria-hidden="true"></i>
                  Imprimir
                </button>
              </div>

              <section className="content-section">
                <h2>
                  <i className="bi bi-people me-2" aria-hidden="true"></i>Para
                  Pacientes e Cuidadores
                </h2>
                <p>
                  A Active Age oferece uma gama de funcionalidades pensadas para
                  facilitar o acesso à saúde geriátrica:
                </p>
                <div className="row mt-4">
                  <div className="col-md-6 col-lg-4">
                    <div className="service-feature">
                      <i className="bi bi-search icon" aria-hidden="true"></i>
                      <h4>Busca de Geriatras</h4>
                      <p>
                        Encontre médicos especializados em geriatria de forma
                        rápida e intuitiva, filtrando por disponibilidade e
                        perfil.
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="service-feature">
                      <i
                        className="bi bi-calendar-check icon"
                        aria-hidden="true"
                      ></i>
                      <h4>Agendamento Online</h4>
                      <p>
                        Marque suas consultas de forma prática, escolhendo o
                        melhor dia e horário na agenda do profissional.
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="service-feature">
                      <i
                        className="bi bi-camera-video icon"
                        aria-hidden="true"
                      ></i>
                      <h4>Teleconsultas Seguras</h4>
                      <p>
                        Realize suas consultas por vídeo em uma sala virtual
                        criptografada, com privacidade e conforto do seu lar.
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="service-feature">
                      <i
                        className="bi bi-person-badge icon"
                        aria-hidden="true"
                      ></i>
                      <h4>Perfis Detalhados</h4>
                      <p>
                        Visualize perfis completos de médicos, incluindo
                        biografia, idiomas e informações de contato.
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="service-feature">
                      <i
                        className="bi bi-clipboard2-pulse icon"
                        aria-hidden="true"
                      ></i>
                      <h4>Histórico de Consultas</h4>
                      <p>
                        Acompanhe todos os seus agendamentos passados, presentes
                        e futuros em um só lugar.
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="service-feature">
                      <i
                        className="bi bi-heart-pulse icon"
                        aria-hidden="true"
                      ></i>
                      <h4>Cuidado Contínuo</h4>
                      <p>
                        Mantenha um acompanhamento regular com seu geriatra,
                        essencial para a saúde na terceira idade.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="content-section">
                <h2>
                  <i className="bi bi-file-medical me-2" aria-hidden="true"></i>
                  Para Médicos Geriatras
                </h2>
                <p>
                  Oferecemos uma plataforma robusta para otimizar sua prática e
                  expandir seu alcance:
                </p>
                <div className="row mt-4">
                  <div className="col-md-6 col-lg-4">
                    <div className="service-feature">
                      <i className="bi bi-globe icon" aria-hidden="true"></i>
                      <h4>Visibilidade Ampliada</h4>
                      <p>
                        Alcance pacientes em diversas regiões, ampliando sua
                        clientela sem sair do consultório.
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="service-feature">
                      <i
                        className="bi bi-calendar-event icon"
                        aria-hidden="true"
                      ></i>
                      <h4>Gestão de Agenda</h4>
                      <p>
                        Defina sua disponibilidade de forma flexível e gerencie
                        todos os seus agendamentos com facilidade.
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="service-feature">
                      <i
                        className="bi bi-shield-check icon"
                        aria-hidden="true"
                      ></i>
                      <h4>Verificação de Credenciais</h4>
                      <p>
                        Nossa plataforma valida suas credenciais para garantir a
                        segurança e a credibilidade do seu serviço.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="content-section">
                <h2>
                  <i className="bi bi-lock me-2" aria-hidden="true"></i>
                  Tecnologia e Segurança
                </h2>
                <p>
                  A Active Age é construída com tecnologia de ponta para
                  garantir a segurança, privacidade e estabilidade das suas
                  informações e teleconsultas. Utilizamos criptografia de ponta
                  a ponta e seguimos rigorosamente a Lei Geral de Proteção de
                  Dados (LGPD).
                </p>
                <Link
                  to="/privacidade"
                  className="btn btn-outline-primary mt-3"
                >
                  <i
                    className="bi bi-file-earmark-text me-1"
                    aria-hidden="true"
                  ></i>{" "}
                  Saiba mais sobre nossa Política de Privacidade
                </Link>
              </section>

              <hr className="my-5 d-print-none" />

              <div className="text-center d-print-none">
                <p className="text-muted mb-4 fs-5">
                  Pronto para transformar sua experiência com a saúde?
                </p>
                <button
                  onClick={handleGoBack}
                  className="btn btn-outline-secondary btn-lg px-4 me-md-3 mb-3 mb-md-0"
                >
                  <i className="bi bi-arrow-left me-2" aria-hidden="true"></i>{" "}
                  Voltar
                </button>
                <Link to="/cadastro" className="btn btn-primary btn-lg px-4">
                  <i className="bi bi-person-plus me-2" aria-hidden="true"></i>{" "}
                  Começar Agora
                </Link>
              </div>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
