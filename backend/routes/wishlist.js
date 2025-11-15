const router= require('express').Router()

const { verifyToken } = require('../middlewares/authMiddleware')
const User= require('../models/user')

router.get('/', verifyToken, async (req, res)=>{
  try {
    const user= await User.findById(req.user._id).populate('wishlist')
    if (!user) return res.status(404).json({msg: 'User not found'})

    return res.status(200).json(user.wishlist)
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error! Try again !!" });  
  }
})

router.post('/', verifyToken, async (req, res)=>{
  try {
    const {itemId} = req.body
    if (!itemId) return res.status(400).json({ msg: 'Item ID is required'});

    const user= await User.findById(req.user._id)
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (user.wishlist.includes(itemId)) return res.status(400).json({ msg: 'Item already in wishlist'});

    user.wishlist.push(itemId)
    await user.save()

    res.status(200).json({ msg: 'Item added to wishlist successfully', wishlist: user.wishlist });
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error! Try again !!" });  
  }
})

router.delete('/:itemId', verifyToken, async (req, res)=>{
  try {
    const user= await User.findById(req.user._id)
    if (!user) return res.status(404).json({msg: 'User not found'})

    user.wishlist= user.wishlist.filter(i=> i.toString() !== req.params.itemId)
    await user.save()

    res.status(200).json({msg: `Item ${req.params.itemId} removed from wishlist`, wishlist: user.wishlist})
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error! Try again !!" });  
  }
})

module.exports= router