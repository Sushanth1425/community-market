const mongoose = require('mongoose')

const userSchema= mongoose.Schema({
  username: {type: String, required: true, unique: true},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  role: {type: String, enum:['user', 'admin'], default: 'user'},
  wishlist: [{type: mongoose.Schema.Types.ObjectId, ref: 'Item'}],
  averageRating: {type: Number, default: 0}
}, {timestamps: true})

module.exports= mongoose.model('User', userSchema)