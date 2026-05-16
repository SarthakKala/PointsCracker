# Windows build script (same flags as Makefile). Requires Emscripten on PATH.
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$outDir = Join-Path $PSScriptRoot '..\..\public'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$outDir = (Resolve-Path $outDir).Path
$outJs = Join-Path $outDir 'calculator.js'
$src = Join-Path $PSScriptRoot 'calculator.cpp'

emcc $src -o $outJs `
  -s EXPORTED_FUNCTIONS='["_calculate","_getPointsValueSummary"]' `
  -s EXPORTED_RUNTIME_METHODS='["cwrap"]' `
  -s MODULARIZE=1 `
  -s EXPORT_NAME='CalculatorModule' `
  -s ALLOW_MEMORY_GROWTH=1 `
  -O2

if ($LASTEXITCODE -ne 0) {
  Write-Error "emcc failed with exit code $LASTEXITCODE"
}

Write-Host "Built: $outJs and $(Join-Path $outDir 'calculator.wasm')"
