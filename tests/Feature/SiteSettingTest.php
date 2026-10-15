<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\SiteSetting;
use App\Models\User;
use App\Services\RolePermissionService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('a user with branding permissions can read and update branding', function () {
    Storage::fake('public');
    $role = Role::factory()->create();
    $user = User::factory()->for($role)->create();
    $read = Permission::factory()->create(['slug' => 'branding.read']);
    $update = Permission::factory()->create(['slug' => 'branding.update']);
    app(RolePermissionService::class)->sync($role, [$read->id, $update->id], $user);

    $this->actingAs($user)->getJson(route('management.branding.show'))
        ->assertOk()->assertJsonPath('data.name', 'ChessX');

    $response = $this->post(route('management.branding.update'), [
        'name' => 'Knight Club',
        'slogan' => 'Play smarter',
        'logo' => UploadedFile::fake()->image('logo.png', 300, 300),
        'favicon' => UploadedFile::fake()->image('favicon.png', 32, 32),
    ])->assertOk()->assertJsonPath('data.name', 'Knight Club');

    $setting = SiteSetting::query()->firstOrFail();
    expect($setting->updated_by)->toBe($user->id);
    Storage::disk('public')->assertExists($setting->logo_path);
    Storage::disk('public')->assertExists($setting->favicon_path);
    expect($response->json('data.logo_url'))->toContain('/storage/branding/');
});

test('branding read and update permissions are enforced separately', function () {
    $role = Role::factory()->create();
    $user = User::factory()->for($role)->create();
    $read = Permission::factory()->create(['slug' => 'branding.read']);
    app(RolePermissionService::class)->assign($role, $read, $user);

    $this->actingAs($user)->getJson(route('management.branding.show'))->assertOk();
    $this->postJson(route('management.branding.update'), ['name' => 'Blocked'])->assertForbidden();
});

test('users without branding read permission cannot access branding data', function () {
    $user = User::factory()->for(Role::factory()->create())->create();

    $this->actingAs($user)->getJson(route('management.branding.show'))->assertForbidden();
});

test('branding validates image types and sizes', function () {
    Storage::fake('public');
    $user = User::factory()->for(Role::factory()->superAdmin())->create();

    $this->actingAs($user)->withHeader('Accept', 'application/json')->post(route('management.branding.update'), [
        'name' => 'ChessX',
        'logo' => UploadedFile::fake()->create('logo.pdf', 100, 'application/pdf'),
    ])->assertUnprocessable()->assertJsonValidationErrors('logo');
});

test('branding is shared with inertia pages together with user permissions', function () {
    SiteSetting::factory()->create(['name' => 'Chess Portal']);
    $role = Role::factory()->create();
    $user = User::factory()->for($role)->create();
    $read = Permission::factory()->create(['slug' => 'branding.read']);
    app(RolePermissionService::class)->assign($role, $read, $user);

    $this->actingAs($user)->get(route('home'))->assertInertia(fn (Assert $page) => $page
        ->where('site.name', 'Chess Portal')
        ->where('auth.permissions', ['branding.read']));
});
