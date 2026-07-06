require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configuração do Pool para Neon.tech
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Rota de validação de TOTVS
app.get('/api/validar-totvs/:codigo', async (req, res) => {
    const { codigo } = req.params;
    try {
        const result = await pool.query('SELECT 1 FROM igrejas WHERE totvs = $1', [codigo]);
        res.json({ existe: result.rowCount > 0 });
    } catch (error) {
        console.error('Erro ao validar TOTVS:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

// Rota de Cadastro com Transação SQL Corrigida
app.post('/api/cadastro', async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            totvs, regiao, estadual, dirigente, telefone, endereco, cep,
            itensExtras
        } = req.body;

        await client.query('BEGIN');

        // 1. Salvar ou Atualizar Igreja na tabela 'igrejas'
        const upsertIgrejaQuery = `
            INSERT INTO igrejas (totvs, regiao, estadual, endereco, dirigente, telefone, data_cadastro)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            ON CONFLICT (totvs) DO UPDATE SET
                regiao = EXCLUDED.regiao,
                estadual = EXCLUDED.estadual,
                endereco = EXCLUDED.endereco,
                dirigente = EXCLUDED.dirigente,
                telefone = EXCLUDED.telefone,
                data_cadastro = NOW()
            RETURNING totvs;
        `;
        await client.query(upsertIgrejaQuery, [totvs, regiao, estadual, endereco, dirigente, telefone]);

        // 2. Limpar patrimônios antigos desta igreja usando a coluna correta 'totvs'
        await client.query('DELETE FROM patrimonios WHERE totvs = $1', [totvs]);

        // 3. Mapeamento de IDs para os nomes corretos do formulário original
        const mapeamentoNomes = {
            banco: "BANCOS", cadeira: "CADEIRAS", bebedouroFiltro: "BEBEDOURO OU FILTRO",
            ar: "AR CONDICIONADO", ventilator: "VENTILADORES", armario: "ARMÁRIO",
            mesa: "MESA", cofreBocaLobo: "COFRE BOCA DE LOBO", computador: "COMPUTADOR",
            impressora: "IMPRESSORA", projetor: "PROJETOR", telaProjetor: "TELA DE PROJETOR",
            microfone: "MICROFONE", pulpito: "PÚLPITO", telefonePatrimonio: "TELEFONE",
            celular: "CELULAR", cameraSeguranca: "CÂMERA DE SEGURANÇA", caixaSom: "CAIXAS DE SOM",
            mesaSom: "MESA DE SOM", violao: "VIOLÃO", guitarra: "GUITARRA", bateria: "BATERIA",
            contrabaixo: "CONTRABAIXO", teclado: "TECLADO", freezer: "FREEZER",
            geladeira: "GELADEIRA", fogao: "FOGÃO", botijao: "BOTIJÃO",
            microondas: "MICRO-ONDAS", extintor: "EXTINTOR"
        };

        // 4. Salvar itens dinâmicos com colunas alinhadas ao Neon (totvs, patrimonio, possui, quantidade, conservacao, observacao)
        const entries = Object.entries(req.body);
        for (const [key, value] of entries) {
            if (key.endsWith('Possui')) {
                const itemId = key.replace('Possui', '');
                const possui = String(value).toUpperCase();
                const qtd = parseInt(req.body[`${itemId}Qtd`]) || 0;
                const estado = req.body[`${itemId}Estado`] || '-';
                const obs = req.body[`${itemId}Obs`] || '-';
                const nomeFormatado = mapeamentoNomes[itemId] || itemId.toUpperCase();

                if (possui === 'SIM' && qtd > 0) {
                    await client.query(
                        'INSERT INTO patrimonios (totvs, patrimonio, possui, quantidade, conservacao, observacao) VALUES ($1, $2, $3, $4, $5, $6)',
                        [totvs, nomeFormatado, possui, qtd, estado, obs]
                    );
                }
            }
        }

        // 5. Salvar itens extras coletados do sub-formulario
        if (itensExtras) {
            const extras = typeof itensExtras === 'string' ? JSON.parse(itensExtras) : itensExtras;
            for (const item of extras) {
                const possuiExtra = String(item.possui).toUpperCase();
                const qtdExtra = parseInt(item.quantidade) || 0;
                
                if (possuiExtra === 'SIM' && qtdExtra > 0) {
                    await client.query(
                        'INSERT INTO patrimonios (totvs, patrimonio, possui, quantidade, conservacao, observacao) VALUES ($1, $2, $3, $4, $5, $6)',
                        [totvs, String(item.nome).toUpperCase(), possuiExtra, qtdExtra, item.estado || '-', item.observacao || '-']
                    );
                }
            }
        }

        await client.query('COMMIT');
        res.json({ sucesso: true, mensagem: 'Cadastro realizado com sucesso!' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro no cadastro:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao salvar os dados.' });
    } finally {
        client.release();
    }
});

// Rota para listagem do Painel Admin
app.get('/api/igrejas', async (req, res) => {
    try {
        const { pagina = 1, regiao, totvs } = req.query;
        const limite = 50;
        const offset = (pagina - 1) * limite;

        let query = 'SELECT * FROM igrejas WHERE 1=1';
        const params = [];

        if (regiao) {
            params.push(regiao);
            query += ` AND regiao = $${params.length}`;
        }

        if (totvs) {
            params.push(totvs);
            query += ` AND totvs = $${params.length}`;
        }

        query += ` ORDER BY data_cadastro DESC LIMIT ${limite} OFFSET ${offset}`;
        const result = await pool.query(query, params);

        let countQuery = 'SELECT COUNT(*) FROM igrejas WHERE 1=1';
        const countParams = [];
        if (regiao) {
            countParams.push(regiao);
            countQuery += ` AND regiao = $${countParams.length}`;
        }
        if (totvs) {
            countParams.push(totvs);
            countQuery += ` AND totvs = $${countParams.length}`;
        }
        const countResult = await pool.query(countQuery, countParams);

        res.json({
            dados: result.rows,
            total: parseInt(countResult.rows[0].count),
            pagina: parseInt(pagina),
            paginas: Math.ceil(parseInt(countResult.rows[0].count) / limite)
        });
    } catch (error) {
        console.error('Erro ao listar igrejas:', error);
        res.status(500).json({ error: 'Erro ao buscar dados' });
    }
});

app.get('/api/status', (req, res) => {
    res.json({ status: 'Servidor rodando', database: 'Pronto para Neon.tech' });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
