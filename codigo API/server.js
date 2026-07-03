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

// Rota de Cadastro com Transação SQL
app.post('/api/cadastro', async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            totvs, regiao, estadual, dirigente, telefone, endereco, cep,
            itensExtras // JSON string vindo do frontend
        } = req.body;

        await client.query('BEGIN');

        // 1. Salvar ou Atualizar Igreja na tabela 'igrejas'
        const upsertIgrejaQuery = `
            INSERT INTO igrejas (totvs, regiao, estadual, dirigente, telefone, endereco, cep, data_cadastro)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
            ON CONFLICT (totvs) DO UPDATE SET
                regiao = EXCLUDED.regiao,
                estadual = EXCLUDED.estadual,
                dirigente = EXCLUDED.dirigente,
                telefone = EXCLUDED.telefone,
                endereco = EXCLUDED.endereco,
                cep = EXCLUDED.cep,
                data_cadastro = NOW()
            RETURNING totvs;
        `;
        await client.query(upsertIgrejaQuery, [totvs, regiao, estadual, dirigente, telefone, endereco, cep]);

        // 2. Limpar patrimônios antigos desta igreja para re-cadastrar (opcional, dependendo da regra)
        await client.query('DELETE FROM patrimonios WHERE igreja_totvs = $1', [totvs]);

        // 3. Salvar itens dinâmicos do formulário (mapeando campos fixos do Apps Script para SQL)
        const entries = Object.entries(req.body);
        for (const [key, value] of entries) {
            if (key.endsWith('Possui')) {
                const itemId = key.replace('Possui', '');
                const possui = value;
                const qtd = req.body[`${itemId}Qtd`] || 0;
                const estado = req.body[`${itemId}Estado`] || '';
                const obs = req.body[`${itemId}Obs`] || '';

                if (possui === 'Sim' || possui === 'Nao') {
                    await client.query(
                        'INSERT INTO patrimonios (igreja_totvs, item_id, possui, quantidade, estado, observacao) VALUES ($1, $2, $3, $4, $5, $6)',
                        [totvs, itemId, possui, qtd, estado, obs]
                    );
                }
            }
        }

        // 4. Salvar itens extras (adicionados manualmente)
        if (itensExtras) {
            const extras = JSON.parse(itensExtras);
            for (const item of extras) {
                await client.query(
                    'INSERT INTO patrimonios (igreja_totvs, item_id, possui, quantidade, estado, observacao, nome_extra) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                    [totvs, 'extra', item.possui, item.quantidade || 0, item.estado, item.observacao, item.nome]
                );
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

// Rota para listagem de igrejas (Painel Admin) com Paginação e Filtros
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

        // Query para contar o total (para paginação no frontend)
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

// Placeholder para futuras rotas do Neon.tech
app.get('/api/status', (req, res) => {
    res.json({ status: 'Servidor rodando', database: 'Pronto para Neon.tech' });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
