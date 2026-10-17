<?php

namespace App\Enums;

enum TournamentQualifierStatus: string
{
    case Pending = 'pending';
    case Qualified = 'qualified';
    case Revoked = 'revoked';
}
