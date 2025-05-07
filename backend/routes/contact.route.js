import express from 'express';
// routes/contact.route.js
import { createContactMessage, getAllContactMessages, deleteContactMessage } from '../controller/contact.controller.js';

const router = express.Router();

router.post('/contact', createContactMessage);
router.get('/contact/messages', getAllContactMessages);
router.delete('/contact/messages/:id', deleteContactMessage);


export default router;
