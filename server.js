import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import connectdb from "./config/db.js";
import authRoutes from './routes/authRoute.js';
import categoryRoute from './routes/CategoryRoute.js'
import productRoute from './routes/ProductRoute.js'
import cors from 'cors';
import path from 'path';
import {fileURLToPath} from 'url';

// Initialize express app
const app = express();

// Config env
dotenv.config();

// Database config
connectdb();

//esmodule fix
const  __filename = fileURLToPath(import.meta.url);
consr __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname , './clint/build')))

// Routes
 app.use('/api/v1/auth', authRoutes);
 app.use('/api/v1/category', categoryRoute);
 app.use('/api/v1/product', productRoute);



// REST API
app.use('*' , function(req , res){
    res.sendFile(path.join(__dirname , './clint/build/index.html'));
})

// PORT
const PORT = process.env.PORT || 8080;

// Run listener
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
