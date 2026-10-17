<?php

namespace App\Enums;

enum MatchmakingQueueStatus: string
{
    case Queued = 'queued';
    case Matched = 'matched';
    case Cancelled = 'cancelled';
    case Expired = 'expired';
}
