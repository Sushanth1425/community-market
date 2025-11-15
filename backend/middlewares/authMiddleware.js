const jwt= require('jsonwebtoken')
const User= require('../models/user')

module.exports.verifyToken= async(req, res, next)=> {
  try{
    const authHeader= req.headers.authorization
    if(!authHeader) return res.status(401).json({ msg: "No token provided! Login Again!!" });

    const token= authHeader.split(' ')[1]
    if (!token) return res.status(401).json({ msg: "Invalid token! Login Again!!" });

    const decoded= jwt.verify(token, process.env.JWT_SECRET)

    const user= await User.findById(decoded.id).select('-password')
    if (!user) return res.status(401).json({ msg: "Invalid token user" });

    req.user= user;
    next()
  }
  catch(err){
    console.error(err);
    return res.status(401).json({ msg: "User Unauthorized! Login Again!! " });
  }
}