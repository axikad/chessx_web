<?php

use App\Services\Auth\AppleNonceService;

test('an issued Apple nonce is short lived and can be consumed only once', function () {
    $result = app(AppleNonceService::class)->issue();

    expect($result)->toHaveKeys(['nonce', 'expires_in'])
        ->and($result['nonce'])->toBeString()->toHaveLength(43)
        ->and($result['expires_in'])->toBe(600)
        ->and(app(AppleNonceService::class)->consume($result['nonce']))->toBeTrue()
        ->and(app(AppleNonceService::class)->consume($result['nonce']))->toBeFalse();
});
