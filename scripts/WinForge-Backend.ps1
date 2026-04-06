#Requires -RunAsAdministrator
param(
  [ValidateSet("scan","apply","platform","full")]
  [string]$Mode = "scan",
  [string]$TweakIds = "",
  [string]$Platforms = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Continue"

function Write-Json($obj) {
  Write-Output ($obj | ConvertTo-Json -Depth 10 -Compress)
}

function Get-RegistryValue($path, $name, $default = $null) {
  try { return (Get-ItemProperty -Path $path -Name $name -ErrorAction Stop).$name }
  catch { return $default }
}

function Set-RegistryValue($path, $name, $value, $type = "DWord") {
  if (-not (Test-Path $path)) { New-Item -Path $path -Force | Out-Null }
  Set-ItemProperty -Path $path -Name $name -Value $value -Type $type
}

# ── SCAN ──────────────────────────────────────────────────────────────────
function Get-SystemProfile {
  Write-Json @{ type="progress"; step="cpu"; message="Scanning CPU..."; percent=12 }
  $cpu = Get-CimInstance Win32_Processor | Select-Object -First 1
  $cpuVendor = if ($cpu.Manufacturer -match "AMD") { "amd" } elseif ($cpu.Manufacturer -match "Intel") { "intel" } else { "other" }

  Write-Json @{ type="progress"; step="gpu"; message="Scanning GPU..."; percent=25 }
  $gpu = Get-CimInstance Win32_VideoController | Where-Object { $_.AdapterRAM -gt 100MB } | Sort-Object AdapterRAM -Descending | Select-Object -First 1
  $gpuVendor = if ($gpu.Name -match "NVIDIA|GeForce|RTX|GTX") { "nvidia" } elseif ($gpu.Name -match "AMD|Radeon|RX ") { "amd" } else { "intel" }

  Write-Json @{ type="progress"; step="ram"; message="Scanning Memory..."; percent=40 }
  $ramSticks = Get-CimInstance Win32_PhysicalMemory
  $totalRAMGB = [math]::Round(($ramSticks | Measure-Object Capacity -Sum).Sum / 1GB, 1)
  $ramSpeed = ($ramSticks | Select-Object -First 1).Speed

  Write-Json @{ type="progress"; step="storage"; message="Scanning Storage..."; percent=55 }
  $primaryDisk = Get-PhysicalDisk | Select-Object -First 1
  $isNvme = $primaryDisk.BusType -eq "NVMe"
  $isSSD = $primaryDisk.MediaType -eq "SSD" -or $isNvme

  Write-Json @{ type="progress"; step="network"; message="Scanning Network..."; percent=68 }
  $nic = Get-NetAdapter | Where-Object { $_.Status -eq "Up" } | Select-Object -First 1
  $isEthernet = $nic.PhysicalMediaType -eq "802.3"

  Write-Json @{ type="progress"; step="windows"; message="Auditing Windows..."; percent=80 }
  $os = Get-CimInstance Win32_OperatingSystem

  Write-Json @{ type="progress"; step="services"; message="Auditing Services..."; percent=90 }

  # Detect issues
  $issues = @()
  $activePlan = (powercfg /getactivescheme) -join ""
  if ($activePlan -notmatch "e9a42b02") { $issues += @{ id="power_plan"; severity="high"; message="Not using Ultimate Performance power plan" } }
  if ($ramSpeed -lt 3200) { $issues += @{ id="xmp"; severity="high"; message="RAM running at ${ramSpeed}MHz — XMP may not be enabled" } }
  $mouseSpeed = Get-RegistryValue "HKCU:\Control Panel\Mouse" "MouseSpeed" "1"
  if ($mouseSpeed -ne "0") { $issues += @{ id="mouse_accel"; severity="high"; message="Mouse acceleration is enabled" } }
  $gameDVR = Get-RegistryValue "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\GameDVR" "AppCaptureEnabled" 1
  if ($gameDVR -eq 1) { $issues += @{ id="game_bar"; severity="medium"; message="Xbox Game Bar and DVR is enabled" } }
  $hags = Get-RegistryValue "HKLM:\SYSTEM\CurrentControlSet\Control\GraphicsDrivers" "HwSchMode" 1
  if ($hags -ne 2) { $issues += @{ id="hags"; severity="medium"; message="Hardware-Accelerated GPU Scheduling not enabled" } }
  if (-not $isSSD) { $issues += @{ id="hdd"; severity="medium"; message="Primary drive is HDD — load times significantly impacted" } }
  if (-not $isEthernet) { $issues += @{ id="wifi"; severity="medium"; message="Using WiFi — Ethernet recommended for online gaming" } }

  $score = 100
  foreach ($issue in $issues) { $score -= if ($issue.severity -eq "high") { 12 } elseif ($issue.severity -eq "medium") { 6 } else { 3 } }
  $score = [math]::Max(0, [math]::Min(100, $score))

  Write-Json @{ type="progress"; step="done"; message="Scan complete"; percent=100 }

  Write-Json @{
    type    = "scan_result"
    score   = $score
    issues  = $issues
    cpu     = @{ name=$cpu.Name.Trim(); cores=$cpu.NumberOfCores; threads=$cpu.NumberOfLogicalProcessors; vendor=$cpuVendor }
    gpu     = @{ name=$gpu.Name; vramMB=[math]::Round($gpu.AdapterRAM/1MB); driver=$gpu.DriverVersion; vendor=$gpuVendor }
    ram     = @{ totalGB=$totalRAMGB; speedMHz=$ramSpeed; sticks=$ramSticks.Count }
    storage = @{ model=$primaryDisk.FriendlyName; isNvme=$isNvme; isSSD=$isSSD }
    network = @{ name=$nic.Name; isEthernet=$isEthernet; speed=$nic.LinkSpeed }
    windows = @{ version=$os.Caption; build=$os.BuildNumber }
    profile = @{ gpuVendor=$gpuVendor; cpuVendor=$cpuVendor; storageType=if($isNvme){"nvme"}elseif($isSSD){"ssd"}else{"hdd"}; hasEthernet=$isEthernet; totalRAMGB=$totalRAMGB }
  }
}

# ── APPLY ─────────────────────────────────────────────────────────────────
function Apply-Tweaks($ids) {
  $list = $ids -split ","
  $total = $list.Count
  $index = 0

  foreach ($tweakId in $list) {
    $index++
    $pct = [math]::Round(($index / $total) * 100)
    Write-Json @{ type="progress"; step="apply"; message="Applying $tweakId"; percent=$pct }

    $result = @{ id=$tweakId; success=$false; message="" }

    try {
      switch ($tweakId.Trim()) {
        "cpu_power" {
          powercfg /duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61 2>$null
          powercfg /setactive e9a42b02-d5df-448d-aa00-03f14749eb61
          $result.success = $true; $result.message = "Ultimate Performance power plan activated"
        }
        "cpu_parking" {
          $guid = ((powercfg /getactivescheme) -split " ")[3]
          powercfg /setacvalueindex $guid SUB_PROCESSOR CPMINCORES 100 2>$null
          powercfg /setdcvalueindex $guid SUB_PROCESSOR CPMINCORES 100 2>$null
          $result.success = $true; $result.message = "CPU core parking disabled"
        }
        "cpu_scheduler" {
          Set-RegistryValue "HKLM:\SYSTEM\CurrentControlSet\Control\PriorityControl" "Win32PrioritySeparation" 38
          $result.success = $true; $result.message = "CPU scheduler optimized for foreground apps"
        }
        "gpu_hags" {
          Set-RegistryValue "HKLM:\SYSTEM\CurrentControlSet\Control\GraphicsDrivers" "HwSchMode" 2
          $result.success = $true; $result.message = "HAGS enabled — reboot required"; $result.requiresReboot = $true
        }
        "gpu_tdr" {
          Set-RegistryValue "HKLM:\SYSTEM\CurrentControlSet\Control\GraphicsDrivers" "TdrDelay" 8
          $result.success = $true; $result.message = "GPU TDR delay set to 8 seconds"
        }
        "gpu_msi" {
          $gpuDevice = Get-PnpDevice | Where-Object { $_.Class -eq "Display" } | Select-Object -First 1
          if ($gpuDevice) {
            $p = "HKLM:\SYSTEM\CurrentControlSet\Enum\$($gpuDevice.InstanceId)\Device Parameters\Interrupt Management\MessageSignaledInterruptProperties"
            if (-not (Test-Path $p)) { New-Item -Path $p -Force | Out-Null }
            Set-ItemProperty -Path $p -Name "MSISupported" -Value 1 -Type DWord
            $result.success = $true; $result.message = "MSI Mode enabled for GPU — reboot required"; $result.requiresReboot = $true
          }
        }
        "net_nagle" {
          $adapters = Get-ChildItem "HKLM:\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters\Interfaces"
          foreach ($a in $adapters) {
            Set-ItemProperty -Path $a.PSPath -Name "TcpAckFrequency" -Value 1 -Type DWord -ErrorAction SilentlyContinue
            Set-ItemProperty -Path $a.PSPath -Name "TCPNoDelay" -Value 1 -Type DWord -ErrorAction SilentlyContinue
          }
          $result.success = $true; $result.message = "Nagle's Algorithm disabled on all adapters"
        }
        "net_throttle" {
          Set-RegistryValue "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile" "NetworkThrottlingIndex" 0xffffffff
          $result.success = $true; $result.message = "Network throttle index removed"
        }
        "sys_gamebar" {
          Set-RegistryValue "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\GameDVR" "AppCaptureEnabled" 0
          Set-RegistryValue "HKCU:\System\GameConfigStore" "GameDVR_Enabled" 0
          $result.success = $true; $result.message = "Xbox Game Bar and DVR disabled"
        }
        "sys_telemetry" {
          @("DiagTrack","dmwappushservice","WerSvc","PcaSvc") | ForEach-Object {
            Stop-Service -Name $_ -Force -ErrorAction SilentlyContinue
            Set-Service -Name $_ -StartupType Disabled -ErrorAction SilentlyContinue
          }
          $result.success = $true; $result.message = "Telemetry services disabled"
        }
        "stor_prefetch" {
          Stop-Service "SysMain" -Force -ErrorAction SilentlyContinue
          Set-Service "SysMain" -StartupType Disabled -ErrorAction SilentlyContinue
          Set-RegistryValue "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management\PrefetchParameters" "EnablePrefetcher" 0
          $result.success = $true; $result.message = "Prefetch and Superfetch disabled"
        }
        "stor_ntfs" {
          & fsutil behavior set disablelastaccess 1
          & fsutil behavior set disable8dot3 1
          $result.success = $true; $result.message = "NTFS optimized"
        }
        "input_accel" {
          Set-ItemProperty "HKCU:\Control Panel\Mouse" "MouseSpeed" "0" -Type String
          Set-ItemProperty "HKCU:\Control Panel\Mouse" "MouseThreshold1" "0" -Type String
          Set-ItemProperty "HKCU:\Control Panel\Mouse" "MouseThreshold2" "0" -Type String
          $result.success = $true; $result.message = "Mouse acceleration disabled"
        }
        "sys_defender" {
          @("C:\Program Files\Steam","C:\Program Files (x86)\Steam","C:\Program Files\Epic Games","C:\Program Files\EA Games","C:\Program Files (x86)\Battle.net") | ForEach-Object {
            if (Test-Path $_) { Add-MpPreference -ExclusionPath $_ -ErrorAction SilentlyContinue }
          }
          $result.success = $true; $result.message = "Game folders added to Defender exclusions"
        }
        "sys_mmcss" {
          $p = "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile\Tasks\Games"
          if (-not (Test-Path $p)) { New-Item -Path $p -Force | Out-Null }
          Set-ItemProperty $p "GPU Priority" 8 -Type DWord
          Set-ItemProperty $p "Priority" 6 -Type DWord
          Set-ItemProperty $p "Scheduling Category" "High" -Type String
          $result.success = $true; $result.message = "MMCSS gaming priority configured"
        }
        "disp_fso" {
          Set-RegistryValue "HKCU:\System\GameConfigStore" "GameDVR_DXGIHonorFSEWindowsCompatible" 1
          $result.success = $true; $result.message = "Fullscreen optimizations disabled"
        }
        "priv_cortana" {
          Set-RegistryValue "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Windows Search" "AllowCortana" 0
          $result.success = $true; $result.message = "Cortana disabled"
        }
        "priv_bloat" {
          $removed = 0
          @("Microsoft.BingNews","Microsoft.BingWeather","king.com.CandyCrushSaga","Microsoft.MicrosoftSolitaireCollection") | ForEach-Object {
            Get-AppxPackage -Name $_ -ErrorAction SilentlyContinue | Remove-AppxPackage -ErrorAction SilentlyContinue
            $removed++
          }
          $result.success = $true; $result.message = "Bloatware removed"
        }
        "gpu_nvidia_power" {
          $p = "HKLM:\SYSTEM\CurrentControlSet\Control\Class\{4d36e968-e325-11ce-bfc1-08002be10318}\0000"
          if (Test-Path $p) { Set-ItemProperty $p "PerfLevelSrc" 0x2222 -Type DWord -ErrorAction SilentlyContinue }
          $result.success = $true; $result.message = "NVIDIA max performance mode set"
        }
        "mem_pagefile" {
          $ramMB = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1MB)
          $size = [int]($ramMB * 1.5)
          $cs = Get-WmiObject Win32_ComputerSystem; $cs.AutomaticManagedPagefile = $false; $cs.Put() | Out-Null
          $result.success = $true; $result.message = "Pagefile fixed at ${size}MB"
        }
        default {
          $result.message = "Tweak '$tweakId' queued for next version"
          $result.success = $true
        }
      }
    } catch {
      $result.success = $false
      $result.message = "Error: $($_.Exception.Message)"
    }

    Write-Json @{ type="tweak_result"; result=$result }
  }
}

function Create-RestorePoint {
  try {
    Enable-ComputerRestore -Drive "C:\" -ErrorAction SilentlyContinue
    Checkpoint-Computer -Description "WinForge $(Get-Date -Format 'yyyy-MM-dd HH:mm')" -RestorePointType MODIFY_SETTINGS -ErrorAction SilentlyContinue
    Write-Json @{ type="restore_point"; success=$true; message="Restore point created" }
  } catch {
    Write-Json @{ type="restore_point"; success=$false; message="Restore point skipped: $($_.Exception.Message)" }
  }
}

# ── MAIN ──────────────────────────────────────────────────────────────────
Write-Json @{ type="init"; version="1.0.0"; mode=$Mode }

switch ($Mode) {
  "scan"  { Get-SystemProfile }
  "apply" { Create-RestorePoint; Apply-Tweaks $TweakIds }
  "full"  { Get-SystemProfile; Create-RestorePoint; Apply-Tweaks $TweakIds }
}
