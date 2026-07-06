const URL = "https://script.google.com/macros/s/AKfycbwkVzOrEX1QiEcQg0aHG_X9DS0hxcaga5cj0sCbm7huetqVvcLZyvyqrmcco95uAdLkAg/exec";

const msgStatus = document.getElementById("mensagem-status");
const botaoSubmit = document.getElementById("btn-enviar");
const btnVoltarWizard = document.getElementById("btn-voltar-wizard");
const btnAvancarWizard = document.getElementById("btn-avancar-wizard");
const progressoTexto = document.getElementById("progresso-texto");
const wizardNav = document.getElementById("wizard-nav");
const categoriasContainer = document.getElementById("categorias-container");

let etapaAtual = 1;
let contadorItensExtras = 0;

const categorias = [
  {
    titulo: "Mobiliario e Estrutura",
    itens: [
      { id: "banco", nome: "Bancos" },
      { id: "cadeira", nome: "Cadeiras" },
      { id: "bebedouroFiltro", nome: "Bebedouro ou Filtro" },
      { id: "armario", nome: "Armario" },
      { id: "mesa", nome: "Mesa" },
      { id: "cofreBocaLobo", nome: "Cofre boca de lobo" },
      { id: "pulpito", nome: "Pulpito" }
    ]
  },
  {
    titulo: "Eletronicos e Climatizacao",
    itens: [
      { id: "ar", nome: "Ar condicionado" },
      { id: "ventilador", nome: "Ventiladores" },
      { id: "computador", nome: "Computador" },
      { id: "impressora", nome: "Impressora" },
      { id: "projetor", nome: "Projetor" },
      { id: "telaProjetor", nome: "Tela de projetor" },
      { id: "telefonePatrimonio", nome: "Telefone" },
      { id: "celular", nome: "Celular" },
      { id: "cameraSeguranca", nome: "Camera de seguranca" }
    ]
  },
  {
    titulo: "Som e Instrumentos",
    itens: [
      { id: "microfone", nome: "Microfone" },
      { id: "caixaSom", nome: "Caixas de som" },
      { id: "mesaSom", nome: "Mesa de som" },
      { id: "violao", nome: "Violao" },
      { id: "guitarra", nome: "Guitarra" },
      { id: "bateria", nome: "Bateria" },
      { id: "contrabaixo", nome: "Contrabaixo" },
      { id: "teclado", nome: "Teclado" }
    ]
  },
  {
    titulo: "Cozinha e Seguranca",
    itens: [
      { id: "freezer", nome: "Freezer" },
      { id: "geladeira", nome: "Geladeira" },
      { id: "fogao", nome: "Fogao" },
      { id: "botijao", nome: "Botijao" },
      { id: "microondas", nome: "Micro-ondas" },
      { id: "extintor", nome: "Extintor" }
    ]
  },
  {
    titulo: "Itens adicionais",
    itens: [],
    permiteAdicionar: true
  }
];

const totalEtapas = categorias.length;
const cards = [];

function exibirMensagem(texto, tipo) {
  if (!msgStatus) return;
  msgStatus.innerText = texto;
  msgStatus.className = `mensagem-status ${tipo}`;
  msgStatus.style.display = "block";
}

if (sessionStorage.getItem("cadastroEnviado") === "true") {
  if (botaoSubmit) {
    botaoSubmit.disabled = true;
    botaoSubmit.innerText = "Formulario Ja Enviado";
  }
  exibirMensagem("Este formulario ja foi enviado com sucesso nesta sessao.", "aviso");
}

const dadosIgreja = JSON.parse(localStorage.getItem("dadosIgreja"));
if (!dadosIgreja && sessionStorage.getItem("cadastroEnviado") !== "true") {
  exibirMensagem("Dados iniciais da igreja nao foram encontrados. Volte a primeira pagina.", "erro");
}

