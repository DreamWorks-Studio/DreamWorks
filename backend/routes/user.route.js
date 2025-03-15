import express from 'express';

import { test, UpdateUser } from '../controller/user.controller.js';
import { verifyToken } from '../utils/VerifyUser.js';


const router = express.Router();

router.get('/test', test);
router.post('/update/:id' , verifyToken , UpdateUser)

export default router;