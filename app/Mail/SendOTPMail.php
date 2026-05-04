<?php

namespace App\Mail;

use App\Models\OTP;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SendOTPMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public OTP $otp)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your OTP for QR Finder Login',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.otp',
            with: [
                'code' => $this->otp->code,
                'expiresAt' => $this->otp->created_at->addMinutes(10),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
