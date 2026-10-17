<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ContactMessageNotification extends Notification
{
    use Queueable;

    public function __construct(
        public readonly string $name,
        public readonly string $email,
        public readonly string $subject,
        public readonly string $message,
        public readonly ?string $ipAddress,
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
            ->subject('New Chess Mission contact message')
            ->greeting('New public contact message')
            ->line('From: '.$this->name)
            ->line('Email: '.$this->email)
            ->line('Subject: '.$this->subject)
            ->line('Message:')
            ->line($this->message)
            ->line('IP address: '.($this->ipAddress ?? 'Unavailable'));
    }
}
