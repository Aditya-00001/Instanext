import express from 'express';
import cors from 'cors';
import { connectMongoDB } from './config/mongo.js';
import authRoute from './routes/authRoute.js';
connectMongoDB();
const app = express();
app.use(cors());
app.use(express.json());



app.get('/', (req, res) => res.send('API running...'));

app.use('/api/auth',authRoute)

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));