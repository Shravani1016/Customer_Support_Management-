import smtplib
import random
import string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

def generate_otp(length: int = 6) -> str:
    return ''.join(random.choices(string.digits, k=length))

def send_email(to_email: str, subject: str, html_body: str):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{settings.MAIL_FROM_NAME} <{settings.MAIL_FROM}>"
    msg["To"] = to_email

    part = MIMEText(html_body, "html")
    msg.attach(part)

    with smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT) as server:
        server.ehlo()
        server.starttls()
        server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
        server.sendmail(settings.MAIL_FROM, to_email, msg.as_string())

def send_otp_email(to_email: str, otp: str, name: str):
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #3b82f6; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">CRM App</h1>
        </div>
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1e293b;">Hello, {name}!</h2>
            <p style="color: #64748b;">Your OTP for password reset is:</p>
            <div style="background: white; border: 2px dashed #3b82f6; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
                <h1 style="color: #3b82f6; font-size: 48px; letter-spacing: 10px; margin: 0;">{otp}</h1>
            </div>
            <p style="color: #64748b;">This OTP expires in <strong>10 minutes</strong>.</p>
            <p style="color: #94a3b8; font-size: 12px;">If you did not request this, please ignore this email.</p>
        </div>
    </div>
    """
    send_email(to_email, "Password Reset OTP — CRM App", html)

def send_admin_reset_email(to_email: str, reset_link: str, name: str):
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e293b; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">CRM App — Admin Reset</h1>
        </div>
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1e293b;">Hello, {name}!</h2>
            <p style="color: #64748b;">Click the button below to reset your admin password:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_link}"
                   style="background: #3b82f6; color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                    Reset Password
                </a>
            </div>
            <p style="color: #64748b;">This link expires in <strong>30 minutes</strong>.</p>
            <p style="color: #94a3b8; font-size: 12px;">If you did not request this, please ignore this email.</p>
        </div>
    </div>
    """
    send_email(to_email, "Admin Password Reset — CRM App", html)