import express from 'express';
const router = express.Router();
import { test, createPayment, processPayment, getPayments } from '../controller/payment.controller.js';

router.get('/test', test);

router.post('/', createPayment);
router.post('/payment', processPayment);
router.get('/getPayment', getPayments);

export default router;