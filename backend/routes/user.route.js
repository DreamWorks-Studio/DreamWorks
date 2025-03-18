import express from 'express';
import { test, UpdateUser , DeleteUser } from '../controller/user.controller.js';
import { verifyToken  } from '../utils/UserVerify.js';
import { getUser } from '../controller/user.controller.js';
import { signout } from '../controller/auth.controller.js';
const router = express.Router();



router.get('/test', test);
router.post('/update/:id' , verifyToken , UpdateUser);
router.delete('/delete/:id' ,verifyToken ,DeleteUser);
router.post('/signout' , signout);
router.get('/getusers' , verifyToken , getUser);
router.get('/:userId', getUser);

export default router;