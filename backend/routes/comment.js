const router= require('express').Router()
const Comment= require('../models/comment')
const Item= require('../models/item')

const {verifyToken}= require('../middlewares/authMiddleware')

router.get('/:itemId', async(req, res)=>{
  try {
    const comments= await Comment.find({item: req.params.itemId})
      .populate("user", "username email")
      .sort({createdAt: -1})

    res.status(200).json(comments)
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error! Try again !!" });
  }
})

router.post('/:itemId', verifyToken, async(req, res)=>{
  try {
    const {text}= req.body
    if (!text) return res.status(400).json({msg: 'Enter a comment'})

    const item= await Item.findById(req.params.itemId)
    if (!item) return res.status(404).json({msg: 'Item not found !'})

    const newComment= new Comment({item: req.params.itemId, user: req.user._id, text})

    await newComment.save()
    return res.status(201).json({msg: 'Comment added successfully', comment: newComment})
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error! Try again !!" });
  }
})

router.delete('/:commentId', verifyToken, async(req, res)=>{
  try {
    const comment= await Comment.findById(req.params.commentId).populate('item')
    if (!comment) return res.status(404).json({msg: 'Comment not found'})

    const item= await Item.findById(comment.item).populate('seller')
    if (!item) return res.status(404).json({msg: 'Item not found'})

    const isItemSeller= item.seller && item.seller._id.toString() === req.user._id.toString() 
    const isCommentAuthor= comment.user.toString() === req.user._id.toString()
    const isAdmin= req.user.role==='admin'

    if (!isItemSeller && !isCommentAuthor && !isAdmin) return res.status(403).json({msg: 'Access Denied! You cannot delete this comment !!'})
    
    await comment.deleteOne()
    const updatedComments= await Comment.find({item: item._id}).populate('user', 'username email')
    return res.status(200).json({msg: 'Comment deleted successfully', comments: updatedComments})
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error! Try again !!" });
  }
})

module.exports= router