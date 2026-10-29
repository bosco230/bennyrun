# 本機測試用小伺服器：pwsh -File serve.ps1 然後開 http://localhost:8123/
param([int]$Port = 8123)
$root = $PSScriptRoot
$types = @{ '.html'='text/html; charset=utf-8'; '.js'='text/javascript; charset=utf-8'; '.css'='text/css; charset=utf-8';
  '.png'='image/png'; '.jpg'='image/jpeg'; '.m4a'='audio/mp4'; '.mp3'='audio/mpeg'; '.md'='text/plain; charset=utf-8' }
$l = [System.Net.HttpListener]::new()
$l.Prefixes.Add("http://localhost:$Port/")
$l.Start()
Write-Host "快打袁枝：http://localhost:$Port/"
while ($l.IsListening) {
  $c = $l.GetContext()
  $path = [Uri]::UnescapeDataString($c.Request.Url.AbsolutePath.TrimStart('/'))
  if ($path -eq '') { $path = 'index.html' }
  $file = Join-Path $root $path
  if ((Test-Path -LiteralPath $file -PathType Leaf) -and ([IO.Path]::GetFullPath($file).StartsWith($root))) {
    $bytes = [IO.File]::ReadAllBytes($file)
    $ext = [IO.Path]::GetExtension($file).ToLower()
    $c.Response.ContentType = $(if ($types[$ext]) { $types[$ext] } else { 'application/octet-stream' })
    $c.Response.ContentLength64 = $bytes.Length
    try { $c.Response.OutputStream.Write($bytes, 0, $bytes.Length) } catch {}
  } else { $c.Response.StatusCode = 404 }
  $c.Response.Close()
}
