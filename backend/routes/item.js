const router= require('express').Router()
const multer= require('multer')
const path= require('path')
const {storage, cloudinary}= require('../utils/cloudinary')
const upload= multer({storage})
const Item= require('../models/item')

const {verifyToken}= require('../middlewares/authMiddleware')

router.post('/', verifyToken, upload.array('images', 5), async(req, res)=>{
  try{
    const {name, description, price, category} = req.body
    if (!name || !description || !price || !category) return res.status(400).json({msg: "All * fields are required!"})

    const imgUrls= req.files.map(file=> file.path)

    const newItem= new Item({ name, description, price, img: imgUrls, category, seller: req.user._id })
    await newItem.save()
    return res.status(201).json({msg: 'Item Added SuccessFully', newItem})
  }
  catch(err){
    console.error(err);
    res.status(500).json({ msg: "Server error! Try again !!" });
  }
})

router.get('/', async (req, res)=>{
  try {
    const {category, minPrice, maxPrice, search, sort, order}= req.query;
    let query= {}

    if (category) query.category= category;
    if (minPrice || maxPrice){
      query.price= {};
      if (minPrice) query.price.$gte= Number(minPrice);
      if (maxPrice) query.price.$lte= Number(maxPrice);
    }
    if (search){
      query.$or= [
        {name: {$regex: search, $options: 'i'}},
        {description: {$regex: search, $options: 'i'}}
      ]
    }
    const sortField= sort || 'createdAt';
    const sortOrder= order === 'asc' ? 1:-1;

    const items= await Item.find(query)
      .populate("seller", "username email")
      .sort({[sortField]: sortOrder})
    return res.status(200).json(items)
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error! Try again !!" });
  }
})

router.get('/:id', async (req, res)=>{
  try {
    const item= await Item.findById(req.params.id).populate("seller", "username email");
    if (!item) return res.status(404).json({msg: 'Item Not Found :('})
    return res.status(200).json(item)
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error! Try again !!" });
  }
})

router.put('/:id', verifyToken, upload.array('images', 5), async(req, res)=>{
  try{
    const {name, description, price, category, isSold} = req.body

    const item = await Item.findById(req.params.id)
    if (!item) return res.status(404).json({ msg: 'Item not found' })

    let updatedImg= item.img
    if (req.files && req.files.length>0){
      for (const imgUrl of item.img){
        const fileName= path.basename(imgUrl)
        const publicId= `items/${fileName.substring(0, fileName.lastIndexOf('.'))}`
        await cloudinary.uploader.destroy(publicId)
      }
      updatedImg= req.files.map(file => file.path)
    }

    const updateData= {...(name && {name}), ...(description && {description}), img: updatedImg, ...( category&& {category}), ...(isSold && {isSold}) }

    await Item.findByIdAndUpdate(req.params.id, updateData, {new: true, runValidators: true} )
    return res.status(200).json({msg: `${name}(${req.params.id}) updated successfully!!`})
  }
  catch(err){
    console.error(err);
    res.status(500).json({ msg: "Server error! Try again !!" });
  }
})

router.delete('/:id', verifyToken, async(req, res)=>{
  try {
    const item= await Item.findById(req.params.id)
    if (!item) return res.status(404).json({msg: 'Item not found'})

    if (req.user.role !== 'admin' && req.user._id.toString() !== item.seller.toString()) return res.status(403).json({msg: 'Access Denied !!'})
    
    for (const imgUrl of item.img){
      const fileName= path.basename(imgUrl)
      const publicId= `items/${fileName.substring(0, fileName.lastIndexOf('.'))}`
      await cloudinary.uploader.destroy(publicId)
    }

    await item.deleteOne()
    return res.status(200).json({msg: `Item ${req.params.id} deleted successfully`})
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error! Try again !!" });
  }
})

module.exports= router