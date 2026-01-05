# Copilot Instructions for CortexVr

Overview
- Pequeno app frontend React + TypeScript (Vite + Tailwind) para sincronização de vídeos em dispositivos VR.

Arquitetura (visão rápida)
- `src/pages/` : páginas principais (Index, Admin, VRPlayer).
- `src/components/` : componentes reutilizáveis. Há subpastas `admin/` e `ui/`.
- `src/hooks/` : hooks personalizados (ex.: `useSyncState.ts` gerencia estado de sincronização).
- `src/lib/` : utilitários compartilhados.

PWA - o que fiz e como seguir
- O projeto agora usa `vite-plugin-pwa` (configurado em `vite.config.ts`) para gerar o Service Worker e manifest em tempo de build.
- Registro do SW é feito a partir do app: `src/pwa/registerServiceWorker.ts` e chamado em `src/main.tsx`.
- Arquivos estáticos do PWA: `public/manifest.json` e `public/icons/*`.

Como rodar localmente (útil para desenvolvimento PWA)
- Instalar dependências:

  npm install

- Rodar dev server:

  npm run dev

- Gerar build (gera SW/asset hashes):

  npm run build

- Testar build (preview):

  npm run preview

Padrões e convenções específicos do projeto
- State: prefira hooks em `src/hooks/`. `useSyncState.ts` é exemplo de hook central para sincronização.
- Componentes: mantenha `admin/*` separados de `ui/*`. Novos componentes globais vão em `src/components/`.
- Alias: `@` aponta para `src` (ver `vite.config.ts`). Use `import X from '@/path'`.

Integrações e pontos a observar
- Vídeos e playback: `src/components/VideoPlayer.tsx` é ponto central; mensagens de sincronização vêm de APIs externas (ver `src/hooks/useSyncState.ts`).
- PWA: o plugin gerará SW. Evite manter `public/sw.js` com lógica custom (o plugin passa a gerenciar o SW). Se precisar de lógica custom, use `workbox` ou `injectManifest` via o plugin.

Notas operacionais para agentes
- Evite reformatação ampla — siga o estilo existente em arquivos modificados.
- Ao adicionar dependências, atualize `package.json` e documente o comando `npm install` no comentário de PR.
- Teste alterações de PWA com `npm run build` + `npm run preview` e abra no navegador (ou `npx serve dist`) para verificar instalação/offline.

Arquivos chave para editar/configurar
- [vite.config.ts](vite.config.ts) — plugin PWA, alias `@`.
- [src/main.tsx](src/main.tsx) — ponto de registro do SW.
- [src/pwa/registerServiceWorker.ts](src/pwa/registerServiceWorker.ts) — helper para registrar SW.
- [public/manifest.json](public/manifest.json) — metadados de instalação.
- [public/icons/](public/icons/) — ícones usados pelo manifest.

Se algo estiver ambíguo, pergunte ao mantenedor qual plataforma priorizar (Android/desktop/iOS) antes de mudar formatos de ícone ou estratégias de cache.