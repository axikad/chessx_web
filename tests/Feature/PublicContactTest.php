<?php

use App\Notifications\ContactMessageNotification;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    config()->set('mail.support_address', 'support@chessmission.test');
});

it('renders the public contact page', function () {
    $this->get(route('contact'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/contact')
            ->where('auth.user', null));
});

it('sends a validated contact message to the configured support address', function () {
    Notification::fake();

    $this->from(route('contact'))->post(route('contact.store'), [
        'name' => 'Player One',
        'email' => ' PLAYER@Example.test ',
        'subject' => 'Location support',
        'message' => 'Please help me correct my confirmed city.',
    ])->assertRedirect(route('contact'))
        ->assertSessionHas('success', 'Thanks for contacting Chess Mission. Your message has been sent.');

    Notification::assertSentOnDemand(
        ContactMessageNotification::class,
        fn (ContactMessageNotification $notification, array $channels, object $notifiable): bool => $channels === ['mail']
            && $notifiable->routes['mail'] === 'support@chessmission.test'
            && $notification->name === 'Player One'
            && $notification->email === 'player@example.test'
            && $notification->subject === 'Location support'
            && $notification->message === 'Please help me correct my confirmed city.',
    );
});

it('rejects incomplete contact messages', function () {
    Notification::fake();

    $this->from(route('contact'))->post(route('contact.store'), [
        'name' => '',
        'email' => 'invalid',
        'subject' => '',
        'message' => 'Short',
    ])->assertRedirect(route('contact'))
        ->assertSessionHasErrors(['name', 'email', 'subject', 'message']);

    Notification::assertNothingSent();
});

it('rejects contact form honeypot submissions', function () {
    Notification::fake();

    $this->from(route('contact'))->post(route('contact.store'), [
        'name' => 'Automated Sender',
        'email' => 'bot@example.test',
        'subject' => 'Automated message',
        'message' => 'This otherwise valid message filled the honeypot.',
        'website' => 'https://spam.example.test',
    ])->assertRedirect(route('contact'))
        ->assertSessionHasErrors('website');

    Notification::assertNothingSent();
});
