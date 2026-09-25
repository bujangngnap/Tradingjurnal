@echo off
set "PHPRC=%~dp0php.ini"
set "PATH=%~dp0;C:\xampp\php;%PATH%"
C:\xampp\php\php.exe "%~dp0composer.phar" %*
