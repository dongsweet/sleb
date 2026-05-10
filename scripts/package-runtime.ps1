$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$outDir = Join-Path $root 'deploy\sleb-runtime'
$archive = Join-Path $root 'deploy\sleb-runtime.tar.gz'

Push-Location $root
try {
  npm run build

  if (Test-Path $outDir) {
    Remove-Item -LiteralPath $outDir -Recurse -Force
  }
  New-Item -ItemType Directory -Force -Path $outDir | Out-Null

  Copy-Item -LiteralPath 'package.json' -Destination $outDir
  Copy-Item -LiteralPath 'package-lock.json' -Destination $outDir
  Copy-Item -LiteralPath 'docker-compose.artifact.yml' -Destination $outDir
  Copy-Item -LiteralPath '.env.example' -Destination $outDir

  New-Item -ItemType Directory -Force -Path (Join-Path $outDir 'scripts') | Out-Null
  Copy-Item -LiteralPath 'scripts\install-runtime-deps.sh' -Destination (Join-Path $outDir 'scripts')

  foreach ($dir in @(
    'apps\api',
    'apps\worker',
    'apps\web',
    'packages\shared',
    'packages\db'
  )) {
    New-Item -ItemType Directory -Force -Path (Join-Path $outDir $dir) | Out-Null
    Copy-Item -LiteralPath (Join-Path $dir 'package.json') -Destination (Join-Path $outDir $dir)
  }

  Copy-Item -LiteralPath 'apps\api\dist' -Destination (Join-Path $outDir 'apps\api') -Recurse
  Copy-Item -LiteralPath 'apps\worker\dist' -Destination (Join-Path $outDir 'apps\worker') -Recurse
  Copy-Item -LiteralPath 'apps\web\.next' -Destination (Join-Path $outDir 'apps\web') -Recurse
  foreach ($nextJunk in @('cache', 'dev', 'diagnostics', 'turbopack')) {
    $junkPath = Join-Path $outDir "apps\web\.next\$nextJunk"
    if (Test-Path $junkPath) {
      Remove-Item -LiteralPath $junkPath -Recurse -Force
    }
  }
  Copy-Item -LiteralPath 'apps\web\next.config.mjs' -Destination (Join-Path $outDir 'apps\web')
  Copy-Item -LiteralPath 'apps\web\public' -Destination (Join-Path $outDir 'apps\web') -Recurse
  Copy-Item -LiteralPath 'packages\shared\dist' -Destination (Join-Path $outDir 'packages\shared') -Recurse
  Copy-Item -LiteralPath 'packages\db\dist' -Destination (Join-Path $outDir 'packages\db') -Recurse

  if (Test-Path $archive) {
    Remove-Item -LiteralPath $archive -Force
  }
  tar -czf $archive -C (Join-Path $root 'deploy') 'sleb-runtime'
  Write-Host "Created $archive"
}
finally {
  Pop-Location
}
