# 🩺 Active Age — Consultório Virtual & Telemedicina para a Terceira Idade

<p align="center">
  <img src="public/logo.png" alt="Active Age Logo" width="180" />
</p>

<p align="center">
  <strong>Plataforma moderna e acessível de telemedicina focada na terceira idade e gestão completa de consultório virtual para médicos especialistas.</strong>
</p>

<p align="center">
  <a href="https://active-age-frontend.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel" alt="Vercel Deploy" />
  </a>
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8-purple?style=for-the-badge&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Bootstrap-5.3-purple?style=for-the-badge&logo=bootstrap" alt="Bootstrap 5" />
</p>

---

## 🌐 Demonstração Online

Acesse o projeto em produção:  
👉 **[https://active-age-frontend.vercel.app](https://active-age-frontend.vercel.app)**

---

## 💡 Sobre o Projeto

O **Active Age** é uma solução de saúde digital desenvolvida com foco na acessibilidade para o público idoso e na praticidade de atendimento para profissionais de saúde. A plataforma une:
1. **Atendimento Humanizado para o Idoso:** Telas intuitivas, botões grandes e teleconsulta acessível com um clique.
2. **Consultório Virtual Completo para Médicos:** Planos de assinatura, prontuário eletrônico, emissão de documentos médicos digitais (receitas e atestados) e agenda personalizada.
3. **Auditoria e Segurança:** Central de validação de CRM e conformidade com as normas do CFM e LGPD.

---

## ✨ Principais Funcionalidades

### 🩺 Para Médicos & Especialistas
- **Planos de Consultório:** Assinatura mensal e anual com checkout integrado via Mercado Pago (PIX e Cartão).
- **Extrato Financeiro & Faturas:** Acompanhamento de faturas, recibos eletrônicos de quitação com impressão e gestão de pagamentos pendentes.
- **Agenda Inteligente:** Criação e liberação de horários livres de atendimento com confirmação automática.
- **Prontuário & Documentos:** Emissão de receitas médicas digitais, laudos e atestados timbrados e validados.
- **Sala de Teleconsulta HD:** Sala de videoconferência ao vivo com áudio, vídeo e chat via WebRTC (**ZegoCloud**).

### 👴 Para Pacientes
- **Busca de Médicos:** Filtro por especialidade, localização e disponibilidade.
- **Agendamento Descomplicado:** Escolha de data e horário com interface simplificada.
- **Central de Exames:** Acompanhamento e histórico de laudos e exames médicos.
- **Perfil Acessível:** Visualização do histórico de consultas e orientações médicas.

### 🛡️ Painel Administrativo
- **Central de Validação de CRM:** Auditoria e aprovação cadastral de novos médicos com checagem junto ao CFM.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend Core:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Roteamento:** [React Router DOM v7](https://reactrouter.com/)
- **Estilização & UI:** [Bootstrap 5](https://getbootstrap.com/), [Bootstrap Icons](https://icons.getbootstrap.com/), Vanilla CSS com Variáveis Customizadas
- **Comunicação em Tempo Real:** [@zegocloud/zego-uikit-prebuilt](https://www.zegocloud.com/) *(Videoconferência)*
- **Pagamentos & Checkout:** Simulação interativa [Mercado Pago](https://www.mercadopago.com.br/) (PIX dinâmico com QR Code e Cartões)
- **Alertas e Notificações:** [SweetAlert2](https://sweetalert2.github.io/)
- **HTTP Client:** [Axios](https://axios-http.com/)


## 📁 Estrutura de Pastas

```bash
active-age-frontend/
├── public/                  # Arquivos estáticos e logotipos
├── src/
│   ├── assets/              # Ícones e recursos visuais
│   ├── components/          # Componentes reutilizáveis
│   │   ├── admin/           # Telas de validação administrativa
│   │   ├── pagamento/       # Modal de Checkout Mercado Pago
│   │   ├── Footer.tsx       # Rodapé global
│   │   ├── Navbar.tsx       # Barra de navegação com perfil
│   │   └── ScrollToTop.tsx  # Scroll suave ao mudar de rota
│   ├── pages/               # Páginas e rotas da aplicação
│   │   ├── Home.tsx
│   │   ├── Login.tsx / Cadastro.tsx
│   │   ├── Dashboard.tsx
│   │   ├── PlanosMedico.tsx
│   │   ├── ExtratoAssinaturas.tsx
│   │   ├── AgendaMedico.tsx / AgendarConsulta.tsx
│   │   ├── SalaTeleconsulta.tsx
│   │   ├── DocumentoMedico.tsx
│   │   ├── BuscaMedicos.tsx / PerfilMedicoPublico.tsx
│   │   └── AdminValidacoes.tsx
│   ├── App.tsx              # Mapa central de rotas
│   ├── main.tsx             # Ponto de entrada da aplicação
│   └── index.css            # Estilos globais e tokens de cores
├── package.json             # Dependências e scripts
└── vite.config.ts           # Configurações do Vite
```

---

## 🔒 Segurança e Privacidade

- **LGPD:** A plataforma foi projetada seguindo as diretrizes da Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018).
- **Normas CFM:** Adequada aos padrões éticos e técnicos para a prática de Telemedicina no Brasil.

---

## 📄 Licença

Este projeto é desenvolvido para fins educacionais e de inovação em saúde digital.

---

<p align="center">
  Feito com 💚 pela equipe <strong>Active Age</strong>.
</p>