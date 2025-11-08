import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/users.js';
import dotenv from 'dotenv';
dotenv.config();

const registerUser = async (req, res) => {
  try {
    const { name, email, password, userID } = req.body;

    if (!name || !email || !password || !userID) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUserID = await User.findOne({ userID });
    if (existingUserID) {
      return res.status(400).json({ message: 'UserID already exists' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      userid: userID,
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        userID: newUser.userid,
      },
    });

  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

//loginUser;
const loginUser = async(req, res) => {
    try{
        const {email, password} = req.body;
        
        if(!email || !password){
            return res.status(400).json({message: 'All fields are required'});
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({message: 'User not found'});

        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(401).json({message: 'Invalid credentials'});
        }
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        res.status(200).json({
            message: 'Login successful',
            token,
            user:{
                id: user._id,
                name: user.name,
                userID: user.userid,
            }
        });
    }catch(error){
        console.error('Error during login:', error);
        res.status(500).json({message: 'Server error'});
    }
};

export { registerUser, loginUser };
