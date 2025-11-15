const mongoose= require('mongoose')

const itemSchema= mongoose.Schema({
  name: {type: String, required: true},
  description: {type: String, required: true},
  price: {type: Number, required: true},
  img: [{type: String}],
  category: {type: String, required: true},
  seller: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
  isSold: {type: Boolean, default: false}
}, {timestamps: true})

module.exports= mongoose.model('Item', itemSchema)