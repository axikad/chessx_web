<?php

namespace App\Enums;

enum TournamentFormat: string
{
    case Swiss = 'swiss';
    case Knockout = 'knockout';
    case RoundRobin = 'round_robin';
}
