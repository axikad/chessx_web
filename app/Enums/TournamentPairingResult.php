<?php

namespace App\Enums;

enum TournamentPairingResult: string
{
    case WhiteWin = 'white_win';
    case BlackWin = 'black_win';
    case Draw = 'draw';
    case Bye = 'bye';
    case Forfeit = 'forfeit';
}
