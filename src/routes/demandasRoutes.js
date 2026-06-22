import { Router } from 'express';
import * as controller from '../controllers/demandasController.js';
import { autenticarJWT } from '../middlewares/autenticacao.js';


const router = Router();

router.use(autenticarJWT);

router.get('/', autenticarJWT, controller.listar);
router.get('/:id', autenticarJWT, controller.buscarPorId);
router.post('/', autenticarJWT, controller.criar);
router.put('/:id', autenticarJWT, controller.atualizar);
router.delete('/:id', autenticarJWT, controller.remover);

export default router;