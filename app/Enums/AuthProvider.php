<?php

namespace App\Enums;

enum AuthProvider: string
{
    case Google = 'google';
    case Apple = 'apple';
}
