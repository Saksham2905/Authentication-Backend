import mongoose from "mongoose";
import dns from "dns";
import config from "./config.js";

async function connectDB(){
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
    await mongoose.connect(config.MONGODB_URI, { family: 4 })

    console.log("Server connected to DB");
}

export default connectDB;
