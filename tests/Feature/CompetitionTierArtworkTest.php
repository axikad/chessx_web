<?php

use App\Models\CompetitionTier;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Services\RolePermissionService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('allows an authorized administrator to replace competition artwork', function () {
    Storage::fake('public');
    $actor = User::factory()->for(Role::factory()->superAdmin())->create();
    $tier = CompetitionTier::factory()->create(['artwork_path' => 'leagues/Lcity.png']);

    $response = $this->actingAs($actor)
        ->post(route('management.competitions.artwork.update', $tier), [
            'artwork' => UploadedFile::fake()->image('city-card.png', 1600, 900),
        ])
        ->assertOk()
        ->assertJsonPath('data.id', $tier->id);

    $path = $tier->fresh()->artwork_path;
    Storage::disk('public')->assertExists($path);
    expect($response->json('data.imageUrl'))->toEndWith('/storage/'.$path);
    $this->assertDatabaseHas('audit_logs', [
        'actor_user_id' => $actor->id,
        'action' => 'competition.artwork_updated',
        'entity_id' => $tier->id,
    ]);
});

it('removes the previous custom artwork after a successful replacement', function () {
    Storage::fake('public');
    Storage::disk('public')->put('leagues/old-custom.png', 'old artwork');
    $tier = CompetitionTier::factory()->create(['artwork_path' => 'leagues/old-custom.png']);

    $this->actingAs(User::factory()->for(Role::factory()->superAdmin())->create())
        ->post(route('management.competitions.artwork.update', $tier), [
            'artwork' => UploadedFile::fake()->image('replacement.webp', 1600, 900),
        ])
        ->assertOk();

    Storage::disk('public')->assertMissing('leagues/old-custom.png');
    Storage::disk('public')->assertExists($tier->fresh()->artwork_path);
});

it('keeps bundled fallback artwork when replacing a default image', function () {
    Storage::fake('public');
    Storage::disk('public')->put('leagues/Lcity.png', 'bundled artwork');
    $tier = CompetitionTier::factory()->create(['artwork_path' => 'leagues/Lcity.png']);

    $this->actingAs(User::factory()->for(Role::factory()->superAdmin())->create())
        ->post(route('management.competitions.artwork.update', $tier), [
            'artwork' => UploadedFile::fake()->image('replacement.png', 1600, 900),
        ])
        ->assertOk();

    Storage::disk('public')->assertExists('leagues/Lcity.png');
});

it('rejects invalid competition artwork uploads', function () {
    Storage::fake('public');
    $tier = CompetitionTier::factory()->create();

    $this->actingAs(User::factory()->for(Role::factory()->superAdmin())->create())
        ->postJson(route('management.competitions.artwork.update', $tier), [
            'artwork' => UploadedFile::fake()->create('document.pdf', 100, 'application/pdf'),
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('artwork');

    expect($tier->fresh()->artwork_path)->toBeNull();
    Storage::disk('public')->assertDirectoryEmpty('leagues');
});

it('forbids artwork updates without the competition update permission', function () {
    Storage::fake('public');
    $role = Role::factory()->create();
    $actor = User::factory()->for($role)->create();
    app(RolePermissionService::class)->assign(
        $role,
        Permission::factory()->create(['slug' => 'competitions.read']),
        $actor,
    );
    $tier = CompetitionTier::factory()->create();

    $this->actingAs($actor)
        ->postJson(route('management.competitions.artwork.update', $tier), [
            'artwork' => UploadedFile::fake()->image('city-card.png'),
        ])
        ->assertForbidden();

    expect($tier->fresh()->artwork_path)->toBeNull();
});
