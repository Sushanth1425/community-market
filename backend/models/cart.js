const mongoose= require('mongoose')

const cartSchema= mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref:'User', required: true},
  items: [
    { 
      item: {type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true} 
    }
  ]
}, {timestamps: true})

module.exports= mongoose.model('Cart', cartSchema)