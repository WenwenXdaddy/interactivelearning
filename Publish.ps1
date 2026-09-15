# Run from PowerShell: .\Publish.ps1
# The GitHub repository already exists. This only publishes to Cloudflare through official browser login.
# Do not paste API tokens into chat or commit them to the repository.
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw 'Install Node.js 22 or later from nodejs.org, then reopen PowerShell.'
}
& node scripts/publish.mjs --cloudflare
if ($LASTEXITCODE -ne 0) { throw 'Publication did not complete. Read the last STOPPED/NOT VERIFIED message. Completed earlier steps are not rolled back.' }
