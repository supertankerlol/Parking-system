# Free port 5000 by killing the process using it
Write-Host "Checking for processes using port 5000..." -ForegroundColor Yellow

$connections = netstat -ano | Select-String ":5000" | Select-String "LISTENING"

if ($connections) {
    foreach ($line in $connections) {
        $parts = $line -split '\s+'
        $pid = $parts[-1]
        
        if ($pid -match '^\d+$') {
            Write-Host "Found process $pid using port 5000" -ForegroundColor Cyan
            try {
                Stop-Process -Id $pid -Force -ErrorAction Stop
                Write-Host "Successfully killed process $pid" -ForegroundColor Green
            } catch {
                Write-Host "Failed to kill process $pid. You may need to run as administrator." -ForegroundColor Red
                Write-Host $_.Exception.Message -ForegroundColor Red
            }
        }
    }
} else {
    Write-Host "No processes found using port 5000" -ForegroundColor Green
}

Write-Host "`nDone. Port 5000 should now be free." -ForegroundColor Green
Start-Sleep -Seconds 2

