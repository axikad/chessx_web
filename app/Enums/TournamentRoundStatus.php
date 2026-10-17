<?php

namespace App\Enums;

enum TournamentRoundStatus: string
{
    case Pending = 'pending';
    case InProgress = 'in_progress';
    case Completed = 'completed';
}
