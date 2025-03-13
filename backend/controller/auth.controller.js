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




};

export const google = async(req,res,next) => {

       try {
        const user = await User.findOne({email: req.body.email});
        if(user){

          const token = jwt.sign({ id: user._id}, process.env.JWT_SECRET);
          const {password : pass, ...rest} = user._id;
          res.cookie('access_token' , token , {httpOnly : true}).status(200).json(rest);
             
        }else{

          const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
          const HashedPassword = bcrypt.hashSync(generatedPassword,10);
          const newUser = new User({username: req.body.name , email : req.body.email , password : HashedPassword , avatar : req.body.photo});
          await newUser.save();
          const token = jwt.sign({id : newUser._id}, process.env.JWT_SECRET);
          const {password : pass, ...rest} = newUser._id;
          res.cookie('access_token' , token , {httpOnly : true})
              .status(200)
              .json(rest);
             
            
        }
  
      } catch (error) {
  
      }

}

