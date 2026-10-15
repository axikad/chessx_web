<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateSiteSettingRequest;
use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class SiteSettingController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        Gate::authorize('branding.read');

        return response()->json(['data' => SiteSetting::current()->toBranding()]);
    }

    public function update(UpdateSiteSettingRequest $request): JsonResponse
    {
        $setting = SiteSetting::current();
        $validated = $request->validated();
        $attributes = [
            'name' => $validated['name'],
            'slogan' => $validated['slogan'] ?? null,
            'updated_by' => $request->user()->getKey(),
        ];

        $this->handleImage($request, $setting, 'logo', 'logo_path', $attributes);
        $this->handleImage($request, $setting, 'favicon', 'favicon_path', $attributes);
        $setting->update($attributes);

        return response()->json(['data' => $setting->fresh()->toBranding(), 'message' => 'Branding settings updated successfully.']);
    }

    /** @param array<string, mixed> $attributes */
    private function handleImage(Request $request, SiteSetting $setting, string $fileKey, string $pathKey, array &$attributes): void
    {
        if ($request->boolean('remove_'.$fileKey) && $setting->{$pathKey}) {
            Storage::disk('public')->delete($setting->{$pathKey});
            $attributes[$pathKey] = null;
        }

        if (! $request->hasFile($fileKey)) {
            return;
        }

        if ($setting->{$pathKey}) {
            Storage::disk('public')->delete($setting->{$pathKey});
        }

        $attributes[$pathKey] = $request->file($fileKey)->store('branding', 'public');
    }
}
