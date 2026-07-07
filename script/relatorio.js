/* =========================================
   GOOGLE APPS SCRIPT URL
========================================= */
const URL = "https://script.google.com/macros/s//exec";

/* =========================================
   REGIÕES DO PROJETO (espelhando script.js)
========================================= */
const REGIOES = {
  "Grande Sao Paulo - SP": [
    "Sede Mundial", "Franco da Rocha - SP (T 16245)", "Guarulhos - SP (T 15937)",
    "Itaquaquecetuba - SP (T 15937)", "Maua - SP (T 9289)", "Mogi das Cruzes - SP (T 15968)",
    "Santo Andre - SP (T 9318)", "Sao Bernardo do Campo - SP (T 9325)", "Sao Mateus - SP (T 16037)",
    "Campo Limpo - SP (T 16588)", "Santo Amaro - SP (T 16883)", "Osasco - SP (T 16501)"
  ],
  "Interior - SP": [
    "Bauru - SP (T 13753)", "Campinas - SP (T 13901)", "Itapeva - SP (T 14339)",
    "Ribeirao Preto - SP (T 14463)", "Jundiai - SP (T 14661)", "Marilia - SP (T 14756)",
    "Piracicaba - SP (T 15104)", "Presidente Prudente - SP (T 15213)", "Registro - SP (T 15252)",
    "Sao Jose do Rio Preto - SP (T 15449)", "Sao Jose dos Campos - SP (T 15463)", "Sorocaba - SP (T 15551)"
  ],
  "Litoral - SP": ["Santos - SP (T 15392)"],
  "Espirito Santo": ["Estadual Vitoria - ES (T 17250)", "Estadual Linhares - ES (T 9740)"],
  "Rio de Janeiro": [
    "Estadual Sao Goncalo - RJ (T 12528)", "Estadual Campos dos Goytacazes - RJ (T 12720)",
    "Estadual Duque de Caxias - RJ (T 12765)", "Estadual Niteroi - RJ (T 13061)",
    "Estadual Nova Iguacu - RJ (T 13103)", "Estadual Petropolis - RJ (T 13166)",
    "Estadual Senador Pompeu - RJ (T 17263)", "Estadual Campo Grande - RJ (T 12704)"
  ],
  "Minas Gerais": [
    "Estadual Gameleira - Cabana - MG (T 10248)", "Estadual Belo Horizonte - Guaicurus - MG (T 10848)",
    "Estadual Governador Valadares - MG (T 10808)", "Estadual Juiz de Fora - MG (T 11074)",
    "Estadual Muriae - MG (T 11548)", "Estadual Uberlandia - MG (T 12374)",
    "Estadual Montes Claros - MG (T 11502)"
  ],
  "Norte": [
    "AC - Cruzeiro do Sul (T 7468)", "AC - Rio Branco (T 17290)", "AM - Manaus (T 17290)",
    "AM - Tabatinga (T 7874)", "AM - Tefe (T 7881)", "AM - Tonantins (T 7897)",
    "PA - Breves (T 8141)", "PA - Itaituba (T 8339)", "PA - Maraba (T 8431)",
    "PA - Belem (T 17268)", "PA - Santarem (T 8706)", "RO - Ji Parana (T 8901)",
    "RO - Porto Velho (T 8933)", "TO - Palmas (T 9162)", "AP - Macapa (T 7932)",
    "RR - Boa Vista (T 17226)"
  ],
  "Nordeste": [
    "Maceio (T 4760)", "Salvador (T 5624)", "Teixeira de Freitas (T 5786)",
    "Vitoria da Conquista (T 5851)", "Juazeiro do Norte (T 6047)", "Fortaleza (T 6082)",
    "Sobral (T 6388)", "Balsas (T 6430)", "Imperatriz (T 6456)", "Sao Luis (T 6547)",
    "Campina Grande (T 6595)", "Joao Pessoa (T 6642)", "Petrolina (T 6895)",
    "Natal (T 7167)", "Aracaju (T 17229)", "Recife (T 17273)", "Teresina (T 17274)"
  ],
  "Centro-Oeste": [
    "Estadual Brasilia - DF (T 3408)", "Estadual Goiania - GO (T 3575)",
    "Estadual Campo Grande - MS (T 4232)", "Estadual Confresa - MT (T 4533)",
    "Estadual Cuiaba - MT (T 4554)"
  ],
  "Regiao Sul": [
    "Estadual Cascavel - PR (T 241)", "Estadual Curitiba - PR (T 363)",
    "Estadual Guarapuava - PR (T 509)", "Estadual Londrina - PR (T 748)",
    "Estadual Ponta Grossa - PR (T 988)", "Estadual Caxias do Sul - RS (T 1554)",
    "Estadual Passo Fundo - RS (T 1944)", "Estadual Pelotas - RS (T 1976)",
    "Estadual Santana do Livramento - RS (T 2093)", "Estadual Porto Alegre - RS (T 17262)",
    "Estadual Santa Maria - RS (T 17591)", "Estadual Chapeco - SC (T 2584)",
    "Estadual Florianopolis - SC (T 2933)", "Estadual Lages - SC (T 3033)",
    "Estadual Joinville - SC (T 3122)"
  ]
};

