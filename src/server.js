const express = require('express')
const router = require('./router')
const cookieParser = require("cookie-parser")
const cors = require('cors')

const app = express()

const PORT = process.env.PORT || 3000

app.use(cors({
    origin: 'http://127.0.0.1:5173',
    credentials: true
}))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(router)

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))