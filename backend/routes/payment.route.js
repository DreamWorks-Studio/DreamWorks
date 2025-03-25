import express from 'express';
const router = express.Router();
import { test, selectPaymentMethod, enterCardDetails, getPayments, generateInvoice, onSubmit, processPayment, getAllPayments, processCardPayment, getInvoice } from '../controller/payment.controller.js';

router.get('/test', test);
router.post('/select-method', selectPaymentMethod);
router.post('/gateway', enterCardDetails)
router.post('/payment-process', processPayment);
router.get('/getPayment', getPayments);
router.get('/getAllPayments', getAllPayments);
router.post('/generate-invoice', generateInvoice);
router.get('/invoices/:filename', getInvoice);
router.post('/saveCard', onSubmit);
router.post('/card', processCardPayment);

export default router;