/* =========================================
   ELEMENTOS DO PAINEL PRINCIPAL
========================================= */
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

if (totvsRelatorio) {
  totvsRelatorio.addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").slice(0, 5);
  });
}

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
      body: JSON.stringify({ acao, totvs: codigo })
    });
    const textoResposta = await resposta.text();
    let resultado;
    try { resultado = JSON.parse(textoResposta); }
    catch (parseError) {
      console.error("Resposta inválida:", textoResposta);
      throw new Error("O servidor retornou dados inválidos. Verifique se o Apps Script foi autorizado.");
    }
    if (!resultado.sucesso) throw new Error(resultado.mensagem || "Não foi possível concluir a solicitação.");
    exibirMensagemRelatorio(resultado.mensagem || "Operação concluída com sucesso.", "sucesso");
    if (resultado.dados && resultado.dados.url) window.open(resultado.dados.url, "_blank");
    if (resultado.dados && resultado.dados.pastaUrl) {
      exibirMensagemRelatorioComLink(
        "PDF salvo na pasta " + resultado.dados.pasta + ".",
        "sucesso", "Abrir pasta no Drive", resultado.dados.pastaUrl
      );
    }
  } catch (erro) {
    exibirMensagemRelatorio(erro.message || "Erro ao conectar com o Apps Script.", "erro");
  } finally {
    botao.disabled = false;
    botao.innerText = textoOriginal;
  }
}

if (btnGerarRelatorio) {
  btnGerarRelatorio.addEventListener("click", function () {
    executarAcaoRelatorio("gerarRelatorio", btnGerarRelatorio, "Gerando...");
  });
}
if (btnExportarPdf) {
  btnExportarPdf.addEventListener("click", function () {
    executarAcaoRelatorio("exportarPdf", btnExportarPdf, "Exportando...");
  });
}

/* =========================================
   LISTAGEM E FILTROS DE IGREJAS
========================================= */
const listaIgrejasContainer = document.getElementById("lista-igrejas-container");
let todasIgrejas = [];

