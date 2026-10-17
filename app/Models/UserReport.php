<?php

namespace App\Models;

use App\Enums\UserReportStatus;
use Database\Factories\UserReportFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserReport extends Model
{
    /** @use HasFactory<UserReportFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = ['reporter_user_id', 'reported_user_id', 'game_id', 'reason', 'description', 'status', 'reviewed_by', 'reviewed_at'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['status' => UserReportStatus::class, 'reviewed_at' => 'datetime'];
    }

    /** @return BelongsTo<User, $this> */
    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_user_id');
    }

    /** @return BelongsTo<User, $this> */
    public function reportedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_user_id');
    }

    /** @return BelongsTo<Game, $this> */
    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }

    /** @return BelongsTo<User, $this> */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
