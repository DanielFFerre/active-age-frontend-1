import { useNavigate, Link } from "react-router-dom";

export function Privacidade() {
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
              Política de Privacidade (TCLE)
            </h1>
            <p className="lead text-muted">
              Última atualização: 10 de Novembro de 2025
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
                  Imprimir Documento
                </button>
              </div>

              <section className="content-section">
                <h2>
                  <i
                    className="bi bi-file-earmark-check me-2"
                    aria-hidden="true"
                  ></i>
                  1. Introdução (Seu Consentimento)
                </h2>
                <p>
                  Bem-vindo ao Active Age. Esta Política de Privacidade também
                  funciona como seu{" "}
                  <strong>
                    Termo de Consentimento Livre e Esclarecido (TCLE)
                  </strong>{" "}
                  para o uso da plataforma de telessaúde. Ao criar uma conta e
                  aceitar estes termos, você (Paciente/Cuidador ou Médico
                  Geriatra) declara que leu, compreendeu e concorda com a
                  coleta, uso e tratamento dos seus dados pessoais e dados
                  sensíveis de saúde, conforme descrito abaixo e em conformidade
                  com a Lei Geral de Proteção de Dados (LGPD, Lei nº
                  13.709/2018).
                </p>
              </section>

              <section className="content-section">
                <h2>
                  <i className="bi bi-database me-2" aria-hidden="true"></i>2.
                  Quais Dados Coletamos?
                </h2>
                <p>
                  Coletamos diferentes tipos de dados para operar a plataforma e
                  fornecer os serviços de teleconsulta:
                </p>
                <h3>2.1. Dados Pessoais de Cadastro (Todos os Usuários)</h3>
                <ul>
                  <li>
                    Nome completo, e-mail, telefone, senha (criptografada).
                  </li>
                </ul>
                <h3>2.2. Dados Pessoais (Paciente/Cuidador)</h3>
                <ul>
                  <li>
                    Data de nascimento, CPF, e informações fornecidas
                    voluntariamente (como observações no agendamento).
                  </li>
                </ul>
                <h3>2.3. Dados Profissionais e Sensíveis (Médico Geriatra)</h3>
                <ul>
                  <li>
                    Número do CRM, cópia de documentos de identidade
                    profissional (para verificação).
                  </li>
                  <li>
                    Biografia, especialidades e horários de disponibilidade.
                  </li>
                </ul>
                <h3>2.4. Dados Sensíveis de Saúde (Durante a Consulta)</h3>
                <p>
                  A Active Age não grava as teleconsultas. No entanto, o
                  conteúdo da conversa entre paciente e médico é considerado um
                  dado sensível de saúde. A plataforma apenas fornece o canal
                  seguro (criptografado) para essa comunicação. Qualquer
                  anotação feita pelo médico é de responsabilidade do
                  profissional, seguindo seu código de ética e a LGPD.
                </p>
              </section>

              <section className="content-section">
                <h2>
                  <i className="bi bi-gear me-2" aria-hidden="true"></i>3. Como
                  Usamos Seus Dados?
                </h2>
                <p>
                  Seus dados são usados estritamente para as seguintes
                  finalidades:
                </p>
                <ul>
                  <li>
                    <strong>Operar a Plataforma:</strong> Criar sua conta,
                    autenticar seu login e permitir que você use as
                    funcionalidades.
                  </li>
                  <li>
                    <strong>Verificar Médicos:</strong> Usamos os documentos do
                    médico para validar seu perfil, garantindo a segurança de
                    todos os usuários.
                  </li>
                  <li>
                    <strong>Facilitar o Agendamento:</strong> Compartilhar os
                    dados necessários com o médico (ou paciente) para que a
                    consulta possa ser marcada.
                  </li>
                  <li>
                    <strong>Realizar a Teleconsulta:</strong> Estabelecer a
                    conexão de vídeo segura.
                  </li>
                  <li>
                    <strong>Comunicação:</strong> Enviar notificações essenciais
                    sobre seus agendamentos.
                  </li>
                </ul>
              </section>

              <section className="content-section">
                <h2>
                  <i className="bi bi-share me-2" aria-hidden="true"></i>4. Com
                  Quem Compartilhamos Seus Dados?
                </h2>
                <p>
                  A sua privacidade é a nossa prioridade. O compartilhamento de
                  dados é restrito:
                </p>
                <ul>
                  <li>
                    Seus dados de paciente são compartilhados apenas com o
                    médico que você escolheu agendar.
                  </li>
                  <li>
                    Seus dados de médico são compartilhados publicamente na
                    plataforma (após aprovação).
                  </li>
                  <li>
                    Seus documentos de verificação são acessíveis apenas pelos
                    Administradores da Active Age.
                  </li>
                  <li>
                    Nunca compartilharemos seus dados pessoais ou de saúde com
                    terceiros para fins de marketing sem seu consentimento
                    explícito.
                  </li>
                </ul>
              </section>

              <section className="content-section">
                <h2>
                  <i className="bi bi-shield-lock me-2" aria-hidden="true"></i>
                  5. Segurança dos Dados
                </h2>
                <p>
                  Levamos a segurança a sério. Todas as comunicações com a
                  plataforma são criptografadas (HTTPS). Senhas e dados
                  sensíveis armazenados no banco de dados utilizam criptografia
                  robusta. A videochamada utiliza um canal seguro para proteger
                  a confidencialidade da consulta.
                </p>
              </section>

              <section className="content-section">
                <h2>
                  <i
                    className="bi bi-person-lines-fill me-2"
                    aria-hidden="true"
                  ></i>
                  6. Seus Direitos (LGPD)
                </h2>
                <p>Como titular dos dados, você tem o direito de:</p>
                <ul>
                  <li>
                    Acessar seus dados a qualquer momento (através da página
                    "Meu Perfil").
                  </li>
                  <li>Corrigir dados incompletos ou desatualizados.</li>
                  <li>
                    Solicitar a exclusão da sua conta e de seus dados pessoais.
                  </li>
                  <li>Revogar seu consentimento a qualquer momento.</li>
                </ul>
              </section>

              <section className="content-section">
                <h2>
                  <i className="bi bi-envelope-at me-2" aria-hidden="true"></i>
                  7. Contato (Encarregado de Dados)
                </h2>
                <p>
                  Para exercer seus direitos ou tirar dúvidas, entre em contato
                  com nosso Encarregado de Proteção de Dados (DPO) através do
                  e-mail:{" "}
                  <a href="mailto:privacidade@activeage.com">
                    privacidade@activeage.com
                  </a>
                  .
                </p>
              </section>

              <hr className="my-5 d-print-none" />

              <div className="text-center d-print-none">
                <p className="text-muted mb-4 fs-5">
                  Obrigado por ler nossa política.
                </p>
                <button
                  onClick={handleGoBack}
                  className="btn btn-primary btn-lg px-4 me-md-3 mb-3 mb-md-0"
                >
                  <i className="bi bi-arrow-left me-2" aria-hidden="true"></i>{" "}
                  Voltar
                </button>
                <Link to="/" className="btn btn-outline-secondary btn-lg px-4">
                  <i className="bi bi-house me-2" aria-hidden="true"></i> Ir
                  para a Home
                </Link>
              </div>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
