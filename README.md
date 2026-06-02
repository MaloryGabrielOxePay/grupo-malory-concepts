# Grupo Malory — Site (bússola)

Single-page "redirector" do holding **Grupo Malory**. Uma bússola interativa: a logo do grupo no centro, as sub-marcas e contatos dispostos como pontos cardeais. Tocar numa marca gira a agulha + acende um feixe (beacon) na cor da marca; tocar de novo abre o link.

> **Para o próximo dev / LLM:** este README é a fonte de verdade. Leia inteiro antes de editar. As armadilhas no fim (`Gotchas`) já custaram horas — não repita.

---

## 1. URLs

| O que | URL |
|---|---|
| **Produção** (home) | https://grupomalory.com  ·  https://www.grupomalory.com |
| **Preview/staging** | https://grupomalory.com/preview/ |
| Deploy direto Vercel | https://grupomalory-site.vercel.app *(ou o alias atual do projeto)* |
| Mockup dos backgrounds | https://grupomalory.com/brainstorm/ |

- **Produção e preview têm o MESMO código** (são cópias byte-a-byte). Preview existe só para validar mudanças sem derrubar a home.
- `www` → CNAME → apex → mesmo destino (Vercel).

---

## 2. Onde fica o projeto

### Local (máquina do Gabriel)
```
C:\Users\artau\.claude\projects\🥽 Agência Inteligente\Grupo Malory\output\site\v2\
```

### GitHub
```
https://github.com/MaloryGabrielOxePay/grupo-malory-concepts
```
- Branch de produção: **`master`**
- Conta: `MaloryGabrielOxePay`

### Deploy: Vercel (automático)
- Projeto: **`grupomalory-site`** (team `malorygabrieloxepays-projects`)
- GitHub ↔ Vercel ligados: **todo `git push origin master` dispara deploy automático** (~30s). Não precisa rodar `vercel` na mão.
- SSL: Let's Encrypt automático pela Vercel.

---

## 3. Estrutura de arquivos

```
v2/
├── index.html            ← 🟢 PRODUÇÃO. A bússola, servida em grupomalory.com/. NÃO editar direto.
├── preview/
│   └── index.html        ← ✏️ EDITE AQUI. Cópia idêntica da produção. Vê em /preview/.
├── shared/
│   ├── base.css          ← tokens/fontes/cores globais (Italiana, Spectral, JetBrains Mono; --canvas-deep, --paper…)
│   └── init.js           ← bootstrap GSAP + Lenis (smooth scroll). Roda em todas as páginas.
├── assets/
│   └── logos/            ← 6 PNGs com fundo transparente:
│                            grupo-malory.png, iai.png, malory-connect.png,
│                            wowlog.png, oxepay.png, malory-entretenimento-light.png
├── brainstorm/
│   └── index.html        ← página de mockup que comparou os 3 backgrounds (G1 Atlas, etc). Referência viva.
├── robots.txt            ← bloqueia /preview/ e /_archive/ de indexar no Google
├── README.md             ← este arquivo
└── _archive/             ← 🗄️ NÃO USADO em produção. Histórico. Não servir.
    ├── v01..v10/         ← os 10 concepts originais (v08 = "Vintage Compass", virou a produção)
    ├── gallery.html      ← índice antigo dos 10 concepts
    └── nav.html          ← componente morto
```

**Ignorados pelo git** (`.gitignore`): `.claude/`, `.vercel/`, `node_modules/`, OS junk.

> ⚠️ Arquivos em `_archive/` têm caminhos quebrados (não foram mantidos). São só referência histórica. Para reviver um concept, conserte os paths primeiro.

---

## 4. Arquitetura técnica

**Stack:** HTML/CSS/JS puro (sem build, sem framework). CDNs: GSAP 3.12.5 + ScrollTrigger + Lenis 1.0.42. Fontes/tokens em `shared/base.css`.

**A bússola é uma só página.** Anatomia (do fundo para a frente, por `z-index`):

| Camada | z-index | pointer-events | Papel |
|---|---|---|---|
| `.atlas` (em `.atmos`) | 0 | none | **Background geral (G1)**: curvas topográficas SVG geradas por JS, giram devagar (`atlasDrift` 100s) |
| `.grain` | 1 | none | textura de ruído sutil |
| `.beacon` (`.layer`) | 0 | **none** | **Background do clique (C1)**: feixe cônico na cor da marca, gira p/ a direção tocada |
| `.rose` (`.layer`) | auto | **none** | anel/ticks da bússola (SVG) |
| `.brand` ×8 | 20 | **auto** | 🎯 as ÚNICAS coisas clicáveis (5 marcas + 3 contatos) |
| `.needle` (`.layer`) | 25 | **none** | a agulha que gira (acima das logos de propósito) |
| `.dial` | 30 | **none** | mostrador central + logo Grupo Malory |
| `.hud` | 35 | none | nome/grau da marca selecionada |

