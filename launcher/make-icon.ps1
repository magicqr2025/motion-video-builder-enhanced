# Draws the MotionStudio icon (blue rounded square, gold bolt) into launcher\motionstudio.ico
Add-Type -AssemblyName System.Drawing
$size = 64
$bmp = New-Object System.Drawing.Bitmap $size, $size
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'AntiAlias'
$g.Clear([System.Drawing.Color]::Transparent)
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$r = 16; $d = $r * 2
$path.AddArc(0, 0, $d, $d, 180, 90); $path.AddArc($size - $d, 0, $d, $d, 270, 90)
$path.AddArc($size - $d, $size - $d, $d, $d, 0, 90); $path.AddArc(0, $size - $d, $d, $d, 90, 90); $path.CloseFigure()
$rect = New-Object System.Drawing.Rectangle 0, 0, $size, $size
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, ([System.Drawing.Color]::FromArgb(62, 128, 241)), ([System.Drawing.Color]::FromArgb(25, 70, 183)), 45.0
$g.FillPath($brush, $path)
$pts = @(@(36, 6), @(14, 36), @(28, 36), @(24, 58), @(46, 28), @(32, 28))
$bolt = New-Object 'System.Drawing.PointF[]' $pts.Count
for ($i = 0; $i -lt $pts.Count; $i++) { $bolt[$i] = New-Object System.Drawing.PointF ([single]$pts[$i][0]), ([single]$pts[$i][1]) }
$g.FillPolygon((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(253, 198, 11))), $bolt)
$g.Dispose()
$icon = [System.Drawing.Icon]::FromHandle($bmp.GetHicon())
$out = Join-Path $PSScriptRoot 'motionstudio.ico'
$fs = [System.IO.File]::Create($out); $icon.Save($fs); $fs.Close()
Write-Host "Wrote $out"
