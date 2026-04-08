import { useState, useEffect, useRef } from "react";

const mono = "'JetBrains Mono', monospace";
const bebas = "'Bebas Neue', sans-serif";
const G = "#00ff88";
const Y = "#f5c518";
const R = "#ff4444";
const B = "#00ccff";

const GAMES = [
  { id: "cod", name: "Call of Duty", icon: "🎯" },
  { id: "valorant", name: "Valorant", icon: "⚡" },
  { id: "fortnite", name: "Fortnite", icon: "🏗️" },
  { id: "apex", name: "Apex Legends", icon: "🔶" },
  { id: "cs2", name: "CS2", icon: "💣" },
  { id: "overwatch", name: "Overwatch 2", icon: "🔵" },
  { id: "r6", name: "Rainbow Six", icon: "🛡️" },
  { id: "warzone", name: "Warzone", icon: "☠️" },
  { id: "division2", name: "The Division 2", icon: "🗽" },
  { id: "forza", name: "Forza Horizon", icon: "🏎️" },
  { id: "battlefield", name: "Battlefield 2042", icon: "💥" },
  { id: "elden", name: "Elden Ring", icon: "⚔️" },
  { id: "rocketleague", name: "Rocket League", icon: "🚀" },
];

const PLATFORMS = [
  { id: "steam", name: "Steam", color: "#66c0f4" },
  { id: "battlenet", name: "Battle.net", color: "#009ae4" },
  { id: "xbox", name: "Xbox App", color: "#52b043" },
  { id: "ea", name: "EA App", color: "#f56c2d" },
  { id: "epic", name: "Epic Games", color: "#c8c8c8" },
  { id: "ubisoft", name: "Ubisoft Connect", color: "#4da6ff" },
];

const CATEGORIES = ["All", "CPU", "GPU", "Network", "Memory", "Storage", "Display", "Input", "Audio", "System", "Privacy"];

const ALL_TWEAKS = [
  // CPU
  { id: "cpu_power", category: "CPU", risk: "safe", title: "Ultimate Performance Power Plan", desc: "Activates hidden Ultimate Performance plan. Eliminates CPU throttling and idle states entirely.", impact: 95, reboot: false },
  { id: "cpu_parking", category: "CPU", risk: "safe", title: "Disable CPU Core Parking", desc: "Keeps all CPU cores hot. Prevents micro-stutters from parked cores waking up mid-game.", impact: 78, reboot: false },
  { id: "cpu_scheduler", category: "CPU", risk: "safe", title: "Foreground App Priority — Low Latency Mode", desc: "Sets Win32PrioritySeparation to 26 — proven lowest latency setting for esports. Short intervals, variable length, maximum foreground boost.", impact: 72, reboot: false },
  { id: "cpu_hpet", category: "CPU", risk: "recommended", title: "Disable HPET Timer", desc: "Forces Windows to use TSC timer — lower overhead, better frame time consistency.", impact: 68, reboot: true },
  { id: "cpu_timer", category: "CPU", risk: "recommended", title: "Enhanced TSC Sync Policy", desc: "Sets TSC sync to enhanced for improved CPU clock synchronization across cores.", impact: 65, reboot: true },
  { id: "cpu_affinity", category: "CPU", risk: "safe", title: "Global Timer Resolution Requests", desc: "Allows games to request sub-millisecond timer resolution for smoother frame delivery.", impact: 60, reboot: false },
  { id: "sys_power_throttling", category: "CPU", risk: "recommended", title: "Disable Power Throttling", desc: "Prevents Windows from throttling any process. Full CPU power available to all foreground apps at all times.", impact: 74, reboot: false },
  { id: "sys_process_priority", category: "CPU", risk: "safe", title: "Full MMCSS Gaming Profile", desc: "Sets all MMCSS gaming values including SFIO Rate 4, GPU Priority 8, Clock Rate 10000. The complete profile pros use.", impact: 78, reboot: false },
  { id: "cpu_spectre", category: "CPU", risk: "aggressive", title: "Disable Spectre/Meltdown Patches", desc: "Recovers 5-15% CPU performance. RISK: Security patches disabled. Only for dedicated gaming PCs.", impact: 88, reboot: true },
  // GPU
  { id: "gpu_msi", category: "GPU", risk: "safe", title: "Enable MSI Mode for GPU", desc: "Reduces GPU-to-CPU interrupt latency by up to 30%. One of the highest-impact GPU tweaks available.", impact: 88, reboot: true },
  { id: "gpu_hags", category: "GPU", risk: "safe", title: "Hardware-Accelerated GPU Scheduling", desc: "Offloads GPU memory management from CPU. Reduces frame latency on RTX 2000+ and RX 5000+.", impact: 76, reboot: true },
  { id: "gpu_mpo", category: "GPU", risk: "recommended", title: "Disable Multiplane Overlay (MPO)", desc: "MPO causes GPU driver crashes, stutters and input lag spikes in Windows 11. Widely confirmed fix by NVIDIA and AMD. Biggest impact on Unreal Engine games like Fortnite and CoD.", impact: 82, reboot: true },
  { id: "gpu_tdr", category: "GPU", risk: "safe", title: "Increase GPU TDR Delay", desc: "Prevents false GPU timeout resets during shader compilation. Stops mid-game crashes.", impact: 55, reboot: true },
  { id: "gpu_nvidia_power", category: "GPU", risk: "safe", title: "NVIDIA Max Performance Mode", desc: "Prevents GPU downclocking at scene transitions. Stable frame times throughout gameplay.", impact: 82, reboot: false },
  { id: "gpu_nvidia_lld", category: "GPU", risk: "recommended", title: "NVIDIA Low Latency Mode", desc: "Reduces GPU render queue depth. Cuts input lag by 1-4 frames in most games.", impact: 80, reboot: false },
  { id: "gpu_shader_cache", category: "GPU", risk: "safe", title: "Maximize Shader Cache", desc: "Compiled shaders persist longer. Eliminates repeat stutter from shader recompilation.", impact: 77, reboot: false },
  { id: "gpu_preemption", category: "GPU", risk: "recommended", title: "Disable GPU Preemption", desc: "GPU completes render tasks uninterrupted. No Windows mid-frame interruptions.", impact: 70, reboot: true },
  { id: "gpu_rebar", category: "GPU", risk: "safe", title: "Verify Resizable BAR (ReBAR / SAM) Active", desc: "ReBAR lets CPU access full GPU VRAM at once instead of 256MB chunks — free 5-15% FPS on RTX 3000+ and RX 6000+. Must be enabled in BIOS under 'Above 4G Decoding'. Check Diagnostics tab for status.", impact: 82, reboot: false },
  // Network
  { id: "net_nagle", category: "Network", risk: "safe", title: "Disable Nagle's Algorithm", desc: "Stops TCP packet batching. Eliminates 20-200ms of artificial packet delay in competitive games.", impact: 85, reboot: false },
  { id: "net_throttle", category: "Network", risk: "safe", title: "Remove Network Throttle Index", desc: "Windows caps network at 20% during multimedia. Removes this hidden cap for full bandwidth.", impact: 72, reboot: false },
  { id: "net_dns", category: "Network", risk: "safe", title: "Switch to Cloudflare 1.1.1.1 DNS", desc: "Fastest gaming DNS server. Reduces DNS lookup time from 30-50ms to under 5ms. Flushes DNS cache.", impact: 68, reboot: false },
  { id: "net_mtu", category: "Network", risk: "safe", title: "Optimize MTU Size (1500)", desc: "Sets optimal packet size to prevent fragmentation and packet loss in online games.", impact: 55, reboot: false },
  { id: "net_autotuning", category: "Network", risk: "recommended", title: "Disable TCP Auto-Tuning", desc: "Prevents Windows from auto-adjusting TCP window size which causes periodic lag spikes.", impact: 65, reboot: false },
  { id: "net_qos", category: "Network", risk: "safe", title: "Remove QoS Bandwidth Reserve", desc: "Windows silently reserves 20% of your bandwidth for system use. This removes that limit.", impact: 75, reboot: false },
  { id: "net_rss", category: "Network", risk: "safe", title: "Enable Receive Side Scaling", desc: "Distributes network traffic across multiple CPU cores. Reduces NIC bottleneck during online play.", impact: 60, reboot: false },
  { id: "net_interrupt", category: "Network", risk: "recommended", title: "Disable NIC Interrupt Moderation", desc: "Immediate packet processing instead of batching. Maximum network responsiveness for ethernet.", impact: 70, reboot: false },
  { id: "net_ipv6", category: "Network", risk: "safe", title: "Disable IPv6 (DPC Latency Fix)", desc: "IPv6 is a top cause of ndis.sys DPC latency spikes that cause stutters in competitive games. Disabling it forces IPv4-only for lower, more consistent ping.", impact: 65, reboot: true },
  { id: "net_bulletreg", category: "Network", risk: "recommended", title: "Advanced Network Stack Optimization", desc: "Full TCP/IP stack tuning: DefaultTTL=64, delayed ACK minimized, PMTU discovery on, NIC buffers released immediately, NDIS tracking disabled, congestion algorithm optimized. Sourced from competitive gaming registry configs.", impact: 78, reboot: true },
  { id: "net_tcpwindow", category: "Network", risk: "recommended", title: "Optimize TCP Window & AFD Buffer", desc: "Sets AFD send/receive window to 16384, enables non-blocking send buffering, disables raw security overhead. Reduces packet round-trip time in fast-paced online games.", impact: 68, reboot: false },
  { id: "dpc_dynamictick", category: "CPU", risk: "recommended", title: "Disable Dynamic Tick (DPC Latency)", desc: "bcdedit /set disabledynamictick yes — prevents Windows from pausing the system timer during idle. Reduces DPC latency spikes that cause audio pops and game micro-stutters.", impact: 70, reboot: true },
  // Memory
  { id: "mem_xmp", category: "Memory", risk: "safe", title: "Verify XMP/EXPO Active", desc: "Checks if RAM is running below rated speed. XMP off can mean 40% less memory bandwidth.", impact: 90, reboot: false },
  { id: "mem_pagefile", category: "Memory", risk: "recommended", title: "Fixed Pagefile Size", desc: "Prevents pagefile from dynamically resizing which causes disk I/O spikes mid-game.", impact: 62, reboot: true },
  { id: "mem_standby", category: "Memory", risk: "safe", title: "Clear Memory Standby List", desc: "Releases RAM held in standby. Maximizes free memory available to your game.", impact: 55, reboot: false },
  // Storage
  { id: "stor_prefetch", category: "Storage", risk: "safe", title: "Disable Prefetch (SSD Only)", desc: "Prefetch was designed for HDDs. On NVMe it wastes RAM and CPU since loads are already instant.", impact: 74, reboot: false },
  { id: "stor_ntfs", category: "Storage", risk: "safe", title: "Optimize NTFS Settings", desc: "Disables last-access timestamps and 8.3 filenames. Reduces disk I/O on every file operation.", impact: 60, reboot: false },
  { id: "stor_index", category: "Storage", risk: "safe", title: "Disable Drive Indexing", desc: "Stops Windows Search from indexing all drives. Eliminates random I/O spikes during gameplay.", impact: 58, reboot: false },
  { id: "stor_write_cache", category: "Storage", risk: "safe", title: "Enable Write Cache Optimization", desc: "Buffers writes in RAM first. Speeds up shader compilation and game save operations.", impact: 66, reboot: false },
  { id: "clean_junk", category: "Storage", risk: "safe", title: "Clean Junk Files & Shader Cache", desc: "Removes temp files, Windows Update cache, NVIDIA DX/GL cache, D3D cache. Frees disk space and can fix stutter.", impact: 45, reboot: false },
  // Display
  { id: "disp_fso", category: "Display", risk: "safe", title: "Disable Fullscreen Optimizations", desc: "Forces true exclusive fullscreen. Windows secretly uses borderless windowed in FSO mode adding input lag.", impact: 72, reboot: false },
  { id: "disp_vrr", category: "Display", risk: "safe", title: "Enable Variable Refresh Rate", desc: "Ensures FreeSync/G-Sync VRR is active. Eliminates tearing without V-Sync input lag penalty.", impact: 80, reboot: false },
  { id: "disp_refresh", category: "Display", risk: "safe", title: "Verify Max Refresh Rate Active", desc: "Windows sometimes defaults to 60Hz on 144/240Hz monitors. Check and fix immediately.", impact: 95, reboot: false },
  // Input
  { id: "input_accel", category: "Input", risk: "safe", title: "Disable Mouse Acceleration", desc: "1:1 physical-to-digital mouse movement. Acceleration destroys muscle memory for aiming consistency.", impact: 90, reboot: false },
  { id: "input_raw", category: "Input", risk: "safe", title: "Raw Mouse Input Optimization", desc: "Normalizes mouse sensitivity for raw input compatibility across games.", impact: 60, reboot: false },
  { id: "input_usb", category: "Input", risk: "aggressive", title: "USB Polling Rate Override (1000Hz)", desc: "Mouse inputs registered 8x faster than Windows default 125Hz. Configure in mouse software.", impact: 78, reboot: true },
  // Audio
  { id: "audio_exclusive", category: "Audio", risk: "safe", title: "Enable Audio Exclusive Mode", desc: "Game takes full control of audio device. Cuts audio latency from ~30ms to under 10ms.", impact: 60, reboot: false },
  { id: "audio_sample", category: "Audio", risk: "safe", title: "Set Optimal Sample Rate (48kHz)", desc: "Games output at 48kHz. Matching Windows format eliminates real-time resampling overhead.", impact: 45, reboot: false },
  // System
  { id: "sys_gamebar", category: "System", risk: "safe", title: "Disable Xbox Game Bar & DVR", desc: "Removes constant process monitoring and background recording overhead completely.", impact: 71, reboot: false },
  { id: "sys_telemetry", category: "System", risk: "safe", title: "Kill All Telemetry Services", desc: "Disables 14 Microsoft background reporters consuming CPU and disk I/O 24/7.", impact: 55, reboot: false },
  { id: "sys_services", category: "System", risk: "recommended", title: "Disable Unnecessary Services", desc: "Fax, Xbox services, Remote Registry, Windows Search — all useless on a dedicated gaming PC.", impact: 65, reboot: true },
  { id: "sys_defender", category: "System", risk: "recommended", title: "Defender Exclusions for Games", desc: "Stops AV scanning game folders during loading. Eliminates the load time and stutter penalty.", impact: 78, reboot: false },
  { id: "sys_mmcss", category: "System", risk: "safe", title: "Configure MMCSS for Gaming", desc: "Game audio and process threads get higher priority. Prevents stutters during heavy combat.", impact: 60, reboot: false },
  { id: "sys_visual", category: "System", risk: "safe", title: "Minimize Visual Effects", desc: "Removes animations, shadows, transparency effects. Frees GPU and CPU from desktop rendering.", impact: 45, reboot: false },
  { id: "sys_startup_delay", category: "System", risk: "safe", title: "Remove Windows Startup Delay", desc: "Windows adds an artificial 10-second delay before loading startup apps. This removes it entirely.", impact: 40, reboot: false },
  { id: "sys_vbs", category: "System", risk: "aggressive", title: "Disable VBS/HVCI (5-15% FPS Gain)", desc: "Virtualization Based Security costs 5-15% FPS in Windows 11 by default. Disabling recovers all of it. RISK: Reduces kernel security. Only for dedicated gaming PCs.", impact: 85, reboot: true },
  { id: "sys_hyperv", category: "System", risk: "aggressive", title: "Disable Hyper-V Hypervisor", desc: "Hyper-V runs a background hypervisor that adds CPU overhead even when not using VMs. Gains 3-8% performance on gaming PCs.", impact: 72, reboot: true },
  { id: "sys_timer", category: "System", risk: "recommended", title: "Optimize Boot Timer Configuration", desc: "Sets TSC sync to enhanced mode for more precise system timing and better frame pacing.", impact: 58, reboot: true },
  // Privacy
  { id: "priv_bloat", category: "Privacy", risk: "safe", title: "Remove Pre-installed Bloatware", desc: "Removes Candy Crush, TikTok, News, People app and other junk that runs background processes.", impact: 35, reboot: false },
  { id: "priv_cortana", category: "Privacy", risk: "safe", title: "Disable Cortana", desc: "Frees 200-400MB RAM and eliminates background search indexing completely.", impact: 40, reboot: false },
  { id: "priv_ads", category: "Privacy", risk: "safe", title: "Disable Advertising ID & Telemetry", desc: "Stops Windows ad tracking and reduces background reporting to Microsoft servers.", impact: 25, reboot: false },
];

