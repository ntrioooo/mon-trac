Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\Metland\.gemini\antigravity-ide\brain\a6d2d5c4-1b9b-4b85-b180-30f67f239668\moneytrack_app_icon_1787817895540.jpg"
$destDir = "d:\Coding\money-tracker\public\icons"

if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Force -Path $destDir | Out-Null
}

$srcImg = [System.Drawing.Image]::FromFile($srcPath)

function Resize-And-Save($img, [int]$w, [int]$h, [string]$outPath) {
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($img, 0, 0, $w, $h)
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

Resize-And-Save $srcImg 192 192 "$destDir\icon-192.png"
Resize-And-Save $srcImg 512 512 "$destDir\icon-512.png"
Resize-And-Save $srcImg 180 180 "$destDir\apple-touch-icon.png"

$srcImg.Dispose()
Write-Output "PNG icons generated in $destDir"
