<?php

namespace App\Enums;

enum GameTerminationReason: string
{
    case Checkmate = 'checkmate';
    case Resignation = 'resignation';
    case Timeout = 'timeout';
    case Stalemate = 'stalemate';
    case DrawAgreement = 'draw_agreement';
    case Repetition = 'repetition';
    case FiftyMoveRule = 'fifty_move_rule';
    case InsufficientMaterial = 'insufficient_material';
    case Abandonment = 'abandonment';
    case Other = 'other';
}
