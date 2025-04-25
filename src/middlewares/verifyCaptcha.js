const fetch = require('node-fetch')

const verifyCaptcha = async (req, res, next) => {
  const { 'g-recaptcha-response': captchaToken } = req.body

  if (!captchaToken) {
    return res.status(400).json({ error: 'Captcha ausente' })
  }

  const secret = process.env.RECAPTCHA_SECRET_KEY

  const params = new URLSearchParams()
  params.append('secret', secret)
  params.append('response', captchaToken)

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    })

    const data = await response.json()

    if (!data.success) {
      console.warn('Falha na verificação do captcha:', data)
      return res.status(403).json({ error: 'Falha na verificação do captcha' })
    }

    next()
  } catch (err) {
    console.error('Erro ao validar captcha:', err)
    return res.status(500).json({ error: 'Erro ao validar captcha' })
  }
}

module.exports = verifyCaptcha
