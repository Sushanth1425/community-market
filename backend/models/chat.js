const mongoose= require('mongoose')

const messageSchema= mongoose.Schema({
  sender: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  text: {type: String, required: true},
  read: {type: Boolean, default: false},
}, {timestamps: true} )

const chatSchema= mongoose.Schema({
  users: [{type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}],
  item: {type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: false},
  messages: [messageSchema]
}, {timestamps: true} )

module.exports= mongoose.model('Chat', chatSchema) 