import mongoose, { mongo } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String, //cloudnary url
        required: true
    },
    coverImage: {
        type: String
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    refreshToken: {
        type: String
    }
},{timestamps: true})

userSchema.pre("save", async function(next){
    if(!this.isModified("password"))    return next();

    // i have manually added await here....hitesh didn't write it in hs code
    this.password = await bcrypt.hash(this.password,10)
    next();
})

userSchema.methods.isPasswordCorrect = async function (password){
    await bcrypt.compare(password, this.password)
}
userSchema.methods.generateAccessToken = async function(){
    return await jwt.sign(
    {
        _id: this._id,
        email: this.email,
        username: this.userName,
        fullname: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    })
}
userSchema.methods.generateRefreshToken = async function(){
    return await jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
}





export const User = mongoose.model("User",userSchema);