/** Normaliza string removendo acentos e maiúsculas para comparação */
function normalizar(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Popula o select de regiões no filtro de igrejas com todas as regiões do projeto */
function popularFiltroRegioes() {
  const selectRegiao = document.getElementById("filtro-regiao-igrejas");
  if (!selectRegiao) return;
  selectRegiao.innerHTML = '<option value="">Todas as Regiões</option>';
  Object.keys(REGIOES).forEach(regiao => {
    const opt = document.createElement("option");
    opt.value = regiao;
    opt.textContent = regiao;
    selectRegiao.appendChild(opt);
  });
}

/** Renderiza a tabela de igrejas (filtrada ou completa) */
function renderizarTabela(igrejas) {
  if (!listaIgrejasContainer) return;

  const contagem = document.getElementById("contagem-igrejas");
  if (contagem) {
    contagem.textContent = `${igrejas.length} ${igrejas.length === 1 ? "igreja cadastrada" : "igrejas cadastradas"}`;
  }

  if (igrejas.length === 0) {
    listaIgrejasContainer.innerHTML = `
      <p style="text-align:center; color:#999; padding:30px 0; font-size:15px;">
        🔍 Nenhuma igreja encontrada para os filtros aplicados.
      </p>`;
    return;
  }

  let html = `
    <table class="tabela-dinamica">
      <thead>
        <tr>
          <th>TOTVS</th>
          <th>Região</th>
          <th>Estadual</th>
          <th>Dirigente</th>
          <th style="text-align:center;">Ações</th>
        </tr>
      </thead>
      <tbody>
  `;

  igrejas.forEach(igreja => {
    html += `
      <tr>
        <td><strong>${igreja.totvs || '-'}</strong></td>
        <td>${igreja.regiao || '-'}</td>
        <td>${igreja.estadual || '-'}</td>
        <td>${igreja.dirigente || '-'}</td>
        <td style="text-align:center;">
          <div style="display:flex; gap:6px; justify-content:center; flex-wrap:wrap;">
            <button class="btn-tabela"
              onclick="exibirDetalhesIgreja('${igreja.totvs}', this)"
              style="background-color:#24348c; color:white; padding:6px 12px; font-size:12px; border-radius:6px; width:auto;">
              🔍 Ver Detalhes
            </button>
            <button class="btn-tabela"
              onclick="gerarPdfTabela('${igreja.totvs}', this)"
              style="background-color:#0f766e; color:white; padding:6px 12px; font-size:12px; border-radius:6px; width:auto;">
              📄 PDF
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  html += '</tbody></table>';
  listaIgrejasContainer.innerHTML = html;
}

/** Aplica os filtros de busca e região sobre todasIgrejas */
function aplicarFiltros() {
  const termoBusca = normalizar(
    (document.getElementById("filtro-igrejas") || {}).value || ""
  );
  const regiaoSelecionada = normalizar(
    (document.getElementById("filtro-regiao-igrejas") || {}).value || ""
  );

  const filtradas = todasIgrejas.filter(igreja => {
    const matchBusca = !termoBusca || [
      igreja.totvs, igreja.regiao, igreja.estadual, igreja.dirigente, igreja.endereco
    ].some(campo => normalizar(campo).includes(termoBusca));

    const matchRegiao = !regiaoSelecionada || normalizar(igreja.regiao) === regiaoSelecionada;

    return matchBusca && matchRegiao;
  });

  renderizarTabela(filtradas);
}

/** Carrega as igrejas da API e inicializa os filtros */
async function listarIgrejas() {
  if (!listaIgrejasContainer) return;

  listaIgrejasContainer.innerHTML = `
    <p style="text-align:center; color:#666; font-size:14px; padding:30px 0;">
      ⏳ Carregando dados do Google Planilhas...
    </p>`;

  try {
    const resposta = await fetch(`${URL}?acao=listar_igrejas&_t=${new Date().getTime()}`);
    const textoResposta = await resposta.text();
    let resultado;
    try { resultado = JSON.parse(textoResposta); }
    catch (parseError) {
      console.error("Resposta inválida na listagem:", textoResposta);
      listaIgrejasContainer.innerHTML = `
        <p class="erro" style="text-align:center; padding:30px 0;">
          ❌ O servidor retornou dados inválidos. Verifique se o Apps Script foi autorizado.
        </p>`;
      return;
    }

    if (!resultado.sucesso) {
      listaIgrejasContainer.innerHTML = `
        <p class="erro" style="text-align:center; padding:30px 0;">
          ❌ Erro no Apps Script: ${resultado.mensagem}
        </p>`;
      return;
    }

    // Suporte a múltiplos formatos de resposta
    let igrejas = [];
    if (resultado.dados) {
      if (Array.isArray(resultado.dados)) {
        igrejas = resultado.dados;
      } else if (resultado.dados.dados && Array.isArray(resultado.dados.dados)) {
        igrejas = resultado.dados.dados;
      }
    }

    todasIgrejas = igrejas;

    if (igrejas.length === 0) {
      listaIgrejasContainer.innerHTML = `
        <p style="text-align:center; color:#999; padding:30px 0;">
          Nenhum registro encontrado nas Planilhas Regionais.
        </p>`;
      const contagem = document.getElementById("contagem-igrejas");
      if (contagem) contagem.textContent = "0 igrejas cadastradas";
      return;
    }

    // Popula o filtro de regiões e renderiza a tabela
    popularFiltroRegioes();
    renderizarTabela(todasIgrejas);

    // Ativa os listeners dos filtros
    const inputBusca = document.getElementById("filtro-igrejas");
    const selectRegiao = document.getElementById("filtro-regiao-igrejas");
    if (inputBusca) inputBusca.addEventListener("input", aplicarFiltros);
    if (selectRegiao) selectRegiao.addEventListener("change", aplicarFiltros);

  } catch (erro) {
    listaIgrejasContainer.innerHTML = `
      <p class="erro" style="text-align:center; padding:30px 0;">
        ❌ Erro de conexão ao buscar igrejas.
      </p>`;
    console.error(erro);
  }
}

/* =========================================
   DETALHES DA IGREJA
========================================= */
async function exibirDetalhesIgreja(totvs, botao) {
  const painelDetalhes = document.getElementById("painel-detalhes-igreja");
  if (!painelDetalhes) return;

  const textoOriginal = botao ? botao.innerHTML : "";
  if (botao) { botao.disabled = true; botao.innerHTML = "⏳ Buscando..."; }

  try {
    const resposta = await fetch(`${URL}?acao=obter_detalhes&totvs=${totvs}&_t=${new Date().getTime()}`);
    const textoResposta = await resposta.text();
    let resultado;
    try { resultado = JSON.parse(textoResposta); }
    catch (parseError) {
      throw new Error("O servidor retornou dados inválidos. Verifique se o Apps Script foi autorizado.");
    }

    if (!resultado.sucesso || !resultado.dados) {
      alert(resultado.mensagem || "Erro ao carregar detalhes da igreja.");
      return;
    }

    const dados = resultado.dados;

    document.getElementById("detalhe-totvs-titulo").innerText = dados.totvs || "";
    document.getElementById("detalhe-totvs").innerText = dados.totvs || "-";
    document.getElementById("detalhe-regiao").innerText = dados.regiao || "-";
    document.getElementById("detalhe-estadual").innerText = dados.estadual || "-";
    document.getElementById("detalhe-dirigente").innerText = dados.dirigente || "-";
    document.getElementById("detalhe-telefone").innerText = dados.telefone || "-";
    document.getElementById("detalhe-data").innerText = dados.dataCadastro || "-";
    document.getElementById("detalhe-endereco").innerText = dados.endereco || "-";

    const tbody = document.getElementById("lista-detalhes-patrimonios-tbody");
    tbody.innerHTML = "";
    const patrimonios = dados.patrimonios || [];

    if (patrimonios.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center; color:#999; padding:20px;">
            Nenhum patrimônio cadastrado para esta igreja.
          </td>
        </tr>`;
    } else {
      patrimonios.forEach(p => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td><strong>${p.patrimonio || "-"}</strong></td>
          <td style="text-align:center;">${p.quantidade || "-"}</td>
          <td style="text-align:center;">
            <span class="status-estado estado-${(p.conservacao || "").toLowerCase()}">
              ${p.conservacao || "-"}
            </span>
          </td>
          <td>${p.observacao || "-"}</td>
        `;
        tbody.appendChild(row);
      });
    }

    const btnPdfDetalhe = document.getElementById("btn-detalhe-exportar-pdf");
    if (btnPdfDetalhe) {
      btnPdfDetalhe.onclick = function () { gerarPdfTabela(dados.totvs, btnPdfDetalhe); };
    }

    painelDetalhes.style.display = "block";
    painelDetalhes.scrollIntoView({ behavior: "smooth", block: "start" });

  } catch (error) {
    console.error("Erro ao buscar detalhes:", error);
    alert("Erro de conexão ao buscar detalhes da igreja.");
  } finally {
    if (botao) { botao.disabled = false; botao.innerHTML = textoOriginal; }
  }
}

/* =========================================
   GERAÇÃO DE PDF VIA APPS SCRIPT
========================================= */
async function gerarPdfTabela(totvs, botao) {
  const textoOriginal = botao.innerHTML;
  botao.disabled = true;
  botao.innerText = "⏳ Gerando...";
  try {
    const resposta = await fetch(URL, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ acao: "exportarPdf", totvs })
    });
    const resultado = JSON.parse(await resposta.text());
    if (resultado.sucesso && resultado.dados && resultado.dados.url) {
      window.open(resultado.dados.url, "_blank");
    } else {
      alert(resultado.mensagem || "Erro ao exportar PDF.");
    }
  } catch (erro) {
    console.error("Erro ao gerar PDF:", erro);
    alert("Erro de conexão ao gerar PDF.");
  } finally {
    botao.disabled = false;
    botao.innerHTML = textoOriginal;
  }
}

/* =========================================
   INICIALIZAÇÃO
========================================= */
document.addEventListener("DOMContentLoaded", () => {
  // Fecha painel de detalhes
  const btnFechar = document.getElementById("btn-fechar-detalhes");
  if (btnFechar) {
    btnFechar.addEventListener("click", () => {
      const painelDetalhes = document.getElementById("painel-detalhes-igreja");
      if (painelDetalhes) painelDetalhes.style.display = "none";
    });
  }

  // Carrega lista de igrejas
  listarIgrejas();
});
