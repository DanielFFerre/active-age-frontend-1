import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export function DocumentoMedico() {
  const { agendamentoId, tipo } = useParams();
  const navigate = useNavigate();
  const [agendamento, setAgendamento] = useState<any>(null);
  const [prontuario, setProntuario] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    const userStr = localStorage.getItem("activeAgeUser");
    if (!userStr) {
      navigate("/login");
      return;
    }
    const usuarioLogado = JSON.parse(userStr);

    try {
      const rota =
        usuarioLogado.tipo === "PACIENTE"
          ? `paciente/${usuarioLogado.id}`
          : `medico/${usuarioLogado.id}/todos`;
      const resAgendamento = await fetch(
        `https://active-age-backend.onrender.com/api/agendamentos/${rota}`,
      );
      if (resAgendamento.ok) {
        const agendamentos = await resAgendamento.json();
        const agendaAtual = agendamentos.find(
          (a: any) => a.id === agendamentoId,
        );
        setAgendamento(agendaAtual);

        const resProntuario = await fetch(
          `https://active-age-backend.onrender.com/api/prontuarios/agendamento/${agendamentoId}`,
        );
        if (resProntuario.ok) {
          const prt = await resProntuario.json();
          setProntuario(prt);
        } else {
          throw new Error("Documento ainda não gerado.");
        }
      }
    } catch (error) {
      Swal.fire("Erro", "Documento não encontrado.", "error").then(() =>
        navigate("/dashboard"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const imprimirPDF = () => {
    window.print();
  };

  const getTituloDocumento = () => {
    if (tipo === "receita") return "RECEITUÁRIO MÉDICO";
    if (tipo === "atestado") return "ATESTADO MÉDICO";
    if (tipo === "pedidos") return "SOLICITAÇÃO DE EXAMES";
    return "PRONTUÁRIO CLÍNICO";
  };

  if (isLoading || !agendamento || !prontuario)
    return (
      <div className="text-center py-5 mt-5">
        <div className="spinner-border text-success"></div>
      </div>
    );

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://assinaturadigital.iti.gov.br/`;

  return (
    <div className="bg-light min-vh-100 py-5 document-page">
      <div className="container mb-4 d-print-none d-flex justify-content-between align-items-center">
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate("/dashboard")}
        >
          <i className="bi bi-arrow-left me-2"></i>Voltar
        </button>
        <button
          className="btn btn-success btn-lg fw-bold shadow-sm"
          onClick={imprimirPDF}
        >
          <i className="bi bi-printer-fill me-2"></i>Salvar PDF / Imprimir
        </button>
      </div>

      <div
        className="container bg-white shadow-lg p-5 document-a4 d-flex flex-column"
        style={{ maxWidth: "800px", minHeight: "1123px" }}
      >
        <header
          className="pb-4 mb-4 d-flex justify-content-between align-items-center"
          style={{ borderBottom: "2px solid #000" }}
        >
          <div>
            <h2
              className="fw-bold mb-1"
              style={{ color: "#000", letterSpacing: "-1px" }}
            >
              Active Age
            </h2>
            <p
              className="mb-0 small text-uppercase tracking-wider"
              style={{ color: "#000" }}
            >
              Telemedicina Geriátrica
            </p>
          </div>
          <div className="text-end" style={{ color: "#000" }}>
            <h5 className="fw-bold mb-0">{agendamento.medicoNome}</h5>
            <p className="mb-0 small">
              CRM: {agendamento.medicoCrm || "Não Informado"}
            </p>
          </div>
        </header>

        <div className="text-center mb-5">
          <h3
            className="fw-bold text-uppercase"
            style={{ letterSpacing: "2px", color: "#000" }}
          >
            {getTituloDocumento()}
          </h3>
        </div>

        <section
          className="mb-5 pb-4"
          style={{ borderBottom: "1px solid #ccc", color: "#000" }}
        >
          <div className="row fs-5">
            <div className="col-12 mb-2">
              <strong>Paciente:</strong> {agendamento.pacienteNome}
            </div>
            <div className="col-6">
              <strong>Data:</strong>{" "}
              {new Date(prontuario.dataRegistro).toLocaleDateString("pt-BR")}
            </div>
          </div>
        </section>

        <section
          className="mb-5 flex-grow-1 fs-5"
          style={{ whiteSpace: "pre-wrap", lineHeight: "1.8", color: "#000" }}
        >
          {tipo === "prontuario" && (
            <>
              <p className="mb-3">
                <strong>Queixa:</strong>
                <br />
                {prontuario.queixaPrincipal}
              </p>
              <p className="mb-3">
                <strong>Diagnóstico:</strong>
                <br />
                {prontuario.diagnostico}
              </p>
              <p className="mb-3">
                <strong>Conduta:</strong>
                <br />
                {prontuario.conduta}
              </p>
            </>
          )}
          {tipo === "receita" && <p>{prontuario.receita}</p>}
          {tipo === "atestado" && <p>{prontuario.atestado}</p>}
          {tipo === "pedidos" && <p>{prontuario.pedidoExames}</p>}
        </section>

        <footer className="mt-auto">
          <div
            className="d-flex align-items-center"
            style={{
              borderTop: "2px solid #000",
              paddingTop: "15px",
              backgroundColor: "#ffffff",
            }}
          >
            <img
              src={qrCodeUrl}
              alt="QR Code Assinatura"
              style={{
                width: "120px",
                height: "120px",
                backgroundColor: "#ffffff",
                padding: "2px",
              }}
              className="me-3"
            />
            <div
              style={{
                fontSize: "0.85rem",
                lineHeight: "1.2",
                color: "#000",
                textAlign: "justify",
                backgroundColor: "#ffffff",
                padding: "5px",
              }}
            >
              Documento assinado digitalmente de acordo com a ICP-Brasil, MP
              2.200-2/2001, no sistema Active Age, por{" "}
              <strong>{agendamento.medicoNome}</strong>, certificado número de
              série {prontuario.hashAssinatura.substring(0, 15).toUpperCase()}{" "}
              em {new Date(prontuario.dataRegistro).toLocaleDateString("pt-BR")}{" "}
              e pode ser validado em https://assinaturadigital.iti.gov.br/.
              <br />
              <br />
              Código de Acesso:{" "}
              {prontuario.hashAssinatura.substring(0, 16).toUpperCase()}
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        @media print {
          body { margin: 0; padding: 0; background: white; }
          /* Esconde NavBar e Footer do seu sistema na marra */
          nav, footer:not(.mt-auto), .navbar, .d-print-none, #root > nav, #root > footer { display: none !important; }
          /* Reseta o fundo da página de documento */
          .document-page { padding: 0 !important; background: transparent !important; }
          .document-a4 { max-width: 100% !important; width: 100% !important; margin: 0 !important; padding: 20px !important; box-shadow: none !important; border: none !important; }
          /* Esconde o cabeçalho e rodapé padrão do navegador (URLs e Datas) */
          @page { margin: 0; }
        }
      `}</style>
    </div>
  );
}
