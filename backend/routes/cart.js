const router= require('express').Router()

const { verifyToken }= require('../middlewares/authMiddleware')
const Cart= require('../models/cart')

router.put('/', verifyToken, async (req, res)=>{
  try {
    const {itemId} = req.body
    if (!itemId) return res.status(404).json({ msg: "Item not found " });

    let cart= await Cart.findOne({user: req.user._id})
    if (!cart) cart= new Cart({user: req.user._id, items: [{item: itemId}]})
    else {
      const alreadyInCart= cart.items.some(i => i.item.toString() === itemId)
      if (alreadyInCart) return res.status(400).json({msg: 'Item already exists in cart'})
      cart.items.push({item: itemId})
    }

    await cart.save()
    return res.status(201).json({msg: 'Item added successfully', cart})
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error! Try again !!" });
  }
})

router.get('/', verifyToken, async (req, res)=>{
  try {
    const cart= await Cart.findOne({user: req.user._id}).populate('items.item')
    if (!cart) return res.status(404).json({msg: 'Cart is Empty :('})
    return res.status(200).json(cart)
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error! Try again !!" });
  }
})

router.delete('/:itemId', verifyToken, async (req, res)=>{
  try{
    const {itemId}= req.params
    const cart= await Cart.findOne({user: req.user._id})
    if (!cart) return res.status(404).json({ msg: "cart not found " });

    cart.items= cart.items.filter(i=> i.item.toString() !== itemId)
    await cart.save()
    return res.status(200).json({msg: `Item ${req.params.itemId} removed successfully from cart`, cart})
  }
  catch(err){
    console.error(err);
    res.status(500).json({ msg: "Server error! Try again !!" });
  }
})

module.exports= router