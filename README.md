# 📋 Formulário Patrimônio IPDA

Sistema web para **cadastro e gestão de patrimônios** das igrejas da Igreja Pentecostal Deus é Amor (IPDA), com painel administrativo, filtros por região e exportação de relatórios em PDF.

---

## 🗂️ Visão Geral

O sistema é composto por três páginas front-end que se comunicam com um backend em **Google Apps Script**, que persiste os dados em **Google Planilhas** divididas por região.

```
┌─────────────────┐      POST/GET      ┌──────────────────────────┐
│  Front-end Web  │ ◄────────────────► │  Google Apps Script API  │
│  (HTML/CSS/JS)  │                    │  (doGet / doPost)        │
└─────────────────┘                    └──────────┬───────────────┘
                                                  │
                                                  ▼
                                       ┌──────────────────────┐
                                       │   Google Planilhas   │
                                       │  BASE_GERAL          │
                                       │  PATRIMONIOS         │
                                       └──────────────────────┘
```

---

## 📁 Estrutura do Projeto

```
Formulario-patrimonio/
│
├── index.html              # Pág. 1 — Cadastro de dados da igreja
├── patrimonios.html        # Pág. 2 — Cadastro de patrimônios por categoria
├── relatorios.html         # Pág. 3 — Painel administrativo e relatórios
│
├── script/
│   ├── script.js           # Lógica do formulário de cadastro (pág. 1)
│   ├── patrimonio.js       # Lógica do wizard de patrimônios (pág. 2)
│   └── relatorio.js        # Lógica do painel administrativo (pág. 3)
│
├── style/
│   └── style.css           # Design system unificado (mobile-first)
│
├── img/
│   ├── logo.png            # Logo principal IPDA
│   ├── logo-relatorio.png  # Logo para cabeçalho de relatórios
│   └── favicon.jpg         # Ícone da aba do navegador
│
└── codigo API/             # Backend Google Apps Script
    ├── code.gs.txt         # Rotas doGet e doPost (entry point)
    ├── config.gs.txt       # Configurações, constantes e lista de patrimônios
    ├── database.gs.txt     # Operações no banco (planilhas BASE_GERAL e PATRIMONIOS)
    ├── report.gs.txt       # Geração de relatório e exportação de PDF
    ├── validator.gs.txt    # Validações de entrada
    ├── utils.gs.txt        # Funções auxiliares
    ├── response.gs.txt     # Padronização de respostas JSON
    └── PASSO_A_PASSO_BACKEND.md  # Guia de deploy do backend
```

---

## 🖥️ Páginas do Sistema

### 1. `index.html` — Cadastro da Igreja
Formulário de cadastro com:
- Seleção de **Região** e **Estadual** (via dropdown encadeado com todas as 10 regiões do projeto)
- Preenchimento automático de endereço via **ViaCEP** (busca pelo CEP)
- Validação de **código TOTVS** único (máx. 5 dígitos)
- Máscara de telefone e CEP em tempo real

### 2. `patrimonios.html` — Cadastro de Patrimônios
Formulário em etapas (wizard) dividido em **5 categorias** de patrimônio:
- Instrumentos Musicais, Equipamentos de Som/Vídeo, Mobiliário, Informática, Outros
- Para cada item: **Sim/Não**, quantidade (stepper numérico) e estado de conservação
- Armazena dados na sessão (localStorage) e envia ao backend em um único POST

### 3. `relatorios.html` — Painel Administrativo
- **Lista completa** de todas as igrejas cadastradas (carregada da planilha)
- **Busca por texto**: filtra por TOTVS, dirigente, região, estadual ou endereço
- **Filtro por região**: dropdown com todas as 10 regiões do projeto
- **Badge de contagem** em tempo real
- **Ver Detalhes**: abre painel com dados completos da igreja e tabela de patrimônios
- **Exportar PDF**: gera relatório corporativo via Apps Script e abre link do Drive
- **Gerar Aba Temporária**: cria aba de relatório na planilha

---

## 🏗️ Banco de Dados (Google Planilhas)

### Aba `BASE_GERAL`
| TOTVS | Região | Estadual | Dirigente | Telefone | Endereço | Data Cadastro |
|-------|--------|----------|-----------|----------|----------|---------------|
| 12345 | Grande Sao Paulo - SP | Guarulhos - SP | João Silva | (11) 99999-9999 | Rua X, 100 | 01/07/2026 |

### Aba `PATRIMONIOS`
| TOTVS | Patrimônio | Possui | Quantidade | Conservação |
|-------|-----------|--------|------------|-------------|
| 12345 | Violão | Sim | 2 | Bom |

> O TOTVS é a **chave primária** que une as duas tabelas.

---

## 🌎 Regiões Cadastradas

O sistema organiza as igrejas em **10 regiões**, cada uma com suas estaduais:

| Região | Estados / Cidades |
|--------|------------------|
| Grande São Paulo - SP | Sede Mundial, Guarulhos, Santo André, Osasco e mais |
| Interior - SP | Campinas, Bauru, Sorocaba, São José dos Campos e mais |
| Litoral - SP | Santos |
| Espírito Santo | Vitória, Linhares |
| Rio de Janeiro | São Gonçalo, Duque de Caxias, Niterói, Nova Iguaçu e mais |
| Minas Gerais | BH, Juiz de Fora, Uberlândia, Montes Claros e mais |
| Norte | AM, PA, RO, AC, AP, RR, TO |
| Nordeste | Fortaleza, Recife, Salvador, Natal, Teresina e mais |
| Centro-Oeste | Brasília, Goiânia, Campo Grande, Cuiabá e mais |
| Região Sul | PR, SC, RS (Curitiba, Florianópolis, Porto Alegre e mais) |

