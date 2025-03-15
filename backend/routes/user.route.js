import express from 'express';

import { test } from '../controller/user.controller.js';


const router = express.Router();

router.get('/test', test);
router.post("/update/:id")

export default router;