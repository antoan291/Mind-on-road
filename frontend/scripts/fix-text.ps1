
$enc1252=[System.Text.Encoding]::GetEncoding(1252)
$utf8=[System.Text.Encoding]::UTF8
function Fix-File($file) {
  $text=Get-Content -Raw $file
  $text=$utf8.GetString($enc1252.GetBytes($text))
  $lines=$text -split "`r?`n"
  for($i=0;$i -lt $lines.Length;$i++){
    for($j=0;$j -lt 3 -and $lines[$i] -match 'Ã|Ð|Ñ|Â|â|€';$j++){
      $lines[$i]=$utf8.GetString($enc1252.GetBytes($lines[$i]))
    }
  }
  [System.IO.File]::WriteAllText((Resolve-Path $file), ($lines -join "`r`n"), $utf8)
}
Fix-File 'frontend/src/app/components/layouts/AppLayout.tsx'
Fix-File 'frontend/src/app/pages/TheoryPage.tsx'
