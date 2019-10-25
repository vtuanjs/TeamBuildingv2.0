const {PORT, HOST, EMAIL_USER, EMAIL_PASS} = process.env
const nodemailer = require('nodemailer')
module.exports.sendEmailActiveUser = async (receiverEmail, secretKey) => {
    try {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS
            }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
        })
        let mailOptions = {
            from: 'Nguyen Van Tuan',
            to: receiverEmail,
            subject: 'Active email',
            html: `<h1>Please click here to acctive your account</h1> http://${HOST}:${PORT}/users/activateUser?secretKey=${secretKey}&email=${receiverEmail}`
        }
        let info = transporter.sendMail(mailOptions)
        console.log(`Message send : ${info.messageId}`)
    } catch (error) {
        throw error
    }
}

