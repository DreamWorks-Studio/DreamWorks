import express from 'express';
const router = express.Router();
import { test, createPayment, getPayments, generateInvoice, onSubmit } from '../controller/payment.controller.js';

router.get('/test', test);

router.post('/', createPayment);
//router.post('/payment', processPayment);
router.get('/getPayment', getPayments);
router.post('/generate-invoice', generateInvoice);
router.post('/saveCard', onSubmit);

export default router;