function preencherResumo() {
  if (!dadosIgreja) return;
  document.getElementById("infoTotvs").innerText = dadosIgreja.totvs || "-";
  document.getElementById("infoRegiao").innerText = dadosIgreja.regiao || "-";
  document.getElementById("infoEstadual").innerText = dadosIgreja.estadual || "-";
  document.getElementById("infoDirigente").innerText = dadosIgreja.dirigente || "-";
  document.getElementById("infoTelefone").innerText = dadosIgreja.telefone || "-";
  document.getElementById("infoEndereco").innerText = dadosIgreja.endereco || "-";
}

function perguntaItem(nome) {
  return `A igreja possui ${nome.toLowerCase()}?`;
}

function opcoesEstadoHtml() {
  return '<option value="">Selecione</option><option>Ruim</option><option>Regular</option><option>Bom</option><option>Otimo</option>';
}

function criarCardItem(item, etapa, extra = false) {
  const card = document.createElement("div");
  card.className = extra ? "card card-extra-item" : "card";
  card.id = `card-${item.id}`;

  const titulo = extra
    ? `<input type="text" id="${item.id}Nome" name="${item.id}Nome" placeholder="Nome do novo item" required>`
    : item.nome;

  const botaoRemover = extra
    ? `<button type="button" class="btn-remover-card" data-card="${item.id}" title="Remover item">Remover</button>`
    : "";

  card.innerHTML = `
    <h2>${titulo} <span class="check-icon">✓</span></h2>
    ${botaoRemover}
    <label>${extra ? "O item foi adicionado ao cadastro?" : perguntaItem(item.nome)}</label>
    <select id="${item.id}Possui" name="${item.id}Possui">
      <option value="">Selecione</option>
      <option value="Sim"${extra ? " selected" : ""}>Sim</option>
      <option value="Nao">Nao</option>
    </select>
    <div class="campo-extra" id="${item.id}Campos">
      <label>Quantidade</label>
      <input type="number" id="${item.id}Qtd" name="${item.id}Qtd" min="1" placeholder="Quantidade">
      <label>Estado de conservacao</label>
      <select id="${item.id}Estado" name="${item.id}Estado">${opcoesEstadoHtml()}</select>
      <label>Observacao opcional</label>
      <input type="text" id="${item.id}Obs" name="${item.id}Obs" maxlength="120" placeholder="Ex: 1 unidade danificada">
    </div>
  `;

  card.dataset.etapa = etapa;
  card.dataset.extra = extra ? "true" : "false";

  cards.push({
    id: item.id,
    etapa,
    extra,
    selectId: `${item.id}Possui`,
    camposId: `${item.id}Campos`,
    qtdId: `${item.id}Qtd`,
    estadoId: `${item.id}Estado`,
    obsId: `${item.id}Obs`,
    nomeId: extra ? `${item.id}Nome` : null,
    cardId: `card-${item.id}`
  });

  return card;
}

function montarWizard() {
  categorias.forEach((categoria, indice) => {
    const etapa = indice + 1;

    const navButton = document.createElement("button");
    navButton.type = "button";
    navButton.className = `wizard-step${etapa === 1 ? " ativo" : ""}`;
    navButton.dataset.etapa = etapa;
    navButton.innerHTML = `<span>${etapa}</span>${categoria.titulo}`;
    wizardNav.appendChild(navButton);

    const section = document.createElement("section");
    section.id = `categoria-${etapa}`;
    section.className = "etapa-wizard pagina-categoria";
    if (etapa !== 1) section.style.display = "none";

    section.innerHTML = `
      <div class="categoria-header">
        <span>Pagina ${etapa} de ${totalEtapas}</span>
        <h2>${categoria.titulo}</h2>
      </div>
      <div class="grid-patrimonios" id="grid-categoria-${etapa}"></div>
    `;

    categoriasContainer.appendChild(section);
    const grid = section.querySelector(".grid-patrimonios");

    categoria.itens.forEach(item => {
      grid.appendChild(criarCardItem(item, etapa));
    });

    if (categoria.permiteAdicionar) {
      const painel = document.createElement("div");
      painel.className = "card painel-adicionar-item";
      painel.innerHTML = `
        <h2>Adicionar novo item</h2>
        <p class="descricao-campo">Inclua somente itens que nao aparecem nas categorias anteriores.</p>
        <button type="button" class="botao-secundario" id="btn-adicionar-item">Adicionar item</button>
      `;
      section.insertBefore(painel, grid);
    }
  });
}

