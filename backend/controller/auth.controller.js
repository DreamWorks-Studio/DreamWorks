import User from '../model/user.model.js'
import bcrypt from 'bcryptjs'
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';


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
  
};

export const signin = async (req,res,next) =>{

      const {email , password } = req.body;
      try {

        const validUser = await User.findOne({email});
        if(!validUser) return next(errorHandler(404,'User Not Found'));
        const validPassword = bcrypt.compareSync(password , validUser.password)
        if(!validPassword) return next(errorHandler(401,'Wrong credntials'));
        const token = jwt.sign({id : validUser._id} , process.env.JWT_SECRET);
        const {password : pass , ...rest} = validUser._doc;
       
        res
           .cookie('access_token' , token , {httpOnly :true})
           .status(200)
           .json(rest)
           
          

        
      } catch (error) {
        next(error)
      }




}


