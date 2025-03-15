import express from 'express';
const router = express.Router();
import { test, createPayment, processPayment } from '../controller/payment.controller.js';

router.get('/test', test);

router.post('/', createPayment);
router.post('/payment', processPayment);

export default router;