 = 'frontend/src/styles/theme.css'
 = Get-Content -Path  -Raw
[System.IO.File]::WriteAllText(System.Management.Automation.EngineIntrinsics.SessionState.Path.GetUnresolvedProviderPathFromPSPath(), , [System.Text.UTF8Encoding]::new(False))
Write-Output 'rewritten'
