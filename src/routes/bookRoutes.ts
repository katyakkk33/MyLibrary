import { Router } from 'express';
import {
  listBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  bulkCreate,
  enrichBooks,
} from '../controllers/bookController';

const router = Router();

/**
 * БАЗОВІ CRUD-ЕНДПОЙНТИ
 * Пам'ятай: цей роутер монтується як app.use('/api/books', router)
 * Тому шляхи тут мають починатися з '/', а не з '/books'
 */

// GET /api/books
router.get('/', listBooks);

// GET /api/books/:id
router.get('/:id(\\d+)', getBookById);

// POST /api/books
router.post('/', createBook);

// PUT /api/books/:id
router.put('/:id(\\d+)', updateBook);

// DELETE /api/books/:id
router.delete('/:id(\\d+)', deleteBook);

/** ДОДАТКОВІ */
/// POST /api/books/bulk — масове додавання
router.post('/bulk', bulkCreate);

/// POST /api/books/enrich — збагачення обкладинками/даними
router.post('/enrich', enrichBooks);

export default router;
