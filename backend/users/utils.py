from mailjet_rest import Client
from django.conf import settings
from decouple import config

def send_verification_email(user, verification_token):
    """Send verification email using Mailjet"""
    
    api_key = config('MAILJET_API_KEY')
    api_secret = config('MAILJET_SECRET_KEY')
    sender_email = config('MAILJET_SENDER_EMAIL', default='noreply@chainsync.ai')
    sender_name = config('MAILJET_SENDER_NAME', default='ChainSync AI')
    frontend_url = config('FRONTEND_URL', default='http://localhost:8081')
    
    mailjet = Client(auth=(api_key, api_secret), version='v3.1')
    
    verification_link = f"{frontend_url}/verify-email?token={verification_token}"
    
    data = {
        'Messages': [
            {
                "From": {
                    "Email": sender_email,
                    "Name": sender_name
                },
                "To": [
                    {
                        "Email": user.email,
                        "Name": user.email.split('@')[0]
                    }
                ],
                "Subject": "Verify Your ChainSync AI Account",
                "TextPart": f"Welcome to ChainSync AI! Please verify your email by clicking: {verification_link}",
                "HTMLPart": f"""
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; border-radius: 10px; text-align: center;">
                            <h1 style="color: white; margin: 0;">Welcome to ChainSync AI!</h1>
                        </div>
                        
                        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-top: 20px;">
                            <p style="font-size: 16px; color: #333;">Hi there,</p>
                            
                            <p style="font-size: 16px; color: #333;">
                                Thank you for signing up as a <strong>{user.user_type}</strong> on ChainSync AI.
                                To complete your registration, please verify your email address.
                            </p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="{verification_link}" 
                                   style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); 
                                          color: white; 
                                          padding: 15px 40px; 
                                          text-decoration: none; 
                                          border-radius: 8px; 
                                          font-weight: bold;
                                          display: inline-block;">
                                    Verify Email
                                </a>
                            </div>
                            
                            <p style="font-size: 14px; color: #666; margin-top: 20px;">
                                Or copy and paste this link in your browser:<br>
                                <a href="{verification_link}" style="color: #6366f1; word-break: break-all;">
                                    {verification_link}
                                </a>
                            </p>
                            
                            <p style="font-size: 14px; color: #999; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
                                If you didn't create this account, please ignore this email.
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                            <p>© 2025 ChainSync AI. All rights reserved.</p>
                        </div>
                    </div>
                """
            }
        ]
    }
    
    try:
        result = mailjet.send.create(data=data)
        return result.status_code == 200
    except Exception as e:
        print(f"Email sending failed: {str(e)}")
        return False
