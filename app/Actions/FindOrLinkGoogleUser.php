<?php

namespace App\Actions;

use App\Enums\AuthProvider;
use App\Exceptions\GoogleAccountException;
use App\Models\Role;
use App\Models\User;
use App\Models\UserAuthProvider;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

final class FindOrLinkGoogleUser
{
    public function __construct(private OnboardPlayer $onboardPlayer) {}

    /**
     * @param  array{sub: string, email: ?string, email_verified: bool, name: ?string, picture: ?string}  $identity
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
     * @param  array{sub: string, email: ?string, email_verified: bool, name: ?string, picture: ?string}  $identity
     */
    private function resolve(array $identity): User
    {
        return DB::transaction(function () use ($identity): User {
            $provider = UserAuthProvider::query()
                ->where('provider', AuthProvider::Google)
                ->where('provider_user_id', $identity['sub'])
                ->lockForUpdate()
                ->first();

            if ($provider !== null) {
                $user = $provider->user;

                if ($user === null) {
                    throw GoogleAccountException::notLinked();
                }

                $this->ensureActive($user);

                return $user;
            }

            if (! $identity['email_verified'] || $identity['email'] === null) {
                throw GoogleAccountException::emailNotVerified();
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

            $existingGoogleProvider = UserAuthProvider::query()
                ->where('user_id', $user->getKey())
                ->where('provider', AuthProvider::Google)
                ->lockForUpdate()
                ->first();

            if ($existingGoogleProvider !== null) {
                throw GoogleAccountException::conflictingLink();
            }

            $user->authProviders()->create([
                'provider' => AuthProvider::Google,
                'provider_user_id' => $identity['sub'],
            ]);

            if ($user->email_verified_at === null) {
                $user->forceFill(['email_verified_at' => now()])->save();
            }

            if ($user->wasRecentlyCreated) {
                $this->onboardPlayer->handle($user);
            }

            return $user;
        });
    }

    /**
     * @param  array{sub: string, email: ?string, email_verified: bool, name: ?string, picture: ?string}  $identity
     */
    private function createPlayer(array $identity): User
    {
        $role = Role::query()->where('slug', 'user')->first();

        if ($role === null || $identity['email'] === null) {
            throw GoogleAccountException::unavailable();
        }

        $name = $identity['name'] === null
            ? Str::of($identity['email'])->before('@')->squish()->limit(255, '')->value()
            : Str::of($identity['name'])->squish()->limit(255, '')->value();

        return User::query()->create([
            'role_id' => $role->getKey(),
            'name' => $name !== '' ? $name : 'Chess Mission Player',
            'email' => $identity['email'],
            'email_verified_at' => now(),
            'password' => Hash::make(Str::random(64)),
            'status' => 'active',
        ]);
    }

    private function ensureActive(User $user): void
    {
        if ($user->trashed() || $user->status !== 'active') {
            throw GoogleAccountException::inactive();
        }
    }
}
