<?php

namespace App\Enums;

enum GameResult: string
{
    case WhiteWin = 'white_win';
    case BlackWin = 'black_win';
    case Draw = 'draw';
}
