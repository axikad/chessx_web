<?php

namespace App\Models;

use Database\Factories\EmailLoginOtpFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailLoginOtp extends Model
{
    /** @use HasFactory<EmailLoginOtpFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = [
        'email',
        'otp_hash',
        'attempts_remaining',
        'expires_at',
        'resend_available_at',
        'requested_ip',
    ];

    /** @var list<string> */
    protected $hidden = ['otp_hash'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'attempts_remaining' => 'integer',
            'expires_at' => 'datetime',
            'resend_available_at' => 'datetime',
        ];
    }
}
