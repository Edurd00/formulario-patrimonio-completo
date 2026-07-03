/* =========================================
   GOOGLE APPS SCRIPT URL
========================================= */
const URL = "https://script.google.com/macros/s/AKfycbwkVzOrEX1QiEcQg0aHG_X9DS0hxcaga5cj0sCbm7huetqVvcLZyvyqrmcco95uAdLkAg/exec";

const btnGerarRelatorio = document.getElementById("btn-gerar-relatorio");
const btnExportarPdf = document.getElementById("btn-exportar-pdf");
const totvsRelatorio = document.getElementById("totvsRelatorio");
const mensagemRelatorio = document.getElementById("mensagem-relatorio");

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

btnGerarRelatorio.addEventListener("click", function () {
  executarAcaoRelatorio("gerarRelatorio", btnGerarRelatorio, "Gerando...");
});

btnExportarPdf.addEventListener("click", function () {
  executarAcaoRelatorio("exportarPdf", btnExportarPdf, "Exportando...");
});
