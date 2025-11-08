import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectMongoDB = async() =>{
    mongoose.set('strictQuery', false);
    try{
         await mongoose.connect(process.env.MONGO_URI);
         console.log("MongoDb Connected");
    }catch(err){
        console.log("MongoDb Connection Error: ", err.message);
        throw {message: err.message};
    }
};