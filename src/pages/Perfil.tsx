import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const LISTA_ESPECIALIDADES = [
  "Cardiologia",
  "Neurologia",
  "Psiquiatria",
  "Ortopedia",
  "Nutrologia",
  "Oncologia",
  "Reumatologia",
  "Endocrinologia",
  "Dermatologia",
  "Pneumologia",
];

interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  tipo: "PACIENTE" | "MEDICO" | "ADMIN";
  crm?: string;
  especializacao?: string;
  biografia?: string; // NOVO CAMPO: Biografia
  statusValidacao?: "PENDENTE" | "EM_ANALISE" | "APROVADO" | "REPROVADO";
  mensagemValidacao?: string;
}

export function Perfil() {
  const navigate = useNavigate();
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [crm, setCrm] = useState("");
  const [especialidades, setEspecialidades] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [biografia, setBiografia] = useState(""); // NOVO ESTADO

  const isCrmBloqueado =
    user?.tipo === "MEDICO" &&
    (user.statusValidacao === "EM_ANALISE" ||
      user.statusValidacao === "APROVADO");

  useEffect(() => {
    const token = localStorage.getItem("activeAgeToken");
    const userStr = localStorage.getItem("activeAgeUser");
    if (!token || !userStr) {
      navigate("/login");
      return;
    }

    const usuarioLogado: Usuario = JSON.parse(userStr);
    setUser(usuarioLogado);
    setNome(usuarioLogado.nome || "");
    setEmail(usuarioLogado.email || "");
    setTelefone(usuarioLogado.telefone || "");
    setCrm(usuarioLogado.crm || "");
    setBiografia(usuarioLogado.biografia || ""); // CARREGA A BIOGRAFIA

    if (usuarioLogado.especializacao) {
      const splitted = usuarioLogado.especializacao
        .split(",")
        .map((s) => s.trim());
      setEspecialidades(
        splitted.filter((s) => s.toLowerCase() !== "geriatria" && s !== ""),
      );
    }
    setIsLoading(false);
  }, [navigate]);

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/(\d{2})(\d)/, "($1) $2");
    value = value.replace(/(\d{5})(\d{1,4})$/, "$1-$2");
    setTelefone(value);
  };

  const handleCrmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, "");
    const numeros = value.replace(/[^0-9]/g, "");
    let letras = value.replace(/[^A-Z]/g, "");
    if (letras.length > 2) letras = letras.slice(0, 2);
    if (letras.length > 0) {
      setCrm(`${numeros}/${letras}`);
    } else {
      setCrm(numeros);
    }
  };

  const handleAddEspecialidade = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val && !especialidades.includes(val)) {
      setEspecialidades([...especialidades, val]);
    }
    e.target.value = "";
  };

  const removeEspecialidade = (esp: string) => {
    setEspecialidades(especialidades.filter((item) => item !== esp));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    if (nome.trim().split(/\s+/).length < 2) {
      Swal.fire({
        icon: "warning",
        title: "Nome Incompleto",
        text: "Informe seu nome e sobrenome.",
      });
      setIsSaving(false);
      return;
    }

    const telefoneLimpo = telefone.replace(/\D/g, "");

    const payload = {
      nome,
      telefone: telefoneLimpo,
      crm: user?.tipo === "MEDICO" && !isCrmBloqueado ? crm : undefined,
      especializacao: especialidades.join(", "),
      biografia: user?.tipo === "MEDICO" ? biografia : undefined, // ENVIA A BIOGRAFIA
    };

    try {
      const res = await fetch(
        `https://active-age-backend.onrender.com/api/usuarios/perfil/${user?.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (res.ok) {
        const usuarioAtualizado = await res.json();
        localStorage.setItem(
          "activeAgeUser",
          JSON.stringify(usuarioAtualizado),
        );
        setUser(usuarioAtualizado);
        Swal.fire(
          "Atualizado!",
          "Seus dados foram salvos com sucesso.",
          "success",
        );
      } else {
        Swal.fire("Erro", "Ocorreu um problema ao atualizar.", "error");
      }
    } catch (error) {
      Swal.fire("Erro", "Servidor offline.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !user)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border"></div>
      </div>
    );

  const avatarColor =
    user.tipo === "PACIENTE"
      ? "90c28d"
      : user.tipo === "MEDICO"
        ? "e86542"
        : "5a3a2d";

  return (
    <main className="container my-5 pb-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <header className="mb-5 pb-3 border-bottom d-flex align-items-center">
            <img
              src={`https://ui-avatars.com/api/?name=${user.nome.replace(" ", "+")}&background=${avatarColor}&color=fff&size=80`}
              alt="Avatar"
              className="rounded-circle shadow-sm me-4"
              style={{ border: `3px solid #${avatarColor}` }}
            />
            <div>
              <h1 className="fw-bold mb-1" style={{ color: "var(--aa-brown)" }}>
                Meu Perfil
              </h1>
              <p className="text-muted mb-0">Gerencie suas informações.</p>
            </div>
          </header>

          {user.tipo === "MEDICO" && user.statusValidacao === "REPROVADO" && (
            <div className="alert alert-danger shadow-sm mb-4">
              <h4 className="alert-heading fw-bold">Validação Recusada</h4>
              <p>
                Motivo: <strong>"{user.mensagemValidacao}"</strong>
              </p>
            </div>
          )}

          <div
            className="card shadow-sm border-0 mb-4"
            style={{ borderRadius: "15px" }}
          >
            <div className="card-body p-4">
              <form onSubmit={handleUpdateProfile}>
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="nome"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                  <label>Nome Completo</label>
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input
                        type="email"
                        className="form-control bg-light"
                        value={email}
                        disabled
                      />
                      <label>E-mail</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input
                        type="tel"
                        className="form-control"
                        value={telefone}
                        onChange={handleTelefoneChange}
                      />
                      <label>Telefone</label>
                    </div>
                  </div>
                </div>

                {user.tipo === "MEDICO" && (
                  <div
                    className="card bg-light border-0 mb-4 p-4 mt-4"
                    style={{ borderRadius: "15px" }}
                  >
                    <div className="form-floating mb-4">
                      <input
                        type="text"
                        className={`form-control bg-white ${isCrmBloqueado ? "bg-light" : ""}`}
                        value={crm}
                        onChange={handleCrmChange}
                        disabled={isCrmBloqueado}
                      />
                      <label>CRM {isCrmBloqueado && "(Validado)"}</label>
                    </div>

                    <label className="form-label fw-bold text-muted mb-2">
                      Especialidades Médicas
                    </label>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      <span className="badge bg-secondary fs-6 py-2 shadow-sm">
                        <i className="bi bi-star-fill text-warning me-1"></i>{" "}
                        Geriatria (Padrão)
                      </span>
                      {especialidades.map((esp) => (
                        <span
                          key={esp}
                          className="badge bg-primary fs-6 py-2 shadow-sm d-flex align-items-center"
                        >
                          {esp}{" "}
                          <i
                            className="bi bi-x-circle ms-2"
                            style={{ cursor: "pointer" }}
                            onClick={() => removeEspecialidade(esp)}
                          ></i>
                        </span>
                      ))}
                    </div>
                    <select
                      className="form-select bg-white mb-4"
                      onChange={handleAddEspecialidade}
                      defaultValue=""
                    >
                      <option value="" disabled>
                        + Adicionar outra especialização
                      </option>
                      {LISTA_ESPECIALIDADES.map((esp) => (
                        <option
                          key={esp}
                          value={esp}
                          disabled={especialidades.includes(esp)}
                        >
                          {esp}
                        </option>
                      ))}
                    </select>

                    <div className="form-floating">
                      <textarea
                        className="form-control bg-white"
                        style={{ height: "120px" }}
                        value={biografia}
                        onChange={(e) => setBiografia(e.target.value)}
                        placeholder="Conte um pouco sobre sua formação e experiência..."
                      ></textarea>
                      <label>Biografia (Aparecerá no seu Perfil Público)</label>
                    </div>
                  </div>
                )}
                <div className="d-flex justify-content-end">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg px-5 shadow-sm"
                    disabled={isSaving}
                  >
                    {isSaving ? "Salvando..." : "Salvar Alterações"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
