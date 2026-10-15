<?php

namespace App\Http\Middleware;

use App\Models\SiteSetting;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');
        $user = $request->user()?->loadMissing(['role', 'profile']);

        return array_merge(parent::share($request), [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'username_can_be_changed' => $user->canChangeUsername(),
                    'username_change_available_at' => $user->usernameChangeAvailableAt()?->toDateString(),
                    'email' => $user->email,
                    'email_verified_at' => $user->email_verified_at,
                    'avatar' => $user->avatar_path
                        ? Storage::disk('public')->url($user->avatar_path)
                        : 'https://ui-avatars.com/api/?name='.urlencode($user->name).'&background=4f46e5&color=fff',
                    'role' => $user->role?->name ?? 'Unassigned',
                    'profile' => [
                        'display_name' => $user->profile?->display_name,
                        'language' => $user->profile?->language ?? 'en',
                        'timezone' => $user->profile?->timezone,
                        'date_of_birth' => $user->profile?->date_of_birth?->toDateString(),
                        'profile_visibility' => $user->profile?->profile_visibility ?? 'public',
                    ],
                ] : null,
                'permissions' => $user ? ($user->isSuperAdmin() ? ['*'] : $user->role?->permissionSlugs() ?? []) : [],
            ],
            'site' => Schema::hasTable('site_settings')
                ? SiteSetting::current()->toBranding()
                : ['name' => 'ChessX', 'slogan' => 'React + Laravel', 'logo_url' => null, 'favicon_url' => null],
        ]);
    }
}
