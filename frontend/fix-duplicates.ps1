# Script to fix duplicate keys in LanguageContext.tsx
$filePath = "src\contexts\LanguageContext.tsx"
$content = Get-Content $filePath -Raw

# Read the file and split by language sections
$lines = Get-Content $filePath

# Find duplicate keys and their line numbers
$seenKeys = @{}
$linesToRemove = @()
$inArSection = $false
$inEnSection = $false
$bracketCount = 0

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    
    # Track when we enter ar or en sections
    if ($line -match "ar:\s*\{") {
        $inArSection = $true
        $inEnSection = $false
        $seenKeys.Clear()
        $bracketCount = 1
    }
    elseif ($line -match "en:\s*\{") {
        $inEnSection = $true
        $inArSection = $false
        $seenKeys.Clear()
        $bracketCount = 1
    }
    
    # Count brackets to know when section ends
    if ($inArSection -or $inEnSection) {
        $bracketCount += ([regex]::Matches($line, '\{').Count)
        $bracketCount -= ([regex]::Matches($line, '\}').Count)
        
        if ($bracketCount -le 0) {
            $inArSection = $false
            $inEnSection = $false
        }
    }
    
    # Check for duplicate keys
    if (($inArSection -or $inEnSection) -and $line -match '^\s{4}(\w+):') {
        $key = $matches[1]
        
        if ($seenKeys.ContainsKey($key)) {
            $linesToRemove += $i
            Write-Host "Duplicate found at line $($i+1): $key (first seen at line $($seenKeys[$key]+1))"
        }
        else {
            $seenKeys[$key] = $i
        }
    }
}

# Remove duplicate lines (in reverse order to maintain line numbers)
for ($i = $linesToRemove.Count - 1; $i -ge 0; $i--) {
    $lineNum = $linesToRemove[$i]
    Write-Host "Removing line $($lineNum+1): $($lines[$lineNum])"
    $lines = $lines[0..($lineNum-1)] + $lines[($lineNum+1)..($lines.Count-1)]
}

# Write back to file
$lines | Set-Content $filePath -Encoding UTF8

Write-Host "`nFixed $($linesToRemove.Count) duplicate keys"