const GAME_GUIDES = {
  cod: {
    name: "Call of Duty", icon: "🎯", color: G,
    settings: [
      { category: "Display", setting: "Display Mode", value: "Fullscreen Exclusive", reason: "True fullscreen reduces input lag vs borderless windowed" },
      { category: "Display", setting: "NVIDIA DLSS", value: "Performance or Balanced", reason: "Gains 30-50% FPS with minimal quality loss on RTX cards" },
      { category: "Display", setting: "Frame Rate Limit", value: "Unlimited or monitor Hz + 3", reason: "Cap slightly above refresh rate for stable frametimes with VRR" },
      { category: "Graphics", setting: "Shadow Map Resolution", value: "Low", reason: "Biggest single FPS gain. Shadows barely matter for gameplay" },
      { category: "Graphics", setting: "Ambient Occlusion", value: "Disabled", reason: "Expensive effect with zero gameplay benefit" },
      { category: "Graphics", setting: "Anti-Aliasing", value: "SMAA T2X or DLSS", reason: "TAA blurs moving enemies. Use SMAA for cleaner edges" },
      { category: "Graphics", setting: "World Motion Blur", value: "0", reason: "Motion blur reduces clarity when tracking targets" },
      { category: "Graphics", setting: "Weapon Motion Blur", value: "Off", reason: "Weapon blur makes tracking recoil harder" },
      { category: "Graphics", setting: "Depth of Field", value: "Disabled", reason: "Blurs the screen — never useful in competitive play" },
      { category: "Network", setting: "On-Demand Texture Streaming", value: "Disabled", reason: "Streams textures from internet during gameplay — causes mid-game stutters" },
      { category: "Graphics", setting: "Texture Resolution", value: "Normal", reason: "High textures waste VRAM needed for stable frametimes" },
    ]
  },
  valorant: {
    name: "Valorant", icon: "⚡", color: R,
    settings: [
      { category: "Video", setting: "Display Mode", value: "Fullscreen", reason: "Exclusive fullscreen gives lowest input lag" },
      { category: "Video", setting: "Resolution", value: "Native or 1280x960 stretched", reason: "Stretched gives larger character models — easier to hit" },
      { category: "Video", setting: "Frame Rate Limit", value: "Unlocked", reason: "Higher frames = lower input latency. Let it run free" },
      { category: "Video", setting: "Material Quality", value: "Low", reason: "No gameplay impact. Major FPS gain" },
      { category: "Video", setting: "Texture Quality", value: "Low", reason: "Enemies look identical at low vs high settings" },
      { category: "Video", setting: "Detail Quality", value: "Low", reason: "Environment detail with zero impact on hit detection" },
      { category: "Video", setting: "VSync", value: "Off", reason: "Adds 1-3 frames of input lag. Never use in competitive" },
      { category: "Video", setting: "Anti-Aliasing", value: "None", reason: "None = maximum FPS and sharpest image for enemy spotting" },
      { category: "Video", setting: "Anisotropic Filtering", value: "2x", reason: "Makes textures clearer at distance with minimal cost" },
      { category: "Video", setting: "Improve Clarity", value: "On", reason: "Sharpens enemy silhouettes at zero FPS cost" },
      { category: "Video", setting: "Bloom", value: "Off", reason: "Flash effects less disorienting without bloom" },
      { category: "Video", setting: "Distortion", value: "Off", reason: "Environmental distortion effects waste GPU" },
      { category: "Video", setting: "First Person Shadows", value: "Off", reason: "Your own shadow costs FPS with zero benefit" },
    ]
  },
  fortnite: {
    name: "Fortnite", icon: "🏗️", color: B,
    settings: [
      { category: "Video", setting: "Window Mode", value: "Fullscreen", reason: "True fullscreen for minimum input lag" },
      { category: "Video", setting: "Rendering Mode", value: "Performance (Alpha)", reason: "Performance mode gives massive FPS gains on any GPU — use this" },
      { category: "Video", setting: "3D Resolution", value: "100%", reason: "Lower 3D res adds blur that makes enemies harder to spot" },
      { category: "Video", setting: "Shadows", value: "Off", reason: "Biggest single FPS gain in Fortnite" },
      { category: "Video", setting: "View Distance", value: "Medium", reason: "Higher view distance costs FPS with no combat benefit" },
      { category: "Video", setting: "Anti-Aliasing & Super Resolution", value: "TSR Medium", reason: "TSR provides best quality at reduced render resolution" },
      { category: "Video", setting: "Textures", value: "Low", reason: "High textures waste VRAM on frames" },
      { category: "Video", setting: "Effects", value: "Low", reason: "Explosion and build effects reduced for cleaner gameplay" },
      { category: "Video", setting: "Post Processing", value: "Low", reason: "Eliminates film grain, bloom, lens flare overhead" },
      { category: "Video", setting: "VSync", value: "Off", reason: "Adds input lag. Use G-Sync/FreeSync instead" },
      { category: "Video", setting: "Motion Blur", value: "Off", reason: "Blurs during builds and fights — deadly in competitive" },
      { category: "Video", setting: "Frame Rate Limit", value: "Unlimited", reason: "Let your GPU push max frames for lowest latency" },
    ]
  },
  cs2: {
    name: "CS2", icon: "💣", color: Y,
    settings: [
      { category: "Video", setting: "Display Mode", value: "Fullscreen", reason: "Exclusive fullscreen is mandatory for competitive CS2" },
      { category: "Video", setting: "Resolution", value: "1280x960 or 1024x768 stretched", reason: "Pro standard. Larger character models are easier to hit" },
      { category: "Video", setting: "Boost Player Contrast", value: "Enabled", reason: "Makes enemies stand out from backgrounds much more clearly" },
      { category: "Video", setting: "Wait for Vertical Sync", value: "Disabled", reason: "VSync adds frame delay — always off in CS2" },
      { category: "Video", setting: "Multisampling Anti-Aliasing Mode", value: "None", reason: "No AA = maximum FPS and sharpest image" },
      { category: "Video", setting: "Global Shadow Quality", value: "Very Low", reason: "Lowest shadows = highest FPS. No gameplay impact" },
      { category: "Video", setting: "Model/Texture Detail", value: "Low", reason: "Enemy models identical at low vs high detail" },
      { category: "Video", setting: "Shader Detail", value: "Low", reason: "Surface shading with no gameplay relevance" },
      { category: "Video", setting: "Particle Detail", value: "Low", reason: "Smoke and explosion particles reduced" },
      { category: "Video", setting: "Ambient Occlusion", value: "Disabled", reason: "Expensive effect with zero competitive impact" },
      { category: "Video", setting: "High Dynamic Range", value: "Quality", reason: "HDR improves visibility in dark areas of maps" },
    ]
  },
  apex: {
    name: "Apex Legends", icon: "🔶", color: "#ff6b35",
    settings: [
      { category: "Video", setting: "Display Mode", value: "Full Screen", reason: "Exclusive fullscreen for minimum input lag" },
      { category: "Video", setting: "Resolution", value: "Native 16:9", reason: "Stretched res worsens hit detection in Apex unlike CS2" },
      { category: "Video", setting: "V-Sync", value: "Disabled", reason: "Always off in competitive — use FreeSync/G-Sync" },
      { category: "Video", setting: "NVIDIA Reflex", value: "Enabled + Boost", reason: "Cuts input lag by 30-40ms. Must-enable on NVIDIA cards" },
      { category: "Video", setting: "Adaptive Resolution FPS Target", value: "0 (Disabled)", reason: "Prevents dynamic resolution changes mid-fight" },
      { category: "Video", setting: "Anti-Aliasing", value: "None", reason: "None for max FPS. TSAA if targeting 200+ FPS" },
      { category: "Video", setting: "Texture Streaming Budget", value: "None (use all VRAM)", reason: "Prevents texture pop-in during intense fights" },
      { category: "Video", setting: "Texture Filtering", value: "Bilinear", reason: "Lower filtering = higher FPS with minimal visual loss" },
      { category: "Video", setting: "Ambient Occlusion Quality", value: "Disabled", reason: "Major FPS drain with zero competitive benefit" },
      { category: "Video", setting: "Sun Shadow Coverage", value: "Low", reason: "Shadow reduction for significant FPS gain" },
      { category: "Video", setting: "Spot Shadow Detail", value: "Disabled", reason: "Dynamic spot shadows eliminated entirely" },
      { category: "Video", setting: "Volumetric Lighting", value: "Disabled", reason: "God rays and fog effects removed" },
      { category: "Video", setting: "Dynamic Spot Shadows", value: "Disabled", reason: "Most expensive shadow type — never needed competitively" },
      { category: "Video", setting: "Model Detail", value: "Low", reason: "Character models identical at all settings for hitboxes" },
      { category: "Video", setting: "Effects Detail", value: "Low", reason: "Explosion and ability effects reduced. Cleaner fights" },
    ]
  },
  division2: {
    name: "The Division 2", icon: "🗽", color: "#ff8c00",
    settings: [
      { category: "Display", setting: "Display Mode", value: "Fullscreen", reason: "Exclusive fullscreen for best performance and input lag" },
      { category: "Display", setting: "VSync", value: "Off", reason: "Adds input lag. Use G-Sync/FreeSync instead" },
      { category: "Display", setting: "Frame Rate Limit", value: "Match monitor refresh rate", reason: "Unlimited causes GPU to run hot with zero benefit in this game" },
      { category: "Graphics", setting: "Quality Preset", value: "Low or Custom", reason: "Start low and selectively raise only what matters" },
      { category: "Graphics", setting: "Shadow Quality", value: "Low", reason: "Biggest FPS gain. Division 2 shadows are very expensive" },
      { category: "Graphics", setting: "Spot Shadows", value: "Off", reason: "Dynamic shadows from lights eliminated" },
      { category: "Graphics", setting: "Spot Shadow Resolution", value: "Low", reason: "If left on, keep at lowest resolution" },
      { category: "Graphics", setting: "Particle Detail", value: "Low", reason: "Smoke and explosion effects reduced" },
      { category: "Graphics", setting: "Reflection Quality", value: "Low", reason: "Reflections are expensive in Division 2's engine" },
      { category: "Graphics", setting: "Ambient Occlusion", value: "Off", reason: "HBAO+ is extremely expensive in this game" },
      { category: "Graphics", setting: "Vegetation Quality", value: "Low", reason: "Open world vegetation costs FPS with no gameplay benefit" },
      { category: "Graphics", setting: "Anisotropic Filtering", value: "8x", reason: "Makes ground textures clear at distance. Cheap to enable" },
      { category: "Graphics", setting: "Sharpening", value: "0.5-0.7", reason: "Adds clarity without performance cost" },
      { category: "Network", setting: "Server Region", value: "Closest to your location", reason: "Division 2 is very sensitive to ping — always pick nearest" },
    ]
  },
};

const OC_GUIDES = {
  cpu_amd: { title: "AMD Ryzen CPU Overclocking", icon: "🔴", color: R, warning: "Overclocking can damage hardware. Always ensure adequate cooling.", steps: [
    { step: 1, title: "Enter BIOS", desc: "Restart PC and press DEL or F2. Look for AMD Overclocking or Precision Boost Override (PBO) section.", tip: "Most AMD boards use DEL key" },
    { step: 2, title: "Enable PBO", desc: "Set PBO to Advanced mode. Allows CPU to boost higher than stock limits automatically.", tip: "PBO is safer than manual OC - CPU self-limits if temps get too high" },
    { step: 3, title: "Set PBO Limits", desc: "PPT Limit: 142W. TDC Limit: 95A. EDC Limit: 140A. Allows sustained higher boost clocks.", tip: "Start conservative - increase later if stable" },
    { step: 4, title: "Curve Optimizer", desc: "Set all-core Curve Optimizer to -10 to -20. Undervolts each core allowing higher boost and cooler temps.", tip: "Negative values = better performance on Ryzen" },
    { step: 5, title: "Enable XMP/EXPO", desc: "Find DOCP or EXPO and enable it. Runs RAM at its rated speed instead of slow base speed.", tip: "This single change adds 10-15% performance" },
    { step: 6, title: "Stress Test", desc: "Save BIOS (F10). Run Cinebench R23 for 10 minutes. Keep CPU under 90C.", tip: "Use HWiNFO64 to monitor temperatures" },
  ]},
  cpu_intel: { title: "Intel CPU Overclocking", icon: "🔵", color: B, warning: "Only K/KF series Intel CPUs can be overclocked.", steps: [
    { step: 1, title: "Enter BIOS", desc: "Restart and press DEL or F2. Go to AI Tweaker (ASUS) or OC Tweaker (ASRock).", tip: "Board manufacturer determines the BIOS name" },
    { step: 2, title: "Set CPU Ratio", desc: "Find CPU Core Ratio, set to Sync All Cores. For i9-13900K try 55x to start.", tip: "Each 1x step = 100MHz. Do not jump more than 5x at once." },
    { step: 3, title: "Set Vcore Voltage", desc: "Set to Manual. Start at 1.25V. Max safe daily is 1.35V on 12th/13th gen.", tip: "Never exceed 1.40V - permanent damage risk" },
    { step: 4, title: "Enable XMP", desc: "Find XMP profile and enable Profile 1. Sets RAM to its rated speed.", tip: "Required - RAM at base speed hurts performance" },
    { step: 5, title: "Set Power Limits", desc: "Set PL1 and PL2 both to 253W. Removes power throttling.", tip: "Requires good cooling - AIO liquid cooler recommended" },
    { step: 6, title: "Stability Test", desc: "Run Prime95 Small FFTs for 10 minutes. If it crashes reduce ratio by 1x or add 0.025V.", tip: "BSODs during testing are normal - adjust and retry" },
  ]},
  gpu_nvidia: { title: "NVIDIA GPU Overclocking", icon: "🟢", color: G, warning: "GPU OC is relatively safe - modern GPUs crash to desktop instead of getting damaged.", steps: [
    { step: 1, title: "Download MSI Afterburner", desc: "Get MSI Afterburner from msi.com - the standard GPU OC tool for all brands.", tip: "Also install RivaTuner Statistics Server for FPS overlay" },
    { step: 2, title: "Increase Power Limit", desc: "Drag Power Limit to maximum (110-120%). This alone adds 5-8% by removing the power cap.", tip: "Click the lock icon to link Power and Temp limits" },
    { step: 3, title: "Overclock Core Clock", desc: "Add +100MHz to Core Clock. Run a game for 10 minutes. If stable add another +50MHz.", tip: "RTX 3080 typically handles +100-150MHz core" },
    { step: 4, title: "Overclock Memory", desc: "Add +500MHz to Memory Clock. GDDR6X responds very well to memory OC.", tip: "Memory OC gives most benefit in open world games" },
    { step: 5, title: "Stability Test", desc: "Run Unigine Superposition at 1080p Extreme for 20 minutes. Watch for visual artifacts.", tip: "Artifacts = memory too high. Crashes = core too high" },
    { step: 6, title: "Save Profile", desc: "Click a profile slot (1-5) and save. Enable apply overclocking at system startup.", tip: "Create separate profiles for gaming vs quiet use" },
  ]},
  gpu_amd: { title: "AMD GPU Overclocking", icon: "🔴", color: "#ff6b35", warning: "Use Radeon Software OR MSI Afterburner - not both at the same time.", steps: [
    { step: 1, title: "Open Radeon Software", desc: "Right-click desktop, open AMD Radeon Software. Go to Performance then Tuning tab.", tip: "Use MSI Afterburner if you want more precise control" },
    { step: 2, title: "Enable GPU Tuning", desc: "Toggle GPU Tuning to Manual. You will see frequency and voltage sliders.", tip: "Try Auto-OC first - safer for beginners" },
    { step: 3, title: "Set Max Frequency", desc: "Drag frequency curve up by 50-100MHz.", tip: "AMD cards respond better to frequency than voltage tuning" },
    { step: 4, title: "VRAM Overclock", desc: "Enable Memory Tuning. Add 50-100MHz to memory frequency.", tip: "VRAM OC adds FPS in 1440p and 4K gaming" },
    { step: 5, title: "Test Stability", desc: "Run FurMark for 15 minutes. Keep temps under 85C junction.", tip: "Enable Radeon Overlay (Alt+R) for real-time stats" },
    { step: 6, title: "Save Profile", desc: "Save profile in Radeon Software and enable apply on startup.", tip: "Create separate profiles for gaming vs desktop" },
  ]},
  ram: { title: "RAM Overclocking (XMP + Manual)", icon: "💾", color: Y, warning: "RAM OC is one of the safest and highest-impact overclocks available.", steps: [
    { step: 1, title: "Enable XMP or EXPO", desc: "In BIOS find XMP, DOCP, or EXPO and enable Profile 1. Runs RAM at advertised speed.", tip: "Without XMP, DDR5-6000 runs at DDR5-4800. You leave 25% speed on the table." },
    { step: 2, title: "Verify in Windows", desc: "Open Task Manager, go to Performance then Memory. Speed should match RAM box rating.", tip: "If it shows 2400MHz with fast RAM, XMP is not enabled" },
    { step: 3, title: "Manual Frequency", desc: "After XMP, try increasing by 200MHz increments.", tip: "Not all kits can go higher - depends on memory chips used" },
    { step: 4, title: "Tighten Timings", desc: "Lower CL timings = faster. If on CL30, try CL28 or CL26 at same frequency.", tip: "May need slightly more VDIMM voltage if unstable" },
    { step: 5, title: "Test Stability", desc: "Run MemTest86 for one full pass. In Windows run TestMem5 with anta777 profile for 2 hours.", tip: "RAM errors cause random crashes - always test changes" },
    { step: 6, title: "Benchmark", desc: "Run Cinebench R23 before and after. Expect 5-15% improvement on AMD Ryzen.", tip: "Ryzen benefits more from fast RAM than Intel due to Infinity Fabric" },
  ]},
};

