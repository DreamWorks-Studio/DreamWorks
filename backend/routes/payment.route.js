import express from 'express';
const router = express.Router();
import { test, createPayment } from '../controller/payment.controller.js';

router.get('/test', test);

router.post('/', createPayment);

export default router;