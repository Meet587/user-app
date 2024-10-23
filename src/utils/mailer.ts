import User from "@/models/user.model";
import bcryptjs from "bcryptjs";
import nodemailer from "nodemailer";

export const verifyEmail = async ({ email, emailType, userId }: any) => {
  try {
    const hashToken = await bcryptjs.hash(userId.toString(), 10);

    if (emailType === "VERIFY") {
      await User.findByIdAndUpdate(userId, {
        verifyToken: hashToken,
        verifyTokenExpiry: Date.now() + 3600000,
      });
    } else if (emailType === "RESET") {
      await User.findByIdAndUpdate(userId, {
        forgotPasswordToken: hashToken,
        forgotPasswordTokenExpiry: Date.now() + 3600000,
      }, { new: true });
    }

    let transport = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USER_ID,
        pass: process.env.MAILTRAP_USER_PASS,
      },
    });


    const mailOptions = {
      from: "meet.rakholiya.w1@gmail.com",
      to: email,
      subject:
        emailType === "VERIFY" ? "Verify your email" : "Reset your Password",
      html: emailType === "VERIFY" ? `<p>Click <a href="${process.env.DOMAIN
        }/verifyemail?token=${hashToken}">here</a> to Verify your email </p>` : `<p>Click <a href="${process.env.DOMAIN
        }/reset-password?token=${hashToken}">here</a> to Reset your Password </p>`,
    };

    const mailresponse = await transport.sendMail(mailOptions);
    return mailresponse;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