function obterCardInfoPorId(cardId) {
  return cards.find(card => card.cardId === cardId);
}

function controlarCampos(cardInfo) {
  const select = document.getElementById(cardInfo.selectId);
  const campos = document.getElementById(cardInfo.camposId);
  const qtd = document.getElementById(cardInfo.qtdId);
  const estado = document.getElementById(cardInfo.estadoId);
  const nome = cardInfo.nomeId ? document.getElementById(cardInfo.nomeId) : null;
  const card = document.getElementById(cardInfo.cardId);

  if (!select || !campos || !qtd || !estado || !card) return;

  function avaliarConclusaoCard() {
    const nomeOk = !nome || nome.value.trim() !== "";
    if (select.value === "Nao") {
      card.classList.add("card-concluido");
      card.classList.add("card-recolhido");
    } else if (select.value === "Sim") {
      card.classList.remove("card-recolhido");
      if (qtd.value.trim() !== "" && estado.value !== "" && nomeOk) {
        card.classList.add("card-concluido");
      } else {
        card.classList.remove("card-concluido");
      }
    } else {
      card.classList.remove("card-concluido");
      card.classList.remove("card-recolhido");
    }
  }

  function atualizarObrigatoriedade() {
    const ativo = Number(card.dataset.etapa) === etapaAtual;
    select.required = ativo;
    if (nome) nome.required = ativo;

    if (select.value === "Sim") {
      campos.style.display = "block";
      qtd.required = ativo;
      estado.required = ativo;
    } else {
      campos.style.display = "none";
      qtd.required = false;
      estado.required = false;
      qtd.value = "";
      estado.value = "";
      const obs = document.getElementById(cardInfo.obsId);
      if (obs) obs.value = "";
    }

    avaliarConclusaoCard();
  }

  select.addEventListener("change", atualizarObrigatoriedade);
  qtd.addEventListener("input", avaliarConclusaoCard);
  estado.addEventListener("change", avaliarConclusaoCard);
  if (nome) nome.addEventListener("input", avaliarConclusaoCard);

  atualizarObrigatoriedade();
}

function inicializarCardsPendentes() {
  cards.forEach(cardInfo => {
    if (!cardInfo.inicializado && document.getElementById(cardInfo.cardId)) {
      controlarCampos(cardInfo);
      cardInfo.inicializado = true;
    }
  });
}

function adicionarItemExtra() {
  contadorItensExtras++;
  const etapa = totalEtapas;
  const item = { id: `extraItem${contadorItensExtras}`, nome: "" };
  const grid = document.getElementById(`grid-categoria-${etapa}`);
  grid.appendChild(criarCardItem(item, etapa, true));
  inicializarCardsPendentes();
  atualizarWizard();
}

function removerItemExtra(id) {
  const card = document.getElementById(`card-${id}`);
  if (card) card.remove();
  const indice = cards.findIndex(item => item.id === id);
  if (indice !== -1) cards.splice(indice, 1);
  salvarRascunhoAglomerado();
  atualizarWizard();
}

function validarEtapa(etapa) {
  const containerEtapa = document.getElementById(`categoria-${etapa}`);
  const camposInvalidos = containerEtapa.querySelectorAll("select:invalid, input:invalid");

  if (camposInvalidos.length > 0) {
    exibirMensagem("Por favor, responda todos os cards da categoria atual antes de avancar.", "erro");
    camposInvalidos[0].focus();
    return false;
  }

  if (msgStatus.className.includes("erro")) msgStatus.style.display = "none";
  return true;
}

