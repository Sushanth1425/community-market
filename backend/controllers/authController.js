const bcryptjs= require('bcryptjs')
const jwt= require('jsonwebtoken')

const User= require('../models/user')

module.exports.signupAuth= async(req, res)=>{
  try{
    const {username, email, password} = req.body;
    if (!username || !email || !password) return res.status(400).json({msg: "All fields are required!"})

    const userExists= await User.findOne({username})
    if (userExists) return res.status(400).json({msg: 'User Exists! Try logging in or a different User Name'})

    const mailExists= await User.findOne({email})
    if (mailExists) return res.status(400).json({msg: 'Email Exists! Try logging in or a different Email'})

    const hashedPwd= await bcryptjs.hash(password, 10)
    const newUser= new User({username, email, password: hashedPwd})
    await newUser.save()

    const payload= {id: newUser._id}
    const token= jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '1d'})

    return res.status(201).json({msg: 'User Created Successfully !!', token, user: {id: newUser._id, username: newUser.username, email: newUser.email}})
  }
  catch(err){
    console.error(err)
    return res.status(500).json({msg: "Server error! Try again !!"})
  }
}

module.exports.loginAuth= async(req, res)=>{
  try{
    const {emailOrUsername, password} = req.body;
    if (!emailOrUsername || !password) return res.status(400).json({msg: "All fields are required!"})

    const userExists= await User.findOne({$or : [{email: emailOrUsername}, {username: emailOrUsername}]})
    if (!userExists) return res.status(400).json({msg: 'Invalid Credentials'})

    const validPwd= await bcryptjs.compare(password, userExists.password)
    if (!validPwd) return res.status(400).json({msg: 'Invalid Credentials'})

    const payload= {id: userExists._id}
    const token= jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '1d'})

    return res.status(200).json({msg: 'Logged in Successfully !!', token}) 
  }
  catch(err){
    console.error(err)
    return res.status(500).json({msg: "Server error! Try again !!"})
  }
}