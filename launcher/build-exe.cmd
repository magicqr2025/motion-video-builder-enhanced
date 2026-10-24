@echo off
rem Builds MotionStudio.exe (in the project folder) from MotionStudio.cs with the C# compiler that comes with Windows.
rem Run it again after changing MotionStudio.cs. No Visual Studio or SDK needed.
setlocal
cd /d "%~dp0"
set CSC=%WINDIR%\Microsoft.NET\Framework64\v4.0.30319\csc.exe
if not exist "%CSC%" set CSC=%WINDIR%\Microsoft.NET\Framework\v4.0.30319\csc.exe
if not exist "%CSC%" ( echo The .NET Framework compiler was not found. & exit /b 1 )
if not exist motionstudio.ico powershell -NoProfile -ExecutionPolicy Bypass -File make-icon.ps1
set ICON=
if exist motionstudio.ico set ICON=/win32icon:motionstudio.ico
"%CSC%" /nologo /target:winexe /optimize+ /out:..\MotionStudio.exe %ICON% /reference:System.Windows.Forms.dll MotionStudio.cs
if errorlevel 1 ( echo Build failed. & exit /b 1 )
echo Built ..\MotionStudio.exe
