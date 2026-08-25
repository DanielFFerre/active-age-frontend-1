import { useNavigate, Link } from "react-router-dom";

export function QuemSomos() {
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
              Quem Somos
            </h1>
            <p className="lead text-muted">
              Nossa missão é conectar a saúde da terceira idade com a
              tecnologia, de forma humana e eficiente.
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
                  <i
                    className="bi bi-clock-history me-2"
                    aria-hidden="true"
                  ></i>
                  Nossa História
                </h2>
                <p>
                  A Active Age nasceu da percepção da crescente necessidade de
                  um atendimento médico especializado e acessível para a
                  população idosa. Observamos que, muitas vezes, a distância, a
                  mobilidade reduzida ou a dificuldade de locomoção se tornam
                  barreiras para que idosos recebam a atenção geriátrica que
                  merecem. Fundada em 2026, nossa plataforma foi idealizada para
                  romper essas barreiras, utilizando a telemedicina como uma
                  ponte entre a experiência dos geriatras e o conforto do lar
                  dos pacientes.
                </p>
                <p>
                  Acreditamos que o envelhecimento deve ser vivido com
                  qualidade, dignidade e acesso facilitado à saúde. Por isso,
                  desenvolvemos uma interface intuitiva e segura, pensada para
                  ser utilizada tanto pelos idosos quanto por seus cuidadores.
                </p>
              </section>

              <section className="content-section">
                <h2>
                  <i className="bi bi-bullseye me-2" aria-hidden="true"></i>
                  Nossa Missão
                </h2>
                <p>
                  Promover a saúde e o bem-estar da população idosa, facilitando
                  o acesso a teleconsultas com geriatras qualificados, através
                  de uma plataforma tecnológica inovadora, segura e humanizada.
                </p>
              </section>

              <section className="content-section">
                <h2>
                  <i className="bi bi-eye me-2" aria-hidden="true"></i>Nossa
                  Visão
                </h2>
                <p>
                  Ser a principal referência em telessaúde geriátrica no Brasil,
                  reconhecida pela excelência no atendimento, pela inovação
                  tecnológica e pelo impacto positivo na qualidade de vida dos
                  idosos.
                </p>
              </section>

              <section className="content-section">
                <h2>
                  <i className="bi bi-star me-2" aria-hidden="true"></i>Nossos
                  Valores
                </h2>
                <ul className="mt-3">
                  <li>
                    <strong>Humanização:</strong> A tecnologia a serviço do
                    cuidado e da empatia.
                  </li>
                  <li>
                    <strong>Acessibilidade:</strong> Saúde de qualidade ao
                    alcance de todos.
                  </li>
                  <li>
                    <strong>Segurança:</strong> Proteção integral dos dados e da
                    privacidade.
                  </li>
                  <li>
                    <strong>Excelência:</strong> Busca contínua pela melhoria
                    dos serviços.
                  </li>
                  <li>
                    <strong>Inovação:</strong> Soluções criativas para desafios
                    da saúde.
                  </li>
                </ul>
              </section>

              <section className="content-section">
                <h2>
                  <i className="bi bi-people me-2" aria-hidden="true"></i>A
                  Equipe
                </h2>
                <p className="mb-5">
                  Conheça os desenvolvedores por trás do Active Age, estudantes
                  de Análise e Desenvolvimento de Sistemas da Fatec Diadema.
                </p>

                <div className="row mt-4">
                  <div className="col-md-6 col-lg-3 team-member">
                    <img
                      src="https://ui-avatars.com/api/?name=Daniel+Felipe&background=90c28d&color=fff&size=150"
                      alt="Daniel Felipe"
                    />
                    <h4>Daniel Felipe</h4>
                    <p>Desenvolvedor Fullstack</p>
                  </div>
                  <div className="col-md-6 col-lg-3 team-member">
                    <img
                      src="https://ui-avatars.com/api/?name=Gabriel+Moura&background=e86542&color=fff&size=150"
                      alt="Gabriel de Moura"
                    />
                    <h4>Gabriel Moura</h4>
                    <p>Desenvolvedor Fullstack</p>
                  </div>
                  <div className="col-md-6 col-lg-3 team-member">
                    {/* Adicionado o Guilherme Araújo */}
                    <img
                      src="https://ui-avatars.com/api/?name=Guilherme+Araujo&background=5a3a2d&color=fff&size=150"
                      alt="Guilherme Araújo"
                    />
                    <h4>Guilherme Araújo</h4>
                    <p>Desenvolvedor Fullstack</p>
                  </div>
                  <div className="col-md-6 col-lg-3 team-member">
                    <img
                      src="https://ui-avatars.com/api/?name=Guilherme+Silva&background=90c28d&color=fff&size=150"
                      alt="Guilherme Silva"
                    />
                    <h4>Guilherme Silva</h4>
                    <p>Desenvolvedor Fullstack</p>
                  </div>
                </div>
              </section>

              <hr className="my-5 d-print-none" />

              <div className="text-center d-print-none">
                <p className="text-muted mb-4 fs-5">
                  Quer fazer parte da nossa história?
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
                  Criar uma Conta
                </Link>
              </div>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
