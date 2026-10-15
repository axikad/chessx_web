<?php

namespace App\Models;

use Database\Factories\PermissionAssignmentLogFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PermissionAssignmentLog extends Model
{
    /** @use HasFactory<PermissionAssignmentLogFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = ['role_id', 'permission_id', 'role_name', 'permission_slug', 'action', 'performed_by'];

    /** @return BelongsTo<Role, $this> */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /** @return BelongsTo<Permission, $this> */
    public function permission(): BelongsTo
    {
        return $this->belongsTo(Permission::class);
    }

    /** @return BelongsTo<User, $this> */
    public function performer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}
