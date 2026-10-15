<?php

namespace App\Enums;

enum PlayerCompetitionStatus: string
{
    case Locked = 'locked';
    case Eligible = 'eligible';
    case Active = 'active';
    case Suspended = 'suspended';
}
