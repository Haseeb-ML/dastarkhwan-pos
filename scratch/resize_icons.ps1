Add-Type -AssemblyName System.Drawing
$src = 'C:\Users\M HASEEB\.gemini\antigravity-ide\brain\ab9a4d7b-44ad-478a-83f5-d45b47b14f54\.user_uploaded\media_1792404743272.jpg'
$img = [System.Drawing.Image]::FromFile($src)

function Resize-Icon($targetPath, $width, $height) {
    $bmp = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::White)
    $g.DrawImage($img, 0, 0, $width, $height)
    $g.Dispose()
    $bmp.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Output "Saved: $targetPath ($width x $height)"
}

Resize-Icon 'c:\Users\M HASEEB\Desktop\Dastarkhwan-Full-Source\dastarkhwan_flutter_app\android\app\src\main\res\mipmap-mdpi\ic_launcher.png' 48 48
Resize-Icon 'c:\Users\M HASEEB\Desktop\Dastarkhwan-Full-Source\dastarkhwan_flutter_app\android\app\src\main\res\mipmap-hdpi\ic_launcher.png' 72 72
Resize-Icon 'c:\Users\M HASEEB\Desktop\Dastarkhwan-Full-Source\dastarkhwan_flutter_app\android\app\src\main\res\mipmap-xhdpi\ic_launcher.png' 96 96
Resize-Icon 'c:\Users\M HASEEB\Desktop\Dastarkhwan-Full-Source\dastarkhwan_flutter_app\android\app\src\main\res\mipmap-xxhdpi\ic_launcher.png' 144 144
Resize-Icon 'c:\Users\M HASEEB\Desktop\Dastarkhwan-Full-Source\dastarkhwan_flutter_app\android\app\src\main\res\mipmap-xxxhdpi\ic_launcher.png' 192 192

$img.Dispose()
Write-Output "Finished generating all Android icons!"