---

## ⚙️ Backend — Google Apps Script

### Rotas disponíveis

#### `GET` — Consultas

| Parâmetro `acao` | Descrição |
|------------------|-----------|
| `listar_igrejas` | Retorna todas as igrejas da planilha |
| `obter_detalhes` | Retorna dados completos de uma igreja + patrimônios |
| `testar_roteamento` | Diagnóstico de roteamento regional |

**Exemplos:**
```
GET .../exec?acao=listar_igrejas
GET .../exec?acao=obter_detalhes&totvs=12345
```

#### `POST` — Ações

| Campo `acao` no body | Descrição |
|----------------------|-----------|
| *(ausente)* ou `cadastrar` | Cadastra nova igreja + patrimônios |
| `gerarRelatorio` | Gera aba temporária na planilha e retorna URL |
| `exportarPdf` | Gera PDF corporativo e retorna URL do Drive |

**Exemplo de cadastro:**
```js
fetch(URL_APPS_SCRIPT, {
  method: "POST",
  headers: { "Content-Type": "text/plain;charset=utf-8" },
  body: JSON.stringify({
    totvs: "12345",
    regiao: "Grande Sao Paulo - SP",
    estadual: "Guarulhos - SP (T 15937)",
    dirigente: "João Silva",
    telefone: "(11) 99999-9999",
    endereco: "Rua Exemplo, 100 - Guarulhos/SP",
    violaoPossui: "Sim",
    violaoQtd: "2",
    violaoEstado: "Bom"
  })
});
```

### Arquivos `.gs` do backend

| Arquivo | Responsabilidade |
|---------|-----------------|
| `code.gs` | Entry point — roteia `doGet` e `doPost` |
| `config.gs` | Constantes globais, lista de patrimônios, cores da planilha |
| `database.gs` | CRUD nas planilhas `BASE_GERAL` e `PATRIMONIOS` |
| `report.gs` | Geração de relatório formatado e exportação em PDF |
| `validator.gs` | Validação dos dados recebidos |
| `utils.gs` | Normalização de texto, formatação de datas e auxiliares |
| `response.gs` | Funções `respostaSucesso()` e `respostaErro()` em JSON |

---

## 🚀 Deploy

### Frontend
Não requer build. Basta hospedar os arquivos estáticos em qualquer servidor ou abrir localmente no navegador.

### Backend (Google Apps Script)

1. Acesse [script.google.com](https://script.google.com) e crie um novo projeto
2. Copie o conteúdo de cada arquivo da pasta `codigo API/` para os respectivos arquivos `.gs`
3. Salve todos os arquivos (`Ctrl + S`)
4. Execute manualmente a função `doGet` para conceder permissões de autorização
5. Clique em **Implantar → Nova implantação**
6. Tipo: **Aplicativo da Web**
   - **Executar como:** Eu (sua conta Google)
   - **Quem tem acesso:** Qualquer pessoa (para formulário público)
7. Copie a **URL gerada** do Web App
8. Cole a URL nos arquivos do frontend:
   - `script/script.js` → constante `URL` (linha 11)
   - `script/relatorio.js` → constante `URL` (linha 4)

> ⚠️ **Importante:** Toda vez que o código do Apps Script for alterado, é necessário criar uma **nova implantação** (não editar a existente) para que as mudanças entrem em vigor.

---

## 🧪 Testes Recomendados

Após o deploy, valide o sistema na seguinte ordem:

- [ ] **Cadastro**: preencher formulário completo e enviar → verificar registro em `BASE_GERAL` e `PATRIMONIOS`
- [ ] **Duplicidade**: tentar cadastrar o mesmo TOTVS → deve exibir mensagem de erro
- [ ] **Listagem**: abrir `relatorios.html` → tabela deve carregar todas as igrejas
- [ ] **Busca por texto**: digitar nome de dirigente ou código TOTVS → lista filtra em tempo real
- [ ] **Filtro por região**: selecionar uma região → apenas igrejas daquela região devem aparecer
- [ ] **Ver Detalhes**: clicar no botão → painel abre com dados e patrimônios corretos
- [ ] **Exportar PDF**: clicar em PDF → abre link do Google Drive com o relatório corporativo

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia |
|--------|-----------|
| Frontend | HTML5, CSS3 (Vanilla), JavaScript (ES2020+) |
| Fonte tipográfica | Google Fonts — Poppins |
| CEP automático | [ViaCEP API](https://viacep.com.br) |
| Backend | Google Apps Script (GAS) |
| Banco de dados | Google Planilhas (Google Sheets) |
| Exportação PDF | Google Drive API (via Apps Script) |
| Hospedagem backend | Google Apps Script Web App |

---

## 📞 Informações

**Organização:** Igreja Pentecostal Deus é Amor — IPDA  
**Endereço:** Rua Alexandre Levi, 50 — Cambuci — São Paulo/SP

---

## 📝 Notas Técnicas

- O **TOTVS é a chave primária** em todas as planilhas — nunca altere esse campo após o cadastro
- A propriedade `regiaoChave` normaliza o nome da região (sem acentos, maiúsculo) para garantir o roteamento correto na planilha correta
- Os filtros de busca normalizam acentos automaticamente (ex.: buscar `Sao Paulo` encontra `São Paulo`)
- O painel administrativo carrega os dados em **modo somente leitura** — alterações devem ser feitas diretamente na planilha ou via re-cadastro
- O backend usa `LockService` para evitar condições de corrida em cadastros simultâneos
