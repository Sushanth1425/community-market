const router= require('express').Router()
const {verifyToken}= require('../middlewares/authMiddleware')
const Chat= require('../models/chat')


router.post('/', verifyToken, async(req, res)=>{
  try {
    const {receiverId, text, itemId} = req.body
    if (!receiverId || !text) return res.status(400).json({msg: 'Text and receiverId required'})

    let chat= await Chat.findOne({users: {$all: [req.user._id, receiverId]}, item: itemId || null})
    if (!chat) {
      chat= new Chat({
        users: [req.user._id, receiverId],
        item: itemId || null,
        messages: []
      })
    }

    const message= {sender: req.user._id, text, sentAt: new Date()}
    chat.messages.push(message)
    await chat.save()

    res.status(201).json({msg: `Message sent`, message})
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error! Try again !!" });
  }
})

router.get('/item/:itemId', verifyToken, async(req, res)=>{
  try {
    const chats= await Chat.find({item: req.params.itemId})
      .populate('users', 'username email')
      .populate('messages.sender', 'username email')
    res.status(200).json(chats)
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error! Try again !!" });
  }
})
router.get('/conversation/:userId', verifyToken, async (req, res)=>{
  try {
    const chats= await Chat.find({users: {$all: [req.user._id, req.params.userId]}})
      .populate('users', 'username email')
      .populate('messages.sender', 'username email')
    res.status(200).json(chats)
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error! Try again !!" });
  }
})

module.exports= router