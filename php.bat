@echo off
set "PHPRC=%~dp0php.ini"
set "PHP_CLI_SERVER_WORKERS=4"
C:\xampp\php\php.exe %*
