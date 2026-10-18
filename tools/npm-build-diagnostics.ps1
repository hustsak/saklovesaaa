<#
.SYNOPSIS
    Global and Project-Level npm and Build Diagnostics Tool for Windows PowerShell.
.DESCRIPTION
    Inspects Node.js, npm configuration, install-script policies (allowScripts),
    and build tools (Vite, Next.js) across any JavaScript/TypeScript repository.
    Safe and strictly read-only: never modifies files, never approves scripts automatically,
    and never exposes authentication secrets.
.PARAMETER ProjectPath
    Target project directory to analyze (defaults to current working directory).
.EXAMPLE
    & "D:\Downloads\project\love\tools\npm-build-diagnostics.ps1"
    & "D:\Downloads\project\love\tools\npm-build-diagnostics.ps1" -ProjectPath "D:\Downloads\project\another-project"
#>

[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$ProjectPath = (Get-Location).Path
)

Set-StrictMode -Off
$ErrorActionPreference = "Continue"

# Resolve relative paths or home directory expansions safely
try {
    if (-not [string]::IsNullOrWhiteSpace($ProjectPath)) {
        if (Test-Path -Path $ProjectPath) {
            $ProjectPath = (Resolve-Path -Path $ProjectPath).Path
        } else {
            # Normalize path even if directory is missing for precise diagnostic reporting
            $ProjectPath = [System.IO.Path]::GetFullPath($ProjectPath)
        }
    } else {
        $ProjectPath = (Get-Location).Path
    }
} catch {
    $ProjectPath = (Get-Location).Path
}

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   Node.js, npm & Build Diagnostics Tool (Windows PowerShell)" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

# -----------------------------------------------------------------------------
# 1. GLOBAL ENVIRONMENT & RUNTIME INSPECTION
# -----------------------------------------------------------------------------
Write-Host "[1/4] GLOBAL ENVIRONMENT & RUNTIME" -ForegroundColor Yellow

# Node.js Version
try {
    $nodeVer = & node --version 2>$null
    Write-Host "  [-] Node.js:         $nodeVer" -ForegroundColor White
} catch {
    Write-Host "  [-] Node.js:         NOT FOUND in PATH" -ForegroundColor Red
}

# npm Version
try {
    $npmVer = & npm --version 2>$null
    Write-Host "  [-] npm:             v$npmVer" -ForegroundColor White
} catch {
    Write-Host "  [-] npm:             NOT FOUND in PATH" -ForegroundColor Red
}

# Global Prefix
try {
    $prefix = (& npm config get prefix 2>$null).Trim()
    Write-Host "  [-] npm Prefix:      $prefix" -ForegroundColor White
} catch {
    Write-Host "  [-] npm Prefix:      Unknown" -ForegroundColor Gray
}

# ignore-scripts status
try {
    $ignoreScripts = (& npm config get ignore-scripts 2>$null).Trim()
    Write-Host "  [-] ignore-scripts:  $ignoreScripts (Global default)" -ForegroundColor White
} catch {
    Write-Host "  [-] ignore-scripts:  Unknown" -ForegroundColor Gray
}

# User & Global Config Paths
try {
    $userConfig = (& npm config get userconfig 2>$null).Trim()
    $userConfigExists = Test-Path $userConfig
    Write-Host "  [-] User Config:     $userConfig (Exists: $userConfigExists)" -ForegroundColor White
} catch {
    $userConfig = "$HOME\.npmrc"
    Write-Host "  [-] User Config:     $userConfig (Status unknown)" -ForegroundColor Gray
}

try {
    $globalConfig = (& npm config get globalconfig 2>$null).Trim()
    $globalConfigExists = Test-Path $globalConfig
    Write-Host "  [-] Global Config:   $globalConfig (Exists: $globalConfigExists)" -ForegroundColor White
} catch {
    Write-Host "  [-] Global Config:   Not configured" -ForegroundColor Gray
}

# Check native approve-scripts / allowScripts support in installed npm
$approveHelp = & npm approve-scripts --help 2>&1
$supportsApproveScripts = ($LASTEXITCODE -eq 0 -and $approveHelp -notmatch 'Unknown command')
if ($supportsApproveScripts) {
    Write-Host "  [-] approve-scripts: Supported natively in installed npm v$npmVer" -ForegroundColor Green
} else {
    Write-Host "  [-] approve-scripts: Not in local npm v$npmVer (Introduced in npm v11.16.0 / v12.0.0+)" -ForegroundColor Cyan
    Write-Host "                       Note: Warnings originate from Cloud CI (Vercel/Netlify) or npm >= 11.16." -ForegroundColor Gray
}

Write-Host ""

