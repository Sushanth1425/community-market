const mongoose= require('mongoose')

const commentSchema= mongoose.Schema({
  item: {type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true},
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  text: {type: String, required: true, trim: true},
  createdAt: {type: Date, default: Date.now}
})

module.exports= mongoose.model('Comment', commentSchema)