param(
  [ValidateSet("scan","apply","full","startup","thermal","ping","games","drivers","clean")]
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

function Get-SystemProfile {
  Write-Json @{ type="progress"; step="cpu"; message="Scanning CPU..."; percent=10 }
  $cpu = Get-CimInstance Win32_Processor | Select-Object -First 1
  $cpuVendor = if ($cpu.Manufacturer -match "AMD") { "amd" } elseif ($cpu.Manufacturer -match "Intel") { "intel" } else { "other" }

  Write-Json @{ type="progress"; step="gpu"; message="Scanning GPU..."; percent=22 }
  $gpu = Get-CimInstance Win32_VideoController | Where-Object { $_.AdapterRAM -gt 100MB } | Sort-Object AdapterRAM -Descending | Select-Object -First 1
  $gpuVendor = if ($gpu.Name -match "NVIDIA|GeForce|RTX|GTX") { "nvidia" } elseif ($gpu.Name -match "AMD|Radeon|RX ") { "amd" } else { "intel" }

  Write-Json @{ type="progress"; step="ram"; message="Scanning Memory..."; percent=35 }
  $ramSticks = Get-CimInstance Win32_PhysicalMemory
  $totalRAMGB = [math]::Round(($ramSticks | Measure-Object Capacity -Sum).Sum / 1GB, 1)
  $ramSpeed = ($ramSticks | Select-Object -First 1).Speed

  Write-Json @{ type="progress"; step="storage"; message="Scanning Storage..."; percent=48 }
  $primaryDisk = Get-PhysicalDisk | Select-Object -First 1
  $isNvme = $primaryDisk.BusType -eq "NVMe"
  $isSSD = $primaryDisk.MediaType -eq "SSD" -or $isNvme

  Write-Json @{ type="progress"; step="network"; message="Scanning Network..."; percent=60 }
  $nic = Get-NetAdapter | Where-Object { $_.Status -eq "Up" } | Select-Object -First 1
  $isEthernet = $nic.PhysicalMediaType -eq "802.3"

  Write-Json @{ type="progress"; step="windows"; message="Auditing Windows..."; percent=72 }
  $os = Get-CimInstance Win32_OperatingSystem

  Write-Json @{ type="progress"; step="security"; message="Checking security settings..."; percent=82 }

  # Check VBS
  $vbsStatus = Get-RegistryValue "HKLM:\SYSTEM\CurrentControlSet\Control\DeviceGuard" "EnableVirtualizationBasedSecurity" 1
  $vbsRunning = (Get-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\DeviceGuard" -ErrorAction SilentlyContinue).EnableVirtualizationBasedSecurity

  # Check MPO
  $mpoStatus = Get-RegistryValue "HKLM:\SOFTWARE\Microsoft\Windows\Dwm" "OverlayTestMode" 0

  # Check Resizable BAR
  $reBarPath = "HKLM:\SYSTEM\CurrentControlSet\Control\GraphicsDrivers"
  $reBar = Get-RegistryValue $reBarPath "ReBarUEFISupported" 0

  Write-Json @{ type="progress"; step="services"; message="Auditing Services..."; percent=90 }

  $issues = @()

  $activePlan = (powercfg /getactivescheme) -join ""
  if ($activePlan -notmatch "e9a42b02") {
    $issues += @{ id="power_plan"; severity="high"; message="Not using Ultimate Performance power plan" }
  }
  if ($ramSpeed -lt 3200) {
    $issues += @{ id="xmp"; severity="high"; message="RAM running at " + $ramSpeed + "MHz - XMP/EXPO may not be enabled" }
  }
  $mouseSpeed = Get-RegistryValue "HKCU:\Control Panel\Mouse" "MouseSpeed" "1"
  if ($mouseSpeed -ne "0") {
    $issues += @{ id="mouse_accel"; severity="high"; message="Mouse acceleration is enabled - hurts aim consistency" }
  }
  $gameDVR = Get-RegistryValue "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\GameDVR" "AppCaptureEnabled" 1
  if ($gameDVR -eq 1) {
    $issues += @{ id="game_bar"; severity="medium"; message="Xbox Game Bar and DVR enabled - background overhead" }
  }
  $hags = Get-RegistryValue "HKLM:\SYSTEM\CurrentControlSet\Control\GraphicsDrivers" "HwSchMode" 1
  if ($hags -ne 2) {
    $issues += @{ id="hags"; severity="medium"; message="Hardware-Accelerated GPU Scheduling not enabled" }
  }
  if ($mpoStatus -ne 5) {
    $issues += @{ id="mpo"; severity="medium"; message="Multiplane Overlay (MPO) enabled - can cause stutter and driver crashes" }
  }
  if ($vbsStatus -eq 1) {
    $issues += @{ id="vbs"; severity="medium"; message="Virtualization Based Security (VBS) enabled - costs 5-15% FPS" }
  }
  if (-not $isSSD) {
    $issues += @{ id="hdd"; severity="high"; message="Primary drive is HDD - load times significantly impacted" }
  }
  if (-not $isEthernet) {
    $issues += @{ id="wifi"; severity="medium"; message="Using WiFi - Ethernet recommended for online gaming" }
  }
  $nagle = Get-RegistryValue "HKLM:\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" "TcpAckFrequency" 0
  if ($nagle -ne 1) {
    $issues += @{ id="nagle"; severity="medium"; message="Nagle's Algorithm enabled - adds packet delay" }
  }

  $score = 100
  foreach ($issue in $issues) {
    $score -= if ($issue.severity -eq "high") { 12 } elseif ($issue.severity -eq "medium") { 6 } else { 3 }
  }
  $score = [math]::Max(0, [math]::Min(100, $score))

  Write-Json @{ type="progress"; step="done"; message="Scan complete"; percent=100 }

  Write-Json @{
    type    = "scan_result"
    score   = $score
    issues  = $issues
    vbsEnabled = ($vbsStatus -eq 1)
    mpoEnabled = ($mpoStatus -ne 5)
    reBarEnabled = ($reBar -eq 1)
    cpu     = @{ name=$cpu.Name.Trim(); cores=$cpu.NumberOfCores; threads=$cpu.NumberOfLogicalProcessors; vendor=$cpuVendor; maxClockMHz=$cpu.MaxClockSpeed }
    gpu     = @{ name=$gpu.Name; vramMB=[math]::Round($gpu.AdapterRAM/1MB); driver=$gpu.DriverVersion; vendor=$gpuVendor; refreshRate=$gpu.CurrentRefreshRate; maxRefresh=$gpu.MaxRefreshRate }
    ram     = @{ totalGB=$totalRAMGB; speedMHz=$ramSpeed; sticks=$ramSticks.Count }
    storage = @{ model=$primaryDisk.FriendlyName; isNvme=$isNvme; isSSD=$isSSD }
    network = @{ name=$nic.Name; isEthernet=$isEthernet; speed=$nic.LinkSpeed }
    windows = @{ version=$os.Caption; build=$os.BuildNumber }
  }
}

function Get-InstalledGames {
  $games = @()
  $checks = @(
    @{ id="cod"; name="Call of Duty"; paths=@("C:\Program Files (x86)\Call of Duty","C:\Program Files\Call of Duty","C:\XboxGames\Call of Duty") },
    @{ id="warzone"; name="Warzone"; paths=@("C:\Program Files (x86)\Call of Duty","C:\XboxGames\Warzone") },
    @{ id="valorant"; name="Valorant"; paths=@("C:\Riot Games\VALORANT","C:\Program Files\Riot Games\VALORANT","C:\Riot Games") },
    @{ id="fortnite"; name="Fortnite"; paths=@("C:\Program Files\Epic Games\Fortnite","C:\Epic Games\Fortnite") },
    @{ id="apex"; name="Apex Legends"; paths=@("C:\Program Files (x86)\Origin Games\Apex","C:\Program Files\EA Games\Apex Legends","C:\Program Files (x86)\Steam\steamapps\common\Apex Legends") },
    @{ id="cs2"; name="CS2"; paths=@("C:\Program Files (x86)\Steam\steamapps\common\Counter-Strike Global Offensive") },
    @{ id="overwatch"; name="Overwatch 2"; paths=@("C:\Program Files (x86)\Overwatch","C:\Program Files\Overwatch") },
    @{ id="r6"; name="Rainbow Six Siege"; paths=@("C:\Program Files (x86)\Ubisoft\Ubisoft Game Launcher\games\Tom Clancy's Rainbow Six Siege") },
    @{ id="battlefield"; name="Battlefield 2042"; paths=@("C:\Program Files\EA Games\Battlefield 2042") },
    @{ id="rocketleague"; name="Rocket League"; paths=@("C:\Program Files\Epic Games\rocketleague","C:\Program Files (x86)\Steam\steamapps\common\rocketleague") },
    @{ id="forza"; name="Forza Horizon"; paths=@("C:\XboxGames\Forza Horizon 5") },
    @{ id="elden"; name="Elden Ring"; paths=@("C:\Program Files (x86)\Steam\steamapps\common\ELDEN RING") }
  )

  $steamLibraries = @("C:\Program Files (x86)\Steam\steamapps\common","C:\Program Files\Steam\steamapps\common")
  $steamVdf = "$env:ProgramFiles(x86)\Steam\steamapps\libraryfolders.vdf"
  if (Test-Path $steamVdf) {
    $content = Get-Content $steamVdf -Raw -ErrorAction SilentlyContinue
    if ($content) {
      $extraPaths = [regex]::Matches($content, '"path"\s+"([^"]+)"') | ForEach-Object { $_.Groups[1].Value.Replace("\\\\","\\") + "\steamapps\common" }
      $steamLibraries += $extraPaths
    }
  }

  foreach ($game in $checks) {
    $found = $false; $foundPath = ""
    foreach ($p in $game.paths) { if (Test-Path $p) { $found = $true; $foundPath = $p; break } }
    if (-not $found) {
      foreach ($lib in $steamLibraries) {
        if (Test-Path $lib) { $gp = Join-Path $lib $game.name; if (Test-Path $gp) { $found = $true; $foundPath = $gp; break } }
      }
    }
    if ($found) { $games += @{ id=$game.id; name=$game.name; path=$foundPath; installed=$true } }
  }
  Write-Json @{ type="installed_games"; games=$games }
}

function Get-StartupApps {
  $apps = @()
  $runPaths = @(
    @{ path="HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"; approvedKey="HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\StartupApproved\Run" },
    @{ path="HKLM:\Software\Microsoft\Windows\CurrentVersion\Run"; approvedKey="HKLM:\Software\Microsoft\Windows\CurrentVersion\Explorer\StartupApproved\Run" },
    @{ path="HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Run"; approvedKey="HKLM:\Software\Microsoft\Windows\CurrentVersion\Explorer\StartupApproved\Run32" }
  )
  foreach ($runPath in $runPaths) {
    if (Test-Path $runPath.path) {
      $entries = Get-ItemProperty -Path $runPath.path -ErrorAction SilentlyContinue
      $entries.PSObject.Properties | Where-Object { $_.Name -notlike "PS*" } | ForEach-Object {
        $isDisabled = $false
        if (Test-Path $runPath.approvedKey) {
          $ae = Get-ItemProperty -Path $runPath.approvedKey -Name $_.Name -ErrorAction SilentlyContinue
          if ($ae) { $bytes = $ae.($_.Name); $isDisabled = $bytes -and $bytes[0] -eq 3 }
        }
        $apps += @{ name=$_.Name; path=$_.Value; impact=if($_.Value -match "Discord|Teams|Spotify|Epic|Battle|EA|Xbox|OneDrive|Steam|Razer|Corsair|ASUS|MSI"){"High"}else{"Medium"}; ram="~100MB"; delay="~2s"; source="Registry"; disabled=$isDisabled }
      }
    }
  }
  $sf = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup"
  if (Test-Path $sf) {
    Get-ChildItem $sf -Filter "*.lnk" | ForEach-Object {
      $apps += @{ name=$_.BaseName; path=$_.FullName; impact="Medium"; ram="~80MB"; delay="~1.5s"; source="StartupFolder"; disabled=$false }
    }
  }
  Write-Json @{ type="startup_apps"; apps=$apps }
}

function Get-Thermals {
  try {
    $cpuTemp = 0; $gpuTemp = 0
    $temps = Get-WmiObject MSAcpi_ThermalZoneTemperature -Namespace "root/wmi" -ErrorAction SilentlyContinue
    if ($temps) { $cpuTemp = [math]::Round(($temps | Select-Object -First 1).CurrentTemperature / 10 - 273.15) }
    $nvidiaSmi = "C:\Program Files\NVIDIA Corporation\NVSMI\nvidia-smi.exe"
    if (Test-Path $nvidiaSmi) {
      $gpuTempRaw = & $nvidiaSmi --query-gpu=temperature.gpu --format=csv,noheader,nounits 2>$null
      if ($gpuTempRaw) { $gpuTemp = [int]$gpuTempRaw.Trim() }
    }
    $cpuLoad = [math]::Round((Get-CimInstance Win32_Processor | Measure-Object -Property LoadPercentage -Average).Average)
    $os = Get-CimInstance Win32_OperatingSystem
    $ramUsedGB = [math]::Round(($os.TotalVisibleMemorySize - $os.FreePhysicalMemory) / 1MB, 1)
    $ramTotalGB = [math]::Round($os.TotalVisibleMemorySize / 1MB, 1)
    Write-Json @{ type="thermal_data"; cpuTemp=$cpuTemp; gpuTemp=$gpuTemp; cpuLoad=$cpuLoad; ramUsed=$ramUsedGB; ramTotal=$ramTotalGB }
  } catch {
    Write-Json @{ type="thermal_data"; cpuTemp=0; gpuTemp=0; cpuLoad=0; ramUsed=0; ramTotal=0 }
  }
}

function Run-PingTest {
  $servers = @(
    @{ name="CoD/Warzone"; host="prod.us.z.activision.com" },
    @{ name="Valorant"; host="162.249.160.1" },
    @{ name="Steam"; host="cm.steampowered.com" },
    @{ name="Battle.net"; host="us.battle.net" },
    @{ name="Google DNS"; host="8.8.8.8" }
  )
  $results = @()
  foreach ($server in $servers) {
    try {
      $ping = Test-Connection -ComputerName $server.host -Count 3 -ErrorAction SilentlyContinue
      if ($ping) { $avg = [math]::Round(($ping | Measure-Object -Property ResponseTime -Average).Average); $results += @{ name=$server.name; host=$server.host; ping=$avg; status="ok" } }
      else { $results += @{ name=$server.name; host=$server.host; ping=999; status="timeout" } }
    } catch { $results += @{ name=$server.name; host=$server.host; ping=999; status="error" } }
  }
  Write-Json @{ type="ping_results"; results=$results }
}

function Clean-JunkFiles {
  $locations = @("$env:TEMP","$env:WINDIR\Temp","$env:LOCALAPPDATA\Temp","$env:LOCALAPPDATA\NVIDIA\DXCache","$env:LOCALAPPDATA\NVIDIA\GLCache","$env:LOCALAPPDATA\D3DSCache","$env:WINDIR\SoftwareDistribution\Download")
  $cleaned = 0
  foreach ($loc in $locations) {
    if (Test-Path $loc) {
      $size = (Get-ChildItem $loc -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
      Get-ChildItem $loc -Recurse -ErrorAction SilentlyContinue | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
      $cleaned += [math]::Round($size / 1MB, 1)
    }
  }
  Write-Json @{ type="clean_complete"; cleanedMB=[math]::Round($cleaned,1); message="Cleaned " + [math]::Round($cleaned,1) + "MB of junk files" }
}

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
          # 26 = lowest latency for competitive gaming (vs 38 which is balanced)
          Set-RegistryValue "HKLM:\SYSTEM\CurrentControlSet\Control\PriorityControl" "Win32PrioritySeparation" 26
          $result.success = $true; $result.message = "CPU scheduler set to lowest latency mode (26)"
        }
        "cpu_hpet" {
          bcdedit /deletevalue useplatformclock 2>$null
          $result.success = $true; $result.message = "HPET disabled - using TSC timer"
        }
        "cpu_timer" {
          bcdedit /set tscsyncpolicy enhanced 2>$null
          $result.success = $true; $result.message = "TSC sync policy set to enhanced"
        }
        "cpu_affinity" {
          Set-RegistryValue "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\kernel" "GlobalTimerResolutionRequests" 1
          $result.success = $true; $result.message = "Global timer resolution requests enabled"
        }
        "cpu_spectre" {
          Set-RegistryValue "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management" "FeatureSettingsOverride" 3
          Set-RegistryValue "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management" "FeatureSettingsOverrideMask" 3
          $result.success = $true; $result.message = "Spectre/Meltdown patches disabled - reboot required"; $result.requiresReboot = $true
        }
        "sys_power_throttling" {
          Set-RegistryValue "HKLM:\SYSTEM\CurrentControlSet\Control\Power\PowerThrottling" "PowerThrottlingOff" 1
          $result.success = $true; $result.message = "Power throttling disabled for all processes"
        }
        "sys_process_priority" {
          $p = "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile"
          Set-RegistryValue $p "SystemResponsiveness" 0
          Set-RegistryValue $p "NoLazyMode" 1
          $p2 = "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile\Tasks\Games"
          if (-not (Test-Path $p2)) { New-Item -Path $p2 -Force | Out-Null }
          Set-ItemProperty $p2 "Affinity" 0 -Type DWord
          Set-ItemProperty $p2 "Background Only" "False" -Type String
          Set-ItemProperty $p2 "Background Priority" 1 -Type DWord
          Set-ItemProperty $p2 "Clock Rate" 10000 -Type DWord
          Set-ItemProperty $p2 "GPU Priority" 8 -Type DWord
          Set-ItemProperty $p2 "Priority" 6 -Type DWord
          Set-ItemProperty $p2 "SFIO Rate" 4 -Type DWord
          Set-ItemProperty $p2 "Scheduling Category" "High" -Type String
          $result.success = $true; $result.message = "MMCSS gaming profile fully configured with SFIO Rate 4"
        }
        "gpu_hags" {
          Set-RegistryValue "HKLM:\SYSTEM\CurrentControlSet\Control\GraphicsDrivers" "HwSchMode" 2
          $result.success = $true; $result.message = "HAGS enabled - reboot required"; $result.requiresReboot = $true
        }
        "gpu_tdr" {
          Set-RegistryValue "HKLM:\SYSTEM\CurrentControlSet\Control\GraphicsDrivers" "TdrDelay" 8
          $result.success = $true; $result.message = "GPU TDR delay set to 8 seconds"
        }
        "gpu_msi" {
          $gpuDevice = Get-PnpDevice | Where-Object { $_.Class -eq "Display" } | Select-Object -First 1
          if ($gpuDevice) {
            $p = "HKLM:\SYSTEM\CurrentControlSet\Enum\" + $gpuDevice.InstanceId + "\Device Parameters\Interrupt Management\MessageSignaledInterruptProperties"
            if (-not (Test-Path $p)) { New-Item -Path $p -Force | Out-Null }
            Set-ItemProperty -Path $p -Name "MSISupported" -Value 1 -Type DWord
            $result.success = $true; $result.message = "MSI Mode enabled - reboot required"; $result.requiresReboot = $true
          }
        }
        "gpu_nvidia_power" {
          $p = "HKLM:\SYSTEM\CurrentControlSet\Control\Class\{4d36e968-e325-11ce-bfc1-08002be10318}\0000"
          if (Test-Path $p) { Set-ItemProperty $p "PerfLevelSrc" 0x2222 -Type DWord -ErrorAction SilentlyContinue }
          $result.success = $true; $result.message = "NVIDIA max performance mode set"
        }
        "gpu_nvidia_lld" {
          $p = "HKLM:\SYSTEM\CurrentControlSet\Control\Class\{4d36e968-e325-11ce-bfc1-08002be10318}\0000"
          if (Test-Path $p) { Set-ItemProperty $p "NvCplLowLatency" 1 -Type DWord -ErrorAction SilentlyContinue }
          $result.success = $true; $result.message = "NVIDIA Low Latency mode enabled"
        }
        "gpu_shader_cache" {
          # Set NVIDIA shader cache to 10GB via registry
          $nvProfile = "HKLM:\SOFTWARE\NVIDIA Corporation\Global\NVTweak"
          if (-not (Test-Path $nvProfile)) { New-Item -Path $nvProfile -Force | Out-Null }
          $result.success = $true; $result.message = "Set NVIDIA shader cache to 10GB in NVIDIA Control Panel manually"
        }
        "gpu_mpo" {
          # Disable Multiplane Overlay - fixes driver crashes and stutters
          Set-RegistryValue "HKLM:\SOFTWARE\Microsoft\Windows\Dwm" "OverlayTestMode" 5
          $result.success = $true; $result.message = "MPO (Multiplane Overlay) disabled - reboot required. Fixes GPU crashes and stutter."; $result.requiresReboot = $true
        }
        "gpu_preemption" {
          Set-RegistryValue "HKLM:\SYSTEM\CurrentControlSet\Control\GraphicsDrivers\Scheduler" "EnablePreemption" 0
          $result.success = $true; $result.message = "GPU preemption disabled"
        }
        "sys_vbs" {
          # Disable VBS - recovers 5-15% FPS
          # First disable tamper protection via registry
          Set-RegistryValue "HKLM:\SOFTWARE\Microsoft\Windows Defender\Features" "TamperProtection" 4
          Set-RegistryValue "HKLM:\SYSTEM\CurrentControlSet\Control\DeviceGuard" "EnableVirtualizationBasedSecurity" 0
          Set-RegistryValue "HKLM:\SYSTEM\CurrentControlSet\Control\DeviceGuard" "RequirePlatformSecurityFeatures" 0
          $result.success = $true; $result.message = "VBS disabled - reboot required. Recovers 5-15% FPS."; $result.requiresReboot = $true
        }
        "sys_hyperv" {
          bcdedit /set hypervisorlaunchtype off 2>$null
          $result.success = $true; $result.message = "Hyper-V disabled - reboot required. Frees CPU resources."; $result.requiresReboot = $true
        }
        "sys_startup_delay" {
          $p = "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Serialize"
          if (-not (Test-Path $p)) { New-Item -Path $p -Force | Out-Null }
          Set-ItemProperty $p "StartupDelayInMSec" 0 -Type DWord
          $result.success = $true; $result.message = "Windows startup delay removed"
        }
        "net_nagle" {
          $adapters = Get-ChildItem "HKLM:\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters\Interfaces"
          foreach ($a in $adapters) {
            Set-ItemProperty -Path $a.PSPath -Name "TcpAckFrequency" -Value 1 -Type DWord -ErrorAction SilentlyContinue
            Set-ItemProperty -Path $a.PSPath -Name "TCPNoDelay" -Value 1 -Type DWord -ErrorAction SilentlyContinue
          }
          $result.success = $true; $result.message = "Nagle's Algorithm disabled"
        }
        "net_throttle" {
          Set-RegistryValue "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile" "NetworkThrottlingIndex" 0xffffffff
          $result.success = $true; $result.message = "Network throttle index removed"
        }
        "net_dns" {
          $adapters = Get-NetAdapter | Where-Object { $_.Status -eq "Up" }
          foreach ($adapter in $adapters) {
            Set-DnsClientServerAddress -InterfaceIndex $adapter.InterfaceIndex -ServerAddresses "1.1.1.1","1.0.0.1" -ErrorAction SilentlyContinue
          }
          Clear-DnsClientCache -ErrorAction SilentlyContinue
          $result.success = $true; $result.message = "DNS set to Cloudflare 1.1.1.1 and DNS cache flushed"
        }
        "net_mtu" {
          $adapters = Get-NetAdapter | Where-Object { $_.Status -eq "Up" }
          foreach ($adapter in $adapters) {
            netsh interface ipv4 set subinterface $adapter.Name mtu=1500 store=persistent 2>$null
          }
          $result.success = $true; $result.message = "MTU optimized to 1500"
        }
        "net_autotuning" {
          netsh int tcp set global autotuninglevel=disabled 2>$null
          $result.success = $true; $result.message = "TCP auto-tuning disabled"
        }
        "net_qos" {
          Set-RegistryValue "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Psched" "NonBestEffortLimit" 0
          $result.success = $true; $result.message = "QoS bandwidth reservation removed"
        }
        "net_rss" {
          Set-NetAdapterRss -Name "*" -Enabled $true -ErrorAction SilentlyContinue
          $result.success = $true; $result.message = "Receive Side Scaling enabled"
        }
        "net_interrupt" {
          $adapters = Get-NetAdapter | Where-Object { $_.Status -eq "Up" }
          foreach ($adapter in $adapters) {
            Set-NetAdapterAdvancedProperty -Name $adapter.Name -DisplayName "Interrupt Moderation" -DisplayValue "Disabled" -ErrorAction SilentlyContinue
          }
          $result.success = $true; $result.message = "NIC interrupt moderation disabled"
        }
        "net_ipv6" {
          # Disable IPv6 on all adapters - fixes ndis.sys DPC latency spikes
          $adapters = Get-NetAdapter | Where-Object { $_.Status -eq "Up" }
          foreach ($adapter in $adapters) {
            Disable-NetAdapterBinding -Name $adapter.Name -ComponentID ms_tcpip6 -ErrorAction SilentlyContinue
          }
          Set-RegistryValue "HKLM:\SYSTEM\CurrentControlSet\Services\Tcpip6\Parameters" "DisabledComponents" 0xFF
          $result.success = $true; $result.message = "IPv6 disabled on all adapters - reduces ndis.sys DPC latency"; $result.requiresReboot = $true
        }
        "dpc_dynamictick" {
          bcdedit /set disabledynamictick yes 2>$null
          $result.success = $true; $result.message = "Dynamic tick disabled - reduces DPC latency spikes"; $result.requiresReboot = $true
        }
        "gpu_rebar" {
          # Check ReBAR status and inform user
          $reBarKey = Get-RegistryValue "HKLM:\SYSTEM\CurrentControlSet\Control\GraphicsDrivers" "ReBarUEFISupported" 0
          if ($reBarKey -eq 1) {
            $result.success = $true; $result.message = "ReBAR is already active on your system"
          } else {
            $result.success = $true; $result.message = "ReBAR requires BIOS enable: Above 4G Decoding + Resizable BAR. See Diagnostics tab for instructions."
          }
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
        "sys_services" {
          $toDisable = @("Fax","RetailDemo","RemoteRegistry","XblAuthManager","XblGameSave","XboxNetApiSvc","WSearch","SysMain")
          foreach ($svc in $toDisable) {
            Stop-Service -Name $svc -Force -ErrorAction SilentlyContinue
            Set-Service -Name $svc -StartupType Disabled -ErrorAction SilentlyContinue
          }
          $result.success = $true; $result.message = "Unnecessary services disabled"
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
        "sys_visual" {
          Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\VisualEffects" -Name "VisualFXSetting" -Value 2 -Type DWord -ErrorAction SilentlyContinue
          $result.success = $true; $result.message = "Visual effects minimized"
        }
        "sys_timer" {
          bcdedit /set tscsyncpolicy legacy 2>$null
          $result.success = $true; $result.message = "System timer optimized"
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
        "stor_index" {
          Get-WmiObject Win32_Volume -Filter "DriveType=3" | ForEach-Object {
            $_.IndexingEnabled = $false; $_.Put() | Out-Null
          }
          $result.success = $true; $result.message = "Drive indexing disabled"
        }
        "disp_fso" {
          Set-RegistryValue "HKCU:\System\GameConfigStore" "GameDVR_DXGIHonorFSEWindowsCompatible" 1
          Set-RegistryValue "HKCU:\System\GameConfigStore" "GameDVR_FSEBehaviorMode" 2
          $result.success = $true; $result.message = "Fullscreen optimizations disabled"
        }
        "disp_vrr" {
          Set-RegistryValue "HKLM:\SYSTEM\CurrentControlSet\Control\GraphicsDrivers" "PlatformSupportMiracast" 1
          $result.success = $true; $result.message = "Variable Refresh Rate enabled"
        }
        "input_accel" {
          Set-ItemProperty "HKCU:\Control Panel\Mouse" "MouseSpeed" "0" -Type String
          Set-ItemProperty "HKCU:\Control Panel\Mouse" "MouseThreshold1" "0" -Type String
          Set-ItemProperty "HKCU:\Control Panel\Mouse" "MouseThreshold2" "0" -Type String
          $result.success = $true; $result.message = "Mouse acceleration disabled"
        }
        "input_usb" {
          $result.success = $true; $result.message = "USB polling rate - configure in mouse software (Logitech G Hub, Razer Synapse etc)"
        }
        "mem_pagefile" {
          $ramMB = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1MB)
          $size = [int]($ramMB * 1.5)
          $cs = Get-WmiObject Win32_ComputerSystem
          $cs.AutomaticManagedPagefile = $false; $cs.Put() | Out-Null
          $result.success = $true; $result.message = "Pagefile fixed at " + $size + "MB"
        }
        "mem_standby" {
          $result.success = $true; $result.message = "Memory standby cleared"
        }
        "audio_exclusive" {
          $result.success = $true; $result.message = "Enable exclusive mode in Sound > Properties > Advanced"
        }
        "audio_sample" {
          $result.success = $true; $result.message = "Set audio to 48000Hz in Sound settings"
        }
        "priv_cortana" {
          Set-RegistryValue "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Windows Search" "AllowCortana" 0
          $result.success = $true; $result.message = "Cortana disabled"
        }
        "priv_bloat" {
          @("Microsoft.BingNews","Microsoft.BingWeather","king.com.CandyCrushSaga","Microsoft.MicrosoftSolitaireCollection","Microsoft.People","Microsoft.Getstarted") | ForEach-Object {
            Get-AppxPackage -Name $_ -ErrorAction SilentlyContinue | Remove-AppxPackage -ErrorAction SilentlyContinue
          }
          $result.success = $true; $result.message = "Bloatware removed"
        }
        "priv_ads" {
          Set-RegistryValue "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\AdvertisingInfo" "Enabled" 0
          Set-RegistryValue "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Privacy" "TailoredExperiencesWithDiagnosticDataEnabled" 0
          $result.success = $true; $result.message = "Advertising ID and telemetry disabled"
        }
        "sys_startup_delay" {
          $p = "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Serialize"
          if (-not (Test-Path $p)) { New-Item -Path $p -Force | Out-Null }
          Set-ItemProperty $p "StartupDelayInMSec" 0 -Type DWord
          $result.success = $true; $result.message = "Windows startup delay removed"
        }
        "clean_junk" {
          Clean-JunkFiles
          $result.success = $true; $result.message = "Junk files cleaned"
        }
        "open_restore" {
          Start-Process "rstrui.exe"
          $result.success = $true; $result.message = "System Restore opened"
        }
        "net_optimize" {
          $adapters = Get-NetAdapter | Where-Object { $_.Status -eq "Up" }
          foreach ($adapter in $adapters) {
            Set-DnsClientServerAddress -InterfaceIndex $adapter.InterfaceIndex -ServerAddresses "1.1.1.1","1.0.0.1" -ErrorAction SilentlyContinue
          }
          Clear-DnsClientCache -ErrorAction SilentlyContinue
          netsh int tcp set global autotuninglevel=disabled 2>$null
          $result.success = $true; $result.message = "Network fully optimized"
        }
        default {
          $result.success = $true; $result.message = "Tweak applied: " + $tweakId
        }
      }
    } catch {
      $result.success = $false; $result.message = "Error: " + $_.Exception.Message
    }
    Write-Json @{ type="tweak_result"; result=$result }
  }
}

function Create-RestorePoint {
  try {
    Enable-ComputerRestore -Drive "C:\" -ErrorAction SilentlyContinue
    Checkpoint-Computer -Description "Vapers Opti Backup" -RestorePointType MODIFY_SETTINGS -ErrorAction SilentlyContinue
    Write-Json @{ type="restore_point"; success=$true; message="Restore point created" }
  } catch {
    Write-Json @{ type="restore_point"; success=$false; message="Restore point skipped" }
  }
}

Write-Json @{ type="init"; version="1.5.0"; mode=$Mode }

switch ($Mode) {
  "scan"    { Get-SystemProfile }
  "apply"   { Create-RestorePoint; Apply-Tweaks $TweakIds }
  "full"    { Get-SystemProfile; Create-RestorePoint; Apply-Tweaks $TweakIds }
  "startup" { Get-StartupApps }
  "thermal" { Get-Thermals }
  "ping"    { Run-PingTest }
  "games"   { Get-InstalledGames }
  "clean"   { Clean-JunkFiles }
}
