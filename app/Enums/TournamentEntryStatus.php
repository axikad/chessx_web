<?php

namespace App\Enums;

enum TournamentEntryStatus: string
{
    case Registered = 'registered';
    case Confirmed = 'confirmed';
    case Withdrawn = 'withdrawn';
    case Disqualified = 'disqualified';
    case Completed = 'completed';
}
