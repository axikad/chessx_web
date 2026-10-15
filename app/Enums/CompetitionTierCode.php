<?php

namespace App\Enums;

enum CompetitionTierCode: string
{
    case City = 'city';
    case State = 'state';
    case National = 'national';
    case World = 'world';
}
