/* =========================================
   GOOGLE APPS SCRIPT URL
========================================= */
const URL = "https://script.google.com/macros/s/AKfycbwkVzOrEX1QiEcQg0aHG_X9DS0hxcaga5cj0sCbm7huetqVvcLZyvyqrmcco95uAdLkAg/exec";

const btnExportarPdf = document.getElementById("btn-exportar-pdf");
const totvsRelatorio = document.getElementById("totvsRelatorio");
const mensagemRelatorio = document.getElementById("mensagem-relatorio");
const tabelaIgrejasContainer = document.getElementById("tabela-igrejas-container");

function exibirMensagemRelatorio(texto, tipo) {
  if (!mensagemRelatorio) return;
  mensagemRelatorio.innerText = texto;
  mensagemRelatorio.className = `mensagem-status ${tipo}`;
  mensagemRelatorio.style.display = "block";
}

function exibirMensagemRelatorioComLink(texto, tipo, textoLink, url) {
  if (!mensagemRelatorio) return;
  mensagemRelatorio.innerText = "";
  mensagemRelatorio.className = `mensagem-status ${tipo}`;
  mensagemRelatorio.style.display = "block";
  mensagemRelatorio.appendChild(document.createTextNode(texto + " "));

  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.innerText = textoLink;
  mensagemRelatorio.appendChild(link);
}

totvsRelatorio.addEventListener("input", function () {
  this.value = this.value.replace(/\D/g, "").slice(0, 5);
});

async function executarAcaoRelatorio(acao, botao, textoProcessando) {
  const codigo = totvsRelatorio.value.trim();

  if (codigo.length < 1 || codigo.length > 5) {
    exibirMensagemRelatorio("Informe um código TOTVS válido com até 5 dígitos.", "erro");
    totvsRelatorio.focus();
    return;
  }

  const textoOriginal = botao.innerText;
  botao.disabled = true;
  botao.innerText = textoProcessando;
  exibirMensagemRelatorio("Consultando o banco de dados...", "aviso");

  try {
    const resposta = await fetch(URL, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        acao,
        totvs: codigo
      })
    });

    const resultado = JSON.parse(await resposta.text());

    if (!resultado.sucesso) {
      throw new Error(resultado.mensagem || "Não foi possível concluir a solicitação.");
    }

    exibirMensagemRelatorio(resultado.mensagem || "Operação concluída com sucesso.", "sucesso");

    if (resultado.dados && resultado.dados.url) {
      window.open(resultado.dados.url, "_blank");
    }

    if (resultado.dados && resultado.dados.pastaUrl) {
      exibirMensagemRelatorioComLink(
        "PDF salvo na pasta " + resultado.dados.pasta + ".",
        "sucesso",
        "Abrir pasta no Drive",
        resultado.dados.pastaUrl
      );
    }
  } catch (erro) {
    exibirMensagemRelatorio(erro.message || "Erro ao conectar com o Apps Script.", "erro");
  } finally {
    botao.disabled = false;
    botao.innerText = textoOriginal;
  }
}

btnExportarPdf.addEventListener("click", function () {
  executarAcaoRelatorio("exportarPdf", btnExportarPdf, "Exportando...");
});

async function listarIgrejas() {
  try {
    const resposta = await fetch(`${URL}?acao=listar_igrejas`);
    const resultado = await resposta.json();

    if (resultado.sucesso && Array.isArray(resultado.dados)) {
      renderizarTabela(resultado.dados);
    } else {
      tabelaIgrejasContainer.innerHTML = "<p>Nenhuma igreja cadastrada ou erro ao carregar.</p>";
    }
  } catch (erro) {
    console.error("Erro ao listar igrejas:", erro);
    tabelaIgrejasContainer.innerHTML = "<p>Erro ao conectar com o servidor.</p>";
  }
}

function renderizarTabela(igrejas) {
  if (!igrejas || igrejas.length === 0) {
    tabelaIgrejasContainer.innerHTML = "<p>Nenhuma igreja cadastrada.</p>";
    return;
  }

  let html = `
    <table class="tabela-igrejas">
      <thead>
        <tr>
          <th>TOTVS</th>
          <th>Região</th>
          <th>Estadual</th>
          <th>Dirigente</th>
          <th style="text-align: center;">Ações</th>
        </tr>
      </thead>
      <tbody>
  `;

  igrejas.forEach(igreja => {
    html += `
      <tr>
        <td><strong>${igreja.totvs}</strong></td>
        <td>${igreja.regiao}</td>
        <td>${igreja.estadual}</td>
        <td>${igreja.dirigente}</td>
        <td style="text-align: center;">
          <button type="button" class="btn-tabela-pdf" data-totvs="${igreja.totvs}" title="Gerar relatório em PDF">📄 Gerar PDF</button>
        </td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  tabelaIgrejasContainer.innerHTML = html;

  // Adicionar eventos aos botões da tabela
  document.querySelectorAll(".btn-tabela-pdf").forEach(btn => {
    btn.addEventListener("click", function() {
      const totvs = this.getAttribute("data-totvs");
      totvsRelatorio.value = totvs;
      executarAcaoRelatorio("exportarPdf", this, "Exportando...");
    });
  });
}

// Carregar lista ao iniciar
document.addEventListener("DOMContentLoaded", listarIgrejas);
