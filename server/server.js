import cors from "cors";
import "dotenv/config";
import express from "express";
import connectDB from "./configs/db.js";
import bookingRouter from "./routes/bookingRoutes.js";
import ownerRouter from "./routes/ownerRoutes.js";
import userRouter from "./routes/userRoutes.js";

// Initialize Express App
const app = express()

//Connect Database
await connectDB()

//Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req,res)=> res.send("server is running"));
app.use('/api/user', userRouter)
app.use('/api/owner', ownerRouter)
app.use('/api/bookings', bookingRouter)

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`server running on port ${PORT}`))