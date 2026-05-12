$assets = "C:\Users\pc\.cursor\projects\c-Users-pc-Downloads-BOB\assets"
$out = Join-Path $PSScriptRoot "..\public\product-detail"
$outNext = Join-Path $PSScriptRoot "..\frontend\public\product-detail"
New-Item -ItemType Directory -Force -Path $out, $outNext | Out-Null

$f1 = Get-ChildItem $assets -Filter "*16.52.36*.png" | Select-Object -First 1
$f2 = Get-ChildItem $assets -Filter "*16.57.43*.png" | Select-Object -First 1
$f3 = Get-ChildItem $assets -Filter "*Car_interior*.png" | Select-Object -First 1
# كولاج عمودي: حامي الفراغ + منظّم الظهر + مرايا الركن (صورة مشتركة لكل صفحات المنتج)
$fShared = Get-ChildItem $assets -Filter "*8440f4e9*.png" | Select-Object -First 1
if (-not $f1 -or -not $f2 -or -not $f3) { throw "Missing source PNGs in $assets" }
if (-not $fShared) { throw "Missing shared trio collage PNG (*8440f4e9*) in $assets" }

Copy-Item $f1.FullName (Join-Path $out "parking-mirror.png") -Force
Copy-Item $f2.FullName (Join-Path $out "seat-organizer.png") -Force
Copy-Item $f3.FullName (Join-Path $out "seatgap-protector.png") -Force

Copy-Item (Join-Path $out "parking-mirror.png") (Join-Path $outNext "parking-mirror.png") -Force
Copy-Item (Join-Path $out "seat-organizer.png") (Join-Path $outNext "seat-organizer.png") -Force
Copy-Item (Join-Path $out "seatgap-protector.png") (Join-Path $outNext "seatgap-protector.png") -Force

Copy-Item $fShared.FullName (Join-Path $out "pdp-shared-cabin.png") -Force
Copy-Item (Join-Path $out "pdp-shared-cabin.png") (Join-Path $outNext "pdp-shared-cabin.png") -Force

Write-Host "OK: product-detail PNGs copied."
