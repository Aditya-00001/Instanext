import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectMongoDB } from './config/mongo.js';
import authRoute from './routes/authRoute.js';
import userRoute from './routes/userRoute.js';

dotenv.config();
connectMongoDB();
const app = express();
app.use(cors());
app.use(express.json());



app.get('/', (req, res) => res.send('API running...'));

app.use('/api/auth',authRoute)

app.use('/api/user', userRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));