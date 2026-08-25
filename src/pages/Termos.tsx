import { useNavigate, Link } from "react-router-dom";

export function Termos() {
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
              Termos de Uso do Active Age
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
                    className="bi bi-check2-square me-2"
                    aria-hidden="true"
                  ></i>
                  1. Aceitação dos Termos
                </h2>
                <p>
                  Ao acessar ou usar a plataforma Active Age ("Plataforma"),
                  você concorda em cumprir e estar vinculado a estes Termos de
                  Uso ("Termos"). Se você não concorda com qualquer parte destes
                  Termos, você não deve usar a Plataforma.
                </p>
              </section>

              <section className="content-section">
                <h2>
                  <i className="bi bi-heart-pulse me-2" aria-hidden="true"></i>
                  2. Serviços Oferecidos
                </h2>
                <p>
                  A Active Age é uma plataforma que conecta pacientes (e seus
                  cuidadores) a médicos geriatras para teleconsultas. A
                  Plataforma facilita o agendamento, a realização das consultas
                  por vídeo e o gerenciamento de perfis.
                </p>
                <ul>
                  <li>
                    <strong>Para Pacientes/Cuidadores:</strong> Busca de
                    médicos, agendamento de consultas, realização de
                    teleconsultas, histórico de agendamentos.
                  </li>
                  <li>
                    <strong>Para Médicos Geriatras:</strong> Criação de perfil
                    profissional, definição de disponibilidade, gerenciamento de
                    agenda, realização de teleconsultas.
                  </li>
                </ul>
              </section>

              <section className="content-section">
                <h2>
                  <i className="bi bi-person-vcard me-2" aria-hidden="true"></i>
                  3. Cadastro e Contas de Usuário
                </h2>
                <h3>3.1. Elegibilidade</h3>
                <p>
                  Para utilizar a Plataforma, você deve ter no mínimo 18 anos de
                  idade ou ser um cuidador legalmente responsável pelo paciente.
                  Médicos devem possuir registro ativo em seu respectivo
                  conselho regional de medicina.
                </p>
                <h3>3.2. Informações de Cadastro</h3>
                <p>
                  Você concorda em fornecer informações precisas, completas e
                  atualizadas durante o processo de cadastro e em manter essas
                  informações sempre atualizadas.
                </p>
              </section>

              <section className="content-section">
                <h2>
                  <i className="bi bi-camera-video me-2" aria-hidden="true"></i>
                  4. Teleconsultas
                </h2>
                <h3>4.1. Natureza do Serviço</h3>
                <p>
                  A Active Age facilita a comunicação entre pacientes e médicos,
                  mas não é uma provedora de serviços médicos. A relação
                  médico-paciente é estabelecida diretamente entre o médico e o
                  paciente.
                </p>
                <h3>4.2. Responsabilidades</h3>
                <ul>
                  <li>
                    <strong>Médicos:</strong> São responsáveis pela qualidade do
                    atendimento, pela precisão das informações médicas
                    fornecidas e pelo cumprimento de todas as regulamentações
                    profissionais e éticas.
                  </li>
                  <li>
                    <strong>Pacientes/Cuidadores:</strong> São responsáveis por
                    fornecer informações de saúde precisas e completas ao médico
                    e por garantir um ambiente adequado para a teleconsulta.
                  </li>
                </ul>
                <h3>4.3. Cancelamento e Remarcação</h3>
                <p>
                  As políticas de cancelamento e remarcação de teleconsultas são
                  definidas na Regra de Negócio RN002. Cancelamentos com menos
                  de 24 horas de antecedência podem estar sujeitos a condições
                  específicas e devem ser tratados diretamente.
                </p>
              </section>

              <section className="content-section">
                <h2>
                  <i className="bi bi-shield-lock me-2" aria-hidden="true"></i>
                  5. Privacidade e Dados Pessoais
                </h2>
                <p>
                  A sua privacidade é muito importante para nós. A coleta, uso e
                  proteção dos seus dados pessoais são regidos pela nossa{" "}
                  <Link to="/privacidade">Política de Privacidade</Link>. Ao
                  aceitar estes Termos, você também concorda com os termos da
                  nossa Política de Privacidade.
                </p>
              </section>

              <section className="content-section">
                <h2>
                  <i
                    className="bi bi-person-exclamation me-2"
                    aria-hidden="true"
                  ></i>
                  6. Conduta do Usuário
                </h2>
                <p>
                  Você concorda em usar a Plataforma de forma ética, respeitosa
                  e em conformidade com todas as leis e regulamentos aplicáveis.
                  É proibido:
                </p>
                <ul>
                  <li>Publicar conteúdo ilegal, difamatório ou ofensivo.</li>
                  <li>Violar direitos de propriedade intelectual.</li>
                  <li>
                    Realizar atividades que possam prejudicar a Plataforma ou
                    outros usuários.
                  </li>
                </ul>
              </section>

              <section className="content-section">
                <h2>
                  <i
                    className="bi bi-exclamation-triangle me-2"
                    aria-hidden="true"
                  ></i>
                  7. Limitação de Responsabilidade
                </h2>
                <p>
                  A Active Age se esforça para manter a Plataforma segura e
                  funcional, mas não garante que estará sempre livre de erros ou
                  interrupções. Não nos responsabilizamos por diagnósticos ou
                  tratamentos resultantes das teleconsultas, pois somos apenas o
                  facilitador da conexão.
                </p>
              </section>

              <section className="content-section">
                <h2>
                  <i
                    className="bi bi-pencil-square me-2"
                    aria-hidden="true"
                  ></i>
                  8. Modificações dos Termos
                </h2>
                <p>
                  Reservamo-nos o direito de modificar estes Termos a qualquer
                  momento. Notificaremos você sobre quaisquer alterações
                  significativas. O uso continuado da Plataforma após as
                  modificações constitui sua aceitação dos novos Termos.
                </p>
              </section>

              <section className="content-section">
                <h2>
                  <i className="bi bi-book me-2" aria-hidden="true"></i>9.
                  Disposições Gerais
                </h2>
                <p>
                  Estes Termos são regidos pelas leis da República Federativa do
                  Brasil. Qualquer disputa relacionada a estes Termos será
                  submetida aos tribunais competentes do Brasil.
                </p>
              </section>

              <section className="content-section">
                <h2>
                  <i className="bi bi-envelope me-2" aria-hidden="true"></i>10.
                  Contato
                </h2>
                <p>
                  Para quaisquer dúvidas sobre estes Termos, entre em contato
                  conosco através do e-mail:{" "}
                  <a href="mailto:suporte@activeage.com">
                    suporte@activeage.com
                  </a>
                  .
                </p>
              </section>

              <hr className="my-5 d-print-none" />

              <div className="text-center d-print-none">
                <p className="text-muted mb-4 fs-5">
                  Obrigado por ler nossos Termos de Uso.
                </p>
                <button
                  onClick={handleGoBack}
                  className="btn btn-primary btn-lg px-4 me-md-3 mb-3 mb-md-0"
                >
                  <i className="bi bi-arrow-left me-2" aria-hidden="true"></i>{" "}
                  Voltar
                </button>
                <Link
                  to="/cadastro"
                  className="btn btn-outline-secondary btn-lg px-4"
                >
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
