<?php

namespace App\Enums;

enum AdEventType: string
{
    case Impression = 'impression';
    case Click = 'click';
    case RewardCompleted = 'reward_completed';
    case Failed = 'failed';
}
