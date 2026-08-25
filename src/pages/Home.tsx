import { Link } from "react-router-dom";

export function Home() {
  return (
    <main>
      <section className="hero-section py-5 py-md-5 text-center text-md-start">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 mb-4 mb-md-0">
              <h1
                className="display-3 fw-bold mb-3"
                style={{ color: "var(--aa-brown)" }}
              >
                Cuidado Geriátrico na Palma da Sua Mão.
              </h1>
              <p
                className="lead mb-4 fs-4"
                style={{ color: "var(--aa-brown)" }}
              >
                Encontre geriatras especializados e tenha o cuidado que você
                precisa, de forma simples e segura.
              </p>
              <Link
                to="/cadastro"
                className="btn btn-primary btn-lg px-5 py-3 fs-5"
              >
                Comece Agora <i className="bi bi-arrow-right ms-2"></i>
              </Link>
            </div>
            <div className="col-md-6 text-center">
              <img
                src="/hero-image.png"
                className="img-fluid rounded-circle shadow-lg"
                alt="Pessoas felizes conversando em teleconsulta"
                style={{
                  maxHeight: "500px",
                  objectFit: "cover",
                  border: "8px solid white",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="features-section py-5 pb-5 bg-white">
        <div className="container mb-5">
          <h2
            className="text-center mb-5 fw-bold"
            style={{ color: "var(--aa-brown)" }}
          >
            Por que escolher o Active Age?
          </h2>
          <div className="row g-4 text-center mt-3">
            <div className="col-md-4 px-4">
              <div className="mb-4">
                <i
                  className="bi bi-person-fill-check display-3"
                  style={{ color: "var(--aa-orange)" }}
                ></i>
              </div>
              <h3 className="fs-4 fw-bold" style={{ color: "var(--aa-brown)" }}>
                Especialistas Validados
              </h3>
              <p className="lead text-muted">
                Médicos geriatras com CRM verificado para sua total segurança e
                confiança.
              </p>
            </div>
            <div className="col-md-4 px-4">
              <div className="mb-4">
                <i
                  className="bi bi-calendar-check-fill display-3"
                  style={{ color: "var(--aa-green)" }}
                ></i>
              </div>
              <h3 className="fs-4 fw-bold" style={{ color: "var(--aa-brown)" }}>
                Agendamento Simplificado
              </h3>
              <p className="lead text-muted">
                Marque consultas de telemedicina em poucos cliques, sem
                burocracia.
              </p>
            </div>
            <div className="col-md-4 px-4">
              <div className="mb-4">
                <i
                  className="bi bi-camera-video-fill display-3"
                  style={{ color: "var(--aa-orange)" }}
                ></i>
              </div>
              <h3 className="fs-4 fw-bold" style={{ color: "var(--aa-brown)" }}>
                Teleconsulta Segura
              </h3>
              <p className="lead text-muted">
                Plataforma integrada para videochamadas com privacidade e
                qualidade.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section py-5 text-center shadow-inner">
        <div className="container py-4">
          <h2 className="display-5 fw-bold mb-4 text-white">
            Pronto para Transformar o Cuidado?
          </h2>
          <p className="lead mb-5 fs-4 text-white">
            Junte-se ao Active Age e garanta uma vida mais saudável e conectada.
          </p>
          <Link
            to="/cadastro"
            className="btn btn-primary btn-lg px-5 py-3 fs-4 shadow"
          >
            Cadastre-se Gratuitamente
          </Link>
        </div>
      </section>
    </main>
  );
}
