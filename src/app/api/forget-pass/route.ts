import { connect } from "@/database/dbConfig";
import sendEmail from "@/helpers/mailer";
import Author from "@/models/AuthorModel";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import EmailTemplate from "@/components/EmailTemplate";
connect();
export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const token=crypto.randomBytes(parseInt(process.env.VERIFY_TOKEN_LENGTH? process.env.VERIFY_TOKEN_LENGTH:"32")).toString('hex');
        const author=await Author.findOneAndUpdate({email:data.email},{forgetPassToken:token,forgetPassTokenExpiryTime:Date.now()+1200000});
        if(author==null){
            return NextResponse.json({message:"Email not found"}, { status: 404 });
        }
        const emailHtml=EmailTemplate({link:`${process.env.NEXT_PUBLIC_DOMAIN}/reset-pass?token=${token}`,message:"Please click on the link below to reset your password",buttonText:"Reset password"});
        const email_sent=await sendEmail(`"News Help" <${process.env.SMTP_NOREPLY}>`,data.email,"Reset your News Help Password",`Please use the link to reset your password : http://${process.env.NEXT_PUBLIC_DOMAIN}/reset-pass?token=${token}`,emailHtml);
        return NextResponse.json({message:"email sent"}, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}