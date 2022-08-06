import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { VerifyUserDto } from "../users/dto/verify-user.dto";

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) { }

  public send(verifyUserDto: VerifyUserDto, jwtVerify): void {
    this.mailerService
      .sendMail({
        to: verifyUserDto.account,
        from: process.env.MAILDEV_INCOMING_USER,
        subject: "Xanalia: Verify",
        text: 'Verify Account',
        html: `
        <html>
          <head>
            <style>
              .template-body {
                  margin: 0;
                  padding: 80px;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  background: #f2f2f2;
                  font-family: Arial, Helvetica, sans-serif;
              }

              .email-page {
                  background: white;
              }

              .content {
                  padding: 75px 77px 80px 86px;
                  text-align: center;
              }

              .text-first {
                  color: #000000;
                  font-size: 18px;
                  margin-top: 36px;
              }

              .text-second {
                  color: #000000;
                  font-size: 18px;
                  margin-top: 20px;
              }

              .text-third {
                  color: #979797;
                  font-size: 15px;
                  margin-top: 28px;
              }

              .button-verify {
                  font-size: 20px;
                  color: white !important;
                  font-weight: 700;
                  background-color: #2280e1;
                  border-radius: 3px;
                  border: none;
                  margin-top: 60px;
                  display: inline-flex;
                  padding: 10px 40px;
                  text-decoration: none;
              }
            </style>
          </head>
            <body>
              <div class="template-body">
                <div class="email-page">
                    <div class="content">
                        <img src="https://i.imgur.com/G75pJCm.png" />
                        <div class="text-first">Greetings from Xanalia Team!</div>
                        <div class="text-second">Thanks for registering your email on Xanalia. We just need you to verify your email
                            address to complete setting up your email on Xanalia.</div>
                        <a href="${process.env.FE_DOMAIN}/verify?token=${jwtVerify}" class="button-verify">Verify Email</a>
                        <div class="text-third">Need support? Contact Xanalia team at contact@noborderz.com</div>
                    </div>
                </div>
              </div>
          </body>
        </html>
        `
      })
      .then(() => { console.log("Send Email Success!") })
      .catch((e) => {
        console.log('error send mail to report nft', e)
      });
  }
}
