<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EmailLoginOtpNotification extends Notification
{
    use Queueable;

    public function __construct(
        #[\SensitiveParameter] public readonly string $code,
        public readonly int $expiresInMinutes,
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your Chess Mission login code')
            ->greeting('Sign in to Chess Mission')
            ->line('Your one-time login code is:')
            ->line($this->code)
            ->line("This code expires in {$this->expiresInMinutes} minutes and can only be used once.")
            ->line('If you did not request this code, you can safely ignore this email.');
    }
}