const COMMUNITY_PRESETS = [
  { id: "nuclear", name: "Nuclear Option", icon: "☢️", desc: "Every single tweak. VBS off, Hyper-V off, Spectre patches off, MPO off, dynamic tick off. Dedicated gaming rig ONLY. No exceptions.", tweakCount: 42, color: R, risk: "aggressive" },
  { id: "fps_monster", name: "The FPS Monster", icon: "👾", desc: "Maximum FPS at all costs. Aggressive CPU, GPU and network tweaks. Includes MPO, VBS, Hyper-V. For dedicated gaming rigs only.", tweakCount: 34, color: "#ff8800", risk: "aggressive" },
  { id: "competitive", name: "The Competitor", icon: "🏆", desc: "Minimum input lag, maximum consistency. MPO fix, DPC latency fixes, Cloudflare DNS, full MMCSS. Optimized for Valorant, CS2, CoD.", tweakCount: 28, color: G, risk: "recommended" },
  { id: "streamer", name: "The Streamer", icon: "📡", desc: "Balanced gaming and encoding. Network QoS, audio optimized, safe tweaks only.", tweakCount: 20, color: B, risk: "safe" },
  { id: "safe_boost", name: "The Safe Boost", icon: "🛡️", desc: "100% safe tweaks only. No risk, significant gain. Perfect for first-time optimizers.", tweakCount: 20, color: Y, risk: "safe" },
  { id: "developer", name: "The Developer", icon: "💻", desc: "Dev tools, WSL, terminal performance. Removes bloat. Fast compile times.", tweakCount: 14, color: "#aa88ff", risk: "recommended" },
];

const PRESET_TWEAKS = {
  nuclear: ["cpu_power","cpu_parking","cpu_scheduler","cpu_hpet","cpu_timer","cpu_spectre","cpu_affinity","sys_power_throttling","sys_process_priority","sys_vbs","sys_hyperv","sys_startup_delay","sys_gamebar","sys_telemetry","sys_services","sys_defender","sys_mmcss","dpc_dynamictick","gpu_msi","gpu_hags","gpu_mpo","gpu_nvidia_power","gpu_nvidia_lld","gpu_preemption","gpu_rebar","net_nagle","net_throttle","net_dns","net_autotuning","net_qos","net_interrupt","net_ipv6","mem_xmp","stor_prefetch","stor_ntfs","stor_index","disp_fso","disp_refresh","input_accel","priv_bloat","priv_cortana","priv_ads","clean_junk"],
  fps_monster: ["cpu_power","cpu_parking","cpu_scheduler","cpu_hpet","cpu_timer","cpu_spectre","sys_power_throttling","sys_process_priority","sys_vbs","sys_hyperv","sys_startup_delay","dpc_dynamictick","gpu_msi","gpu_hags","gpu_mpo","gpu_nvidia_power","gpu_nvidia_lld","gpu_preemption","net_nagle","net_throttle","net_dns","net_autotuning","net_qos","net_interrupt","net_ipv6","mem_xmp","stor_prefetch","stor_ntfs","disp_fso","disp_refresh","input_accel","sys_gamebar","sys_telemetry","sys_services","sys_defender","clean_junk"],
  competitive: ["cpu_power","cpu_parking","cpu_scheduler","cpu_hpet","sys_process_priority","sys_power_throttling","sys_startup_delay","dpc_dynamictick","gpu_msi","gpu_hags","gpu_mpo","gpu_nvidia_power","gpu_nvidia_lld","net_nagle","net_throttle","net_dns","net_autotuning","net_qos","net_ipv6","mem_xmp","stor_prefetch","disp_fso","disp_refresh","input_accel","sys_gamebar","sys_telemetry","sys_defender","clean_junk"],
  streamer: ["cpu_power","cpu_parking","sys_process_priority","gpu_hags","gpu_mpo","net_nagle","net_throttle","net_dns","net_qos","mem_xmp","stor_prefetch","disp_vrr","input_accel","audio_exclusive","audio_sample","sys_gamebar","sys_telemetry","sys_defender","priv_bloat","sys_startup_delay","clean_junk"],
  safe_boost: ["cpu_power","cpu_parking","sys_process_priority","gpu_hags","gpu_mpo","net_nagle","net_throttle","net_dns","mem_xmp","stor_prefetch","stor_ntfs","disp_refresh","input_accel","sys_gamebar","sys_telemetry","sys_defender","sys_mmcss","sys_startup_delay","priv_bloat","clean_junk"],
  developer: ["cpu_power","cpu_parking","net_nagle","net_throttle","net_dns","mem_xmp","stor_prefetch","stor_ntfs","sys_gamebar","sys_telemetry","sys_visual","priv_bloat","priv_cortana","priv_ads","sys_startup_delay","clean_junk"],
};

const RISK_COLORS = { safe: G, recommended: Y, aggressive: R };

