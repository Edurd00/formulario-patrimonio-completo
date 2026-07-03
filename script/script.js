const formulario = document.getElementById("formulario");
const regiao = document.getElementById("regiao");
const estadual = document.getElementById("estadual");
const cepInput = document.getElementById("cep");
const endereco = document.getElementById("endereco");
const dirigente = document.getElementById("dirigente");
const telefoneInput = document.getElementById("telefone");
const totvs = document.getElementById("totvs");
const erroTotvs = document.getElementById("erro-totvs");

// Futura API URL
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? "http://localhost:3000"
    : "";
if (sessionStorage.getItem("cadastroEnviado") === "true") {
  sessionStorage.removeItem("cadastroEnviado");
}

const estaduais = {
  "Grande Sao Paulo - SP": [
    "Sede Mundial",
    "Franco da Rocha - SP (T 16245)",
    "Guarulhos - SP (T 15937)",
    "Itaquaquecetuba - SP (T 15937)",
    "Maua - SP (T 9289)",
    "Mogi das Cruzes - SP (T 15968)",
    "Santo Andre - SP (T 9318)",
    "Sao Bernardo do Campo - SP (T 9325)",
    "Sao Mateus - SP (T 16037)",
    "Campo Limpo - SP (T 16588)",
    "Santo Amaro - SP (T 16883)",
    "Osasco - SP (T 16501)"
  ],
  "Interior - SP": [
    "Bauru - SP (T 13753)",
    "Campinas - SP (T 13901)",
    "Itapeva - SP (T 14339)",
    "Ribeirao Preto - SP (T 14463)",
    "Jundiai - SP (T 14661)",
    "Marilia - SP (T 14756)",
    "Piracicaba - SP (T 15104)",
    "Presidente Prudente - SP (T 15213)",
    "Registro - SP (T 15252)",
    "Sao Jose do Rio Preto - SP (T 15449)",
    "Sao Jose dos Campos - SP (T 15463)",
    "Sorocaba - SP (T 15551)"
  ],
  "Litoral - SP": [
    "Santos - SP (T 15392)"
  ],
  "Espirito Santo": [
    "Estadual Vitoria - ES (T 17250)",
    "Estadual Linhares - ES (T 9740)"
  ],
  "Rio de Janeiro": [
    "Estadual Sao Goncalo - RJ (T 12528)",
    "Estadual Campos dos Goytacazes - RJ (T 12720)",
    "Estadual Duque de Caxias - RJ (T 12765)",
    "Estadual Niteroi - RJ (T 13061)",
    "Estadual Nova Iguacu - RJ (T 13103)",
    "Estadual Petropolis - RJ (T 13166)",
    "Estadual Senador Pompeu - RJ (T 17263)",
    "Estadual Campo Grande - RJ (T 12704)"
  ],
  "Minas Gerais": [
    "Estadual Gameleira - Cabana - MG (T 10248)",
    "Estadual Belo Horizonte - Guaicurus - MG (T 10848)",
    "Estadual Governador Valadares - MG (T 10808)",
    "Estadual Juiz de Fora - MG (T 11074)",
    "Estadual Muriae - MG (T 11548)",
    "Estadual Uberlandia - MG (T 12374)",
    "Estadual Montes Claros - MG (T 11502)"
  ],
  "Norte": [
    "AC - Cruzeiro do Sul (T 7468)",
    "AC - Rio Branco (T 17290)",
    "AM - Manaus (T 17290)",
    "AM - Tabatinga (T 7874)",
    "AM - Tefe (T 7881)",
    "AM - Tonantins (T 7897)",
    "PA - Breves (T 8141)",
    "PA - Itaituba (T 8339)",
    "PA - Maraba (T 8431)",
    "PA - Belem (T 17268)",
    "PA - Santarem (T 8706)",
    "RO - Ji Parana (T 8901)",
    "RO - Porto Velho (T 8933)",
    "TO - Palmas (T 9162)",
    "AP - Macapa (T 7932)",
    "RR - Boa Vista (T 17226)"
  ],
  "Nordeste": [
    "Maceio (T 4760)",
    "Salvador (T 5624)",
    "Teixeira de Freitas (T 5786)",
    "Vitoria da Conquista (T 5851)",
    "Juazeiro do Norte (T 6047)",
    "Fortaleza (T 6082)",
    "Sobral (T 6388)",
    "Balsas (T 6430)",
    "Imperatriz (T 6456)",
    "Sao Luis (T 6547)",
    "Campina Grande (T 6595)",
    "Joao Pessoa (T 6642)",
    "Petrolina (T 6895)",
    "Natal (T 7167)",
    "Aracaju (T 17229)",
    "Recife (T 17273)",
    "Teresina (T 17274)"
  ],
  "Centro-Oeste": [
    "Estadual Brasilia - DF (T 3408)",
    "Estadual Goiania - GO (T 3575)",
    "Estadual Campo Grande - MS (T 4232)",
    "Estadual Confresa - MT (T 4533)",
    "Estadual Cuiaba - MT (T 4554)"
  ],
  "Regiao Sul": [
    "Estadual Cascavel - PR (T 241)",
    "Estadual Curitiba - PR (T 363)",
    "Estadual Guarapuava - PR (T 509)",
    "Estadual Londrina - PR (T 748)",
    "Estadual Ponta Grossa - PR (T 988)",
    "Estadual Caxias do Sul - RS (T 1554)",
    "Estadual Passo Fundo - RS (T 1944)",
    "Estadual Pelotas - RS (T 1976)",
    "Estadual Santana do Livramento - RS (T 2093)",
    "Estadual Porto Alegre - RS (T 17262)",
    "Estadual Santa Maria - RS (T 17591)",
    "Estadual Chapeco - SC (T 2584)",
    "Estadual Florianopolis - SC (T 2933)",
    "Estadual Lages - SC (T 3033)",
    "Estadual Joinville - SC (T 3122)"
  ]
};

