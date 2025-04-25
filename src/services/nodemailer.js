const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
})

async function sendEmail({ to, subject, html, text }) {
    const info = await transporter.sendMail({
        from: process.env.SMTP_EMAIL,
        to,
        subject,
        html,
        text: text || ''
    })

    return info
}

function generateHtmlTable(data) {
    if (!Array.isArray(data) || data.length === 0) return '<p>Nenhum dado disponível.</p>'
  
    const headers = Object.keys(data[0])
    let html = '<table border="1" cellspacing="0" cellpadding="5"><thead><tr>'
  
    headers.forEach(header => {
      html += `<th>${header}</th>`
    })
    html += '</tr></thead><tbody>'
  
    data.forEach(item => {
      html += '<tr>'
      headers.forEach(header => {
        html += `<td>${item[header]}</td>`
      })
      html += '</tr>'
    })
  
    html += '</tbody></table>'
    return html
  }

module.exports = {
    sendEmail,
    generateHtmlTable
}