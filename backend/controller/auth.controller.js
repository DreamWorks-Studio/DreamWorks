import User from '../model/user.model.js'
import bcrypt from 'bcryptjs'
import { errorHandler } from '../utils/error.js';


export const signup = async (req,res,next) =>{

  const { username , email ,password,confirmPassword } = req.body;
  console.log(username , email ,password,confirmPassword )
  const HashedPassword = bcrypt.hashSync(password,10);
  const HashedPassword2 = bcrypt.hashSync(confirmPassword,10);
  const newUser =  new User({ username , email ,password : HashedPassword , confirmPassword : HashedPassword2});
  try {
    await newUser.save();
    res.status(201).json('User Created Succesfully')
  } catch (error) {
    next(errorHandler(550 , 'error from the function'));
  }
  
}

