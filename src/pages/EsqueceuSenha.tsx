import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export function EsqueceuSenha() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorLimpo = e.target.value.toLowerCase().trim();
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
      const response = await fetch(
        "https://active-age-backend.onrender.com/api/auth/recuperar-senha",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );

      if (response.ok || !response.ok) {
        Swal.fire({
          icon: "success",
          title: "E-mail Enviado!",
          text: "Se este e-mail estiver cadastrado em nossa base, você receberá um link de recuperação em alguns minutos.",
          confirmButtonColor: "var(--aa-green)",
        }).then(() => {
          navigate("/login");
        });
      }
    } catch (error) {
      console.error("Erro na recuperação:", error);
      Swal.fire({
        icon: "warning",
        title: "Sistema Indisponível",
        text: "Nossos servidores estão passando por instabilidade. Tente novamente mais tarde.",
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
              Recuperar Senha
            </h1>
            <p className="fs-5 text-muted">
              Esqueceu sua senha? Não se preocupe. Digite seu e-mail abaixo e
              enviaremos instruções para redefini-la.
            </p>
          </header>

          <article
            className="card shadow-sm border-0"
            style={{ borderRadius: "15px" }}
          >
            <div className="card-body p-4 p-md-5">
              <div className="text-center mb-4">
                <i
                  className="bi bi-envelope-paper display-1"
                  style={{ color: "var(--aa-orange)" }}
                ></i>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-floating mb-4">
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    placeholder="seu@email.com"
                    required
                    value={email}
                    onChange={handleEmailChange}
                  />
                  <label htmlFor="email">Digite seu E-mail</label>
                </div>

                <div className="d-grid gap-3">
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
                        Enviando Link...
                      </>
                    ) : (
                      "Enviar Link de Recuperação"
                    )}
                  </button>
                  <Link
                    to="/login"
                    className="btn btn-outline-secondary btn-lg py-3 fs-5 shadow-sm"
                  >
                    <i className="bi bi-arrow-left me-2"></i> Voltar para o
                    Login
                  </Link>
                </div>
              </form>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
