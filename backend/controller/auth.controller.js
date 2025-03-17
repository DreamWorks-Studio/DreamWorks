import User from '../model/user.model.js';
import bcrypt from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

export const signup = async (req, res, next) => {
    const { username, email, password ,confirmpassword } = req.body;
    console.log({ username, email, password ,confirmpassword });
    
    console.log(username, email, password,confirmpassword);

    if (password !== confirmpassword) {
        return next(errorHandler(400, 'Passwords do not match'));
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
     const hashedPassword2 = bcrypt.hashSync(confirmpassword,10);

    const newUser = new User({ 
        username, 
        email, 
        password: hashedPassword, // Don't store `confirmPassword`
        confirmpassword:hashedPassword2,
    });

    try {
        await newUser.save();
        res.status(201).json('User Created Successfully');
    } catch (error) {
        next(errorHandler(500, 'Error from the function'));
    }
};

export const signin = async (req, res, next) => {
    const { email, password } = req.body;
    console.log({ email, password });

    try {
        const validUser = await User.findOne({ email });

        if (!validUser) return next(errorHandler(404, 'User Not Found'));

        const validPassword = bcrypt.compareSync(password, validUser.password);
        if (!validPassword) return next(errorHandler(401, 'Wrong credentials'));

        const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);
        

        // Use `_doc` to extract user data properly
        const { password: pass, ...userData } = validUser._doc;
        

        res.cookie('access_token', token, { httpOnly: true })
            .status(200)
            .json(userData);

    } catch (error) {
        next(error);
    }
};


export const google = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
      const { password: hashedPassword, ...rest } = user._doc;
      const expiryDate = new Date(Date.now() + 3600000); // 1 hour
      res
        .cookie('access_token', token, {
          httpOnly: true,
          expires: expiryDate,
        })
        .status(200)
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);

      const username =
        (req.body.name?.split(' ').join('').toLowerCase() || 'user') +
        Math.random().toString(36).slice(-8);

      const newUser = new User({
        username,
        email: req.body.email,
        password: hashedPassword,
        profilePicture: req.body.photoURL,
      });

      await newUser.save();
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
      const { password: hashedPasswordNew, ...rest } = newUser._doc;
      const expiryDate = new Date(Date.now() + 3600000); // 1 hour

      res
        .cookie('access_token', token, {
          httpOnly: true,
          expires: expiryDate,
        })
        .status(200)
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};

export const signout = (req, res) => {
  res
    .clearCookie('access_token', { httpOnly: true })
    .status(200)
    .json('Signout success!');
};
