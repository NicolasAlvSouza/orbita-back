-- Arquivo de apoio para os alunos enxergarem o SQL das tabelas base.
-- Quando for criar uma tabela nova manualmente:
-- 1) escreva o CREATE TABLE aqui como rascunho e referencia;
-- 2) copie a mesma estrutura para src/data/db.js;
-- 3) suba o projeto para o backend executar o CREATE TABLE IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS usuarios (
    id        INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nome      TEXT NOT NULL,
    email     TEXT NOT NULL UNIQUE,
    senha     TEXT NOT NULL,
    foto      TEXT
);

-- TABELA PRODUTOS
CREATE TABLE IF NOT EXISTS produtos (
    id          INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nome        TEXT NOT NULL,
    descricao   TEXT,
    preco       NUMERIC,
    id_usuario    INTEGER NOT NULL,
    
     CONSTRAINT fk_demanda_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id)
);

-- TABELA DEMANDAS
CREATE TABLE IF NOT EXISTS demandas (
    id            INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    id_usuario    INTEGER NOT NULL,
    nome_cliente  TEXT NOT NULL,
    descricao     TEXT,
    prioridade    TEXT DEFAULT 'media',
    status        TEXT DEFAULT 'novo',
    data_criacao  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_demanda_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id)
);

-- TABELA INTERMEDIÁRIA
CREATE TABLE IF NOT EXISTS demanda_produto (
    id          INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    id_demanda  INTEGER NOT NULL,
    id_produto  INTEGER NOT NULL,

    CONSTRAINT fk_dp_demanda
        FOREIGN KEY (id_demanda)
        REFERENCES demandas(id),

    CONSTRAINT fk_dp_produto
        FOREIGN KEY (id_produto)
        REFERENCES produtos(id)
);