> 🔑 **REGRA DE OURO:** só `.brand` tem `pointer-events:auto`. TODA camada decorativa (`.layer` = rose/needle/beacon, mais `.dial` e `.hud`) é `pointer-events:none`. Se isso quebrar, os toques morrem (ver Gotcha #1).

**Paths root-absolute:** `index.html` e `preview/index.html` referenciam `/shared/...` e `/assets/...` (com barra inicial). Por isso são **idênticos** e funcionam tanto em `/` quanto em `/preview/`. **Não use paths relativos** (`shared/` ou `../shared/`) — quebra a paridade preview↔prod.

**Interação (two-tap):** 1º toque numa marca = "arma" (agulha aponta + beacon acende + HUD mostra nome). 2º toque na mesma = abre o link. Tocar fora = reseta. E-mail abre `mailto:`; resto abre nova aba.

**Intro:** na 1ª visita da sessão a agulha gira ~3 voltas e trava ao norte (iAÍ). `sessionStorage('mc_intro')` evita repetir. Botão "pular intro". Há **rede de segurança** (timeout 3.5s + `visibilitychange` + tap-durante-intro) que destrava tudo se a animação travar (ver Gotcha #2).

---

## 5. Fluxo de trabalho — staging → produção

**Edite SEMPRE `preview/index.html`. Nunca `index.html` direto.**

```bash
cd "C:\Users\artau\.claude\projects\🥽 Agência Inteligente\Grupo Malory\output\site\v2"

# 1. edite preview/index.html  (no editor)

# 2. publique o preview
git add preview/index.html
git commit -m "wip: <o que mudou>"
git push origin master
#    → ~30s depois: confira em https://grupomalory.com/preview/  (celular ou desktop)

# 3. APROVOU? promova preview → produção (cópia idêntica, sem editar paths)
cp preview/index.html index.html
git add index.html
git commit -m "release: <o que mudou>"
git push origin master
#    → ~30s depois: live em https://grupomalory.com/
```

A produção só muda no passo 3. Enquanto você itera no preview, a home **não cai nem sofre interferência**.

> **Preview local (última opção, sem internet):** na pasta `v2/` rode `python -m http.server 5173` e abra `http://localhost:5173/preview/`. Precisa servir pela raiz (os paths são `/shared`, `/assets`) — **não** abra o HTML por `file://`.

---

## 6. DNS (registrador: HostGator — cPanel `br1122`)

O domínio usa os nameservers do HostGator (`ns1122/ns1123.hostgator.com.br`); os registros A/CNAME vivem no **cPanel → Editor de Zona DNS**.

| Tipo | Nome | Valor | Papel |
|---|---|---|---|
| A | `@` (grupomalory.com) | `76.76.21.21` | aponta a home p/ Vercel |
| CNAME | `www` | `grupomalory.com` | www segue o apex → Vercel |
| MX | `@` | `mx1.titan.email` (10), `mx2.titan.email` (20) | **e-mail (Titan) — NÃO MEXER** |
| TXT | `@` | `v=spf1 include:spf.titan.email ~all` | SPF do e-mail |
| TXT | `*._domainkey` / `titan1._domainkey` | (DKIM) | DKIM do e-mail |

> ⚠️ **IP da Vercel = `76.76.21.21`** (vinte-e-um ponto vinte-e-um). NÃO é `76.76.212.1` — esse erro de digitação já derrubou a zona inteira uma vez.
> Subdomínios existentes (entretenimento, dashboard, hub, lucena, tour, apoio, campanha…) e todos os registros de e-mail estão **intactos** — não apague.

---

## 7. Como editar coisas comuns (tudo em `preview/index.html`)

- **Trocar uma logo:** substitua o PNG em `assets/logos/` (mesmo nome, fundo transparente). Sem editar HTML.
- **Mudar URL de uma marca:** atribua `data-url="..."` no `<a class="brand" ...>` correspondente.
- **Mudar cor do feixe de uma marca:** atribua `data-beam="#hex"` no mesmo `<a>`. (Tabela na seção 8.)
- **Mudar texto do contato (WhatsApp/e-mail/Insta):** `data-name`, `data-deg`, `data-cta`, `data-url` no `<a class="brand contact">`.
- **Posição no círculo:** `style="--a:Ndeg"` (0=N, 45=NE, 90=L, 135=SE, 180=S, 225=SO, 270=O, 315=NO).
- **Fundo Atlas mais/menos visível:** `.atlas{ opacity }` (hoje `.18` desktop, `.15` mobile via media query).
- **Beacon mais/menos forte:** `.beacon.show{ opacity }` (hoje `.66`) e `.beacon{ filter:blur() }`.

---

## 8. Paleta dos beacons (cor por direção)

| Marca / contato | Direção | `--a` | `data-beam` |
|---|---|---|---|
| iAÍ | N | 0° | `#ffd400` |
| Malory Connect | NE | 45° | `#ff6a3d` |
| WOW Logistics | L | 90° | `#2f6bff` |
| Instagram | SE | 135° | `#e1306c` |
| E-mail | S | 180° | `#38bdf8` |
| WhatsApp | SO | 225° | `#25d366` |
| Malory Entretenimento | O | 270° | `#a855f7` |
| OxePay | NO | 315° | `#f59e0b` |

URLs atuais das marcas: iAÍ `iai.grupomalory.com` · Connect `maloryconnect.com` · WOW `wowlognow.com` · Entret. `entretenimento.grupomalory.com` · OxePay `useoxepay.com.br` · WhatsApp `wa.me/5583998060678` · E-mail `gabriel@grupomalory.com` · Insta `instagram.com/eumalory`.

---

## 9. Gotchas (lições que já custaram caro — LEIA)

1. **Toque morto = camada decorativa capturando o clique.** A `.needle` (e qualquer `.layer`) ocupa a tela inteira ACIMA das logos (z-25 > z-20). Sem `pointer-events:none` nelas, o dedo bate na agulha invisível, não na logo. **Só `.brand` é `pointer-events:auto`.** (Testar clique com `dispatchEvent` MENTE — ele ignora o que está por cima; use `document.elementFromPoint(x,y)` ou um tap de verdade.)
2. **Intro do GSAP pode travar** em aba que perde foco / rAF lento → logos invisíveis + `lock` preso → tudo morto. Por isso existe a rede de segurança (timeout 3.5s + `visibilitychange` + tap pula a intro). Não remova.
3. **`prefers-reduced-motion`:** se ligado no aparelho, a intro é pulada (ok) e antes travava o Atlas. O Atlas hoje gira mesmo com reduced-motion (escolha do dono). 
4. **DNS:** IP Vercel é `76.76.21.21`. Registros A do mesmo nome precisam de **TTL igual** (TTL misto trava a zona → SERVFAIL). Um nome com **CNAME não pode ter registro A** junto (erro "CNAME and other data"). Nunca apague MX/SPF/DKIM do Titan.
5. **Paridade preview↔prod:** mantenha os paths root-absolute (`/shared`, `/assets`). Se divergir, promover deixa de ser cópia limpa.

---

## 10. Troubleshooting rápido

| Sintoma | Causa provável | Fix |
|---|---|---|
| Toque na logo não faz nada | `.layer`/`.needle`/`.dial` sem `pointer-events:none` | restaurar regra de ouro (seção 4) |
| Logos invisíveis / página "travada" | intro do GSAP não completou | conferir rede de segurança no JS (`boot()`); hard-refresh |
| Site fora do ar (apex) | zona DNS quebrada (TTL misto / CNAME+A) | cPanel → Editor de Zona; apex = 1 só A `76.76.21.21` |
| HTTPS não sobe | cert não emitido | `vercel certs issue grupomalory.com www.grupomalory.com` |
| Mudei e não vejo | cache do navegador | hard-refresh (Ctrl+Shift+R) ou aba anônima |
| Logo com fundo preto | PNG sem transparência | exportar PNG transparente, mesmo nome |

---

## 11. NÃO FAÇA

- ❌ editar `index.html` direto (edite `preview/`, depois promova).
- ❌ usar paths relativos (`shared/`, `../shared/`) — só root-absolute (`/shared/`).
- ❌ tocar em MX/SPF/DKIM do Titan no DNS.
- ❌ trocar nameservers do domínio sem necessidade.
- ❌ remover `pointer-events:none` das camadas decorativas.
- ❌ confiar em `dispatchEvent` pra testar clique (use tap real / `elementFromPoint`).

---

*Última grande mudança: bússola vira produção · backgrounds Atlas+Beacon · fix do clique (pointer-events) · staging via `/preview/` · concepts antigos → `_archive/`.*
