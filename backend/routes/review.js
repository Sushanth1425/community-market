const router= require('express').Router();
const Review= require('../models/review')
const User= require('../models/user')

const {verifyToken}= require('../middlewares/authMiddleware')

router.get('/:sellerId', async(req, res)=>{
  try {
    const reviews= await Review.find({seller: req.params.sellerId})
      .populate('reviewer', 'username email')
      .sort({createdAt: -1})
    if (!reviews.length) return res.status(404).json({msg: 'No reviews for this seller yet'});
    res.status(200).json(reviews)
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error! Try again !!" }); 
  }
})

router.post('/:sellerId', verifyToken, async(req, res)=>{
  try {
    const {rating, comment} =  req.body
    if (!rating || rating<1 || rating>5) return res.status(400).json({msg: 'Rating must be between 1 and 5!'})

    const sellerId= req.params.sellerId
    if (sellerId === req.user._id.toString()) return res.status(403).json({msg: 'You cannot review yourself!'})

    const seller= await User.findById(sellerId)
    if (!seller) return res.status(404).json({msg: 'Seller not found'})

    const review= await Review.findOneAndUpdate(
      {seller: sellerId, reviewer: req.user._id},
      {rating, comment},
      {upsert: true, new: true, runValidators: true}
    )

    const allReviews= await Review.find({seller: sellerId})
    const avgRating= allReviews.reduce((acc, r)=> acc+ r.rating, 0) / allReviews.length

    seller.averageRating= avgRating
    await seller.save()

    res.status(201).json({msg: 'Review submitted successfully', review, avgRating});
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({msg: "Server error! Try again !!"})
  }
})

router.delete('/:reviewId', verifyToken, async(req, res)=>{
  try {
    const review= await Review.findById(req.params.reviewId)
    if (!review) return res.status(404).json({msg: 'Review not found'})

    const isAuthor= review.reviewer.toString() === req.user._id.toString()
    const isAdmin= req.user.role === 'admin'

    if (!isAuthor && !isAdmin) return res.status(403).json({msg: 'Access denied! You cannot delete this review !!'})

    await review.deleteOne()

    const remaining= await Review.find({seller: review.seller})
    const seller= await User.findById(review.seller)

    if (remaining.length >0) {
      const newAvg= remaining.reduce((acc, r)=> acc+ r.rating, 0) / remaining.length
      seller.averageRating= newAvg
    }
    else seller.averageRating= 0

    await seller.save();
    res.status(200).json({msg: 'Review deleted successfully'})
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error! Try again !!" }); 
  }
})

module.exports= router