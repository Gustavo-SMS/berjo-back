const { prismaClient } = require('../database/prismaClient')
const { v4: uuidv4 } = require('uuid')
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { sendEmail } = require('../services/nodemailer')

const validateCurrentPassword = async (userId, currentPassword) => {
  const user = await prismaClient.user.findUnique({ where: { id: userId } })

  if (!user) {
    throw new Error('Usuário não encontrado.')
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

  if (!isPasswordValid) {
    throw new Error('Senha atual incorreta.')
  }

  return user
}

const updateLogin = async (req, res) => {
  const userId = req.user.id
  const { newLogin, currentPassword } = req.body

  if (!newLogin || !currentPassword) {
    return res.status(400).json({ error: 'Login e senha atual são obrigatórios.' })
  }

  try {
    await validateCurrentPassword(userId, currentPassword)

    const existingUser = await prismaClient.user.findUnique({
      where: { login: newLogin }
    })

    if (existingUser) {
      return res.status(409).json({ error: 'Esse login já está em uso.' })
    }

    await prismaClient.user.update({
      where: { id: userId },
      data: { login: newLogin }
    })

    return res.status(200).json({ message: 'Login atualizado com sucesso.' })
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
}

const updatePassword = async (req, res) => {
  const userId = req.user.id

  const { currentPassword, newPassword, confirmPassword } = req.body

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' })
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'As novas senhas não coincidem.' })
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' })
  }

  try {
    await validateCurrentPassword(userId, currentPassword)

    const salt = await bcrypt.genSalt(12)
    const hashedNewPassword = await bcrypt.hash(newPassword, salt)

    await prismaClient.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    })

    return res.status(200).json({ message: 'Senha atualizada com sucesso.' })
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
}

const registerUser = async (req, res) => {
  const { login, password, confirmPassword, customerId, role } = req.body

  if (!login) {
    return res.status(422).json({ msg: 'O login é obrigatório!' })
  }

  if (!password) {
    return res.status(422).json({ msg: 'A senha é obrigatória!' })
  }

  if (password !== confirmPassword) {
    return res.status(422).json({ msg: 'As senhas não conferem!' })
  }

  const userExists = await prismaClient.user.findUnique({
    where: {
      login
    }
  })

  if (userExists) {
    return res.status(422).json({ msg: 'Por favor, utilize outro login!' })
  }

  const salt = await bcrypt.genSalt(12)
  const passwordHash = await bcrypt.hash(password, salt)

  const user = await prismaClient.user.create({
    data: {
      login,
      password: passwordHash,
      role,
      customer: {
        connect: { id: customerId }
      }
    }
  })

  return res.status(200).json(`Usuário criado com sucesso! ${user.login}`)
}

async function validateUser(login) {
  try {
    const user = await prismaClient.user.findUnique({
      where: { login },
      include: { customer: true }
    })

    if (!user) return { error: 'Usuário não encontrado' }

    if (user.role === 'CUSTOMER' && !user.customer) {
      return { error: 'Usuário ainda não vinculado a um cliente.' }
    }

    if (user.customer && user.customer.isActive === false) {
      return { error: 'Usuário desativado.' }
    }

    return user
  } catch (err) {
    console.error('Erro ao validar usuário:', err.message)
    return { error: 'Erro ao validar usuário.' }
  }
}

async function validatePassword(password, hash) {
  try {
    const isValid = await bcrypt.compare(password, hash)
    return isValid
  } catch (error) {
    console.error('Erro ao validar senha:', error.message)
    return false
  }
}

const validateLogin = async (req, res) => {
  const { login, password } = req.body

  const user = await validateUser(login)
  if (!user) {
    return res.status(404).json({ msg: 'Usuário não encontrado!' })
  }

  const checkPassword = await validatePassword(password, user.password)
  
  if (!checkPassword) {
    return res.status(422).json({ msg: 'Senha incorreta' })
  }
  
  try {
    const payload = {
      id: user.id,
      role: user.role,
      customerId: user.customer?.id || null,
      jti: uuidv4()
    }

    const secret = process.env.JWT_SECRET
    const refreshSecret = process.env.JWT_REFRESH_SECRET

    const accessToken = jwt.sign(payload, secret, { expiresIn: '15m' })
    const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: '7d' })

    await prismaClient.user.update({
      where: { id: user.id },
      data: { refreshToken }
    })

    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 15 * 60 * 1000 // 15min
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    })

    res.status(200).json({ msg: 'Autenticação realizada com sucesso' })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: 'Aconteceu um erro no servidor, tente novamente mais tarde!' })
  }
}

const recoverPassword = async (req, res) => {
  const { email } = req.body

  const customer = await prismaClient.customer.findUnique({
    where: { email },
    include: { user: true }
  })

  if (!customer || !customer.user) {
    return res.status(404).json({ error: 'Usuário não encontrado' })
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiration = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

  await prismaClient.user.update({
    where: { id: customer.user.id },
    data: {
      passwordResetToken: token,
      passwordResetExpires: expiration,
    }
  })

  const link = `http://127.0.0.1:5173/resetPassword?token=${token}`

  await sendEmail({
    to: email,
    subject: 'Recuperação de Senha',
    html: `<p>Clique no link abaixo para redefinir sua senha:</p><a href="${link}">${link}</a>`
  })

  return res.status(200).json({ msg: 'Link de recuperação enviado para o e-mail.' })
}

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body
  
  const user = await prismaClient.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpires: { 
        gte: new Date() 
      }
    }
  })

  if (!user) {
    return res.status(400).json({ error: 'Token inválido ou expirado.' })
  }

  const salt = await bcrypt.genSalt(12)
  const hashedPassword = await bcrypt.hash(newPassword, salt)

  await prismaClient.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null
    }
  })

  return res.status(200).json({ msg: 'Senha redefinida com sucesso!' })
}

const doLogout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken
  if (refreshToken) {
    await prismaClient.user.updateMany({
      where: { refreshToken },
      data: { refreshToken: null }
    })
  }

  const cookieOptions = {
    httpOnly: true,
    secure: false,
    sameSite: 'lax'
  }

  res.clearCookie('token', cookieOptions)
  res.clearCookie('refreshToken', cookieOptions)

  res.status(200).json({ msg: 'Logout realizado com sucesso' })
}

module.exports = {
  updateLogin,
  updatePassword,
  registerUser,
  validateLogin,
  recoverPassword,
  resetPassword,
  doLogout
}