import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="text-white-50 py-5">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-4 mb-md-0">
            <h5 className="text-white mb-3">Active Age</h5>
            <p>
              Conectando cuidado e tecnologia para a saúde da terceira idade,
              com respeito e inovação.
            </p>
          </div>
          <div className="col-md-4 mb-4 mb-md-0">
            <h5 className="text-white mb-3">Links Rápidos</h5>
            <ul className="list-unstyled lh-lg">
              <li>
                <Link to="/quem-somos" className="text-white-50">
                  <i className="bi bi-chevron-right me-1 small"></i>Quem Somos
                </Link>
              </li>
              <li>
                <Link to="/servicos" className="text-white-50">
                  <i className="bi bi-chevron-right me-1 small"></i>Serviços
                </Link>
              </li>
              <li>
                <Link to="/planos-medico" className="text-white-50">
                  <i className="bi bi-chevron-right me-1 small"></i>Planos para Médicos
                </Link>
              </li>
              <li>
                <Link to="/termos" className="text-white-50">
                  <i className="bi bi-chevron-right me-1 small"></i>Termos de
                  Uso
                </Link>
              </li>
              <li>
                <Link to="/privacidade" className="text-white-50">
                  <i className="bi bi-chevron-right me-1 small"></i>Política de
                  Privacidade
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-md-4">
            <h5 className="text-white mb-3">Contato</h5>
            <ul className="list-unstyled lh-lg">
              <li>
                <i className="bi bi-envelope me-2 text-primary"></i>
                contato@activeage.com
              </li>
              <li>
                <i className="bi bi-telephone me-2 text-primary"></i>(11)
                99999-9999
              </li>
              <li>
                <i className="bi bi-geo-alt me-2 text-primary"></i>Fatec Diadema
                - SP
              </li>
            </ul>
          </div>
        </div>
        <div className="text-center mt-5 pt-4 border-top border-secondary">
          <p className="mb-0">
            &copy; 2026 Active Age. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
