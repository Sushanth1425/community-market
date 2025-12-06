const router= require('express').Router()

const {loginAuth, signupAuth, googleOauth}= require('../controllers/authController')
const { verifyToken } = require('../middlewares/authMiddleware')

router.post('/signup', signupAuth)
router.post('/google', googleOauth)
router.post('/login', loginAuth)

router.post('/logout', async(req,res)=>{
  res.clearCookie('token')
  return res.status(200).json({msg: 'Logged out successfully'})
})

router.get('/me', verifyToken, async(req,res)=>{
  res.status(200).json(req.user)
})


module.exports= router