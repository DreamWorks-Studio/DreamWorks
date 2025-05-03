import express from 'express';
import { test, UpdateUser , DeleteUser } from '../controller/user.controller.js';
import { verifyToken  } from '../utils/UserVerify.js';
import { getUser } from '../controller/user.controller.js';
import { signout } from '../controller/auth.controller.js';
import { forgetpassword,resetpassword,updateResetPassword } from '../controller/user.controller.js';
const router = express.Router();
import { toggleUserStatus } from '../controller/user.controller.js';
import { toggleAdminPrivileges } from '../controller/user.controller.js';
import { verifySuperAdmin } from '../utils/UserVerify.js';

router.get('/test', test);
router.post('/update/:id' , verifyToken , UpdateUser);
router.delete('/delete/:id' ,verifyToken ,DeleteUser);
router.post('/signout' , signout);
router.get('/getusers' , verifyToken , getUser);
router.get('/:userId', getUser);
router.post('/forgetpassword',forgetpassword);
router.get('/resetpassword/:id/:token',resetpassword);
router.post('/updateResetPassword/:id/:token',updateResetPassword);
router.patch('/toggle-status/:id', verifyToken, toggleUserStatus);

// In user.route.js
router.patch(
    '/toggle-admin/:id', 
    verifyToken, 
    verifySuperAdmin, 
    toggleAdminPrivileges
  );

export default router;