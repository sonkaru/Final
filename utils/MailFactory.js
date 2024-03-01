import nodemailer from 'nodemailer'

class MailerClass {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            auth: {
                user: "esteban.schulist@ethereal.email",
                pass: "sEH81PYqBs6YrrPvvA",
            },
        });
    }
    send(to, subject, html) {
        return new Promise((resolve) => {
            (async () => {
                let info = await this.transporter.sendMail({
                    from: '"Sunkar Assignment 👻" <noreply@songharu.kun>',
                    to,
                    subject,
                    html,
                });

                console.log("Message sent: %s", info.messageId);
                resolve(info);
            })();
        });
    }
}

const MailFactory = new MailerClass();
export default MailFactory;
