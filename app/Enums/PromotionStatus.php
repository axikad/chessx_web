<?php

namespace App\Enums;

enum PromotionStatus: string
{
    case Pending = 'pending';
    case Qualified = 'qualified';
    case Approved = 'approved';
    case Rejected = 'rejected';
}