function atualizarWizard() {
  window.scrollTo({ top: 0, behavior: "smooth" });

  for (let i = 1; i <= totalEtapas; i++) {
    document.getElementById(`categoria-${i}`).style.display = i === etapaAtual ? "block" : "none";
  }

  document.querySelectorAll(".wizard-step").forEach(botao => {
    const etapaBotao = Number(botao.dataset.etapa);
    botao.classList.toggle("ativo", etapaBotao === etapaAtual);
    botao.classList.toggle("concluido", etapaBotao < etapaAtual);
  });

  cards.forEach(cardInfo => controlarObrigatoriedadeCard(cardInfo));

  progressoTexto.innerText = `Categoria ${etapaAtual} de ${totalEtapas}: ${categorias[etapaAtual - 1].titulo}`;
  btnVoltarWizard.innerText = etapaAtual === 1 ? "Voltar Etapa 1" : "Voltar Pagina";

  if (etapaAtual === totalEtapas) {
    btnAvancarWizard.style.display = "none";
    botaoSubmit.style.display = "block";
  } else {
    btnAvancarWizard.style.display = "block";
    botaoSubmit.style.display = "none";
  }
}

function controlarObrigatoriedadeCard(cardInfo) {
  const select = document.getElementById(cardInfo.selectId);
  const qtd = document.getElementById(cardInfo.qtdId);
  const estado = document.getElementById(cardInfo.estadoId);
  const nome = cardInfo.nomeId ? document.getElementById(cardInfo.nomeId) : null;
  const campos = document.getElementById(cardInfo.camposId);
  const ativo = cardInfo.etapa === etapaAtual;

  if (!select || !qtd || !estado || !campos) return;

  select.required = ativo;
  if (nome) nome.required = ativo;

  if (select.value === "Sim") {
    campos.style.display = "block";
    qtd.required = ativo;
    estado.required = ativo;
  } else {
    campos.style.display = "none";
    qtd.required = false;
    estado.required = false;
  }
}

function coletarItensExtras() {
  return cards
    .filter(card => card.extra && document.getElementById(card.cardId))
    .map(card => ({
      nome: (document.getElementById(card.nomeId)?.value || "").trim(),
      possui: document.getElementById(card.selectId)?.value || "",
      quantidade: document.getElementById(card.qtdId)?.value || "",
      estado: document.getElementById(card.estadoId)?.value || "",
      observacao: document.getElementById(card.obsId)?.value || ""
    }))
    .filter(item => item.nome);
}

document.getElementById("formularioPatrimonio").addEventListener("submit", async function (e) {
  e.preventDefault();

  if (sessionStorage.getItem("cadastroEnviado") === "true") return;
  if (!validarEtapa(etapaAtual)) return;

  botaoSubmit.disabled = true;
  botaoSubmit.innerText = "Enviando Dados...";
  exibirMensagem("Processando informacoes e conectando com o Google Sheets...", "aviso");

  try {
    const formData = new FormData(this);
    const dadosFormulario = {};

    formData.forEach((valor, chave) => {
      dadosFormulario[chave] = valor;
    });

    dadosFormulario.itensExtras = JSON.stringify(coletarItensExtras());

    const dadosFinais = { acao: "cadastrar", ...dadosIgreja, ...dadosFormulario };

    const resposta = await fetch(URL, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(dadosFinais)
    });

    const resultado = JSON.parse(await resposta.text());

    if (resultado.sucesso) {
      sessionStorage.setItem("cadastroEnviado", "true");
      exibirMensagem("Cadastro patrimonial enviado com sucesso para a planilha!", "sucesso");
      botaoSubmit.innerText = "Enviado com Sucesso";
      limparRascunho();
      localStorage.clear();
      setTimeout(() => { window.location.href = "index.html"; }, 3500);
    } else {
      exibirMensagem(resultado.mensagem || "Erro ao salvar na planilha.", "erro");
      botaoSubmit.disabled = false;
      botaoSubmit.innerText = "Finalizar Cadastro";
    }
  } catch (erro) {
    exibirMensagem("Erro de conexao com o banco de dados. Verifique a URL do App Script.", "erro");
    botaoSubmit.disabled = false;
    botaoSubmit.innerText = "Finalizar Cadastro";
  }
});

