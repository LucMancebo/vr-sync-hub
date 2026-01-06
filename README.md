# CortexVr

Central de Sincronização de Vídeos para dispositivos de Realidade Virtual.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

## 📋 Descrição

O CortexVr é uma aplicação web progressiva (PWA) desenvolvida para sincronizar a reprodução de vídeos em tempo real em múltiplos dispositivos de realidade virtual. Permite o controle centralizado de bibliotecas de vídeo, upload de conteúdo e gerenciamento de dispositivos conectados via rede local.

## ✨ Funcionalidades

- **Sincronização em Tempo Real**: Controle simultâneo de reprodução em vários óculos VR
- **Painel Administrativo**: Interface para upload, gerenciamento e controle de vídeos
- **Player VR Otimizado**: Experiência imersiva para dispositivos de realidade virtual
- **Conexão LAN**: Comunicação otimizada para redes locais com baixa latência
- **PWA Suportada**: Instalável como aplicativo nativo em dispositivos móveis
- **Interface Moderna**: Design responsivo com Tailwind CSS e componentes shadcn-ui

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca para construção de interfaces
- **TypeScript** - Tipagem estática para JavaScript
- **Vite** - Ferramenta de build rápida e moderna
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn-ui** - Componentes UI acessíveis e customizáveis
- **React Router** - Roteamento para aplicações React
- **React Query** - Gerenciamento de estado e cache de dados

### Backend e Infraestrutura
- **Supabase** - Plataforma backend-as-a-service
- **BroadcastChannel API** - Comunicação entre abas/janelas para sincronização
- **Vite PWA Plugin** - Geração de service worker e manifest para PWA

### Desenvolvimento
- **ESLint** - Linting e formatação de código
- **Prettier** - Formatação automática de código
- **TypeScript Compiler** - Verificação de tipos

## 🚀 Instalação

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn

### Passos para Instalação

1. **Clone o repositório:**
   ```bash
   git clone <url-do-repositorio>
   cd cortexvr
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente (se necessário):**
   - Copie o arquivo `.env.example` para `.env`
   - Configure as credenciais do Supabase se aplicável

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Acesse a aplicação:**
   - Abra [http://localhost:5173](http://localhost:5173) no navegador

## 📖 Uso

### Para Administradores

1. Acesse o painel administrativo em `/admin`
2. Faça upload de vídeos usando a seção de upload
3. Gerencie a biblioteca de vídeos
4. Controle a reprodução em tempo real
5. Monitore dispositivos conectados

### Para Usuários VR

1. Acesse o player VR em `/vr`
2. Conecte-se automaticamente à sincronização
3. Assista aos vídeos sincronizados

## 📁 Estrutura do Projeto

```
cortexvr/
├── public/                 # Arquivos estáticos
│   ├── icons/             # Ícones da PWA
│   ├── manifest.json      # Manifest da PWA
│   └── sw.js             # Service Worker
├── src/
│   ├── components/        # Componentes reutilizáveis
│   │   ├── ui/           # Componentes base shadcn-ui
│   │   └── admin/        # Componentes específicos do admin
│   ├── hooks/            # Hooks customizados
│   │   ├── useSyncState.ts      # Estado de sincronização
│   │   └── useRealtimeSync.ts   # Sincronização em tempo real
│   ├── pages/            # Páginas da aplicação
│   │   ├── Index.tsx     # Página inicial
│   │   ├── Admin.tsx     # Painel administrativo
│   │   ├── VRPlayer.tsx  # Player VR
│   │   └── NotFound.tsx  # Página 404
│   ├── types/            # Definições de tipos TypeScript
│   ├── lib/              # Utilitários
│   └── integrations/     # Integrações externas
├── supabase/             # Configuração do Supabase
├── package.json          # Dependências e scripts
├── vite.config.ts        # Configuração do Vite
└── tailwind.config.ts    # Configuração do Tailwind
```

## 🧪 Desenvolvimento

### Scripts Disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Gera build de produção
npm run build:dev    # Gera build de desenvolvimento
npm run preview      # Visualiza build gerado
npm run lint         # Executa ESLint
npm run type-check   # Verifica tipos TypeScript
npm run format       # Formata código com Prettier
npm run check        # Executa lint, type-check e testes
```

### Boas Práticas

- Execute `npm run lint` e `npm run type-check` antes de commits
- Use `npm run format` para manter consistência no código
- Adicione testes para novas funcionalidades
- Mantenha a documentação atualizada

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

### Diretrizes

- Siga os padrões de código estabelecidos
- Adicione testes para novas funcionalidades
- Atualize a documentação conforme necessário
- Mantenha commits pequenos e descritivos

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

## 📞 Contato

Para dúvidas ou sugestões, abra uma issue no repositório ou entre em contato com a equipe de desenvolvimento.

---

**Desenvolvido por SkyX Tecnologia**
