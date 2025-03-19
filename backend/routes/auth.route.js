import express from 'express'
import { google, signin, signup, signout } from '../controller/auth.controller.js';
import nodemailer from 'nodemailer'
import User from '../model/user.model.js';
import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/google", google);
router.get("/signout", signout);


  
export default router;