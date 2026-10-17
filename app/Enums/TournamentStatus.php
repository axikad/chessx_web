<?php

namespace App\Enums;

enum TournamentStatus: string
{
    case Draft = 'draft';
    case Registration = 'registration';
    case Scheduled = 'scheduled';
    case InProgress = 'in_progress';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
}
