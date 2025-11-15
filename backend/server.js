const express= requie('express')
require('dotenv').config()
const cors= require('cors')
const cookieParser= require('cookie-parser')

const app= express()

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'PUT', "POST", 'DELETE'],
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

const port= process.env.PORT || 5050

app.listen(port, ()=> console.log(`Server connected to port ${port}`))