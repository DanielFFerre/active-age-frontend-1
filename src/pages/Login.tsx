import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorLimpo = e.target.value.trim();
    setEmail(valorLimpo);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Swal.fire({
        icon: "warning",
        title: "E-mail Inválido",
        text: "Por favor, informe um e-mail válido (ex: @gmail.com).",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("https://active-age-backend.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      if (response.ok) {
        const data = await response.json();

        localStorage.setItem("activeAgeToken", data.token);
        localStorage.setItem("activeAgeUser", JSON.stringify(data.usuario));

        Swal.fire({
          icon: "success",
          title: "Bem-vindo(a)!",
          text: "Login realizado com sucesso.",
          confirmButtonColor: "var(--aa-green)",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          navigate("/dashboard");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Acesso Negado",
          text: "E-mail ou senha incorretos. Verifique seus dados e tente novamente.",
          confirmButtonColor: "var(--aa-orange)",
        });
      }
    } catch (error) {
      console.error("Erro no login:", error);
      Swal.fire({
        icon: "warning",
        title: "Sistema Indisponível",
        text: "Nossos servidores estão passando por uma instabilidade momentânea. Por favor, tente novamente em alguns instantes.",
        confirmButtonColor: "var(--aa-orange)",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8">
          <header className="text-center mb-4">
            <h1 className="fw-bold mb-3" style={{ color: "var(--aa-brown)" }}>
              Acesse sua Conta
            </h1>
            <p className="fs-5 text-muted">
              Bem-vindo(a) de volta! Insira seus dados para continuar.
            </p>
          </header>

          <article
            className="card shadow-sm border-0"
            style={{ borderRadius: "15px" }}
          >
            <div className="card-body p-4 p-md-5">
              <form onSubmit={handleSubmit}>
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    placeholder="seu@email.com"
                    required
                    value={email}
                    onChange={handleEmailChange}
                  />
                  <label htmlFor="email">E-mail</label>
                </div>

                <div className="form-floating mb-3 position-relative">
                  <input
                    type={showSenha ? "text" : "password"}
                    className="form-control pe-5"
                    id="senha"
                    placeholder="Senha"
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                  />
                  <label htmlFor="senha">Senha</label>
                  <button
                    type="button"
                    className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-secondary px-3"
                    onClick={() => setShowSenha(!showSenha)}
                    aria-label="Mostrar senha"
                  >
                    <i
                      className={`bi ${showSenha ? "bi-eye" : "bi-eye-slash"} fs-5`}
                    ></i>
                  </button>
                </div>

                <div className="d-grid gap-3 mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg py-3 fs-5 shadow-sm"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          aria-hidden="true"
                        ></span>{" "}
                        Entrando...
                      </>
                    ) : (
                      "Entrar"
                    )}
                  </button>
                  <Link
                    to="/esqueceu-senha"
                    className="text-center text-decoration-none fs-5 fw-bold"
                    style={{ color: "var(--aa-green)" }}
                  >
                    Esqueceu sua senha?
                  </Link>
                </div>
              </form>

              <hr className="my-4" />
              <p className="text-center fs-5 mb-0">
                Não tem uma conta?{" "}
                <Link
                  to="/cadastro"
                  className="text-decoration-none fw-bold"
                  style={{ color: "var(--aa-orange)" }}
                >
                  Crie sua conta aqui
                </Link>
              </p>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
