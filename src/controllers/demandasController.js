import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../data/db.js';
import { processarUploadImagem } from '../middlewares/uploadImagem.js';

export const listar = async (req, res) => {
  try {
    const db = await getDatabase();

    const demandas = await db.all(
      `SELECT * FROM demandas ORDER BY data_criacao DESC`
    );

    return res.status(200).json(demandas);

  } catch (error) {
    console.error('[demandas.listar]', error);

    return res.status(500).json({
      mensagem: 'Erro ao buscar demandas.'
    });
  }
};

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

    return res.status(200).json(demanda);

  } catch (error) {
    console.error('[demandas.buscarPorId]', error);

    return res.status(500).json({
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
    const { data, error } = await supabase
      .from('demandas')
      .insert([
        {
          id_usuario,
          nome_cliente,
          descricao,
          prioridade: prioridade || 'Média',
          status: status || 'Pendente'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('[supabase.criar]', error);
      return res.status(400).json({
        mensagem: error.message
      });
    }

    return res.status(201).json(data);

  } catch (erro) {
    console.error('[demandas.criar]', erro);

    return res.status(500).json({
      mensagem: 'Erro ao salvar demanda.'
    });
  }
}

export async function atualizar(req, res) {
  const id = Number(req.params.id);

  const { nome_cliente, descricao, prioridade, status } = req.body;

  try {
    const { data: atual, error: errFind } = await supabase
      .from('demandas')
      .select('*')
      .eq('id', id)
      .single();

    if (errFind || !atual) {
      return res.status(404).json({ mensagem: 'Demanda não encontrada.' });
    }

    const { data, error } = await supabase
      .from('demandas')
      .update({
        nome_cliente: nome_cliente ?? atual.nome_cliente,
        descricao: descricao ?? atual.descricao,
        prioridade: prioridade ?? atual.prioridade,
        status: status ?? atual.status
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ mensagem: error.message });
    }

    return res.json(data);

  } catch (erro) {
    console.error('[demandas.atualizar]', erro);
    return res.status(500).json({ mensagem: 'Erro ao atualizar demanda.' });
  }
}

export async function remover(req, res) {
  const id = Number(req.params.id);

  try {
    const { data: demanda, error: errFind } = await supabase
      .from('demandas')
      .select('id_usuario')
      .eq('id', id)
      .single();

    if (errFind || !demanda) {
      return res.status(404).json({ mensagem: 'Demanda não encontrada.' });
    }

    if (demanda.id_usuario !== req.usuarioId) {
      return res.status(403).json({
        mensagem: 'Você só pode remover suas próprias demandas.'
      });
    }

    const { error } = await supabase
      .from('demandas')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ mensagem: error.message });
    }

    return res.json({ mensagem: 'Demanda removida com sucesso.' });

  } catch (erro) {
    console.error('[demandas.remover]', erro);
    return res.status(500).json({ mensagem: 'Erro ao remover demanda.' });
  }
}
