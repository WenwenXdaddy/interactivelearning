# Run from PowerShell: .\Publish.ps1
# The helper opens official GitHub/Cloudflare browser login screens. Do not paste API tokens into chat.
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw 'Install Node.js 22 or later from nodejs.org, then reopen PowerShell.'
}
& node scripts/publish.mjs --all
if ($LASTEXITCODE -ne 0) { throw 'Publication did not complete. Read the last STOPPED/NOT VERIFIED message. Completed earlier steps are not rolled back.' }
