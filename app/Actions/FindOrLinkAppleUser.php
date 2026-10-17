<?php

namespace App\Actions;

use App\Enums\AuthProvider;
use App\Exceptions\AppleAccountException;
use App\Models\Role;
use App\Models\User;
use App\Models\UserAuthProvider;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

final class FindOrLinkAppleUser
{
    public function __construct(private OnboardPlayer $onboardPlayer) {}

    /**
     * @param  array{sub: string, email: ?string, email_verified: bool, is_private_email: bool, name: ?string}  $identity
     */
    public function handle(array $identity): User
    {
        try {
            return $this->resolve($identity);
        } catch (UniqueConstraintViolationException) {
            return $this->resolve($identity);
        }
    }

    /**
     * @param  array{sub: string, email: ?string, email_verified: bool, is_private_email: bool, name: ?string}  $identity
     */
    private function resolve(array $identity): User
    {
        return DB::transaction(function () use ($identity): User {
            $provider = UserAuthProvider::query()
                ->where('provider', AuthProvider::Apple)
                ->where('provider_user_id', $identity['sub'])
                ->lockForUpdate()
                ->first();

            if ($provider !== null) {
                $user = $provider->user;

                if ($user === null) {
                    throw AppleAccountException::notLinked();
                }

                $this->ensureActive($user);

                return $user;
            }

            if ($identity['email'] === null) {
                throw AppleAccountException::emailUnavailable();
            }

            if (! $identity['email_verified']) {
                throw AppleAccountException::emailNotVerified();
            }

            $user = User::query()
                ->withTrashed()
                ->where('email', $identity['email'])
                ->lockForUpdate()
                ->first();

            if ($user === null) {
                $user = $this->createPlayer($identity);
            }

            $this->ensureActive($user);

            $existingAppleProvider = UserAuthProvider::query()
                ->where('user_id', $user->getKey())
                ->where('provider', AuthProvider::Apple)
                ->lockForUpdate()
                ->first();

            if ($existingAppleProvider !== null) {
                throw AppleAccountException::conflictingLink();
            }

            $user->authProviders()->create([
                'provider' => AuthProvider::Apple,
                'provider_user_id' => $identity['sub'],
            ]);

            if ($user->email_verified_at === null) {
                $user->forceFill(['email_verified_at' => now()])->save();
            }

            if ($user->wasRecentlyCreated) {
                $this->onboardPlayer->handle($user);
            } else {
                $this->importMissingDisplayName($user, $identity['name']);
            }

            return $user;
        });
    }

    /**
     * @param  array{sub: string, email: string, email_verified: bool, is_private_email: bool, name: ?string}  $identity
     */
    private function createPlayer(array $identity): User
    {
        $role = Role::query()->where('slug', 'user')->first();

        if ($role === null) {
            throw AppleAccountException::unavailable();
        }

        $name = $identity['name'] ?? Str::of($identity['email'])
            ->before('@')
            ->replace(['.', '_', '-'], ' ')
            ->squish()
            ->title()
            ->limit(255, '')
            ->value();

        return User::query()->create([
            'role_id' => $role->getKey(),
            'name' => $name !== '' ? $name : 'Chess Mission Player',
            'email' => $identity['email'],
            'email_verified_at' => now(),
            'password' => Hash::make(Str::random(64)),
            'status' => 'active',
        ]);
    }

    private function importMissingDisplayName(User $user, ?string $name): void
    {
        if ($name === null || $name === '') {
            return;
        }

        $profile = $user->profile()->firstOrCreate([]);

        if ($profile->display_name === null || $profile->display_name === '') {
            $profile->update(['display_name' => $name]);
        }
    }

    private function ensureActive(User $user): void
    {
        if ($user->trashed() || $user->status !== 'active') {
            throw AppleAccountException::inactive();
        }
    }
}
