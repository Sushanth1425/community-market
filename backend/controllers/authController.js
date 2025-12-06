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

module.exports.googleOauth= async(req, res)=> {
  try{
    const {idToken}= req.body;
    if (!idToken) return res.status(400).json({ msg: 'Missing idToken' })

    const decoded= await admin.auth(verifyIdToken(idToken))
    const { uid, email, name, picture}= decoded;

    if (!email) return res.status(400).json({ msg: 'No email in token' });

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        username: name || email.split('@')[0],
        email,
        password: Math.random().toString(36).slice(-12), 
      });
      await user.save();
    }
    const payload = { id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    return res.status(200).json({
      msg: 'Logged in with Google',
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role, averageRating: user.averageRating || 0 }
    });

  } catch (err) {
    console.error('Google OAuth error:', err);
    return res.status(500).json({ msg: 'OAuth verification failed' });
  }
}