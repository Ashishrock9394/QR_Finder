<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your OTP for QR Finder</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .header {
            background-color: #007bff;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: white;
            padding: 30px;
            border-radius: 0 0 5px 5px;
        }
        .otp-code {
            background-color: #f0f0f0;
            border: 2px solid #007bff;
            padding: 15px;
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            border-radius: 5px;
            margin: 20px 0;
            color: #007bff;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #999;
        }
        .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>QR Finder</h1>
            <p>Your One-Time Password</p>
        </div>
        <div class="content">
            <h2>Hi there!</h2>
            <p>You requested a login code for your QR Finder account. Use the code below to verify your identity:</p>

            <div class="otp-code">{{ $code }}</div>

            <p>This code will expire in <strong>10 minutes</strong> (at {{ $expiresAt->format('g:i A') }}).</p>

            <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <p>Never share this code with anyone. QR Finder staff will never ask for your OTP.</p>
            </div>

            <p>If you didn't request this code, you can safely ignore this email.</p>

            <p>Best regards,<br>The QR Finder Team</p>
        </div>
        <div class="footer">
            <p>© {{ date('Y') }} QR Finder. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
        </div>
    </div>
</body>
</html>
