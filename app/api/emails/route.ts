import Welcome from "@/emails/Welcome";
import {Resend} from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);
export async function POST(){
    await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: 'faysalmohammed.shah@gmail.com',
        subject: 'OTP Testing',
        react: Welcome(),
      });

}