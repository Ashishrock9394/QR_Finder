<?php

namespace App\Jobs;

use App\Mail\SendOTPMail;
use App\Models\OTP;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendOTPJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public OTP $otp)
    {
    }

    public function handle(): void
    {
        Mail::to($this->otp->email)->send(new SendOTPMail($this->otp));
    }
}
