<?php

namespace App\Enums;

enum AntiCheatStatus: string
{
    case Open = 'open';
    case Reviewing = 'reviewing';
    case Confirmed = 'confirmed';
    case Dismissed = 'dismissed';
}
