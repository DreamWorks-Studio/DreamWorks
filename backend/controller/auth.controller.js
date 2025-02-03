import User from '../model/user.model.js'
import bcrypt from 'bcryptjs'
import { errorHandler } from '../utils/error.js';

export const signup = async (req,res,next) =>{

  const { username , email ,password} = req.body;
  const HashedPassword = bcrypt.hashSync(password,10);
  const newUser =  new User({ username , email ,password : HashedPassword});
  try {
    await newUser.save();
    res.status(201).json('User Created Succesfully')
  } catch (error) {
    next(errorHandler(550 , 'error from the function'));
  }
  
}