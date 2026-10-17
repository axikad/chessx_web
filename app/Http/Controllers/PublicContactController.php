<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContactRequest;
use App\Notifications\ContactMessageNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Notification;

class PublicContactController extends Controller
{
    public function __invoke(StoreContactRequest $request): RedirectResponse
    {
        Notification::route('mail', (string) config('mail.support_address'))->notify(
            new ContactMessageNotification(
                name: $request->validated('name'),
                email: $request->validated('email'),
                subject: $request->validated('subject'),
                message: $request->validated('message'),
                ipAddress: $request->ip(),
            ),
        );

        return back()->with('success', 'Thanks for contacting Chess Mission. Your message has been sent.');
    }
}
