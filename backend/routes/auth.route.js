import express from 'express'
import { promo } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/promo', promo);

export default router;