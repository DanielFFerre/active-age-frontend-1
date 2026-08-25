import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

interface Exame {
  id: string;
  nome: string;
  dataRealizacao: string;
  arquivoBase64: string;
  tipoArquivo: string;
}

export function ExamesPaciente() {
  const navigate = useNavigate();
  const [pacienteId, setPacienteId] = useState("");
  const [exames, setExames] = useState<Exame[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [nomeExame, setNomeExame] = useState("");
  const [dataRealizacao, setDataRealizacao] = useState("");
  const [arquivoBase64, setArquivoBase64] = useState("");
  const [tipoArquivo, setTipoArquivo] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("activeAgeUser");
    if (!userStr) {
      navigate("/login");
      return;
    }
    const user = JSON.parse(userStr);
    if (user.tipo !== "PACIENTE") {
      navigate("/dashboard");
      return;
    }
    setPacienteId(user.id);
    carregarExames(user.id);
  }, [navigate]);

  const carregarExames = async (id: string) => {
    try {
      const res = await fetch(
        `https://active-age-backend.onrender.com/api/exames/paciente/${id}`,
      );
      if (res.ok) {
        const data = await res.json();
        setExames(data);
      }
    } catch (error) {
      console.error("Erro ao carregar exames", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire(
          "Arquivo muito grande",
          "O exame deve ter no máximo 5MB.",
          "warning",
        );
        e.target.value = "";
        return;
      }
      setTipoArquivo(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setArquivoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arquivoBase64) {
      Swal.fire("Atenção", "Selecione um arquivo de exame.", "warning");
      return;
    }

    setIsUploading(true);
    try {
      const res = await fetch(
        `https://active-age-backend.onrender.com/api/exames/paciente/${pacienteId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: nomeExame,
            dataRealizacao,
            arquivoBase64,
            tipoArquivo,
          }),
        },
      );

      if (res.ok) {
        Swal.fire("Sucesso!", "Exame enviado com segurança.", "success");
        setNomeExame("");
        setDataRealizacao("");
        setArquivoBase64("");
        setTipoArquivo("");
        (document.getElementById("fileInput") as HTMLInputElement).value = "";
        carregarExames(pacienteId);
      } else {
        Swal.fire("Erro", "Falha ao enviar o exame.", "error");
      }
    } catch (error) {
      Swal.fire("Erro", "Servidor offline.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const deletarExame = async (id: string) => {
    Swal.fire({
      title: "Excluir exame?",
      text: "Os médicos não terão mais acesso a este arquivo.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Sim, excluir",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`https://active-age-backend.onrender.com/api/exames/${id}`, {
            method: "DELETE",
          });
          if (res.ok) {
            setExames((prev) => prev.filter((e) => e.id !== id));
            Swal.fire("Excluído!", "O exame foi removido.", "success");
          }
        } catch (error) {
          Swal.fire("Erro", "Não foi possível excluir.", "error");
        }
      }
    });
  };

  if (isLoading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );

  return (
    <main className="container my-5 pb-5">
      <header className="mb-5 pb-3 border-bottom">
        <Link to="/dashboard" className="btn btn-outline-secondary mb-3">
          <i className="bi bi-arrow-left me-2"></i>Voltar para o Painel
        </Link>
        <h1 className="fw-bold mb-1" style={{ color: "var(--aa-brown)" }}>
          Meus Exames
        </h1>
        <p className="fs-5 text-muted mb-0">
          Faça upload dos seus exames anteriores para os médicos avaliarem.
        </p>
      </header>

      <div className="row g-4">
        <div className="col-lg-4">
          <div
            className="card shadow-sm border-0"
            style={{
              borderRadius: "15px",
              borderTop: "5px solid var(--aa-green)",
            }}
          >
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4" style={{ color: "var(--aa-brown)" }}>
                <i className="bi bi-cloud-arrow-up-fill me-2 text-primary"></i>
                Novo Exame
              </h5>
              <form onSubmit={handleUpload}>
                <div className="mb-3">
                  <label className="form-label text-muted fw-bold small">
                    Qual o nome do exame?
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: Hemograma Completo"
                    required
                    value={nomeExame}
                    onChange={(e) => setNomeExame(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted fw-bold small">
                    Data de Realização
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    required
                    value={dataRealizacao}
                    onChange={(e) => setDataRealizacao(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label text-muted fw-bold small">
                    Arquivo (PDF ou Imagem)
                  </label>
                  <input
                    type="file"
                    id="fileInput"
                    className="form-control"
                    accept=".pdf, image/*"
                    required
                    onChange={handleFileChange}
                  />
                  <div className="form-text">Tamanho máximo: 5MB</div>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100 fw-bold shadow-sm"
                  disabled={isUploading}
                >
                  {isUploading ? "Enviando..." : "Enviar Arquivo"}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div
            className="card shadow-sm border-0 h-100"
            style={{ borderRadius: "15px" }}
          >
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4" style={{ color: "var(--aa-brown)" }}>
                <i className="bi bi-file-earmark-medical me-2"></i>Histórico de
                Exames
              </h5>

              {exames.length === 0 ? (
                <div className="text-center py-5 bg-light rounded border">
                  <i className="bi bi-folder2-open fs-1 text-muted opacity-50 mb-3 d-block"></i>
                  <h5 className="fw-bold text-muted mb-0">
                    Nenhum exame enviado ainda.
                  </h5>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {exames.map((exame) => (
                    <div
                      key={exame.id}
                      className="border rounded p-3 shadow-sm bg-white d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3"
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-light p-3 rounded text-primary">
                          <i
                            className={`bi fs-3 ${exame.tipoArquivo.includes("pdf") ? "bi-filetype-pdf text-danger" : "bi-image text-primary"}`}
                          ></i>
                        </div>
                        <div>
                          <h5 className="fw-bold text-dark mb-1">
                            {exame.nome}
                          </h5>
                          <span className="text-muted fw-semibold small">
                            <i className="bi bi-calendar-event me-1"></i>
                            Realizado em:{" "}
                            {new Date(exame.dataRealizacao).toLocaleDateString(
                              "pt-BR",
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <a
                          href={exame.arquivoBase64}
                          download={`${exame.nome}.pdf`}
                          className="btn btn-outline-primary px-3 shadow-sm fw-bold"
                        >
                          <i className="bi bi-download me-2"></i>Baixar
                        </a>
                        <button
                          className="btn btn-outline-danger px-3 shadow-sm"
                          onClick={() => deletarExame(exame.id)}
                        >
                          <i className="bi bi-trash3-fill"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
