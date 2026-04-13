$projectDir = Split-Path -Parent $PSScriptRoot
$launcherPath = Join-Path $projectDir "open-web.cmd"

if (-not (Test-Path -LiteralPath $launcherPath)) {
  throw "未找到启动脚本: $launcherPath"
}

$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "XMU-Book-Platform-Open-Web.lnk"

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "cmd.exe"
$shortcut.Arguments = "/c `"$launcherPath`""
$shortcut.WorkingDirectory = $projectDir
$shortcut.IconLocation = "$env:SystemRoot\System32\SHELL32.dll,220"
$shortcut.Hotkey = "CTRL+ALT+X"
$shortcut.Description = "Open XMU Book Platform (Ctrl+Alt+X)"
$shortcut.Save()

Write-Host "Shortcut created: $shortcutPath"
Write-Host "Hotkey set: Ctrl+Alt+X"