const CHAVE_STORAGE = "rascunho_inventario_patrimonio";

function salvarRascunhoAglomerado() {
  const form = document.getElementById("formularioPatrimonio");
  if (!form) return;

  const formData = new FormData(form);
  const dadosFormulario = {
    itensExtras: coletarItensExtras()
  };

  formData.forEach((value, key) => {
    dadosFormulario[key] = value;
  });

  localStorage.setItem(CHAVE_STORAGE, JSON.stringify(dadosFormulario));
}

function restaurarRascunhoSalvo() {
  const rascunhoTexto = localStorage.getItem(CHAVE_STORAGE);
  if (!rascunhoTexto) return;

  try {
    const dados = JSON.parse(rascunhoTexto);

    if (Array.isArray(dados.itensExtras)) {
      dados.itensExtras.forEach(item => {
        adicionarItemExtra();
        const id = `extraItem${contadorItensExtras}`;
        document.getElementById(`${id}Nome`).value = item.nome || "";
        document.getElementById(`${id}Possui`).value = item.possui || "Sim";
        document.getElementById(`${id}Qtd`).value = item.quantidade || "";
        document.getElementById(`${id}Estado`).value = item.estado || "";
        document.getElementById(`${id}Obs`).value = item.observacao || "";
      });
    }

    Object.keys(dados).forEach(nomeDoCampo => {
      if (nomeDoCampo === "itensExtras") return;
      const elemento = document.getElementById(nomeDoCampo) || document.forms.formularioPatrimonio.elements[nomeDoCampo];

      if (elemento && typeof dados[nomeDoCampo] === "string") {
        elemento.value = dados[nomeDoCampo];
        elemento.dispatchEvent(new Event("change"));
        elemento.dispatchEvent(new Event("input"));
      }
    });
  } catch (erro) {
    console.error("Erro ao restaurar o rascunho:", erro);
  }
}

function limparRascunho() {
  localStorage.removeItem(CHAVE_STORAGE);
}

const btnTopo = document.getElementById("btn-topo");
window.addEventListener("scroll", function () {
  btnTopo.style.display = window.scrollY > 400 ? "block" : "none";
});
btnTopo.addEventListener("click", function () {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

montarWizard();
preencherResumo();
inicializarCardsPendentes();
restaurarRascunhoSalvo();
atualizarWizard();

document.querySelectorAll(".wizard-step").forEach(botao => {
  botao.addEventListener("click", function () {
    const destino = Number(this.dataset.etapa);

    if (destino > etapaAtual && !validarEtapa(etapaAtual)) {
      return;
    }

    etapaAtual = destino;
    atualizarWizard();
  });
});

btnAvancarWizard.addEventListener("click", function () {
  if (!validarEtapa(etapaAtual)) return;
  if (etapaAtual < totalEtapas) {
    etapaAtual++;
    atualizarWizard();
  }
});

btnVoltarWizard.addEventListener("click", function () {
  if (msgStatus.className.includes("erro")) msgStatus.style.display = "none";

  if (etapaAtual === 1) {
    window.location.href = "index.html";
  } else {
    etapaAtual--;
    atualizarWizard();
  }
});

document.addEventListener("click", function (event) {
  if (event.target.id === "btn-adicionar-item") {
    adicionarItemExtra();
    salvarRascunhoAglomerado();
  }

  if (event.target.classList.contains("btn-remover-card")) {
    removerItemExtra(event.target.dataset.card);
  }
});

document.getElementById("formularioPatrimonio").addEventListener("input", salvarRascunhoAglomerado);
document.getElementById("formularioPatrimonio").addEventListener("change", salvarRascunhoAglomerado);
