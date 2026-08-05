import { Router } from 'express';
import { TodoController } from '../controllers/todoController';
import { requireAuth } from '../middleware/requireAuth';
import { TodoRepository } from '../repositories/todoRepository';
import { TodoService } from '../services/todoService';

const router = Router();
const todoController = new TodoController(new TodoService(new TodoRepository()));

router.get('/', requireAuth, todoController.list);
router.post('/', requireAuth, todoController.create);
router.put('/:id', requireAuth, todoController.update);
router.delete('/:id', requireAuth, todoController.delete);

export default router;
