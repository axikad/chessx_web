<?php

namespace App\Enums;

enum GameMode: string
{
    case Rated = 'rated';
    case Casual = 'casual';
    case Tournament = 'tournament';
}
