<?php

namespace Database\Seeders;

use App\Models\Module;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Services\RolePermissionService;
use Illuminate\Database\Seeder;

class ModuleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $superAdmin = User::query()->where('email', 'admin@chessx.test')->firstOrFail();
        $modules = [
            'dashboard' => ['name' => 'Dashboard', 'sort_order' => 10, 'permissions' => ['read']],
            'users' => ['name' => 'User Management', 'sort_order' => 20, 'permissions' => ['read', 'view_super_admin', 'create', 'update', 'delete', 'restore']],
            'roles' => ['name' => 'Role Management', 'sort_order' => 30, 'permissions' => ['read', 'create', 'update', 'delete', 'assign_permissions']],
            'permissions' => ['name' => 'Permission Management', 'sort_order' => 40, 'permissions' => ['read', 'create', 'update', 'delete']],
            'modules' => ['name' => 'Module Management', 'sort_order' => 50, 'permissions' => ['read', 'create', 'update', 'delete']],
            'branding' => ['name' => 'Site Branding', 'sort_order' => 60, 'permissions' => ['read', 'update']],
            'player_profiles' => ['name' => 'Player Profiles', 'sort_order' => 70, 'permissions' => ['read', 'update']],
            'geography' => ['name' => 'Geography', 'sort_order' => 80, 'permissions' => ['read', 'create', 'update', 'delete']],
            'player_locations' => ['name' => 'Player Locations', 'sort_order' => 90, 'permissions' => ['read', 'review']],
            'competitions' => ['name' => 'Competitions', 'sort_order' => 100, 'permissions' => ['read', 'create', 'update', 'delete']],
            'seasons' => ['name' => 'Seasons', 'sort_order' => 110, 'permissions' => ['read', 'create', 'update', 'delete']],
            'ratings' => ['name' => 'Player Ratings', 'sort_order' => 120, 'permissions' => ['read', 'update']],
            'leaderboards' => ['name' => 'Leaderboards', 'sort_order' => 130, 'permissions' => ['read', 'generate']],
            'promotions' => ['name' => 'Promotions', 'sort_order' => 140, 'permissions' => ['read', 'update', 'review']],
        ];

        foreach ($modules as $moduleSlug => $moduleData) {
            $module = Module::query()->updateOrCreate(
                ['slug' => $moduleSlug],
                [
                    'name' => $moduleData['name'],
                    'is_active' => true,
                    'sort_order' => $moduleData['sort_order'],
                    'created_by' => $superAdmin->getKey(),
                    'updated_by' => $superAdmin->getKey(),
                ],
            );

            foreach ($moduleData['permissions'] as $action) {
                Permission::query()->updateOrCreate(
                    ['slug' => "{$moduleSlug}.{$action}"],
                    [
                        'module_id' => $module->getKey(),
                        'name' => $this->permissionName($moduleData['name'], $action),
                        'action' => $action,
                        'is_active' => true,
                        'created_by' => $superAdmin->getKey(),
                        'updated_by' => $superAdmin->getKey(),
                    ],
                );
            }
        }

        $permissionService = app(RolePermissionService::class);
        $adminRole = Role::query()->where('slug', 'admin')->firstOrFail();
        $userRole = Role::query()->where('slug', 'user')->firstOrFail();

        $permissionService->sync($adminRole, Permission::query()->pluck('id'), $superAdmin);
        $permissionService->assign(
            $userRole,
            Permission::query()->where('slug', 'dashboard.read')->firstOrFail(),
            $superAdmin,
        );
    }

    private function permissionName(string $moduleName, string $action): string
    {
        return str($action)->replace('_', ' ')->title()->append(" {$moduleName}")->toString();
    }
}
