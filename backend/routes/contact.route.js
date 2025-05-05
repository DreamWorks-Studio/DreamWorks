import express from 'express';
// routes/contact.route.js
import { createContactMessage } from '../controller/contact.controller.js';

const router = express.Router();

router.post('/contact', createContactMessage);

export default router;
