# CLAUDE.md — site Grupo Malory (bússola)

**LEIA `README.md` PRIMEIRO.** É a fonte de verdade completa (arquitetura, fluxo, deploy, DNS, gotchas, troubleshooting).

## Regras críticas (resumo — detalhes no README)

1. **Edite `preview/index.html`, NUNCA `index.html` direto.** `index.html` = produção (live grupomalory.com/). Promova só quando aprovado: `cp preview/index.html index.html`.
2. **`index.html` e `preview/index.html` são idênticos** (paths root-absolute `/shared`, `/assets`). Mantenha assim — não use paths relativos.
3. **Deploy é automático:** `git push origin master` → Vercel publica (~30s). Repo: `MaloryGabrielOxePay/grupo-malory-concepts`.
4. **Só `.brand` é clicável.** Toda `.layer` (rose/needle/beacon) + `.dial` + `.hud` = `pointer-events:none`. Remover isso → toques morrem. NÃO teste clique com `dispatchEvent` (mente) — use `elementFromPoint` ou tap real.
5. **DNS:** IP Vercel = `76.76.21.21` (não `76.76.212.1`). NÃO mexa em MX/SPF/DKIM do Titan (e-mail).
6. **`_archive/`** = concepts velhos (v01–v10, gallery, nav). Não servidos. Não edite.
7. Idioma: pt-BR. Commits: inglês (conventional).

## Fluxo padrão
```bash
# edita preview/index.html → publica:
git add preview/index.html && git commit -m "wip: x" && git push
#   vê em grupomalory.com/preview/
# aprovou → promove:
cp preview/index.html index.html && git add index.html && git commit -m "release: x" && git push
```