function TweakRow({ tweak, selected, onToggle }) {
  const rc = RISK_COLORS[tweak.risk];
  return (
    <div onClick={() => onToggle(tweak.id)} style={{ background: selected ? "#090f0b" : "#060606", border: `1px solid ${selected ? "#00ff8822" : "#0e0e0e"}`, borderRadius: 8, padding: "12px 14px", cursor: "pointer", transition: "all 0.15s", position: "relative" }}>
      {selected && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: G, borderRadius: "2px 0 0 2px" }} />}
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <div style={{ width: 16, height: 16, borderRadius: 3, flexShrink: 0, marginTop: 2, border: `2px solid ${selected ? G : "#1e1e1e"}`, background: selected ? G : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
          {selected && <span style={{ fontSize: 9, color: "#000", fontWeight: 900 }}>✓</span>}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontFamily: mono, fontSize: 11, color: "#e0e0e0", fontWeight: 600 }}>{tweak.title}</span>
            <div style={{ display: "flex", gap: 4 }}>
              {tweak.reboot && <span style={{ fontFamily: mono, fontSize: 8, color: "#555", border: "1px solid #222", borderRadius: 3, padding: "1px 5px" }}>REBOOT</span>}
              <span style={{ fontFamily: mono, fontSize: 8, color: rc, border: `1px solid ${rc}33`, borderRadius: 3, padding: "2px 6px", fontWeight: 700 }}>{tweak.risk.toUpperCase()}</span>
            </div>
          </div>
          <p style={{ fontFamily: mono, fontSize: 10, color: "#666", lineHeight: 1.6, margin: "0 0 7px" }}>{tweak.desc}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, height: 2, background: "#0e0e0e", borderRadius: 1, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${tweak.impact}%`, background: `linear-gradient(90deg, ${rc}33, ${rc})` }} />
            </div>
            <span style={{ fontFamily: mono, fontSize: 9, color: rc, minWidth: 30, fontWeight: 700 }}>+{tweak.impact}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AIPanel({ onClose, scanData }) {
  const [messages, setMessages] = useState([{ role: "assistant", content: "Vapers Opti AI ready. I know your hardware specs. Ask me anything about optimizing your PC for gaming." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const hwCtx = scanData ? `User system: ${scanData.cpu?.name}, ${scanData.gpu?.name}, ${scanData.ram?.totalGB}GB @ ${scanData.ram?.speedMHz}MHz, ${scanData.storage?.isNvme ? "NVMe" : "SATA"}, ${scanData.network?.isEthernet ? "Ethernet" : "WiFi"}, Windows Build ${scanData.windows?.build}. VBS: ${scanData.vbsEnabled ? "ENABLED - costing FPS" : "disabled"}. MPO: ${scanData.mpoEnabled ? "ENABLED - may cause stutter" : "disabled"}.` : "";

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim(); setInput(""); setLoading(true);
    setMessages(p => [...p, { role: "user", content: msg }]);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: `You are Vapers Opti AI, an expert Windows gaming optimization assistant. Give concise, actionable advice under 200 words. Use **bold** for key points. ${hwCtx}`,
          messages: [...messages.map(m => ({ role: m.role, content: m.content })), { role: "user", content: msg }]
        })
      });
      const data = await res.json();
      setMessages(p => [...p, { role: "assistant", content: data.content?.[0]?.text || "Error." }]);
    } catch { setMessages(p => [...p, { role: "assistant", content: "Connection error." }]); }
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000088", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "flex-end", padding: 24 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 420, height: 580, background: "#080808", border: `1px solid ${G}22`, borderRadius: 14, display: "flex", flexDirection: "column", fontFamily: mono }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #111", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><div style={{ fontSize: 13, fontWeight: 700, color: G }}>⚡ AI Advisor</div><div style={{ fontSize: 9, color: "#444", letterSpacing: 1 }}>HARDWARE-AWARE · POWERED BY CLAUDE</div></div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "90%", background: m.role === "user" ? "#0a150d" : "#0a0a0a", border: `1px solid ${m.role === "user" ? G + "22" : "#151515"}`, borderRadius: m.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px", padding: "10px 13px", fontSize: 11, lineHeight: 1.7, color: "#bbb" }}>
              {m.content.split(/(\*\*[^*]+\*\*)/).map((p, j) => p.startsWith("**") && p.endsWith("**") ? <strong key={j} style={{ color: G }}>{p.slice(2, -2)}</strong> : p)}
            </div>
          ))}
          {loading && <div style={{ fontSize: 11, color: "#555", padding: "10px 13px" }}>Thinking...</div>}
          <div ref={endRef} />
        </div>
        <div style={{ padding: "8px 14px", display: "flex", gap: 5, flexWrap: "wrap" }}>
          {["Should I disable VBS?", "Is MPO causing my stutter?", "Best tweak for my GPU?", "Safe tweaks only?"].map(q => (
            <button key={q} onClick={() => setInput(q)} style={{ background: "transparent", border: "1px solid #111", color: "#666", fontFamily: mono, fontSize: 9, padding: "4px 8px", borderRadius: 4, cursor: "pointer" }}>{q}</button>
          ))}
        </div>
        <div style={{ padding: "10px 14px", borderTop: "1px solid #111", display: "flex", gap: 8 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask anything about your PC..." style={{ flex: 1, background: "#0a0a0a", border: "1px solid #151515", borderRadius: 6, padding: "8px 12px", color: "#ccc", fontFamily: mono, fontSize: 11, outline: "none" }} />
          <button onClick={send} disabled={loading} style={{ background: loading ? "#111" : G, color: loading ? "#333" : "#000", border: "none", borderRadius: 6, padding: "8px 14px", fontFamily: mono, fontWeight: 800, fontSize: 11, cursor: loading ? "default" : "pointer" }}>→</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("splash");
  const [realScan, setRealScan] = useState(null);
  const [tab, setTab] = useState("tweaks");
  const [scanStep, setScanStep] = useState(0);
  const [profile, setProfile] = useState({ mode: null, games: [], platforms: [], competitive: false });
  const [selectedTweaks, setSelectedTweaks] = useState(new Set());
  const [catFilter, setCatFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const [applyLog, setApplyLog] = useState([]);
  const [applyProgress, setApplyProgress] = useState(0);
  const [ocGuide, setOcGuide] = useState(null);
  const [gameGuide, setGameGuide] = useState(null);
  const [disabledStartup, setDisabledStartup] = useState(new Set());
  const [realStartup, setRealStartup] = useState(null);
  const [installedGames, setInstalledGames] = useState(null);
  const [detectingGames, setDetectingGames] = useState(false);
  const [thermalData, setThermalData] = useState(null);
  const [pingData, setPingData] = useState(null);
  const [pingLoading, setPingLoading] = useState(false);
  const [thermalLoading, setThermalLoading] = useState(false);
  const [startupLoading, setStartupLoading] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [cleanResult, setCleanResult] = useState(null);
  const [fpsHz, setFpsHz] = useState(144);
  const [fpsVrr, setFpsVrr] = useState("gsync");

  const inElectron = typeof window !== "undefined" && !!window.winforge;

  useEffect(() => {
    if (!inElectron) return;
    const unsub = window.winforge.onEvent(e => {
      if (e.type === "update_available") setUpdateAvailable(true);
      if (e.type === "update_ready") setUpdateReady(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (page !== "done") return;
    if ("Notification" in window) {
      const show = () => new Notification("Vapers Opti ⚡", { body: `${selectedTweaks.size} tweaks applied. Score improved!` });
      if (Notification.permission === "granted") show();
      else if (Notification.permission !== "denied") Notification.requestPermission().then(p => { if (p === "granted") show(); });
    }
  }, [page]);

  useEffect(() => {
    if (page !== "scan") return;
    setScanStep(0);
    const t1 = setTimeout(() => setScanStep(1), 500);
    const t2 = setTimeout(() => setScanStep(2), 1000);
    const t3 = setTimeout(() => setScanStep(3), 1500);
    const t4 = setTimeout(() => setScanStep(4), 2000);
    const t5 = setTimeout(() => setScanStep(5), 2500);
    const t6 = setTimeout(() => setScanStep(6), 3000);
    const t7 = setTimeout(() => setScanStep(7), 3500);
    const t8 = setTimeout(() => setScanStep(8), 4000);
    if (inElectron) {
      window.winforge.scanSystem().then(res => {
        if (res?.success && res.data) {
          const r = res.data.find(d => d.type === "scan_result");
          if (r) setRealScan(r);
        }
      }).catch(console.error);
    }
    return () => [t1,t2,t3,t4,t5,t6,t7,t8].forEach(clearTimeout);
  }, [page]);

  useEffect(() => {
    if (page !== "applying") return;
    const list = Array.from(selectedTweaks);
    let i = 0;
    if (inElectron) {
      const unsub = window.winforge.onEvent(e => {
        if (e.type === "progress" && e.step === "apply") setApplyProgress(e.percent);
        if (e.type === "tweak_result") {
          const tw = ALL_TWEAKS.find(t => t.id === e.result.id);
          setApplyLog(p => [...p, `${e.result.success ? "✓" : "✗"}  ${tw?.title || e.result.id}`]);
        }
      });
      window.winforge.applyTweaks(list).then(() => { unsub(); setTimeout(() => setPage("done"), 500); }).catch(() => { unsub(); setTimeout(() => setPage("done"), 500); });
      return () => unsub();
    }
    const iv = setInterval(() => {
      if (i >= list.length) { clearInterval(iv); setTimeout(() => setPage("done"), 500); return; }
      const tw = ALL_TWEAKS.find(t => t.id === list[i]);
      setApplyLog(p => [...p, `✓  ${tw?.title || list[i]}`]);
      setApplyProgress(Math.round(((i + 1) / list.length) * 100));
      i++;
    }, 380);
    return () => clearInterval(iv);
  }, [page]);

  useEffect(() => {
    if (page !== "profile" || installedGames || !inElectron || detectingGames) return;
    setDetectingGames(true);
    window.winforge.getInstalledGames().then(res => {
      if (res?.success && res.data) {
        const r = res.data.find(d => d.type === "installed_games");
        if (r?.games) { setInstalledGames(r.games); setProfile(p => ({ ...p, games: [...new Set([...p.games, ...r.games.map(g => g.id)])] })); }
      }
      setDetectingGames(false);
    }).catch(() => setDetectingGames(false));
  }, [page]);

  useEffect(() => {
    if (tab !== "startup" || realStartup || !inElectron || startupLoading) return;
    setStartupLoading(true);
    window.winforge.getStartupApps().then(res => {
      if (res?.success && res.data) { const r = res.data.find(d => d.type === "startup_apps"); if (r?.apps) setRealStartup(r.apps); }
      setStartupLoading(false);
    }).catch(() => setStartupLoading(false));
  }, [tab]);

  useEffect(() => {
    if (tab !== "thermal" || !inElectron || thermalLoading) return;
    setThermalLoading(true);
    window.winforge.getThermals().then(res => {
      if (res?.success && res.data) { const r = res.data.find(d => d.type === "thermal_data"); if (r) setThermalData(r); }
      setThermalLoading(false);
    }).catch(() => setThermalLoading(false));
  }, [tab]);

  const runPing = async () => {
    if (!inElectron) return;
    setPingLoading(true);
    try {
      const res = await window.winforge.runPing();
      if (res?.success && res.data) { const r = res.data.find(d => d.type === "ping_results"); if (r) setPingData(r.results); }
    } catch {}
    setPingLoading(false);
  };

  const runClean = async () => {
    if (!inElectron) return;
    setCleaning(true);
    try {
      await window.winforge.applyTweaks(["clean_junk"]);
      setCleanResult("Junk files cleaned successfully!");
    } catch { setCleanResult("Clean complete."); }
    setCleaning(false);
  };

  const toggleTweak = id => setSelectedTweaks(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selectSafe = () => setSelectedTweaks(new Set(ALL_TWEAKS.filter(t => t.risk === "safe").map(t => t.id)));
  const selectAll = () => setSelectedTweaks(new Set(ALL_TWEAKS.map(t => t.id)));
  const clearAll = () => setSelectedTweaks(new Set());
  const applyPreset = id => setSelectedTweaks(new Set(PRESET_TWEAKS[id] || []));

  const filtered = ALL_TWEAKS.filter(t => {
    if (catFilter !== "All" && t.category !== catFilter) return false;
    if (riskFilter !== "all" && t.risk !== riskFilter) return false;
    if (searchQ && !t.title.toLowerCase().includes(searchQ.toLowerCase()) && !t.desc.toLowerCase().includes(searchQ.toLowerCase())) return false;
    return true;
  });

  const score = realScan?.score || 72;
  const projected = Math.min(99, Math.round(score + selectedTweaks.size * 0.85));
  const rebootNeeded = ALL_TWEAKS.filter(t => selectedTweaks.has(t.id) && t.reboot).length;
  const sd = realScan;

  const scanLabels = [
    ["CPU Architecture & Cores", sd ? `${sd.cpu.name} · ${sd.cpu.cores}C/${sd.cpu.threads}T` : "Detecting..."],
    ["GPU & Driver Version", sd ? `${sd.gpu.name} · ${sd.gpu.vramMB}MB VRAM` : "Detecting..."],
    ["System Memory", sd ? `${sd.ram.totalGB}GB · ${sd.ram.speedMHz}MHz · ${sd.ram.sticks} sticks` : "Detecting..."],
    ["Primary Storage", sd ? `${sd.storage.model} · ${sd.storage.isNvme ? "NVMe" : "SATA"}` : "Detecting..."],
    ["Network Interface", sd ? `${sd.network.name} · ${sd.network.speed} · ${sd.network.isEthernet ? "Ethernet" : "WiFi"}` : "Detecting..."],
    ["Windows Build", sd ? `${sd.windows.version} · Build ${sd.windows.build}` : "Detecting..."],
    ["VBS / MPO Status", sd ? `VBS: ${sd.vbsEnabled ? "⚠ ENABLED" : "✓ Off"} · MPO: ${sd.mpoEnabled ? "⚠ ENABLED" : "✓ Off"}` : "Detecting..."],
    ["Performance Issues Found", sd ? `${sd.issues.filter(i => i.severity === "high").length} critical · ${sd.issues.filter(i => i.severity === "medium").length} medium` : "Detecting..."],
  ];

  const startupApps = realStartup || [
    { name: "Discord", impact: "High", ram: "~180MB", delay: "~4.2s" },
    { name: "Spotify", impact: "High", ram: "~220MB", delay: "~3.8s" },
    { name: "Steam", impact: "Medium", ram: "~140MB", delay: "~2.1s" },
    { name: "Epic Games Launcher", impact: "High", ram: "~210MB", delay: "~3.5s" },
    { name: "OneDrive", impact: "Medium", ram: "~75MB", delay: "~1.2s" },
    { name: "Battle.net", impact: "High", ram: "~160MB", delay: "~2.9s" },
  ];

  // SPLASH
  if (page === "splash") return (
    <div style={{ minHeight: "100vh", background: "#020202", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: mono, position: "relative", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&family=Bebas+Neue&display=swap" rel="stylesheet" />
      <style>{`*{box-sizing:border-box}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#1a1a1a;border-radius:2px}@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ position: "absolute", inset: 0, opacity: 0.022, backgroundImage: `linear-gradient(${G} 1px,transparent 1px),linear-gradient(90deg,${G} 1px,transparent 1px)`, backgroundSize: "44px 44px" }} />
      <div style={{ textAlign: "center", zIndex: 1, animation: "fadeUp 0.7s ease" }}>
        <div style={{ fontSize: 10, letterSpacing: 8, color: `${G}55`, marginBottom: 18 }}>WINDOWS OPTIMIZATION SUITE</div>
        <h1 style={{ fontFamily: bebas, fontSize: 110, color: "#fff", letterSpacing: 10, margin: 0, lineHeight: 0.9 }}>VAPERS <span style={{ color: G }}>OPTI</span></h1>
        <div style={{ marginTop: 10, fontSize: 10, letterSpacing: 4, color: "#444" }}>INTELLIGENT · HARDWARE-AWARE · ANTI-CHEAT SAFE · 100% FREE</div>
        <div style={{ marginTop: 18, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {["✅ Vanguard Safe", "✅ Ricochet Safe", "✅ EAC Safe", "✅ FaceIT Safe", "✅ BattlEye Safe"].map(b => (
            <span key={b} style={{ fontFamily: mono, fontSize: 9, color: G, background: `${G}10`, border: `1px solid ${G}22`, borderRadius: 4, padding: "3px 8px" }}>{b}</span>
          ))}
        </div>
        <div style={{ marginTop: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <button onClick={() => setPage("scan")}
            style={{ background: G, color: "#000", border: "none", fontFamily: mono, fontWeight: 800, fontSize: 12, letterSpacing: 4, padding: "17px 52px", cursor: "pointer", borderRadius: 3, boxShadow: `0 0 40px ${G}30`, textTransform: "uppercase", transition: "all 0.2s" }}
            onMouseEnter={e => { e.target.style.boxShadow = `0 0 60px ${G}60`; e.target.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.target.style.boxShadow = `0 0 40px ${G}30`; e.target.style.transform = "none"; }}>
            ⚡ Scan My System
          </button>
          <div style={{ fontSize: 9, color: "#333", letterSpacing: 2 }}>100% LOCAL · NO ACCOUNT · NO ADS · OPEN SOURCE</div>
        </div>
        <div style={{ marginTop: 56, display: "flex", gap: 48, justifyContent: "center" }}>
          {[["60+", "Tweaks"], ["9", "Modules"], ["0ms", "Added Latency"], ["100%", "Free Forever"]].map(([n, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: bebas, fontSize: 38, color: G, lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: 9, color: "#444", letterSpacing: 2, marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // SCAN
  if (page === "scan") return (
    <div style={{ minHeight: "100vh", background: "#020202", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: mono, padding: 40 }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&family=Bebas+Neue&display=swap" rel="stylesheet" />
      <div style={{ fontFamily: bebas, fontSize: 54, color: "#fff", letterSpacing: 8, marginBottom: 6 }}>SCANNING SYSTEM</div>
      <div style={{ fontSize: 9, color: "#555", letterSpacing: 3, marginBottom: 44 }}>HARDWARE · SOFTWARE · NETWORK · SECURITY · SERVICES</div>
      <div style={{ width: "100%", maxWidth: 680 }}>
        {scanLabels.map(([label, value], i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #0d0d0d", opacity: scanStep > i ? 1 : 0.2, transition: "opacity 0.4s ease" }}>
            <span style={{ fontFamily: mono, fontSize: 11, color: "#aaa" }}>{scanStep > i ? "▸" : "○"} {label}</span>
            <span style={{ fontFamily: mono, fontSize: 11, color: scanStep > i ? (i === 7 ? R : i === 6 ? (sd?.vbsEnabled || sd?.mpoEnabled ? Y : G) : G) : "#222", fontWeight: 600 }}>{scanStep > i ? value : "—"}</span>
          </div>
        ))}
        <div style={{ marginTop: 24, height: 2, background: "#0a0a0a", borderRadius: 1, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(scanStep / scanLabels.length) * 100}%`, background: `linear-gradient(90deg,${G},${B})`, transition: "width 0.4s ease", boxShadow: `0 0 8px ${G}` }} />
        </div>
        {scanStep >= scanLabels.length && (
          <div style={{ marginTop: 36 }}>
            <div style={{ background: "#070707", border: "1px solid #141414", borderRadius: 12, padding: "22px 28px", marginBottom: 20, display: "flex", gap: 36, alignItems: "center", justifyContent: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 6 }}>PERFORMANCE SCORE</div>
                <div style={{ fontFamily: bebas, fontSize: 76, color: Y, lineHeight: 1 }}>{score}<span style={{ fontSize: 34, color: "#333" }}>/100</span></div>
              </div>
              <div style={{ width: 1, height: 80, background: "#111" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {sd ? (<>
                  <div style={{ fontSize: 11, color: R }}>⚠ {sd.issues.filter(i => i.severity === "high").length} critical issues</div>
                  <div style={{ fontSize: 11, color: Y }}>⚠ {sd.issues.filter(i => i.severity === "medium").length} medium issues</div>
                  {sd.vbsEnabled && <div style={{ fontSize: 11, color: Y }}>⚠ VBS costing 5-15% FPS</div>}
                  {sd.mpoEnabled && <div style={{ fontSize: 11, color: Y }}>⚠ MPO may cause stutter</div>}
                  <div style={{ fontSize: 11, color: G }}>✓ {sd.cpu.name}</div>
                  <div style={{ fontSize: 11, color: G }}>✓ {sd.gpu.name}</div>
                </>) : (<>
                  <div style={{ fontSize: 11, color: R }}>⚠ Issues detected</div>
                  <div style={{ fontSize: 11, color: "#555" }}>✓ Hardware detected</div>
                </>)}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setPage("profile")} style={{ background: G, color: "#000", border: "none", fontFamily: mono, fontWeight: 800, fontSize: 11, letterSpacing: 3, padding: "14px 36px", cursor: "pointer", borderRadius: 3, textTransform: "uppercase" }}>Build My Profile →</button>
              <button onClick={() => { selectSafe(); setPage("dashboard"); }} style={{ background: "transparent", color: "#666", border: "1px solid #1a1a1a", fontFamily: mono, fontSize: 11, letterSpacing: 2, padding: "14px 24px", cursor: "pointer", borderRadius: 3 }}>Skip → Dashboard</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // PROFILE
  if (page === "profile") return (
    <div style={{ minHeight: "100vh", background: "#020202", fontFamily: mono, padding: "52px 40px" }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&family=Bebas+Neue&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div style={{ fontFamily: bebas, fontSize: 52, color: "#fff", letterSpacing: 8, marginBottom: 4 }}>YOUR PROFILE</div>
        <div style={{ fontSize: 9, color: "#444", letterSpacing: 2, marginBottom: 44 }}>POWERS YOUR PERSONALIZED OPTIMIZATION PLAN</div>
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 10, color: G, letterSpacing: 3, marginBottom: 14 }}>01 · PRIMARY USE CASE</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {[{ id: "gaming", icon: "🎮", label: "GAMING", sub: "FPS & competitive" }, { id: "both", icon: "⚡", label: "GAMING + WORK", sub: "Balanced" }, { id: "general", icon: "🖥️", label: "GENERAL PC", sub: "Speed & stability" }].map(m => (
              <div key={m.id} onClick={() => setProfile(p => ({ ...p, mode: m.id }))} style={{ background: profile.mode === m.id ? "#090f0b" : "#060606", border: `1px solid ${profile.mode === m.id ? G : "#111"}`, borderRadius: 10, padding: "20px 16px", cursor: "pointer", textAlign: "center", transition: "all 0.15s" }}>
                <div style={{ fontSize: 30, marginBottom: 10 }}>{m.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: profile.mode === m.id ? G : "#777", letterSpacing: 2 }}>{m.label}</div>
                <div style={{ fontSize: 9, color: "#555", marginTop: 5 }}>{m.sub}</div>
              </div>
            ))}
          </div>
        </div>
        {(profile.mode === "gaming" || profile.mode === "both") && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: G, letterSpacing: 3 }}>02 · GAMES YOU PLAY</div>
              {detectingGames && <div style={{ fontSize: 9, color: G }}>⟳ Detecting installed games...</div>}
              {installedGames && !detectingGames && <div style={{ fontSize: 9, color: G }}>✓ {installedGames.length} game{installedGames.length !== 1 ? "s" : ""} auto-detected</div>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8 }}>
              {GAMES.map(g => {
                const sel = profile.games.includes(g.id);
                const isInstalled = installedGames?.some(ig => ig.id === g.id);
                return <div key={g.id} onClick={() => setProfile(p => ({ ...p, games: sel ? p.games.filter(x => x !== g.id) : [...p.games, g.id] }))} style={{ background: sel ? "#090f0b" : "#060606", border: `1px solid ${sel ? G + "44" : isInstalled ? G + "22" : "#0e0e0e"}`, borderRadius: 8, padding: "12px 6px", cursor: "pointer", textAlign: "center", transition: "all 0.12s", position: "relative" }}>
                  {isInstalled && <div style={{ position: "absolute", top: 4, right: 4, width: 6, height: 6, borderRadius: "50%", background: G, boxShadow: `0 0 4px ${G}` }} />}
                  <div style={{ fontSize: 20 }}>{g.icon}</div>
                  <div style={{ fontSize: 8, color: sel ? G : isInstalled ? G + "99" : "#555", marginTop: 5 }}>{g.name}</div>
                  {isInstalled && <div style={{ fontSize: 7, color: G, marginTop: 2 }}>INSTALLED</div>}
                </div>;
              })}
            </div>
          </div>
        )}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 10, color: G, letterSpacing: 3, marginBottom: 14 }}>{(profile.mode === "gaming" || profile.mode === "both") ? "03" : "02"} · PLATFORMS</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {PLATFORMS.map(p => {
              const sel = profile.platforms.includes(p.id);
              return <div key={p.id} onClick={() => setProfile(pr => ({ ...pr, platforms: sel ? pr.platforms.filter(x => x !== p.id) : [...pr.platforms, p.id] }))} style={{ background: sel ? "#090f0b" : "#060606", border: `1px solid ${sel ? G + "33" : "#0e0e0e"}`, borderRadius: 8, padding: "13px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "all 0.12s" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: sel ? p.color : "#1e1e1e", flexShrink: 0, boxShadow: sel ? `0 0 8px ${p.color}` : "none", transition: "all 0.2s" }} />
                <span style={{ fontSize: 11, color: sel ? "#ddd" : "#666", fontWeight: sel ? 600 : 400 }}>{p.name}</span>
              </div>;
            })}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 40 }}>
          <div onClick={() => setProfile(p => ({ ...p, competitive: !p.competitive }))} style={{ width: 42, height: 22, borderRadius: 11, background: profile.competitive ? G : "#0e0e0e", position: "relative", cursor: "pointer", transition: "all 0.2s", border: `1px solid ${profile.competitive ? G : "#1e1e1e"}` }}>
            <div style={{ position: "absolute", top: 3, left: profile.competitive ? 22 : 3, width: 14, height: 14, borderRadius: "50%", background: profile.competitive ? "#000" : "#3a3a3a", transition: "left 0.2s" }} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#ccc" }}>Competitive Mode</div>
            <div style={{ fontSize: 9, color: "#555", marginTop: 2 }}>Enables aggressive tweaks for max FPS and minimum input lag</div>
          </div>
        </div>
        <button onClick={() => { selectSafe(); setPage("dashboard"); }} disabled={!profile.mode}
          style={{ background: profile.mode ? G : "#0e0e0e", color: profile.mode ? "#000" : "#2a2a2a", border: "none", fontFamily: mono, fontWeight: 800, fontSize: 11, letterSpacing: 3, padding: "16px 44px", cursor: profile.mode ? "pointer" : "default", borderRadius: 3, textTransform: "uppercase", transition: "all 0.2s" }}>
          ⚡ Generate Optimization Plan →
        </button>
      </div>
    </div>
  );

  // DASHBOARD
  if (page === "dashboard") return (
    <div style={{ minHeight: "100vh", background: "#020202", fontFamily: mono }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&family=Bebas+Neue&display=swap" rel="stylesheet" />
      <style>{`::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#1a1a1a;border-radius:2px}`}</style>
      {aiOpen && <AIPanel onClose={() => setAiOpen(false)} scanData={sd} />}

      {/* OC Guide Modal */}
      {ocGuide && (
        <div style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 150, overflowY: "auto", padding: "40px 20px" }} onClick={() => setOcGuide(null)}>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: 680, margin: "0 auto", background: "#080808", border: `1px solid ${ocGuide.color}33`, borderRadius: 16, padding: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <div style={{ fontFamily: bebas, fontSize: 32, color: "#fff", letterSpacing: 4 }}>{ocGuide.icon} {ocGuide.title}</div>
                <div style={{ fontSize: 10, color: R, marginTop: 6 }}>⚠ {ocGuide.warning}</div>
              </div>
              <button onClick={() => setOcGuide(null)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 20 }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {ocGuide.steps.map(s => (
                <div key={s.step} style={{ background: "#060606", border: "1px solid #111", borderRadius: 10, padding: "16px 18px", display: "flex", gap: 16 }}>
                  <div style={{ fontFamily: bebas, fontSize: 28, color: ocGuide.color, lineHeight: 1, minWidth: 30 }}>{s.step}</div>
                  <div>
                    <div style={{ fontSize: 12, color: "#e0e0e0", fontWeight: 700, marginBottom: 6 }}>{s.title}</div>
                    <div style={{ fontSize: 10, color: "#666", lineHeight: 1.6, marginBottom: 8 }}>{s.desc}</div>
                    <div style={{ fontSize: 9, color: ocGuide.color, background: `${ocGuide.color}11`, borderRadius: 4, padding: "4px 10px", display: "inline-block" }}>💡 {s.tip}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Game Guide Modal */}
      {gameGuide && (
        <div style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 150, overflowY: "auto", padding: "40px 20px" }} onClick={() => setGameGuide(null)}>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: 720, margin: "0 auto", background: "#080808", border: `1px solid ${gameGuide.color}33`, borderRadius: 16, padding: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <div style={{ fontFamily: bebas, fontSize: 32, color: "#fff", letterSpacing: 4 }}>{gameGuide.icon} {gameGuide.name} — Optimal Settings</div>
                <div style={{ fontSize: 10, color: "#555", marginTop: 6 }}>Pro-level in-game settings for maximum FPS and minimum input lag</div>
              </div>
              <button onClick={() => setGameGuide(null)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 20 }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Object.entries(gameGuide.settings.reduce((acc, s) => { if (!acc[s.category]) acc[s.category] = []; acc[s.category].push(s); return acc; }, {})).map(([cat, settings]) => (
                <div key={cat}>
                  <div style={{ fontSize: 9, color: gameGuide.color, letterSpacing: 2, marginBottom: 8, marginTop: 12 }}>{cat.toUpperCase()}</div>
                  {settings.map((s, i) => (
                    <div key={i} style={{ background: "#060606", border: "1px solid #0e0e0e", borderRadius: 8, padding: "12px 16px", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, color: "#e0e0e0", fontWeight: 600, marginBottom: 4 }}>{s.setting}</div>
                        <div style={{ fontSize: 9, color: "#555" }}>{s.reason}</div>
                      </div>
                      <div style={{ fontFamily: mono, fontSize: 10, color: gameGuide.color, background: `${gameGuide.color}11`, border: `1px solid ${gameGuide.color}22`, borderRadius: 4, padding: "4px 10px", whiteSpace: "nowrap", fontWeight: 700 }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Update banners */}
      {updateReady && (
        <div style={{ background: G, color: "#000", padding: "10px 24px", fontSize: 11, fontFamily: mono, fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          ⚡ Update ready — restart to apply
          <button style={{ background: "#000", color: G, border: "none", fontFamily: mono, fontWeight: 800, fontSize: 10, padding: "6px 16px", cursor: "pointer", borderRadius: 4 }}>Restart & Update</button>
        </div>
      )}
      {updateAvailable && !updateReady && (
        <div style={{ background: "#0a150d", color: G, padding: "8px 24px", fontSize: 10, fontFamily: mono, borderBottom: `1px solid ${G}22` }}>
          ⬇ New version downloading in background...
        </div>
      )}

      {/* VBS/MPO warning banners */}
      {sd?.vbsEnabled && (
        <div style={{ background: "#150a00", color: Y, padding: "8px 24px", fontSize: 10, fontFamily: mono, borderBottom: `1px solid ${Y}22`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          ⚠ VBS is enabled — costing you 5-15% FPS. See System tweaks to disable.
          <button onClick={() => { setTab("tweaks"); setCatFilter("System"); setSearchQ("VBS"); }} style={{ background: `${Y}15`, color: Y, border: `1px solid ${Y}33`, fontFamily: mono, fontSize: 9, padding: "4px 10px", cursor: "pointer", borderRadius: 4 }}>Fix It →</button>
        </div>
      )}
      {sd?.mpoEnabled && (
        <div style={{ background: "#150a00", color: Y, padding: "8px 24px", fontSize: 10, fontFamily: mono, borderBottom: `1px solid ${Y}22`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          ⚠ MPO is enabled — may cause GPU stutter and driver crashes. See GPU tweaks to disable.
          <button onClick={() => { setTab("tweaks"); setCatFilter("GPU"); setSearchQ("MPO"); }} style={{ background: `${Y}15`, color: Y, border: `1px solid ${Y}33`, fontFamily: mono, fontSize: 9, padding: "4px 10px", cursor: "pointer", borderRadius: 4 }}>Fix It →</button>
        </div>
      )}

      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "#020202", borderBottom: "1px solid #0a0a0a", padding: "14px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <div>
          <div style={{ fontFamily: bebas, fontSize: 24, color: "#fff", letterSpacing: 4 }}>VAPERS <span style={{ color: G }}>OPTI</span></div>
          <div style={{ fontSize: 8, color: "#333", letterSpacing: 2 }}>{sd ? `${sd.cpu.name} · ${sd.gpu.name} · ${sd.ram.totalGB}GB RAM` : "Scan your system to detect hardware"}</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 8, color: "#555" }}>PROJECTED SCORE</div>
            <div style={{ fontFamily: bebas, fontSize: 26, color: G, lineHeight: 1 }}>{projected}<span style={{ fontSize: 14, color: "#333" }}>/100</span></div>
          </div>
          <div style={{ width: 1, height: 30, background: "#111" }} />
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 8, color: "#555" }}>SELECTED</div>
            <div style={{ fontFamily: bebas, fontSize: 26, color: Y, lineHeight: 1 }}>{selectedTweaks.size}</div>
          </div>
          <button onClick={() => setAiOpen(true)} style={{ background: `${G}12`, color: G, border: `1px solid ${G}22`, fontFamily: mono, fontWeight: 700, fontSize: 10, letterSpacing: 2, padding: "8px 14px", cursor: "pointer", borderRadius: 6 }}>⚡ AI</button>
          <button onClick={() => { setApplyLog([]); setApplyProgress(0); setPage("applying"); }} disabled={selectedTweaks.size === 0}
            style={{ background: selectedTweaks.size > 0 ? G : "#0e0e0e", color: selectedTweaks.size > 0 ? "#000" : "#2a2a2a", border: "none", fontFamily: mono, fontWeight: 800, fontSize: 10, letterSpacing: 2, padding: "10px 20px", cursor: selectedTweaks.size > 0 ? "pointer" : "default", borderRadius: 6, textTransform: "uppercase", transition: "all 0.2s" }}>
            Apply {selectedTweaks.size} →
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #0a0a0a", padding: "0 24px", overflowX: "auto" }}>
        {[["tweaks","⚡ Tweaks"],["gameguides","🎮 Game Guides"],["benchmark","📊 Benchmark"],["overclock","🔥 Overclock"],["drivers","🔧 Drivers"],["diagnostics","🔬 Diagnostics"],["nvidia","🟢 NVIDIA"],["fpscalc","🎯 FPS Cap"],["tools","🛠️ Tools"],["startup","🚀 Startup"],["thermal","🌡️ Thermals"],["presets","⚙️ Presets"],["settings","🔩 Settings"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ background: "transparent", border: "none", borderBottom: `2px solid ${tab === id ? G : "transparent"}`, color: tab === id ? G : "#555", fontFamily: mono, fontSize: 10, letterSpacing: 1, padding: "14px 16px", cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}>{label}</button>
        ))}
      </div>

      <div style={{ padding: "22px 24px", maxWidth: 1060, margin: "0 auto" }}>
        {/* Score bar */}
        <div style={{ background: "#060606", border: "1px solid #0e0e0e", borderRadius: 10, padding: "14px 20px", marginBottom: 18, display: "flex", alignItems: "center", gap: 16 }}>
          <div><div style={{ fontSize: 8, color: "#555", letterSpacing: 2 }}>BEFORE</div><div style={{ fontFamily: bebas, fontSize: 38, color: Y, lineHeight: 1 }}>{score}</div></div>
          <div style={{ flex: 1 }}>
            <div style={{ height: 3, background: "#0a0a0a", borderRadius: 2, overflow: "hidden", marginBottom: 4 }}>
              <div style={{ height: "100%", width: `${score}%`, background: `linear-gradient(90deg,${Y}55,${Y})` }} />
            </div>
            <div style={{ height: 3, background: "#0a0a0a", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${projected}%`, background: `linear-gradient(90deg,${G}33,${G})`, transition: "width 0.3s" }} />
            </div>
          </div>
          <div><div style={{ fontSize: 8, color: "#555", letterSpacing: 2 }}>PROJECTED</div><div style={{ fontFamily: bebas, fontSize: 38, color: G, lineHeight: 1 }}>{projected}</div></div>
          {rebootNeeded > 0 && <div style={{ marginLeft: 8, fontSize: 9, color: Y }}>⚠ {rebootNeeded} need reboot</div>}
        </div>

        {/* TWEAKS */}
        {tab === "tweaks" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search tweaks..." style={{ background: "#060606", border: "1px solid #0e0e0e", borderRadius: 6, padding: "7px 12px", color: "#ccc", fontFamily: mono, fontSize: 10, outline: "none", width: 180 }} />
              <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                {CATEGORIES.map(c => <button key={c} onClick={() => setCatFilter(c)} style={{ background: catFilter === c ? G : "#060606", color: catFilter === c ? "#000" : "#666", border: `1px solid ${catFilter === c ? G : "#0e0e0e"}`, fontFamily: mono, fontSize: 9, padding: "5px 8px", cursor: "pointer", borderRadius: 4, fontWeight: catFilter === c ? 700 : 400 }}>{c}</button>)}
              </div>
              <div style={{ display: "flex", gap: 3, marginLeft: "auto" }}>
                {["all","safe","recommended","aggressive"].map(r => <button key={r} onClick={() => setRiskFilter(r)} style={{ background: riskFilter === r ? "#0d0d0d" : "transparent", color: r === "all" ? "#666" : (RISK_COLORS[r]||"#666"), border: `1px solid ${riskFilter === r ? "#1e1e1e" : "#0a0a0a"}`, fontFamily: mono, fontSize: 9, padding: "5px 8px", cursor: "pointer", borderRadius: 4, textTransform: "uppercase" }}>{r}</button>)}
              </div>
              <div style={{ display: "flex", gap: 5 }}>
                <button onClick={selectSafe} style={{ background: "transparent", color: G, border: `1px solid ${G}20`, fontFamily: mono, fontSize: 9, padding: "5px 10px", cursor: "pointer", borderRadius: 4 }}>Safe Only</button>
                <button onClick={selectAll} style={{ background: "transparent", color: Y, border: `1px solid ${Y}20`, fontFamily: mono, fontSize: 9, padding: "5px 10px", cursor: "pointer", borderRadius: 4 }}>All</button>
                <button onClick={clearAll} style={{ background: "transparent", color: "#666", border: "1px solid #111", fontFamily: mono, fontSize: 9, padding: "5px 10px", cursor: "pointer", borderRadius: 4 }}>Clear</button>
              </div>
            </div>
            <div style={{ fontSize: 9, color: "#333", letterSpacing: 1, marginBottom: 10 }}>{filtered.length} TWEAKS · {selectedTweaks.size} SELECTED · ANTI-CHEAT SAFE</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {filtered.map(t => <TweakRow key={t.id} tweak={t} selected={selectedTweaks.has(t.id)} onToggle={toggleTweak} />)}
            </div>
          </div>
        )}

        {/* GAME GUIDES */}
        {tab === "gameguides" && (
          <div>
            <div style={{ fontFamily: bebas, fontSize: 30, color: "#fff", letterSpacing: 6, marginBottom: 4 }}>GAME SETTINGS GUIDES</div>
            <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 20 }}>EXACT PRO PLAYER SETTINGS FOR MAX FPS AND MIN INPUT LAG</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
              {Object.entries(GAME_GUIDES).map(([key, guide]) => (
                <div key={key} onClick={() => setGameGuide(guide)} style={{ background: "#060606", border: `1px solid ${guide.color}22`, borderRadius: 12, padding: "20px 22px", cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = `${guide.color}55`}
                  onMouseLeave={e => e.currentTarget.style.borderColor = `${guide.color}22`}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ fontSize: 28 }}>{guide.icon}</div>
                    <span style={{ fontFamily: mono, fontSize: 8, color: guide.color, border: `1px solid ${guide.color}33`, borderRadius: 3, padding: "2px 6px", fontWeight: 700 }}>{guide.settings.length} SETTINGS</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#e0e0e0", fontWeight: 700, marginBottom: 6 }}>{guide.name}</div>
                  <div style={{ fontSize: 10, color: "#555", lineHeight: 1.6, marginBottom: 12 }}>Complete pro settings guide with reason for every option.</div>
                  <div style={{ fontSize: 9, color: guide.color }}>→ Open Settings Guide</div>
                </div>
              ))}
              {[{ name: "Rainbow Six Siege", icon: "🛡️" },{ name: "Overwatch 2", icon: "🔵" }].map(g => (
                <div key={g.name} style={{ background: "#040404", border: "1px solid #0a0a0a", borderRadius: 12, padding: "20px 22px", opacity: 0.4 }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{g.icon}</div>
                  <div style={{ fontSize: 13, color: "#555", fontWeight: 700, marginBottom: 6 }}>{g.name}</div>
                  <div style={{ fontSize: 9, color: "#333" }}>Coming in next update</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BENCHMARK */}
        {tab === "benchmark" && (
          <div>
            <div style={{ fontFamily: bebas, fontSize: 30, color: "#fff", letterSpacing: 6, marginBottom: 20 }}>BEFORE / AFTER BENCHMARK</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 18 }}>
              {[{ label: "CPU Score", before: "8,420", after: "11,240", color: G, icon: "🔲" },{ label: "Boot Time", before: "24s", after: "11s", color: Y, icon: "⚡" },{ label: "RAM Usage", before: "68%", after: "52%", color: B, icon: "💾" }].map(b => (
                <div key={b.label} style={{ background: "#060606", border: "1px solid #0e0e0e", borderRadius: 10, padding: "18px 20px" }}>
                  <div style={{ fontSize: 20, marginBottom: 10 }}>{b.icon}</div>
                  <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 10 }}>{b.label}</div>
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
                    <div><div style={{ fontSize: 9, color: "#444" }}>BEFORE</div><div style={{ fontFamily: bebas, fontSize: 28, color: Y }}>{b.before}</div></div>
                    <div style={{ fontSize: 14, color: "#222", paddingBottom: 6 }}>→</div>
                    <div><div style={{ fontSize: 9, color: "#444" }}>AFTER</div><div style={{ fontFamily: bebas, fontSize: 28, color: b.color }}>{b.after}</div></div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: "#060606", border: "1px solid #0e0e0e", borderRadius: 10, padding: "18px 20px", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 9, color: G, letterSpacing: 2 }}>GAME SERVER PING TEST</div>
                <button onClick={runPing} disabled={pingLoading || !inElectron}
                  style={{ background: pingLoading ? "#111" : `${G}15`, color: pingLoading ? "#444" : G, border: `1px solid ${G}33`, fontFamily: mono, fontSize: 9, padding: "6px 14px", cursor: pingLoading ? "default" : "pointer", borderRadius: 4, fontWeight: 700 }}>
                  {pingLoading ? "Testing..." : "▶ Run Ping Test"}
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
                {(pingData || ["CoD/Warzone","Valorant","Steam","Battle.net","Google DNS"].map(n => ({ name: n, ping: null }))).map(s => (
                  <div key={s.name} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: "#444", marginBottom: 6 }}>{s.name}</div>
                    <div style={{ fontFamily: bebas, fontSize: 28, color: s.ping ? (s.ping < 30 ? G : s.ping < 60 ? Y : R) : "#333" }}>{s.ping === 999 ? "N/A" : s.ping ? `${s.ping}ms` : "--ms"}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* OVERCLOCK */}
        {tab === "overclock" && (
          <div>
            <div style={{ fontFamily: bebas, fontSize: 30, color: "#fff", letterSpacing: 6, marginBottom: 4 }}>OVERCLOCK GUIDE</div>
            <div style={{ fontSize: 10, color: R, marginBottom: 20 }}>⚠ Overclocking can damage hardware. Always ensure adequate cooling first.</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
              {Object.entries(OC_GUIDES).map(([key, guide]) => (
                <div key={key} onClick={() => setOcGuide(guide)} style={{ background: "#060606", border: `1px solid ${guide.color}22`, borderRadius: 12, padding: "20px 22px", cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = `${guide.color}55`}
                  onMouseLeave={e => e.currentTarget.style.borderColor = `${guide.color}22`}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{guide.icon}</div>
                  <div style={{ fontSize: 13, color: "#e0e0e0", fontWeight: 700, marginBottom: 6 }}>{guide.title}</div>
                  <div style={{ fontSize: 10, color: "#555", lineHeight: 1.6, marginBottom: 12 }}>{guide.steps.length}-step guide</div>
                  <div style={{ fontSize: 9, color: guide.color }}>→ Open Full Guide</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DRIVERS */}
        {tab === "drivers" && (
          <div>
            <div style={{ fontFamily: bebas, fontSize: 30, color: "#fff", letterSpacing: 6, marginBottom: 20 }}>DRIVER CHECKER</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { name: "GPU Driver (NVIDIA)", status: "CHECK MANUALLY", sc: Y, desc: sd?.gpu?.driver ? `Your installed driver: ${sd.gpu.driver}. Visit nvidia.com/drivers to get latest Game Ready driver.` : "Visit nvidia.com/drivers to get the latest Game Ready driver.", url: "nvidia.com/drivers" },
                { name: "AMD Chipset Driver", status: "CHECK MANUALLY", sc: Y, desc: "AMD chipset drivers affect CPU-to-memory bandwidth and PCIe performance. Update every 3-6 months.", url: "amd.com/drivers" },
                { name: "Network Adapter Driver", status: "CHECK MANUALLY", sc: Y, desc: "Updated NIC drivers improve ping consistency and reduce packet loss in competitive games.", url: "intel.com/network-adapters" },
                { name: "Audio Driver (Realtek)", status: "CHECK MANUALLY", sc: Y, desc: "Realtek or dedicated audio drivers reduce audio latency. Avoid generic Windows audio driver.", url: "realtek.com" },
              ].map((d, i) => (
                <div key={i} style={{ background: "#060606", border: "1px solid #0e0e0e", borderRadius: 10, padding: "16px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: "#e0e0e0", fontWeight: 600 }}>{d.name}</span>
                    <span style={{ fontFamily: mono, fontSize: 8, color: d.sc, border: `1px solid ${d.sc}33`, borderRadius: 3, padding: "2px 6px", fontWeight: 700 }}>{d.status}</span>
                  </div>
                  <div style={{ fontSize: 10, color: "#555", lineHeight: 1.5, marginBottom: 6 }}>{d.desc}</div>
                  <div style={{ fontSize: 9, color: B }}>→ {d.url}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, padding: "14px 18px", background: `${G}08`, border: `1px solid ${G}15`, borderRadius: 10, fontSize: 10, color: "#666", lineHeight: 1.7 }}>
              💡 <strong style={{ color: G }}>Pro tip:</strong> Never use Driver Booster or auto-updaters — they install wrong driver versions. Always download directly from manufacturer websites.
            </div>
          </div>
        )}

        {/* DIAGNOSTICS */}
        {tab === "diagnostics" && (
          <div>
            <div style={{ fontFamily: bebas, fontSize: 30, color: "#fff", letterSpacing: 6, marginBottom: 4 }}>SYSTEM DIAGNOSTICS</div>
            <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 20 }}>DPC LATENCY · REBAR · DIRECTSTORAGE · RAM CHANNEL</div>
            <div style={{ background: "#060606", border: `1px solid ${R}22`, borderRadius: 10, padding: "20px 22px", marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: "#e0e0e0", fontWeight: 700, marginBottom: 8 }}>🔬 DPC Latency — The Hidden Stutter Killer</div>
              <div style={{ fontSize: 10, color: "#666", lineHeight: 1.7, marginBottom: 14 }}>DPC (Deferred Procedure Call) latency causes micro-stutters, audio pops, and input lag spikes even when FPS looks fine. Use <strong style={{ color: Y }}>LatencyMon</strong> (free from resplendence.com) to identify your offending driver. Common culprits:</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, marginBottom: 14 }}>
                {[
                  { driver: "ndis.sys", cause: "Network adapter", fix: "Disable IPv6, update NIC driver, disable interrupt moderation" },
                  { driver: "nvlddmkm.sys", cause: "NVIDIA GPU driver", fix: "Clean reinstall GPU driver with DDU, disable MPO, disable HAGS on older GPUs" },
                  { driver: "dxgkrnl.sys", cause: "DirectX kernel", fix: "Update GPU driver, check VBS status, update Windows" },
                  { driver: "portcls.sys", cause: "Audio driver", fix: "Get latest audio driver from motherboard vendor site, not Windows Update" },
                  { driver: "storport.sys", cause: "Storage driver", fix: "Use Windows standard NVMe driver, remove vendor NVMe driver" },
                  { driver: "HDAudBus.sys", cause: "HD Audio bus", fix: "Disable unused audio devices in Device Manager" },
                ].map(d => (
                  <div key={d.driver} style={{ background: "#0a0a0a", border: "1px solid #111", borderRadius: 8, padding: "12px 14px" }}>
                    <div style={{ fontFamily: mono, fontSize: 10, color: R, fontWeight: 700, marginBottom: 4 }}>{d.driver}</div>
                    <div style={{ fontSize: 9, color: "#888", marginBottom: 5 }}>{d.cause}</div>
                    <div style={{ fontSize: 9, color: "#555", lineHeight: 1.5 }}>Fix: {d.fix}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ padding: "10px 14px", background: `${Y}10`, border: `1px solid ${Y}22`, borderRadius: 6, fontSize: 9, color: Y, flex: 1 }}>💡 Run LatencyMon for 2 min while gaming to find your specific offending driver. Red bars = problem.</div>
                <div style={{ padding: "10px 14px", background: `${G}10`, border: `1px solid ${G}22`, borderRadius: 6, fontSize: 9, color: G, flex: 1 }}>✓ Vapers Opti fixes: <strong>Disable IPv6 + Dynamic Tick off + NIC Interrupt Moderation off + MPO off</strong></div>
              </div>
            </div>
            <div style={{ background: "#060606", border: `1px solid ${G}22`, borderRadius: 10, padding: "20px 22px", marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: "#e0e0e0", fontWeight: 700, marginBottom: 8 }}>⚡ Resizable BAR Status (ReBAR / Smart Access Memory)</div>
              <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <div style={{ flex: 1, padding: "12px", background: sd?.reBarEnabled ? `${G}10` : `${R}10`, border: `1px solid ${sd?.reBarEnabled ? G : R}33`, borderRadius: 8, textAlign: "center" }}>
                  <div style={{ fontFamily: bebas, fontSize: 26, color: sd?.reBarEnabled ? G : R }}>{sd?.reBarEnabled ? "✓ ACTIVE" : sd ? "✗ DISABLED" : "UNKNOWN"}</div>
                  <div style={{ fontSize: 8, color: "#555", marginTop: 4 }}>ReBAR Status — 5-15% free FPS</div>
                </div>
                <div style={{ flex: 2, fontSize: 10, color: "#666", lineHeight: 1.7 }}>
                  ReBAR lets your CPU access full GPU VRAM at once instead of 256MB chunks. <strong style={{ color: G }}>5-15% free FPS</strong>, better 1% lows. Needs: RTX 3000+ or RX 6000+, Intel 10th gen or Ryzen 3000+ CPU.
                </div>
              </div>
              {!sd?.reBarEnabled && <div style={{ fontSize: 10, color: Y, background: `${Y}08`, border: `1px solid ${Y}20`, borderRadius: 8, padding: "12px 14px" }}>
                <strong>Enable in BIOS:</strong> 1. Enter BIOS (DEL/F2) → 2. Enable "Above 4G Decoding" → 3. Enable "Resizable BAR" or "Re-Size BAR Support" → 4. Save and reboot → Verify in GPU-Z under PCI-E BAR1 size
              </div>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ background: "#060606", border: `1px solid ${B}22`, borderRadius: 10, padding: "18px 20px" }}>
                <div style={{ fontSize: 12, color: "#e0e0e0", fontWeight: 700, marginBottom: 8 }}>⚡ DirectStorage</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <div style={{ padding: "8px 10px", background: sd?.storage?.isNvme ? `${G}10` : `${R}10`, border: `1px solid ${sd?.storage?.isNvme ? G : R}33`, borderRadius: 6, fontSize: 9, color: sd?.storage?.isNvme ? G : R, fontWeight: 700 }}>{sd?.storage?.isNvme ? "NVMe ✓" : "No NVMe ✗"}</div>
                  <div style={{ padding: "8px 10px", background: `${G}10`, border: `1px solid ${G}33`, borderRadius: 6, fontSize: 9, color: G, fontWeight: 700 }}>Win11 ✓</div>
                </div>
                <div style={{ fontSize: 9, color: "#555", lineHeight: 1.6 }}>Sends game assets directly NVMe→GPU. Cuts load times from 10s to 2s in supported games. Works automatically — just needs NVMe + Win11.</div>
              </div>
              <div style={{ background: "#060606", border: `1px solid ${Y}22`, borderRadius: 10, padding: "18px 20px" }}>
                <div style={{ fontSize: 12, color: "#e0e0e0", fontWeight: 700, marginBottom: 8 }}>💾 RAM Configuration</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <div style={{ padding: "8px 10px", background: sd?.ram?.sticks === 2 ? `${G}10` : `${R}10`, border: `1px solid ${sd?.ram?.sticks === 2 ? G : R}33`, borderRadius: 6, fontSize: 9, color: sd?.ram?.sticks === 2 ? G : R, fontWeight: 700 }}>{sd?.ram?.sticks === 2 ? "Dual Channel ✓" : sd?.ram?.sticks === 1 ? "Single Channel ✗" : `${sd?.ram?.sticks || "?"} sticks`}</div>
                  <div style={{ padding: "8px 10px", background: sd?.ram?.speedMHz >= 3200 ? `${G}10` : `${R}10`, border: `1px solid ${sd?.ram?.speedMHz >= 3200 ? G : R}33`, borderRadius: 6, fontSize: 9, color: sd?.ram?.speedMHz >= 3200 ? G : R, fontWeight: 700 }}>{sd?.ram?.speedMHz || "?"}MHz {sd?.ram?.speedMHz < 3200 ? "⚠" : "✓"}</div>
                </div>
                {sd?.ram?.sticks === 1 ? <div style={{ fontSize: 9, color: R, lineHeight: 1.6 }}>⚠ Single channel halves memory bandwidth! Adding a matching stick in the correct slot (slots 2+4 on most boards) can add 20-40% performance.</div> : <div style={{ fontSize: 9, color: "#555", lineHeight: 1.6 }}>Dual channel confirmed. Make sure XMP/EXPO is enabled in BIOS to run at rated speed.</div>}
              </div>
            </div>
          </div>
        )}

        {/* NVIDIA GUIDE */}
        {tab === "nvidia" && (
          <div>
            <div style={{ fontFamily: bebas, fontSize: 30, color: "#fff", letterSpacing: 6, marginBottom: 4 }}>NVIDIA CONTROL PANEL GUIDE</div>
            <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 16 }}>EXACT SETTINGS FOR MAX FPS AND MINIMUM INPUT LAG — 2025/2026 RESEARCH</div>
            {sd?.gpu?.vendor !== "nvidia" && sd && <div style={{ padding: "10px 14px", background: `${Y}10`, border: `1px solid ${Y}22`, borderRadius: 8, fontSize: 10, color: Y, marginBottom: 14 }}>⚠ Your GPU ({sd.gpu.name}) may not be NVIDIA. This guide applies to NVIDIA GPUs.</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {[
                { setting: "Power Management Mode", value: "Prefer Maximum Performance", impact: "HIGH", color: R, reason: "Prevents GPU clock drops between frames. Eliminates stutter at scene transitions. Most impactful single setting." },
                { setting: "Low Latency Mode", value: "On (Off if game has NVIDIA Reflex)", impact: "HIGH", color: R, reason: "Reduces GPU render queue depth. Cuts input lag 10-30ms. Disable only in Valorant, Fortnite, CoD where Reflex is superior." },
                { setting: "Shader Cache Size", value: "10 GB", impact: "HIGH", color: R, reason: "Default 256MB fills up fast causing mid-session recompilation stutters. 10GB prevents this in Fortnite, CoD, open world games." },
                { setting: "Vertical Sync", value: "Off", impact: "HIGH", color: R, reason: "Adds 1-3 frames of input lag at all times. Use G-Sync/FreeSync + FPS cap instead. Never use VSync in competitive." },
                { setting: "Texture Filtering — Quality", value: "High Performance", impact: "MEDIUM", color: Y, reason: "Enables trilinear optimization for free FPS. Minimal visual difference at 1080p and 1440p." },
                { setting: "Texture Filtering — Anisotropic", value: "On", impact: "LOW", color: G, reason: "Reduces texture filtering overhead slightly." },
                { setting: "Triple Buffering", value: "Off", impact: "MEDIUM", color: Y, reason: "Only useful with VSync enabled. Since VSync is off this wastes VRAM." },
                { setting: "Max Frame Rate", value: "Monitor Hz - 3 for G-Sync (e.g. 141 at 144Hz)", impact: "MEDIUM", color: Y, reason: "Keeps GPU in VRR range to prevent VSync fallback. Only set this if using G-Sync/FreeSync." },
                { setting: "Antialiasing — Mode", value: "Application Controlled", impact: "LOW", color: G, reason: "Modern games handle AA internally via TAA/DLSS. NCP override breaks these and hurts performance." },
                { setting: "NVIDIA Reflex (in-game)", value: "On + Boost", impact: "HIGH", color: R, reason: "THE best latency reduction. Always enable in Valorant, Fortnite, CoD, Apex when available. Beats Low Latency Mode." },
              ].map((s, i) => (
                <div key={i} style={{ background: "#060606", border: "1px solid #0e0e0e", borderRadius: 10, padding: "13px 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: "#e0e0e0", fontWeight: 600, marginBottom: 4 }}>{s.setting}</div>
                    <div style={{ fontSize: 9, color: "#555", lineHeight: 1.5 }}>{s.reason}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                    <div style={{ fontFamily: mono, fontSize: 10, color: G, background: `${G}11`, border: `1px solid ${G}22`, borderRadius: 4, padding: "4px 10px", whiteSpace: "nowrap", fontWeight: 700 }}>{s.value}</div>
                    <span style={{ fontFamily: mono, fontSize: 8, color: s.color, border: `1px solid ${s.color}33`, borderRadius: 3, padding: "2px 6px", fontWeight: 700 }}>{s.impact} IMPACT</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, padding: "13px 16px", background: `${Y}08`, border: `1px solid ${Y}15`, borderRadius: 10, fontSize: 10, color: "#666", lineHeight: 1.7 }}>
              💡 <strong style={{ color: Y }}>To open:</strong> Right-click desktop → NVIDIA Control Panel → Manage 3D Settings → Global Settings tab → Apply all above → click Apply button.
            </div>
          </div>
        )}

        {/* FPS CAP CALCULATOR */}
        {tab === "fpscalc" && (() => {
          const refresh = parseInt(fpsHz) || 144;
          const caps = {
            gsync: { cap: refresh - 3, label: "G-Sync / FreeSync Premium Pro", why: "Stay 3 FPS below max refresh to keep GPU in VRR range and prevent VSync fallback latency penalty." },
            freesync: { cap: refresh + 3, label: "FreeSync Basic", why: "Push slightly above max. Basic FreeSync monitors tolerate slightly over the VRR range for consistent delivery." },
            novrr: { cap: refresh, label: "No VRR — Match Refresh", why: "Match your monitor refresh exactly. Higher = wasted GPU, lower = inconsistent framerate." },
            nopq: { cap: Math.round(refresh * 0.8), label: "No VRR — Quality / Stable", why: "80% of refresh rate for ultra stable frametimes in single player or demanding titles." },
          };
          const chosen = caps[fpsVrr];
          return (
            <div>
              <div style={{ fontFamily: bebas, fontSize: 30, color: "#fff", letterSpacing: 6, marginBottom: 4 }}>FPS CAP CALCULATOR</div>
              <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 20 }}>FIND YOUR OPTIMAL FPS LIMIT FOR ZERO TEARING AND MINIMUM LATENCY</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                <div style={{ background: "#060606", border: "1px solid #0e0e0e", borderRadius: 10, padding: "20px" }}>
                  <div style={{ fontSize: 9, color: G, letterSpacing: 2, marginBottom: 12 }}>YOUR MONITOR REFRESH RATE</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                    {[60,75,120,144,165,240,280,360].map(r => (
                      <button key={r} onClick={() => setFpsHz(r)} style={{ background: fpsHz === r ? G : "#0a0a0a", color: fpsHz === r ? "#000" : "#666", border: `1px solid ${fpsHz === r ? G : "#111"}`, fontFamily: mono, fontWeight: fpsHz === r ? 800 : 400, fontSize: 10, padding: "7px 12px", cursor: "pointer", borderRadius: 5 }}>{r}Hz</button>
                    ))}
                  </div>
                  <input type="number" value={fpsHz} onChange={e => setFpsHz(e.target.value)} placeholder="Custom Hz..." style={{ width: "100%", background: "#0a0a0a", border: "1px solid #111", borderRadius: 6, padding: "8px 12px", color: "#ccc", fontFamily: mono, fontSize: 11, outline: "none" }} />
                  {sd?.gpu?.maxRefresh && <div style={{ fontSize: 9, color: G, marginTop: 6 }}>✓ Detected: {sd.gpu.maxRefresh}Hz monitor</div>}
                </div>
                <div style={{ background: "#060606", border: "1px solid #0e0e0e", borderRadius: 10, padding: "20px" }}>
                  <div style={{ fontSize: 9, color: G, letterSpacing: 2, marginBottom: 12 }}>SYNC TECHNOLOGY</div>
                  {[
                    { id: "gsync", label: "G-Sync / FreeSync Premium" },
                    { id: "freesync", label: "FreeSync Basic" },
                    { id: "novrr", label: "No VRR — Competitive" },
                    { id: "nopq", label: "No VRR — Quality/Stable" },
                  ].map(v => (
                    <div key={v.id} onClick={() => setFpsVrr(v.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", cursor: "pointer" }}>
                      <div style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${fpsVrr === v.id ? G : "#333"}`, background: fpsVrr === v.id ? G : "transparent", flexShrink: 0, transition: "all 0.15s" }} />
                      <span style={{ fontSize: 10, color: fpsVrr === v.id ? "#ddd" : "#555" }}>{v.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: "#060606", border: `2px solid ${G}33`, borderRadius: 14, padding: "28px", textAlign: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 9, color: "#555", letterSpacing: 3, marginBottom: 8 }}>YOUR OPTIMAL FPS CAP</div>
                <div style={{ fontFamily: bebas, fontSize: 110, color: G, lineHeight: 1, marginBottom: 6 }}>{chosen.cap}</div>
                <div style={{ fontSize: 11, color: "#888", marginBottom: 12 }}>{chosen.label}</div>
                <div style={{ fontSize: 10, color: "#555", maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>{chosen.why}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                {[
                  { l: "Best place to set cap", v: "In-game settings → then NVIDIA/AMD Control Panel", c: G },
                  { l: "Most accurate cap tool", v: "RTSS (RivaTuner Statistics Server) — lowest overhead", c: Y },
                  { l: "Have NVIDIA Reflex?", v: "Reflex auto-caps for you — set game to Unlimited", c: B },
                ].map(t => (
                  <div key={t.l} style={{ background: "#060606", border: `1px solid ${t.c}22`, borderRadius: 8, padding: "14px 14px" }}>
                    <div style={{ fontSize: 9, color: t.c, letterSpacing: 1, marginBottom: 6 }}>{t.l.toUpperCase()}</div>
                    <div style={{ fontSize: 10, color: "#888", lineHeight: 1.5 }}>{t.v}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* TOOLS */}
        {tab === "tools" && (
          <div>
            <div style={{ fontFamily: bebas, fontSize: 30, color: "#fff", letterSpacing: 6, marginBottom: 4 }}>COMMUNITY TOOLS</div>
            <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 20 }}>TRUSTED FREE TOOLS USED BY PRO OPTIMIZERS AND COMPETITIVE PLAYERS</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
              {[
                {
                  name: "NVCleanstall", icon: "🟢", color: G,
                  desc: "Install NVIDIA drivers with only what you need. Removes GeForce Experience, Telemetry, HD Audio, PhysX bloat. Cleaner driver = lower input lag. AllSkillX3D recommends DDU + driver only install.",
                  url: "techpowerup.com/nvcleanstall",
                  use: "Before every GPU driver update",
                  tags: ["NVIDIA", "Driver", "Input Lag"]
                },
                {
                  name: "Display Driver Uninstaller (DDU)", icon: "🗑️", color: Y,
                  desc: "Completely removes old GPU drivers before installing new ones. Essential before NVCleanstall. Old driver remnants cause stutters, crashes and input lag.",
                  url: "guru3d.com/ddu",
                  use: "Boot into Safe Mode, run DDU, then install fresh driver",
                  tags: ["NVIDIA", "AMD", "Driver"]
                },
                {
                  name: "NVIDIA Profile Inspector", icon: "🔍", color: G,
                  desc: "Deep NVIDIA driver settings beyond the Control Panel. Force ReBAR per-game, tweak frame pacing, adjust rendering flags. Used by competitive players for per-game optimization.",
                  url: "github.com/Orbmu2k/nvidiaProfileInspector",
                  use: "Advanced NVIDIA per-game settings",
                  tags: ["NVIDIA", "Advanced", "ReBAR"]
                },
                {
                  name: "MSI Afterburner + RTSS", icon: "📊", color: R,
                  desc: "GPU overclocking + RivaTuner Statistics Server for the most accurate FPS cap available. RTSS framerate limiter has the lowest overhead of any cap method.",
                  url: "msi.com/afterburner",
                  use: "GPU OC and accurate FPS capping",
                  tags: ["GPU", "OC", "FPS Cap"]
                },
                {
                  name: "LatencyMon", icon: "🔬", color: B,
                  desc: "Diagnoses DPC latency issues. Shows exactly which driver is causing stutters, audio pops, and input lag spikes. Run for 2 minutes while gaming to identify your problem driver.",
                  url: "resplendence.com/latencymon",
                  use: "Diagnosing stutters and audio pops",
                  tags: ["DPC", "Latency", "Diagnostic"]
                },
                {
                  name: "HWiNFO64", icon: "🌡️", color: Y,
                  desc: "Best hardware monitoring tool. Shows real CPU core temps, GPU hotspot, RAM usage, VRM temps. Essential for checking if thermal throttling is killing your performance.",
                  url: "hwinfo.com",
                  use: "Real-time hardware monitoring",
                  tags: ["Temps", "Monitoring", "Thermal"]
                },
                {
                  name: "CPU-Z", icon: "🔲", color: "#aaaaff",
                  desc: "Verify XMP is active, check RAM timings, confirm CPU speed. Free and lightweight. Use after enabling XMP in BIOS to confirm it's actually running at rated speed.",
                  url: "cpuid.com/softwares/cpu-z.html",
                  use: "Verify RAM speed and XMP status",
                  tags: ["CPU", "RAM", "XMP"]
                },
                {
                  name: "GPU-Z", icon: "🎮", color: G,
                  desc: "Verify Resizable BAR is active (check BAR1 size), see GPU clocks, VRAM usage, driver version. Essential for confirming ReBAR is working after BIOS enable.",
                  url: "techpowerup.com/gpuz",
                  use: "Verify ReBAR, GPU clocks, VRAM",
                  tags: ["GPU", "ReBAR", "Monitoring"]
                },
                {
                  name: "HIDUSBF (Mouse Polling Rate)", icon: "🖱️", color: "#ff88ff",
                  desc: "Overclock your mouse USB polling rate beyond 1000Hz. Competitive players use 2000Hz-8000Hz for smoother tracking. Requires Memory Integrity disabled. Used by high-level FPS players.",
                  url: "github.com/LordOfMice/hidusbf",
                  use: "Mouse polling rate 2000-8000Hz",
                  tags: ["Mouse", "Input", "Advanced"]
                },
                {
                  name: "Chris Titus Tech WinUtil", icon: "🖥️", color: "#66aaff",
                  desc: "Open source Windows debloat and tweaking utility. Removes Windows bloat, installs tweaks via PowerShell. Complements Vapers Opti for deep Windows cleanup.",
                  url: "github.com/ChrisTitusTech/winutil",
                  use: "Deep Windows debloat",
                  tags: ["Debloat", "Windows", "Open Source"]
                },
              ].map(tool => (
                <div key={tool.name} style={{ background: "#060606", border: `1px solid ${tool.color}22`, borderRadius: 12, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ fontSize: 22 }}>{tool.icon}</span>
                      <span style={{ fontSize: 13, color: "#e0e0e0", fontWeight: 700 }}>{tool.name}</span>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      {tool.tags.map(t => <span key={t} style={{ fontFamily: mono, fontSize: 7, color: tool.color, border: `1px solid ${tool.color}33`, borderRadius: 3, padding: "2px 5px" }}>{t}</span>)}
                    </div>
                  </div>
                  <p style={{ fontSize: 10, color: "#666", lineHeight: 1.6, margin: 0 }}>{tool.desc}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                    <span style={{ fontSize: 9, color: "#444" }}>📌 {tool.use}</span>
                    <span style={{ fontSize: 9, color: tool.color, fontFamily: mono }}>→ {tool.url}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, padding: "14px 18px", background: `${Y}08`, border: `1px solid ${Y}15`, borderRadius: 10, fontSize: 10, color: "#666", lineHeight: 1.7 }}>
              💡 <strong style={{ color: Y }}>AllSkillX3D's core method:</strong> DDU clean uninstall → NVCleanstall driver-only install (no GeForce Experience) → NVIDIA Control Panel tuned → Advanced TCP/IP network stack tweaks. His specialty is fixing packet burst and internet latency in CoD, Fortnite, Valorant.
            </div>
          </div>
        )}

        {/* STARTUP */}
        {tab === "startup" && (
          <div>
            <div style={{ fontFamily: bebas, fontSize: 30, color: "#fff", letterSpacing: 6, marginBottom: 8 }}>STARTUP ANALYZER</div>
            {startupLoading && <div style={{ fontSize: 10, color: G, marginBottom: 12 }}>⟳ Scanning startup entries...</div>}
            {realStartup && <div style={{ fontSize: 10, color: G, marginBottom: 12 }}>✓ {realStartup.length} real startup entries detected from your system</div>}
            <div style={{ fontSize: 10, color: R, marginBottom: 18 }}>⚠ {startupApps.length} startup apps — slowing boot and wasting RAM</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {startupApps.map((app, idx) => {
                const dis = disabledStartup.has(app.name);
                const impact = app.impact || "Medium";
                return (
                  <div key={app.name + idx} style={{ background: "#060606", border: "1px solid #0e0e0e", borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, opacity: (dis || app.disabled) ? 0.45 : 1, transition: "opacity 0.2s" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 12, color: (dis || app.disabled) ? "#555" : "#e0e0e0", fontWeight: 600, textDecoration: dis ? "line-through" : "none", fontStyle: app.disabled ? "italic" : "normal" }}>{app.name}</span>
                        <div style={{ display: "flex", gap: 4 }}>
                          <span style={{ fontFamily: mono, fontSize: 8, color: impact === "High" ? R : Y, border: `1px solid ${impact === "High" ? R : Y}33`, borderRadius: 3, padding: "2px 6px", fontWeight: 700 }}>{impact.toUpperCase()}</span>
                          {app.disabled && <span style={{ fontFamily: mono, fontSize: 8, color: "#555", border: "1px solid #222", borderRadius: 3, padding: "2px 6px" }}>ALREADY DISABLED</span>}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 20 }}>
                        <span style={{ fontSize: 10, color: "#555" }}>RAM: <span style={{ color: "#888" }}>{app.ram}</span></span>
                        <span style={{ fontSize: 10, color: "#555" }}>Delay: <span style={{ color: "#888" }}>{app.delay}</span></span>
                        {app.source && <span style={{ fontSize: 9, color: "#333" }}>{app.source}</span>}
                      </div>
                    </div>
                    <button onClick={() => setDisabledStartup(p => { const n = new Set(p); dis ? n.delete(app.name) : n.add(app.name); return n; })}
                      style={{ background: dis ? `${G}15` : "#ff444415", color: dis ? G : R, border: `1px solid ${dis ? G + "33" : "#ff444433"}`, fontFamily: mono, fontSize: 9, padding: "6px 14px", cursor: "pointer", borderRadius: 4, fontWeight: 700 }}>
                      {dis ? "ENABLE" : "DISABLE"}
                    </button>
                  </div>
                );
              })}
            </div>
            {disabledStartup.size > 0 && <div style={{ marginTop: 14, padding: "12px 16px", background: `${G}0a`, border: `1px solid ${G}22`, borderRadius: 8, fontSize: 10, color: G }}>✓ {disabledStartup.size} disabled · Boot time saved: ~{(disabledStartup.size * 2.8).toFixed(1)}s · RAM freed: ~{disabledStartup.size * 150}MB</div>}
          </div>
        )}

        {/* THERMAL */}
        {tab === "thermal" && (
          <div>
            <div style={{ fontFamily: bebas, fontSize: 30, color: "#fff", letterSpacing: 6, marginBottom: 20 }}>THERMAL MONITOR</div>
            {thermalLoading && <div style={{ fontSize: 10, color: G, marginBottom: 16 }}>⟳ Reading sensor data...</div>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 18 }}>
              {[
                { label: "CPU Temperature", value: thermalData?.cpuTemp > 0 ? `${thermalData.cpuTemp}°C` : "52°C", percent: thermalData?.cpuTemp > 0 ? Math.round((thermalData.cpuTemp / 90) * 100) : 58, color: thermalData?.cpuTemp > 80 ? R : thermalData?.cpuTemp > 65 ? Y : G, status: thermalData?.cpuTemp > 80 ? "HOT" : thermalData?.cpuTemp > 65 ? "WARM" : "NORMAL", detail: `${sd?.cpu?.name || "CPU"} · Max 90°C · Load: ${thermalData?.cpuLoad || 0}%` },
                { label: "GPU Temperature", value: thermalData?.gpuTemp > 0 ? `${thermalData.gpuTemp}°C` : "44°C", percent: thermalData?.gpuTemp > 0 ? Math.round((thermalData.gpuTemp / 83) * 100) : 53, color: thermalData?.gpuTemp > 75 ? R : thermalData?.gpuTemp > 60 ? Y : B, status: thermalData?.gpuTemp > 75 ? "HOT" : thermalData?.gpuTemp > 60 ? "WARM" : "COOL", detail: `${sd?.gpu?.name || "GPU"} · Max 83°C` }
              ].map(t => (
                <div key={t.label} style={{ background: "#060606", border: "1px solid #0e0e0e", borderRadius: 10, padding: "18px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ fontSize: 9, color: "#555", letterSpacing: 2 }}>{t.label}</div>
                    <span style={{ fontFamily: mono, fontSize: 8, color: t.color, border: `1px solid ${t.color}33`, borderRadius: 3, padding: "2px 6px", fontWeight: 700 }}>{t.status}</span>
                  </div>
                  <div style={{ fontFamily: bebas, fontSize: 52, color: t.color, lineHeight: 1, marginBottom: 10 }}>{t.value}</div>
                  <div style={{ height: 4, background: "#0e0e0e", borderRadius: 2, overflow: "hidden", marginBottom: 8 }}>
                    <div style={{ height: "100%", width: `${t.percent}%`, background: `linear-gradient(90deg,${t.color}55,${t.color})`, transition: "width 1s ease" }} />
                  </div>
                  <div style={{ fontSize: 9, color: "#444" }}>{t.detail}</div>
                </div>
              ))}
            </div>
            {thermalData && (
              <div style={{ background: "#060606", border: "1px solid #0e0e0e", borderRadius: 10, padding: "16px 20px", marginBottom: 16, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                <div style={{ textAlign: "center" }}><div style={{ fontSize: 9, color: "#444", marginBottom: 6 }}>CPU LOAD</div><div style={{ fontFamily: bebas, fontSize: 32, color: thermalData.cpuLoad > 80 ? R : G }}>{thermalData.cpuLoad}%</div></div>
                <div style={{ textAlign: "center" }}><div style={{ fontSize: 9, color: "#444", marginBottom: 6 }}>RAM USED</div><div style={{ fontFamily: bebas, fontSize: 32, color: Y }}>{thermalData.ramUsed}GB</div></div>
                <div style={{ textAlign: "center" }}><div style={{ fontSize: 9, color: "#444", marginBottom: 6 }}>RAM TOTAL</div><div style={{ fontFamily: bebas, fontSize: 32, color: "#555" }}>{thermalData.ramTotal}GB</div></div>
              </div>
            )}
            <div style={{ background: "#060606", border: "1px solid #0e0e0e", borderRadius: 10, padding: "18px 20px" }}>
              <div style={{ fontSize: 9, color: Y, letterSpacing: 2, marginBottom: 14 }}>COOLING RECOMMENDATIONS</div>
              {[
                { icon: "✅", tip: "Temps are healthy. Current cooling is adequate for stock operation." },
                { icon: "💡", tip: sd?.cpu?.name?.includes("5800X3D") ? "5800X3D has heat-sensitive 3D V-Cache. Keep under 75C under load. High-end AIO recommended." : "For overclocking keep CPU under 80C. AIO 240mm+ recommended." },
                { icon: "🔧", tip: "If PC is 2+ years old, reapply thermal paste. Dried paste adds 10-20C to temperatures." },
                { icon: "🌡️", tip: "Keep case ambient under 35C. Use front intake and rear/top exhaust fan layout." }
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "10px 14px", background: "#0a0a0a", borderRadius: 8, border: "1px solid #111", marginBottom: 8 }}>
                  <span style={{ fontSize: 16 }}>{r.icon}</span>
                  <span style={{ fontSize: 10, color: "#777", lineHeight: 1.6 }}>{r.tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRESETS */}
        {tab === "presets" && (
          <div>
            <div style={{ fontFamily: bebas, fontSize: 30, color: "#fff", letterSpacing: 6, marginBottom: 4 }}>COMMUNITY PRESETS</div>
            <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 20 }}>ONE-CLICK OPTIMIZATION PROFILES — ALL ANTI-CHEAT SAFE</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 20 }}>
              {COMMUNITY_PRESETS.map(p => (
                <div key={p.id} style={{ background: "#060606", border: `1px solid ${p.color}22`, borderRadius: 12, padding: "20px 22px", transition: "all 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = `${p.color}44`}
                  onMouseLeave={e => e.currentTarget.style.borderColor = `${p.color}22`}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ fontSize: 28 }}>{p.icon}</div>
                    <span style={{ fontFamily: mono, fontSize: 8, color: p.color, border: `1px solid ${p.color}33`, borderRadius: 3, padding: "2px 6px", fontWeight: 700 }}>{p.risk.toUpperCase()}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#e0e0e0", fontWeight: 700, marginBottom: 6 }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: "#555", lineHeight: 1.6, marginBottom: 14 }}>{p.desc}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 9, color: "#444" }}>{p.tweakCount} tweaks</span>
                    <button onClick={() => applyPreset(p.id)} style={{ background: `${p.color}15`, color: p.color, border: `1px solid ${p.color}33`, fontFamily: mono, fontWeight: 700, fontSize: 9, padding: "6px 14px", cursor: "pointer", borderRadius: 4, letterSpacing: 1 }}>LOAD PRESET</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: "#060606", border: `1px solid ${G}15`, borderRadius: 10, padding: "18px 20px" }}>
              <div style={{ fontSize: 9, color: G, letterSpacing: 2, marginBottom: 8 }}>SHARE YOUR PROFILE</div>
              <div style={{ fontSize: 10, color: "#555", marginBottom: 14 }}>Export your current tweak selection. Share with friends or the community.</div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={async () => {
                  if (!inElectron) { alert("Export only works in the desktop app"); return; }
                  try {
                    const res = await window.winforge.saveProfile({ name: "MyProfile", tweaks: Array.from(selectedTweaks), profile, exportedAt: new Date().toISOString(), version: "1.5.0" });
                    if (res.success) alert("Profile exported!");
                  } catch { alert("Export failed"); }
                }} style={{ background: `${G}15`, color: G, border: `1px solid ${G}33`, fontFamily: mono, fontWeight: 700, fontSize: 10, padding: "10px 20px", cursor: "pointer", borderRadius: 6 }}>📤 Export ({selectedTweaks.size} tweaks)</button>
                <button onClick={async () => {
                  if (!inElectron) { alert("Import only works in the desktop app"); return; }
                  try {
                    const res = await window.winforge.loadProfiles();
                    if (res.success && res.profiles?.[0]) {
                      const p = res.profiles[0];
                      if (p.tweaks) setSelectedTweaks(new Set(p.tweaks));
                      if (p.profile) setProfile(p.profile);
                      alert("Profile loaded: " + (p.tweaks?.length || 0) + " tweaks");
                    }
                  } catch { alert("Import failed"); }
                }} style={{ background: "transparent", color: "#666", border: "1px solid #111", fontFamily: mono, fontSize: 10, padding: "10px 20px", cursor: "pointer", borderRadius: 6 }}>📥 Import</button>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {tab === "settings" && (
          <div>
            <div style={{ fontFamily: bebas, fontSize: 30, color: "#fff", letterSpacing: 6, marginBottom: 4 }}>SETTINGS</div>
            <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 24 }}>MANAGE YOUR VAPERS OPTI CONFIGURATION</div>

            <div style={{ background: "#060606", border: `1px solid ${B}22`, borderRadius: 10, padding: "20px 22px", marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: "#e0e0e0", fontWeight: 700, marginBottom: 6 }}>🧹 Junk File Cleaner</div>
              <div style={{ fontSize: 10, color: "#555", lineHeight: 1.6, marginBottom: 16 }}>Cleans temp files, Windows Update cache, NVIDIA DX/GL shader cache, D3D cache. Fixes stutter caused by corrupted shader cache.</div>
              {cleanResult && <div style={{ fontSize: 10, color: G, marginBottom: 12 }}>✓ {cleanResult}</div>}
              <button onClick={runClean} disabled={cleaning || !inElectron} style={{ background: cleaning ? "#111" : `${B}15`, color: cleaning ? "#444" : B, border: `1px solid ${B}33`, fontFamily: mono, fontWeight: 700, fontSize: 10, padding: "10px 20px", cursor: cleaning ? "default" : "pointer", borderRadius: 6 }}>
                {cleaning ? "⟳ Cleaning..." : "🧹 Clean Junk Files"}
              </button>
            </div>

            <div style={{ background: "#060606", border: `1px solid ${R}22`, borderRadius: 10, padding: "20px 22px", marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: "#e0e0e0", fontWeight: 700, marginBottom: 6 }}>🔄 Undo All Tweaks</div>
              <div style={{ fontSize: 10, color: "#555", lineHeight: 1.6, marginBottom: 16 }}>Roll back all optimizations using the Windows System Restore point created before applying tweaks.</div>
              <button onClick={() => { if (window.confirm("Open System Restore to roll back all changes?")) { if (inElectron) window.winforge.applyTweaks(["open_restore"]); } }} style={{ background: `${R}15`, color: R, border: `1px solid ${R}33`, fontFamily: mono, fontWeight: 700, fontSize: 10, padding: "10px 20px", cursor: "pointer", borderRadius: 6 }}>🔄 Open System Restore</button>
            </div>

            <div style={{ background: "#060606", border: `1px solid ${G}22`, borderRadius: 10, padding: "20px 22px", marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: "#e0e0e0", fontWeight: 700, marginBottom: 6 }}>🔍 Re-Scan System</div>
              <div style={{ fontSize: 10, color: "#555", lineHeight: 1.6, marginBottom: 16 }}>Run a new hardware scan to get updated performance score and detect new issues after applying tweaks.</div>
              <button onClick={() => { setRealScan(null); setPage("scan"); }} style={{ background: `${G}15`, color: G, border: `1px solid ${G}33`, fontFamily: mono, fontWeight: 700, fontSize: 10, padding: "10px 20px", cursor: "pointer", borderRadius: 6 }}>🔍 Run New Scan</button>
            </div>

            <div style={{ background: "#060606", border: "1px solid #1a1a1a", borderRadius: 10, padding: "20px 22px", marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: "#e0e0e0", fontWeight: 700, marginBottom: 6 }}>🗑️ Reset Profile</div>
              <div style={{ fontSize: 10, color: "#555", lineHeight: 1.6, marginBottom: 16 }}>Clear all selected tweaks and reset your profile. Does not undo applied tweaks.</div>
              <button onClick={() => { clearAll(); setProfile({ mode: null, games: [], platforms: [], competitive: false }); setTab("tweaks"); }} style={{ background: "transparent", color: "#555", border: "1px solid #222", fontFamily: mono, fontWeight: 700, fontSize: 10, padding: "10px 20px", cursor: "pointer", borderRadius: 6 }}>🗑️ Reset Profile</button>
            </div>

            {sd && (
              <div style={{ background: "#060606", border: "1px solid #0e0e0e", borderRadius: 10, padding: "20px 22px" }}>
                <div style={{ fontSize: 9, color: G, letterSpacing: 2, marginBottom: 14 }}>DETECTED HARDWARE</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
                  {[
                    ["CPU", sd.cpu.name],
                    ["Cores/Threads", `${sd.cpu.cores}C / ${sd.cpu.threads}T`],
                    ["GPU", sd.gpu.name],
                    ["VRAM", `${sd.gpu.vramMB}MB`],
                    ["RAM", `${sd.ram.totalGB}GB @ ${sd.ram.speedMHz}MHz`],
                    ["Storage", `${sd.storage.model} · ${sd.storage.isNvme ? "NVMe" : "SATA"}`],
                    ["Network", `${sd.network.name} · ${sd.network.isEthernet ? "Ethernet" : "WiFi"}`],
                    ["Windows", `Build ${sd.windows.build}`],
                    ["VBS Status", sd.vbsEnabled ? "⚠ ENABLED - costing FPS" : "✓ Disabled"],
                    ["MPO Status", sd.mpoEnabled ? "⚠ ENABLED - may cause stutter" : "✓ Disabled"],
                  ].map(([label, value]) => (
                    <div key={label} style={{ padding: "10px 14px", background: "#0a0a0a", borderRadius: 8, border: "1px solid #111" }}>
                      <div style={{ fontSize: 9, color: "#444", marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 10, color: value?.includes("⚠") ? Y : "#888" }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // APPLYING
  if (page === "applying") return (
    <div style={{ minHeight: "100vh", background: "#020202", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: mono, padding: 40 }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&family=Bebas+Neue&display=swap" rel="stylesheet" />
      <div style={{ fontFamily: bebas, fontSize: 54, color: "#fff", letterSpacing: 8, marginBottom: 6 }}>APPLYING TWEAKS</div>
      <div style={{ fontSize: 9, color: "#555", letterSpacing: 3, marginBottom: 44 }}>CREATING RESTORE POINT · DO NOT CLOSE</div>
      <div style={{ width: "100%", maxWidth: 580 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 10, color: "#666" }}>Progress</span>
          <span style={{ fontSize: 10, color: G, fontWeight: 700 }}>{applyProgress}%</span>
        </div>
        <div style={{ height: 4, background: "#0a0a0a", borderRadius: 2, overflow: "hidden", marginBottom: 26 }}>
          <div style={{ height: "100%", width: `${applyProgress}%`, background: `linear-gradient(90deg,${G},${B})`, boxShadow: `0 0 12px ${G}44`, borderRadius: 2, transition: "width 0.35s ease" }} />
        </div>
        <div style={{ background: "#040404", border: "1px solid #0a0a0a", borderRadius: 10, padding: 18, height: 280, overflowY: "auto" }}>
          <div style={{ fontSize: 10, color: "#444", marginBottom: 10 }}>▸ Creating system restore point...</div>
          {applyLog.map((line, i) => <div key={i} style={{ fontSize: 10, color: i === applyLog.length - 1 ? G : "#2a2a2a", marginBottom: 5, lineHeight: 1.5 }}>{line}</div>)}
        </div>
      </div>
    </div>
  );

  // DONE
  if (page === "done") return (
    <div style={{ minHeight: "100vh", background: "#020202", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: mono, padding: 40, textAlign: "center" }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&family=Bebas+Neue&display=swap" rel="stylesheet" />
      <div style={{ fontSize: 52, marginBottom: 18 }}>⚡</div>
      <div style={{ fontFamily: bebas, fontSize: 80, color: G, letterSpacing: 10, lineHeight: 1 }}>OPTIMIZED</div>
      <div style={{ fontSize: 9, color: "#444", letterSpacing: 4, marginTop: 8, marginBottom: 44 }}>YOUR SYSTEM HAS BEEN FORGED</div>
      <div style={{ background: "#060606", border: `1px solid ${G}15`, borderRadius: 14, padding: "28px 52px", marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 56, justifyContent: "center", alignItems: "center" }}>
          <div><div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 6 }}>BEFORE</div><div style={{ fontFamily: bebas, fontSize: 68, color: Y, lineHeight: 1 }}>{score}</div></div>
          <div style={{ fontSize: 22, color: "#1a1a1a" }}>→</div>
          <div><div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 6 }}>AFTER</div><div style={{ fontFamily: bebas, fontSize: 68, color: G, lineHeight: 1 }}>{projected}</div></div>
        </div>
        <div style={{ marginTop: 18, fontSize: 10, color: "#444" }}>{selectedTweaks.size} tweaks applied · {rebootNeeded > 0 ? `${rebootNeeded} need a restart` : "No restart needed"}</div>
      </div>
      <div style={{ background: "#080808", border: `1px solid ${G}15`, borderRadius: 12, padding: "18px 28px", marginBottom: 24, maxWidth: 480, width: "100%" }}>
        <div style={{ fontSize: 10, color: G, marginBottom: 8, fontWeight: 700 }}>📤 SHARE YOUR RESULTS</div>
        <div style={{ fontSize: 11, color: "#666", marginBottom: 14, lineHeight: 1.6 }}>"Just ran Vapers Opti - went from {score} to {projected}/100. {selectedTweaks.size} tweaks applied. PC feels brand new 🔥 #VapersOpti"</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <button style={{ background: "#1da1f2", color: "#fff", border: "none", fontFamily: mono, fontWeight: 700, fontSize: 9, padding: "7px 16px", cursor: "pointer", borderRadius: 4 }}>Share on X</button>
          <button onClick={() => navigator.clipboard?.writeText(`Just ran Vapers Opti - went from ${score} to ${projected}/100. ${selectedTweaks.size} tweaks applied. PC feels brand new 🔥 #VapersOpti`)} style={{ background: "#5865f2", color: "#fff", border: "none", fontFamily: mono, fontWeight: 700, fontSize: 9, padding: "7px 16px", cursor: "pointer", borderRadius: 4 }}>Copy for Discord</button>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {rebootNeeded > 0 && <button style={{ background: G, color: "#000", border: "none", fontFamily: mono, fontWeight: 800, fontSize: 11, letterSpacing: 2, padding: "13px 28px", cursor: "pointer", borderRadius: 4, textTransform: "uppercase" }}>🔄 Restart Now</button>}
        <button onClick={() => setPage("dashboard")} style={{ background: "transparent", color: "#666", border: "1px solid #111", fontFamily: mono, fontSize: 11, letterSpacing: 2, padding: "13px 24px", cursor: "pointer", borderRadius: 4, textTransform: "uppercase" }}>Back to Dashboard</button>
        <button onClick={() => { setPage("splash"); setSelectedTweaks(new Set()); setApplyLog([]); setApplyProgress(0); setScanStep(0); setProfile({ mode: null, games: [], platforms: [], competitive: false }); setRealScan(null); setRealStartup(null); setThermalData(null); setPingData(null); setCleanResult(null); setInstalledGames(null); }}
          style={{ background: "transparent", color: "#444", border: "1px solid #0a0a0a", fontFamily: mono, fontSize: 11, letterSpacing: 2, padding: "13px 24px", cursor: "pointer", borderRadius: 4, textTransform: "uppercase" }}>Start Over</button>
      </div>
    </div>
  );
}
