@echo off
setlocal
title Minha Jornada - acesso pelo celular
color 1F

set "PYTHON=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
set "APPDIR=%~dp0"

cls
echo ============================================================
echo              MINHA JORNADA NO CELULAR
echo ============================================================
echo.
echo 1. Deixe o computador e o celular no mesmo Wi-Fi.
echo.
echo 2. No celular, abra o Chrome ou Safari.
echo.
echo 3. Digite um dos enderecos abaixo, acrescentando :4173
echo    no final. Use o endereco que comeca com 192.168 ou 10.
echo.
ipconfig | findstr /i "IPv4"
echo.
echo Exemplo: http://192.168.1.10:4173
echo.
echo 4. NAO FECHE esta janela enquanto estiver usando no celular.
echo.
echo ============================================================
echo.

if not exist "%PYTHON%" (
  color 4F
  echo Nao encontrei o programa necessario para compartilhar o site.
  echo.
  echo Tire uma foto desta tela e envie para o Codex.
  echo.
  pause
  exit /b 1
)

cd /d "%APPDIR%"
"%PYTHON%" -m http.server 4173 --bind 0.0.0.0

color 4F
echo.
echo O compartilhamento foi encerrado ou ocorreu um problema.
echo Tire uma foto desta tela e envie para o Codex.
echo.
pause
