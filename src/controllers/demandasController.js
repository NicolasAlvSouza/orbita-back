import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../data/db.js';
import { processarUploadImagem } from '../middlewares/uploadImagem.js';

export const listar = async (req, res) => {
  try {
    const db = await getDatabase();
    const demandas = await db.all(`SELECT * FROM demandas ORDER BY data_criacao DESC`);
    res.json(demandas);
   
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    console.error('[demandas.listarDemandas]', erro);
    res.status(500).json({ mensagem: 'Erro ao buscar demandas.' });
  }
}

export async function buscarPorId(req, res) {
  const { id } = req.params;

  try {
    const db = await getDatabase();

    const demanda = await db.get(
      `SELECT
          id,
          id_usuario,
          nome_cliente,
          descricao,
          status,
          prioridade,
          data_criacao
       FROM demandas
       WHERE id = ?`,
      [id]
    );

    if (!demanda) {
      return res.status(404).json({
        mensagem: 'Demanda não encontrada.'
      });
    }

    res.json(demanda);

  } catch (erro) {
    console.error('[demandas.buscarDemandaPorId]', erro);

    res.status(500).json({
      mensagem: 'Erro ao buscar demanda.'
    });
  }
}

export async function criar(req, res) {
  const {
    id_usuario,
    nome_cliente,
    descricao,
    prioridade,
    status
  } = req.body;

  if (!nome_cliente || !descricao) {
    return res.status(400).json({
      mensagem: 'Campos obrigatórios ausentes.'
    });
  }

  try {
    const db = await getDatabase();

    const resultado = await db.run(
      `INSERT INTO demandas
       (id_usuario, nome_cliente, descricao, prioridade, status)
       VALUES (?, ?, ?, ?, ?)`,
      [
        id_usuario,
        nome_cliente,
        descricao,
        prioridade || 'Média',
        status || 'Pendente'
      ]
    );

    res.status(201).json({
      id: resultado.lastID,
      id_usuario,
      nome_cliente,
      descricao,
      prioridade: prioridade || 'Média',
      status: status || 'Pendente'
    });

  } catch (erro) {
    console.error('[demandas.criar]', erro);

    res.status(500).json({
      mensagem: 'Erro ao salvar demanda.'
    });
  }
}

export async function atualizar(req, res) {
  const idDemanda = Number(req.params.id);

  const {
    nome_cliente,
    descricao,
    prioridade,
    status
  } = req.body;

  try {
    const db = await getDatabase();

    const atual = await db.get(
      'SELECT * FROM demandas WHERE id = ?',
      [idDemanda]
    );

    if (!atual) {
      return res.status(404).json({
        mensagem: 'Demanda não encontrada.'
      });
    }

    const novoNomeCliente = nome_cliente ?? atual.nome_cliente;
    const novaDescricao = descricao ?? atual.descricao;
    const novaPrioridade = prioridade ?? atual.prioridade;
    const novoStatus = status ?? atual.status;

    await db.run(
      `UPDATE demandas
       SET nome_cliente = ?,
           descricao = ?,
           prioridade = ?,
           status = ?
       WHERE id = ?`,
      [
        novoNomeCliente,
        novaDescricao,
        novaPrioridade,
        novoStatus,
        idDemanda
      ]
    );

    res.json({
      id: idDemanda,
      nome_cliente: novoNomeCliente,
      descricao: novaDescricao,
      prioridade: novaPrioridade,
      status: novoStatus
    });

  } catch (erro) {
    console.error('[demandas.atualizar]', erro);

    res.status(500).json({
      mensagem: 'Erro ao atualizar demanda.'
    });
  }
}

export async function remover(req, res) {
  const idDemanda = Number(req.params.id);

  try {
    const db = await getDatabase();

    const demanda = await db.get(
      'SELECT id_usuario FROM demandas WHERE id = ?',
      [idDemanda]
    );

    if (!demanda) {
      return res.status(404).json({
        mensagem: 'Demanda não encontrada.'
      });
    }

    if (demanda.id_usuario !== req.usuarioId) {
      return res.status(403).json({
        mensagem: 'Você só pode remover suas próprias demandas.'
      });
    }

    const resultado = await db.run(
      'DELETE FROM demandas WHERE id = ?',
      [idDemanda]
    );

    if (resultado.changes === 0) {
      return res.status(404).json({
        mensagem: 'Demanda não encontrada.'
      });
    }

    res.json({
      mensagem: 'Demanda removida com sucesso.'
    });

  } catch (erro) {
    console.error('[demandas.remover]', erro);

    res.status(500).json({
      mensagem: 'Erro ao remover demanda.'
    });
  }
}