# -----------------------------------------------------------------------------
# 2. PROJECT REPOSITORY & PACKAGE INSPECTION
# -----------------------------------------------------------------------------
Write-Host "[2/4] PROJECT REPOSITORY INSPECTION" -ForegroundColor Yellow
Write-Host "  • Target Path:     $ProjectPath" -ForegroundColor White

$pkgJsonPath = Join-Path $ProjectPath "package.json"
if (-not (Test-Path $pkgJsonPath)) {
    Write-Host "  [-] Status:          No package.json found in target directory." -ForegroundColor Yellow
    Write-Host "                     Run this script from inside a project directory or pass -ProjectPath." -ForegroundColor Gray
} else {
    try {
        $pkgContent = Get-Content $pkgJsonPath -Raw | ConvertFrom-Json
        $pkgName = if ($pkgContent.name) { $pkgContent.name } else { "(unnamed)" }
        $pkgVersion = if ($pkgContent.version) { $pkgContent.version } else { "0.0.0" }
        Write-Host "  [-] Project Name:    $pkgName@$pkgVersion" -ForegroundColor Green

        # Detect Lockfile
        $lockfiles = @(
            @{ Name = "package-lock.json"; Tool = "npm" },
            @{ Name = "yarn.lock"; Tool = "Yarn" },
            @{ Name = "pnpm-lock.yaml"; Tool = "pnpm" },
            @{ Name = "bun.lockb"; Tool = "Bun" }
        )
        $foundLocks = @()
        foreach ($l in $lockfiles) {
            if (Test-Path (Join-Path $ProjectPath $l.Name)) {
                $foundLocks += "$($l.Name) ($($l.Tool))"
            }
        }
        if ($foundLocks.Count -gt 0) {
            Write-Host "  [-] Lockfile(s):     $($foundLocks -join ', ')" -ForegroundColor White
        } else {
            Write-Host "  [-] Lockfile(s):     None detected" -ForegroundColor Yellow
        }

        # Check for project-level .npmrc
        $projNpmrc = Join-Path $ProjectPath ".npmrc"
        if (Test-Path $projNpmrc) {
            Write-Host "  [-] Project .npmrc:  Present ($projNpmrc)" -ForegroundColor White
            # Scan for allow-scripts or ignore-scripts without printing credentials
            $npmrcLines = Get-Content $projNpmrc | Where-Object { $_ -match 'allow-scripts|ignore-scripts' }
            foreach ($line in $npmrcLines) {
                Write-Host "    -> Rule: $line" -ForegroundColor Cyan
            }
        } else {
            Write-Host "  [-] Project .npmrc:  Not present (relying on user/defaults)" -ForegroundColor Gray
        }

        # Check for package.json 'allowScripts' configuration
        if ($pkgContent.allowScripts) {
            Write-Host "  [-] allowScripts:    Configured in package.json" -ForegroundColor Green
            $pkgContent.allowScripts.PSObject.Properties | ForEach-Object {
                Write-Host "    -> Approved: $($_.Name) = $($_.Value)" -ForegroundColor Gray
            }
        } else {
            Write-Host "  [-] allowScripts:    Not configured in package.json" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  [-] Error:           Could not parse package.json: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# -----------------------------------------------------------------------------
# 3. INSTALL-SCRIPT AUDIT (LIFECYCLE SCRIPTS AUDIT)
# -----------------------------------------------------------------------------
Write-Host "[3/4] LIFECYCLE INSTALL-SCRIPT AUDIT (POTENTIAL WARNING SOURCES)" -ForegroundColor Yellow
$nodeModulesPath = Join-Path $ProjectPath "node_modules"
if (Test-Path $nodeModulesPath) {
    Write-Host "  Scanning node_modules for packages with lifecycle install scripts..." -ForegroundColor Gray
    
    # Check known packages and scan common dependencies
    $knownPackages = @(
        "@firebase/util",
        "protobufjs",
        "esbuild",
        "sharp",
        "bcrypt",
        "canvas",
        "core-js"
    )
    
    $detectedScripts = @()
    foreach ($kp in $knownPackages) {
        $kpPkg = Join-Path $nodeModulesPath "$kp\package.json"
        if (Test-Path $kpPkg) {
            try {
                $kpJson = Get-Content $kpPkg -Raw | ConvertFrom-Json
                if ($kpJson.scripts) {
                    $scripts = $kpJson.scripts.PSObject.Properties | Where-Object { $_.Name -match '^(preinstall|install|postinstall)$' }
                    if ($scripts) {
                        $scriptTypes = ($scripts | ForEach-Object { "$($_.Name): $($_.Value)" }) -join " | "
                        $detectedScripts += [PSCustomObject]@{
                            Package = $kp
                            Version = $kpJson.version
                            Scripts = $scriptTypes
                        }
                    }
                }
            } catch {}
        }
    }

    if ($detectedScripts.Count -gt 0) {
        Write-Host "  Detected packages with install scripts in this project:" -ForegroundColor White
        foreach ($item in $detectedScripts) {
            Write-Host "    [!] $($item.Package)@$($item.Version)" -ForegroundColor Yellow
            Write-Host "        Script: $($item.Scripts)" -ForegroundColor Gray
        }
        Write-Host ""
        Write-Host "  Remedy Guide (for npm >= 11.16.0 & Cloud CI environments):" -ForegroundColor Cyan
        Write-Host "    npm 11.16+ / npm 12+ and Cloud CI (Vercel) support declaring in package.json:" -ForegroundColor Gray
        Write-Host '    "allowScripts": {' -ForegroundColor DarkCyan
        foreach ($item in $detectedScripts) {
            Write-Host "      `"$($item.Package)`": true," -ForegroundColor DarkCyan
        }
        Write-Host '    }' -ForegroundColor DarkCyan
        Write-Host "    (Note: This script does not modify files. Add to package.json only when explicitly desired.)" -ForegroundColor Gray
    } else {
        Write-Host "  No common unapproved lifecycle scripts detected in tested list." -ForegroundColor Green
    }
} else {
    Write-Host "  [-] node_modules:    Not installed in target directory." -ForegroundColor Gray
}

Write-Host ""

# -----------------------------------------------------------------------------
# 4. BUILD TOOL & CHUNK-SIZE CONFIGURATION AUDIT
# -----------------------------------------------------------------------------
Write-Host "[4/4] BUILD TOOL & CHUNK-SIZE CONFIGURATION" -ForegroundColor Yellow

$isVite = $false
$isNext = $false

# Detect Vite
$viteConfigFiles = @("vite.config.js", "vite.config.ts", "vite.config.mjs", "vite.config.cjs")
foreach ($vf in $viteConfigFiles) {
    $vPath = Join-Path $ProjectPath $vf
    if (Test-Path $vPath) {
        $isVite = $true
        Write-Host "  [-] Framework/Tool:  Vite ($vf detected)" -ForegroundColor Green
        
        # Check chunkSizeWarningLimit and manualChunks in config
        $vContent = Get-Content $vPath -Raw
        if ($vContent -match 'chunkSizeWarningLimit\s*:\s*(\d+)') {
            Write-Host "    -> Custom Chunk Limit: $($matches[1]) kB" -ForegroundColor White
        } else {
            Write-Host "    -> Chunk Size Limit:  Default (500 kB)" -ForegroundColor Gray
        }

        if ($vContent -match 'manualChunks') {
            Write-Host "    -> Code Splitting:    manualChunks is configured" -ForegroundColor Green
        } else {
            Write-Host "    -> Code Splitting:    manualChunks not configured (large bundles trigger >500kB warning)" -ForegroundColor Yellow
        }
        break
    }
}

# Detect Next.js
$nextConfigFiles = @("next.config.js", "next.config.mjs", "next.config.ts")
foreach ($nf in $nextConfigFiles) {
    $nPath = Join-Path $ProjectPath $nf
    if (Test-Path $nPath) {
        $isNext = $true
        Write-Host "  • Framework/Tool:  Next.js ($nf detected)" -ForegroundColor Green
        $nContent = Get-Content $nPath -Raw
        if ($nContent -match '@next/bundle-analyzer') {
            Write-Host "    -> Analyzer:          @next/bundle-analyzer is configured" -ForegroundColor Green
        } else {
            Write-Host "    -> Analyzer:          Bundle analyzer not detected in config" -ForegroundColor Gray
        }
        break
    }
}

if (-not $isVite -and -not $isNext) {
    Write-Host "  • Framework/Tool:  Generic or other build system" -ForegroundColor White
}

# Check dist/ or build/ output sizes if present
$distPath = Join-Path $ProjectPath "dist"
if (Test-Path $distPath) {
    $largeFiles = Get-ChildItem -Path $distPath -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.Length -gt 500KB -and $_.Extension -match '\.js|\.css' }
    if ($largeFiles) {
        Write-Host "  Large generated bundle chunks (>500 kB) in dist/:" -ForegroundColor Yellow
        foreach ($lf in $largeFiles) {
            $sizeKB = [math]::Round($lf.Length / 1KB, 1)
            $rel = $lf.FullName.Substring($distPath.Length).TrimStart('\', '/')
            Write-Host "    -> dist/$rel : $sizeKB kB" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  No generated chunks exceeding 500 kB in dist/." -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   Diagnostic Complete. No project files were modified." -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
