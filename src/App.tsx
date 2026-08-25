import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { Privacidade } from "./pages/Privacidade";
import { Termos } from "./pages/Termos";
import { Servicos } from "./pages/Servicos";
import { QuemSomos } from "./pages/QuemSomos";
import { Cadastro } from "./pages/Cadastro";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { EsqueceuSenha } from "./pages/EsqueceuSenha";
import { Perfil } from "./pages/Perfil";
import { BuscaMedicos } from "./pages/BuscaMedicos";
import { AgendaMedico } from "./pages/AgendaMedico";
import { AgendarConsulta } from "./pages/AgendarConsulta";
import { SalaTeleconsulta } from "./pages/SalaTeleconsulta";
import { ExamesPaciente } from "./pages/ExamesPaciente";
import { DocumentoMedico } from './pages/DocumentoMedico';
import { PerfilMedicoPublico } from './pages/PerfilMedicoPublico';
import { AdminValidacoes } from './pages/AdminValidacoes';
import { PlanosMedico } from './pages/PlanosMedico';
import { ExtratoAssinaturas } from './pages/ExtratoAssinaturas';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/privacidade" element={<Privacidade />} />
        <Route path="/termos" element={<Termos />} />
        <Route path="/servicos" element={<Servicos />} />
        <Route path="/quem-somos" element={<QuemSomos />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/esqueceu-senha" element={<EsqueceuSenha />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/busca" element={<BuscaMedicos />} />
        <Route path="/agenda-medico" element={<AgendaMedico />} />
        <Route path="/agendar/:medicoId" element={<AgendarConsulta />} />
        <Route path="/sala/:agendamentoId" element={<SalaTeleconsulta />} />
        <Route path="/exames" element={<ExamesPaciente />} />
        <Route path="/documento/:agendamentoId/:tipo" element={<DocumentoMedico />} />
        <Route path="/medico/:medicoId" element={<PerfilMedicoPublico />} />
        <Route path="/admin" element={<AdminValidacoes />} />
        <Route path="/admin/validacoes" element={<AdminValidacoes />} />
        <Route path="/planos-medico" element={<PlanosMedico />} />
        <Route path="/consultorio-virtual" element={<PlanosMedico />} />
        <Route path="/planos" element={<PlanosMedico />} />
        <Route path="/extrato-assinaturas" element={<ExtratoAssinaturas />} />
        <Route path="/minhas-assinaturas" element={<ExtratoAssinaturas />} />
        <Route path="/admin/assinaturas" element={<ExtratoAssinaturas />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
