import { Router } from 'express';
import * as controller from '../controllers/demandaProdutoController.js';
import { autenticarJWT } from '../middlewares/autenticacao.js';

const router = Router();

router.use(autenticarJWT);

router.get('/', controller.listar);
router.get('/:id', autenticarJWT, controller.buscarPorId);
router.post('/', autenticarJWT, controller.criar);
router.put('/:id', autenticarJWT, controller.atualizar);

export default router;