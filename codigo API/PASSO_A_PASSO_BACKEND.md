# Backend Google Apps Script - Patrimônios IPDA - SP

## Estrutura

- `Code.gs`: rotas `doGet` e `doPost`
- `config.gs`: constantes, abas, cores, logo e lista de patrimônios
- `validator.gs`: validações
- `database.gs`: banco centralizado em `BASE_GERAL` e `PATRIMONIOS`
- `report.gs`: relatório sob demanda e exportação PDF
- `response.gs`: JSON padronizado
- `utils.gs`: funções auxiliares

## Abas criadas/usadas

### BASE_GERAL

`TOTVS | Região | Estadual | Dirigente | Telefone | Endereço | Data Cadastro`

### PATRIMONIOS

`TOTVS | Patrimônio | Possui | Quantidade | Conservação`

## Cadastro

O frontend pode continuar enviando os campos atuais. Se não enviar `acao`, o backend assume cadastro.

Exemplo:

```js
fetch(URL_APPS_SCRIPT, {
  method: "POST",
  body: JSON.stringify({
    totvs: "12345",
    regiao: "Sul",
    estadual: "SP",
    dirigente: "João",
    telefone: "11999999999",
    endereco: "Rua Exemplo, 100",
    violaoPossui: "Sim",
    violaoQtd: "2",
    violaoEstado: "Bom"
  })
});
```

## Gerar relatório

```js
fetch(URL_APPS_SCRIPT, {
  method: "POST",
  body: JSON.stringify({
    acao: "gerarRelatorio",
    totvs: "12345"
  })
});
```

## Exportar PDF

```js
fetch(URL_APPS_SCRIPT, {
  method: "POST",
  body: JSON.stringify({
    acao: "exportarPdf",
    totvs: "12345"
  })
});
```

## Botões sugeridos no frontend

```html
<input id="totvsRelatorio" placeholder="Código TOTVS">
<button type="button" onclick="gerarRelatorio()">Gerar Relatório</button>
<button type="button" onclick="exportarPdf()">Exportar PDF</button>
```

```js
async function gerarRelatorio() {
  const totvs = document.getElementById("totvsRelatorio").value;

  const resposta = await fetch(URL_APPS_SCRIPT, {
    method: "POST",
    body: JSON.stringify({
      acao: "gerarRelatorio",
      totvs
    })
  });

  const json = await resposta.json();

  if (json.sucesso && json.dados && json.dados.url) {
    window.open(json.dados.url, "_blank");
  } else {
    alert(json.mensagem);
  }
}

async function exportarPdf() {
  const totvs = document.getElementById("totvsRelatorio").value;

  const resposta = await fetch(URL_APPS_SCRIPT, {
    method: "POST",
    body: JSON.stringify({
      acao: "exportarPdf",
      totvs
    })
  });

  const json = await resposta.json();

  if (json.sucesso && json.dados && json.dados.url) {
    window.open(json.dados.url, "_blank");
  } else {
    alert(json.mensagem);
  }
}
```

## Deploy

1. Abra o projeto no Apps Script.
2. Crie/substitua os arquivos `.gs` com os arquivos desta pasta.
3. Salve tudo.
4. Execute manualmente uma função simples, como `doGet`, para iniciar autorização.
5. Faça o deploy como Web App.
6. Execute como: `Eu`.
7. Acesso: conforme sua necessidade. Para formulário público, use `Qualquer pessoa`.
8. Atualize a URL do frontend com a URL do Web App.

## Testes mínimos

1. Enviar cadastro novo.
2. Reenviar o mesmo TOTVS e confirmar erro de duplicidade.
3. Conferir `BASE_GERAL`.
4. Conferir `PATRIMONIOS`.
5. Gerar relatório por TOTVS.
6. Exportar PDF.

## Boas práticas

- Não criar abas permanentes por igreja.
- Usar `BASE_GERAL` como tabela de igrejas.
- Usar `PATRIMONIOS` como tabela filha.
- Manter TOTVS como chave primária.
- Criar dashboards futuros lendo as duas tabelas centrais.
- Evitar `appendRow` em loops.
- Evitar milhares de abas.
- Usar PDF sob demanda para auditoria e impressão.
