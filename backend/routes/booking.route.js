import express from 'express';
const router = express.Router();

import { test } from '../controller/booking.controller.js';

router.get('/test',test);



export default router;