function normalizarChaveRegiao(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}

function popularRegioes() {
  Object.keys(estaduais).forEach(nomeRegiao => {
    const option = document.createElement("option");
    option.value = nomeRegiao;
    option.text = nomeRegiao;
    regiao.appendChild(option);
  });
}

popularRegioes();

cepInput.addEventListener("input", function() {
  let value = this.value.replace(/\D/g, "");
  if (value.length > 8) value = value.substring(0, 8);
  if (value.length > 5) {
    this.value = `${value.substring(0, 5)}-${value.substring(5)}`;
  } else {
    this.value = value;
  }
});

cepInput.addEventListener("blur", async function() {
  const cep = this.value.replace(/\D/g, "");
  if (cep.length !== 8) return;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();

    if (!data.erro) {
      endereco.value = `${data.logradouro}, , ${data.bairro} - ${data.localidade}/${data.uf}`;
      endereco.focus();
      // O cursor vai para antes da primeira vírgula para facilitar a digitação do número
      const position = data.logradouro.length + 2;
      endereco.setSelectionRange(position, position);
    }
  } catch (error) {
    console.error("Erro ao consultar ViaCEP:", error);
  }
});

regiao.addEventListener("change", function () {
  estadual.innerHTML = '<option value="">Selecione a Estadual</option>';
  const lista = estaduais[this.value];

  if (lista) {
    estadual.disabled = false;
    lista.forEach(item => {
      const option = document.createElement("option");
      option.value = item;
      option.text = item;
      estadual.appendChild(option);
    });
  } else {
    estadual.disabled = true;
  }
});

totvs.addEventListener("input", function() {
  this.value = this.value.replace(/\D/g, "");
  erroTotvs.innerText = "";
  this.classList.remove("erro-input");
});

totvs.addEventListener("blur", async function () {
  erroTotvs.innerText = "";
  this.classList.remove("erro-input");

  const valor = this.value.trim();
  if (!valor) return;

  if (valor.length > 5) {
    erroTotvs.innerText = "O codigo TOTVS deve conter no maximo 5 digitos.";
    this.classList.add("erro-input");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/validar-totvs/${valor}`);
    const data = await response.json();

    if (data.existe) {
      erroTotvs.innerText = "Este codigo TOTVS ja esta cadastrado no sistema.";
      this.classList.add("erro-input");
    }
  } catch (error) {
    console.warn("Nao foi possivel conectar a API de validacao TOTVS. Usando validacao local (se disponivel).", error);
  }
});

telefoneInput.addEventListener("input", function() {
  let r = this.value.replace(/\D/g, "");
  if (r.length > 11) r = r.substring(0, 11);
  if (r.length > 6) {
    this.value = `(${r.substring(0, 2)}) ${r.substring(2, 7)}-${r.substring(7, 11)}`;
  } else if (r.length > 2) {
    this.value = `(${r.substring(0, 2)}) ${r.substring(2)}`;
  } else if (r.length > 0) {
    this.value = `(${r}`;
  }
});

formulario.addEventListener("submit", async function (e) {
  e.preventDefault();
  erroTotvs.innerText = "";

  if (!regiao.value || !estadual.value || !cepInput.value.trim() || !endereco.value.trim() || !dirigente.value.trim() || !telefoneInput.value.trim() || !totvs.value.trim()) {
    alert("Por favor, preencha todos os campos obrigatorios antes de prosseguir.");
    return;
  }

  if (totvs.value.length < 1 || totvs.value.length > 5) {
    erroTotvs.innerText = "Codigo TOTVS invalido. Deve ter de 1 a 5 numeros.";
    totvs.classList.add("erro-input");
    totvs.focus();
    return;
  }

  // Validacao final via API antes de prosseguir
  try {
    const response = await fetch(`${API_BASE_URL}/api/validar-totvs/${totvs.value.trim()}`);
    const data = await response.json();

    if (data.existe) {
      erroTotvs.innerText = "Codigo TOTVS ja cadastrado.";
      totvs.classList.add("erro-input");
      totvs.focus();
      return;
    }
  } catch (error) {
    console.warn("Falha na validacao final via API, prosseguindo com cautela...");
  }

  const dadosPagina1 = {
    regiao: regiao.value,
    regiaoChave: normalizarChaveRegiao(regiao.value),
    estadual: estadual.value,
    cep: cepInput.value.trim(),
    endereco: endereco.value.trim(),
    dirigente: dirigente.value.trim(),
    telefone: telefoneInput.value.trim(),
    totvs: totvs.value.trim()
  };

  localStorage.setItem("dadosIgreja", JSON.stringify(dadosPagina1));
  window.location.href = "patrimonios.html";
});
