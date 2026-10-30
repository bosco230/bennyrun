# 本機測試用小伺服器：pwsh -File serve.ps1 然後開 http://localhost:8123/
# 支援 Range（分段讀取），Safari／iPhone 播影片一定要有
param([int]$Port = 8123)
$root = $PSScriptRoot
$types = @{ '.html'='text/html; charset=utf-8'; '.js'='text/javascript; charset=utf-8'; '.css'='text/css; charset=utf-8';
  '.png'='image/png'; '.jpg'='image/jpeg'; '.m4a'='audio/mp4'; '.mp3'='audio/mpeg'; '.mp4'='video/mp4'; '.md'='text/plain; charset=utf-8' }
$l = [System.Net.HttpListener]::new()
$l.Prefixes.Add("http://localhost:$Port/")
$l.Start()
Write-Host "快打袁枝：http://localhost:$Port/"
while ($l.IsListening) {
  $c = $l.GetContext(); $req = $c.Request; $res = $c.Response
  try {
    $path = [Uri]::UnescapeDataString($req.Url.AbsolutePath.TrimStart('/'))
    if ($path -eq '') { $path = 'index.html' }
    $file = [IO.Path]::GetFullPath((Join-Path $root $path))
    if (-not ($file.StartsWith($root) -and (Test-Path -LiteralPath $file -PathType Leaf))) { $res.StatusCode = 404 }
    else {
      $ext = [IO.Path]::GetExtension($file).ToLower()
      $res.ContentType = $(if ($types[$ext]) { $types[$ext] } else { 'application/octet-stream' })
      $res.Headers['Accept-Ranges'] = 'bytes'
      $fs = [IO.File]::OpenRead($file)
      try {
        $len = $fs.Length; $start = 0; $end = $len - 1
        $range = $req.Headers['Range']
        if ($range -match '^bytes=(\d*)-(\d*)$') {
          if ($Matches[1] -ne '') { $start = [int64]$Matches[1]; if ($Matches[2] -ne '') { $end = [Math]::Min([int64]$Matches[2], $len - 1) } }
          elseif ($Matches[2] -ne '') { $start = [Math]::Max(0, $len - [int64]$Matches[2]) }
          if ($start -gt $end) { $res.StatusCode = 416; $res.Headers['Content-Range'] = "bytes */$len"; $start = -1 }
          else { $res.StatusCode = 206; $res.Headers['Content-Range'] = "bytes $start-$end/$len" }
        }
        if ($start -ge 0) {
          $count = $end - $start + 1
          $res.ContentLength64 = $count
          if ($req.HttpMethod -ne 'HEAD') {
            $fs.Position = $start
            $buf = New-Object byte[] 65536
            while ($count -gt 0) {
              $n = $fs.Read($buf, 0, [int][Math]::Min($buf.Length, $count))
              if ($n -le 0) { break }
              $res.OutputStream.Write($buf, 0, $n); $count -= $n
            }
          }
        }
      } finally { $fs.Close() }
    }
  } catch { try { $res.StatusCode = 500 } catch {} }
  try { $res.Close() } catch {}
}
