import User from '../model/user.model.js'
import bcrypt from 'bcryptjs'

export const signup = async (req,res) =>{

  const { username , email ,password} = req.body;
  const HashedPassword = bcrypt.hashSync(password,10);
  const newUser =  new User({ username , email ,password : HashedPassword});
  try {
    await newUser.save();
    res.status(201).json('User Created Succesfully')
  } catch (error) {
    res.status(500).json(error.message);
  }
  
}