import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    email:{
        type:String,
        required: [true, "email is required"],
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: [true, "user is required"]
    },
    otpHash:{
        type:String,
        required: [true, "OTP Hash is required"]
    }
},{
    timestamps:true
})

const otpModel = mongoose.model("otps", otpSchema)
export default otpModel;