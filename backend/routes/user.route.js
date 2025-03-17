import express from 'express';

import { test, UpdateUser , DeleteUser } from '../controller/user.controller.js';
import { verifyToken } from '../utils/VerifyUser.js';
import authorizedRoles from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get("/admin" , verifyToken , authorizedRoles("admin"), (req ,res) => {

    res.json({message : "Welcome Admin"});
})
router.get("/user" , verifyToken , authorizedRoles("admin" , "user"), (req ,res) => {

    res.json({message : "Welcome user"});
})

router.get('/test', test);
router.post('/update/:id' , verifyToken , UpdateUser)
router.delete('/delete/:id' ,verifyToken ,DeleteUser)

export default router;