const {Server} = require('socket.io')
const Chat= require('../models/chat')

module.exports= server=> {
  const io= new Server (server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true
    }
  })

  io.on('connection', socket=> {
    console.log(`New Client connected: ${socket.id}`)
    
    socket.on('joinRoom', roomId=> {
      socket.join(roomId)
      console.log(`User joined room: ${roomId}`)
    })

    socket.on('sendMessage', async (payload)=>{
      console.log('Received sendMessage event:', payload);
      const {senderId, receiverId, text, itemId} = payload || {}
      if (!senderId || !receiverId || !text) {
            console.log('Missing fields:', { senderId, receiverId, text });
        return;
      }
      try {
        let chat= await Chat.findOne({
          users: {$all: [senderId, receiverId]},
          item: itemId || null
        })
        if (!chat) {
          chat= new Chat({
            users: [senderId, receiverId],
            item: itemId || null,
            messages: []
          })
          console.log('New chat created:', chat._id.toString());
        }
        const message= {sender: senderId, text, read: false, sentAt: new Date()}
        chat.messages.push(message)
        await chat.save()
        console.log('Message saved:', message);
        io.to(chat._id.toString()).emit('receiveMessage', message)
      } 
      catch (err) {
        console.error('Error saving message:', err);
      }
    })    
    socket.on('disconnect', ()=> console.log(`Client disconnected: ${socket.id}`))
  })
  return io
}