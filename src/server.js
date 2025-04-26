const express = require('express')
const router = require('./router')
const cookieParser = require("cookie-parser")
const cors = require('cors')

const app = express()

const PORT = process.env.PORT || 3000

app.use(cors({
    origin: ['https://gustavo-sms.github.io'],
    credentials: true
}))
app.options('*', cors())
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(router)

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))