const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? "http://localhost:3000"
    : ""; // Em produção, a API costuma rodar no mesmo domínio ou subdomínio configurado
let paginaAtual = 1;

async function carregarIgrejas(pagina = 1) {
    const regiao = document.getElementById('filtro-regiao').value;
    const totvs = document.getElementById('filtro-totvs').value;

    try {
        const response = await fetch(`${API_BASE_URL}/api/igrejas?pagina=${pagina}&regiao=${regiao}&totvs=${totvs}`);
        const result = await response.json();

        renderizarTabela(result.dados);
        renderizarPaginacao(result.paginas, result.pagina);
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
    }
}

function renderizarTabela(igrejas) {
    const tbody = document.getElementById('tabela-igrejas');
    tbody.innerHTML = '';

    if (igrejas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Nenhum registro encontrado</td></tr>';
        return;
    }

    igrejas.forEach(igreja => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${igreja.totvs}</strong></td>
            <td>${igreja.regiao}</td>
            <td>${igreja.estadual}</td>
            <td>${igreja.dirigente}</td>
            <td>${new Date(igreja.data_cadastro).toLocaleDateString('pt-BR')}</td>
            <td>
                <button class="btn-acao" onclick="verDetalhes('${igreja.totvs}')">Ver Patrimônios</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderizarPaginacao(totalPaginas, atual) {
    const container = document.getElementById('paginacao');
    container.innerHTML = '';

    for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        btn.className = i === atual ? 'ativo' : 'voltar';
        btn.onclick = () => {
            paginaAtual = i;
            carregarIgrejas(i);
        };
        container.appendChild(btn);
    }
}

function verDetalhes(totvs) {
    alert(`Funcionalidade de detalhes para o TOTVS ${totvs} em desenvolvimento (integração com tabela patrimonios).`);
}

document.getElementById('btn-filtrar').addEventListener('click', () => {
    paginaAtual = 1;
    carregarIgrejas(1);
});

// Popular select de regiões (mock ou API futura)
const regioes = [
    "Grande Sao Paulo - SP", "Interior - SP", "Litoral - SP", "Espirito Santo",
    "Rio de Janeiro", "Minas Gerais", "Norte", "Nordeste", "Centro-Oeste", "Regiao Sul"
];

const selectRegiao = document.getElementById('filtro-regiao');
regioes.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r;
    opt.innerText = r;
    selectRegiao.appendChild(opt);
});

// Inicializar
carregarIgrejas();
