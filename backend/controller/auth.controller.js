import User from '../model/user.model.js';
import bcrypt from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';

export const signup = async (req, res, next) => {
    const { username, email, password, confirmPassword } = req.body;
    
    console.log(username, email, password, confirmPassword);

    if (password !== confirmPassword) {
        return next(errorHandler(400, 'Passwords do not match'));
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = new User({ 
        username, 
        email, 
        password: hashedPassword // Don't store `confirmPassword`
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

        const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

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
        let user = await User.findOne({ email: req.body.email });

        if (user) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
            const { password: pass, ...userData } = user._doc;

            return res.cookie('access_token', token, { httpOnly: true })
                .status(200)
                .json(userData);
        } 

        // Generate a secure random password
        const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
        const hashedPassword = bcrypt.hashSync(generatedPassword, 10);

        const newUser = new User({
            username: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            avatar: req.body.photo // Ensure avatar is a string, not a Buffer
        });

        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
        const { password: pass, ...userData } = newUser._doc;

        res.cookie('access_token', token, { httpOnly: true })
            .status(200)
            .json(userData);

    } catch (error) {
        next(errorHandler(500, 'Error processing Google sign-in'));
    }
};
