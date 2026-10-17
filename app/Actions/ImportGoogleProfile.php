<?php

namespace App\Actions;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

final class ImportGoogleProfile
{
    private const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

    private const MAX_AVATAR_DIMENSION = 4096;

    /** @var array<string, string> */
    private const AVATAR_EXTENSIONS = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
    ];

    /**
     * @param  array{sub: string, email: ?string, email_verified: bool, name: ?string, picture: ?string}  $identity
     */
    public function handle(User $user, array $identity): void
    {
        $this->importDisplayName($user, $identity['name']);

        if ($identity['picture'] === null || $user->avatar_path !== null) {
            return;
        }

        try {
            $this->importAvatar($user, $identity['picture']);
        } catch (Throwable $exception) {
            Log::notice('Google profile avatar import failed.', [
                'user_id' => $user->getKey(),
                'exception' => $exception::class,
            ]);
        }
    }

    private function importDisplayName(User $user, ?string $name): void
    {
        $displayName = $name === null
            ? null
            : Str::of($name)->squish()->limit(100, '')->value();

        if ($displayName === null || $displayName === '') {
            return;
        }

        $profile = $user->profile()->first();

        if ($profile === null) {
            try {
                $user->profile()->create(['display_name' => $displayName]);

                return;
            } catch (UniqueConstraintViolationException) {
                $profile = $user->profile()->first();
            }
        }

        if ($profile === null) {
            return;
        }

        UserProfile::query()
            ->whereKey($profile->getKey())
            ->where(function ($query): void {
                $query->whereNull('display_name')->orWhere('display_name', '');
            })
            ->update(['display_name' => $displayName]);
    }

    private function importAvatar(User $user, string $pictureUrl): void
    {
        if (! $this->isAllowedPictureUrl($pictureUrl)) {
            return;
        }

        $response = Http::accept(implode(', ', array_keys(self::AVATAR_EXTENSIONS)))
            ->connectTimeout(2)
            ->timeout(5)
            ->get($pictureUrl);

        if (! $response->successful()) {
            return;
        }

        $contents = $response->body();

        if ($contents === '' || strlen($contents) > self::MAX_AVATAR_BYTES) {
            return;
        }

        $mimeType = (new \finfo(FILEINFO_MIME_TYPE))->buffer($contents);
        $extension = is_string($mimeType) ? (self::AVATAR_EXTENSIONS[$mimeType] ?? null) : null;
        $dimensions = @getimagesizefromstring($contents);

        if ($extension === null
            || $dimensions === false
            || $dimensions[0] > self::MAX_AVATAR_DIMENSION
            || $dimensions[1] > self::MAX_AVATAR_DIMENSION) {
            return;
        }

        $path = 'avatars/google-'.$user->uuid.'-'.Str::lower(Str::random(8)).'.'.$extension;

        if (! Storage::disk('public')->put($path, $contents)) {
            return;
        }

        $updated = User::query()
            ->whereKey($user->getKey())
            ->whereNull('avatar_path')
            ->update(['avatar_path' => $path]);

        if ($updated === 0) {
            Storage::disk('public')->delete($path);

            return;
        }

        $user->avatar_path = $path;
    }

    private function isAllowedPictureUrl(string $pictureUrl): bool
    {
        if (filter_var($pictureUrl, FILTER_VALIDATE_URL) === false) {
            return false;
        }

        $scheme = parse_url($pictureUrl, PHP_URL_SCHEME);
        $host = parse_url($pictureUrl, PHP_URL_HOST);
        $port = parse_url($pictureUrl, PHP_URL_PORT);
        $user = parse_url($pictureUrl, PHP_URL_USER);
        $password = parse_url($pictureUrl, PHP_URL_PASS);

        return $scheme === 'https'
            && is_string($host)
            && ($host === 'googleusercontent.com' || str_ends_with($host, '.googleusercontent.com'))
            && ($port === null || $port === 443)
            && $user === null
            && $password === null;
    }
}
