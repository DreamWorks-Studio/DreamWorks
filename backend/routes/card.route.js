// routes/card.routes.js
import express from 'express';
import { saveCard, getUserCards, updateCard, deleteCard, setDefaultCard } from '../controller/card.controller.js';

const router = express.Router();

router.post('/save', saveCard);
router.get('/user/:userId', getUserCards);
router.put('/:cardId', updateCard);
router.delete('/:cardId', deleteCard);
router.put('/:cardId/default', setDefaultCard);

export default router;


