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
            'users' => ['name' => 'User Management', 'sort_order' => 20, 'permissions' => ['read', 'create', 'update', 'delete']],
            'roles' => ['name' => 'Role Management', 'sort_order' => 30, 'permissions' => ['read', 'create', 'update', 'delete', 'assign_permissions']],
            'permissions' => ['name' => 'Permission Management', 'sort_order' => 40, 'permissions' => ['read', 'create', 'update', 'delete']],
            'modules' => ['name' => 'Module Management', 'sort_order' => 50, 'permissions' => ['read', 'create', 'update', 'delete']],
            'branding' => ['name' => 'Site Branding', 'sort_order' => 60, 'permissions' => ['read', 'update']],
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
        $permissionService->sync(
            $userRole,
            Permission::query()->where('slug', 'dashboard.read')->pluck('id'),
            $superAdmin,
        );
    }

    private function permissionName(string $moduleName, string $action): string
    {
        return str($action)->replace('_', ' ')->title()->append(" {$moduleName}")->toString();
    }
}
