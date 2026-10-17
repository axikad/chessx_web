<?php

use Illuminate\Support\Facades\Notification;

it('returns the standard 401 response when authentication is missing', function () {
    $this->getJson('/api/v1/me')->assertUnauthorized()->assertExactJson([
        'success' => false,
        'message' => 'Authentication is required.',
        'code' => 'unauthenticated',
    ]);
});

it('returns the standard 422 response with field errors', function () {
    $this->postJson('/api/v1/auth/email-otp/verify', [
        'email' => 'not-an-email',
        'otp' => '123456',
    ])->assertUnprocessable()->assertJson([
        'success' => false,
        'message' => 'The submitted data is invalid.',
        'code' => 'validation_failed',
    ])->assertJsonValidationErrors([
        'email',
        'otp',
        'device_name',
        'platform',
        'device_id',
    ])->assertJsonMissingPath('data');
});

it('returns the standard 404 response for an unknown API route', function () {
    $this->getJson('/api/v1/does-not-exist')->assertNotFound()->assertExactJson([
        'success' => false,
        'message' => 'The requested resource was not found.',
        'code' => 'not_found',
    ]);
});

it('nests OTP timing information inside the success data envelope', function () {
    Notification::fake();

    $response = $this->postJson('/api/v1/auth/email-otp/request', [
        'email' => 'player@example.test',
    ]);

    $response->assertAccepted()->assertExactJson([
        'success' => true,
        'message' => 'If this email can use Chess Mission, a login code has been sent.',
        'data' => [
            'expires_in' => 600,
            'resend_after' => 60,
        ],
    ]);
});
