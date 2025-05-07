import User from '../model/user.model.js';
import bcrypt from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

export const signup = async (req, res, next) => {
  const { username, email, password, confirmpassword } = req.body;

  if (password !== confirmpassword) {
    return next(errorHandler(400, 'Passwords do not match'));
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    confirmpassword: hashedPassword,
    isAdmin: false,       // Explicitly set
    isSuperAdmin: false ,  // Explicitly set
    lastActive: new Date(),
    
  });

  try {
    await newUser.save();
    res.status(201).json('User Created Successfully');
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, 'User not found'));

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(400, 'Invalid password'));

    const token = jwt.sign(
      {
        id: validUser._id,
        isAdmin: validUser.isAdmin,
        isSuperAdmin: validUser.isSuperAdmin ,// Added
        lastActive: new Date(),
        
      },
      process.env.JWT_SECRET,
      { expiresIn: '1m' } // Added expiration
    );

    const { password: pass, ...rest } = validUser._doc;

    res
      .status(200)
      .cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      })
      .json(rest);
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  const { email, name, googlePhotoUrl } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      const token = jwt.sign(
        {
          id: user._id,
          isAdmin: user.isAdmin,
          isSuperAdmin: user.isSuperAdmin,
        },
        process.env.JWT_SECRET
      );
      return res.status(200).json({ user, token });
    }

    const generatedUsername = name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 10000);

    const newUser = new User({
      email,
      username: generatedUsername,
      googlePhotoUrl,
      avatar: googlePhotoUrl, // ✅ Add this
      isAdmin: false,
      isSuperAdmin: false,
    });

    await newUser.save();

    const token = jwt.sign(
      {
        id: newUser._id,
        isAdmin: newUser.isAdmin,
        isSuperAdmin: newUser.isSuperAdmin,
      },
      process.env.JWT_SECRET
    );

    return res.status(201).json({ user: newUser, token });
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

export const setupSuperAdmin = async (req, res, next) => {
  
  try {
    const superAdmin = await User.findOneAndUpdate(
      { email: process.env.SUPERADMIN_EMAIL },
      { isAdmin: true, isSuperAdmin: true },
      { new: true, upsert: true }
    );
    
    res.status(200).json(superAdmin);
  } catch (error) {
    next(error);
  }
};