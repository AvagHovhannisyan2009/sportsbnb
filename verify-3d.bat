@echo off
REM 🔍 3D Installation Verification Script for Windows

echo 🔍 Verifying 3D Immersive Website Installation...
echo.

REM Check Node.js
echo Checking Node.js...
where node >nul 2>nul
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
    echo [√] Found %NODE_VERSION%
) else (
    echo [X] Node.js not found
    exit /b 1
)

REM Check npm
echo Checking npm...
where npm >nul 2>nul
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
    echo [√] Found v%NPM_VERSION%
) else (
    echo [X] npm not found
    exit /b 1
)

echo.
echo 📦 Checking Dependencies...

REM Check packages (simplified for Windows)
call npm list three >nul 2>nul && echo [√] Three.js || echo [X] Three.js (not installed)
call npm list @react-three/fiber >nul 2>nul && echo [√] React Three Fiber || echo [X] React Three Fiber
call npm list @react-three/drei >nul 2>nul && echo [√] Drei || echo [X] Drei
call npm list @react-three/postprocessing >nul 2>nul && echo [√] Postprocessing || echo [X] Postprocessing
call npm list gsap >nul 2>nul && echo [√] GSAP || echo [X] GSAP
call npm list @studio-freight/lenis >nul 2>nul && echo [√] Lenis || echo [X] Lenis
call npm list maath >nul 2>nul && echo [√] Maath || echo [X] Maath

echo.
echo 📁 Checking Files...

if exist "src\pages\HomePage3D.tsx" (echo [√] HomePage3D.tsx) else (echo [X] HomePage3D.tsx)
if exist "src\components\3d\Scene3D.tsx" (echo [√] Scene3D.tsx) else (echo [X] Scene3D.tsx)
if exist "src\components\3d\HeroScene.tsx" (echo [√] HeroScene.tsx) else (echo [X] HeroScene.tsx)
if exist "src\components\3d\ScrollRig.tsx" (echo [√] ScrollRig.tsx) else (echo [X] ScrollRig.tsx)
if exist "src\components\3d\ParticleField.tsx" (echo [√] ParticleField.tsx) else (echo [X] ParticleField.tsx)
if exist "src\components\3d\PostProcessing.tsx" (echo [√] PostProcessing.tsx) else (echo [X] PostProcessing.tsx)
if exist "src\hooks\useSmoothScroll.ts" (echo [√] useSmoothScroll.ts) else (echo [X] useSmoothScroll.ts)
if exist "src\hooks\useInteractions.ts" (echo [√] useInteractions.ts) else (echo [X] useInteractions.ts)
if exist "src\lib\animations.ts" (echo [√] animations.ts) else (echo [X] animations.ts)
if exist "src\types\3d.d.ts" (echo [√] 3d.d.ts) else (echo [X] 3d.d.ts)

echo.
echo 📚 Checking Documentation...

if exist "3D_IMPLEMENTATION_GUIDE.md" (echo [√] Implementation Guide) else (echo [X] Implementation Guide)
if exist "3D_API_REFERENCE.md" (echo [√] API Reference) else (echo [X] API Reference)
if exist "3D_ARCHITECTURE.md" (echo [√] Architecture Doc) else (echo [X] Architecture Doc)
if exist "README_3D_SUMMARY.md" (echo [√] Summary) else (echo [X] Summary)

echo.
echo ════════════════════════════════════════
echo 🎉 Verification Complete!
echo ════════════════════════════════════════
echo.
echo Next steps:
echo 1. Update src\App.tsx to use HomePage3D
echo 2. Run 'npm run dev'
echo 3. Visit http://localhost:5173
echo.
echo 📖 Documentation: .\3D_IMPLEMENTATION_GUIDE.md
echo.
pause
