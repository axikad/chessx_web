<?php

it('reports native Apple sign-in as enabled when the flag and client ID are configured', function () {
    config()->set('services.apple.enabled', true);
    config()->set('services.apple.native_client_ids', ['com.chessx.mobile']);

    $this->getJson('/api/v1/app-config')
        ->assertOk()
        ->assertExactJson([
            'success' => true,
            'message' => 'Application configuration retrieved successfully.',
            'data' => [
                'auth' => [
                    'apple' => [
                        'enabled' => true,
                    ],
                ],
            ],
        ]);
});

it('reports native Apple sign-in as disabled when its configuration is incomplete', function (bool $enabled, array $clientIds) {
    config()->set('services.apple.enabled', $enabled);
    config()->set('services.apple.native_client_ids', $clientIds);

    $this->getJson('/api/v1/app-config')
        ->assertOk()
        ->assertJsonPath('data.auth.apple.enabled', false);
})->with([
    'feature flag disabled' => [false, ['com.chessx.mobile']],
    'native client ID missing' => [true, []],
]);
