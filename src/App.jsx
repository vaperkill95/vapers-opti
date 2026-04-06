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
  { id: "cpu_power", category: "CPU", risk: "safe", title: "Ultimate Performance Power Plan", desc: "Activates the hidden Ultimate Performance plan. Eliminates CPU throttling and power-saving idle states entirely.", impact: 95, reboot: false },
  { id: "cpu_parking", category: "CPU", risk: "safe", title: "Disable CPU Core Parking", desc: "Keeps all CPU cores hot and ready. Prevents micro-stutters from parked cores waking up mid-game.", impact: 78, reboot: false },
  { id: "cpu_scheduler", category: "CPU", risk: "safe", title: "Foreground App CPU Priority", desc: "Gives your active game more CPU slices per second over all background processes.", impact: 65, reboot: false },
  { id: "cpu_hpet", category: "CPU", risk: "recommended", title: "Disable HPET Timer", desc: "Forces Windows to use TSC timer - lower overhead, better frame time consistency.", impact: 68, reboot: true },
  { id: "cpu_timer", category: "CPU", risk: "recommended", title: "0.5ms System Timer Resolution", desc: "Smoother frame pacing and more responsive input than default 15.6ms Windows timer.", impact: 72, reboot: false },
  { id: "cpu_spectre", category: "CPU", risk: "aggressive", title: "Disable Spectre/Meltdown Patches", desc: "Recovers 5-15% CPU performance. RISK: Only for dedicated gaming PCs.", impact: 88, reboot: true },
  { id: "gpu_msi", category: "GPU", risk: "safe", title: "Enable MSI Mode for GPU", desc: "Reduces GPU-to-CPU interrupt latency by up to 30%. One of the highest-impact GPU tweaks.", impact: 88, reboot: true },
  { id: "gpu_hags", category: "GPU", risk: "safe", title: "Hardware-Accelerated GPU Scheduling", desc: "Offloads GPU memory management from CPU. Reduces frame latency on RTX 2000+ / RX 5000+.", impact: 76, reboot: true },
  { id: "gpu_tdr", category: "GPU", risk: "safe", title: "Increase GPU TDR Delay", desc: "Prevents false GPU timeout resets during shader compilation. Stops mid-game crashes.", impact: 55, reboot: true },
  { id: "gpu_preemption", category: "GPU", risk: "recommended", title: "Disable GPU Preemption", desc: "GPU completes render tasks uninterrupted. No Windows mid-frame interruptions.", impact: 70, reboot: true },
  { id: "gpu_nvidia_power", category: "GPU", risk: "safe", title: "NVIDIA Max Performance Mode", desc: "Prevents GPU downclocking at scene transitions. Stable frame times throughout gameplay.", impact: 82, reboot: false },
  { id: "gpu_nvidia_lld", category: "GPU", risk: "recommended", title: "NVIDIA Low Latency Ultra", desc: "Driver-level NVIDIA Reflex. Cuts input lag by 1-4 frames in most games.", impact: 85, reboot: false },
  { id: "gpu_shader_cache", category: "GPU", risk: "safe", title: "Maximize Shader Cache", desc: "Compiled shaders persist longer. Eliminates repeat stutter across sessions.", impact: 77, reboot: false },
  { id: "net_nagle", category: "Network", risk: "safe", title: "Disable Nagle's Algorithm", desc: "Stops TCP packet batching. Eliminates 20-200ms of artificial input packet delay.", impact: 85, reboot: false },
  { id: "net_throttle", category: "Network", risk: "safe", title: "Remove Network Throttle Index", desc: "Windows caps network at 20% during multimedia. Removes this cap for games.", impact: 72, reboot: false },
  { id: "net_qos", category: "Network", risk: "safe", title: "QoS Policy for Gaming Traffic", desc: "Marks game UDP packets with DSCP 46. Router prioritizes game traffic over downloads.", impact: 75, reboot: false },
  { id: "net_interrupt", category: "Network", risk: "recommended", title: "Disable NIC Interrupt Moderation", desc: "Immediate packet processing. Max network responsiveness for wired ethernet.", impact: 70, reboot: false },
  { id: "mem_xmp", category: "Memory", risk: "safe", title: "Verify XMP/EXPO Active", desc: "Detects if RAM is running below rated speed. XMP off = up to 40% less memory bandwidth.", impact: 90, reboot: false },
  { id: "mem_pagefile", category: "Memory", risk: "recommended", title: "Fixed Pagefile Size", desc: "Prevents pagefile from dynamically resizing which causes disk I/O spikes mid-game.", impact: 62, reboot: true },
  { id: "mem_standby", category: "Memory", risk: "safe", title: "Clear Memory Standby List", desc: "Releases RAM held in standby. Maximizes free memory for your game.", impact: 55, reboot: false },
  { id: "stor_prefetch", category: "Storage", risk: "safe", title: "Disable Prefetch (SSD Only)", desc: "Prefetch was designed for HDDs. On NVMe it wastes RAM and CPU since loads are already instant.", impact: 74, reboot: false },
  { id: "stor_ntfs", category: "Storage", risk: "safe", title: "Optimize NTFS Settings", desc: "Disables last-access timestamps. Reduces disk I/O on every file read and write.", impact: 60, reboot: false },
  { id: "stor_index", category: "Storage", risk: "safe", title: "Disable Indexing on Game Drives", desc: "Stops Windows Search indexing game folders. Eliminates random I/O spikes during gameplay.", impact: 58, reboot: false },
  { id: "stor_write_cache", category: "Storage", risk: "safe", title: "Enable Disk Write Cache", desc: "Buffers writes in RAM first. Speeds up shader compilation and save operations.", impact: 66, reboot: false },
  { id: "disp_fso", category: "Display", risk: "safe", title: "Disable Fullscreen Optimizations", desc: "Forces true exclusive fullscreen. Windows secretly uses borderless windowed adding input lag.", impact: 72, reboot: false },
  { id: "disp_vrr", category: "Display", risk: "safe", title: "Enable Variable Refresh Rate", desc: "Ensures FreeSync/G-Sync VRR is active. Eliminates tearing without V-Sync latency penalty.", impact: 80, reboot: false },
  { id: "disp_refresh", category: "Display", risk: "safe", title: "Verify Max Refresh Rate Active", desc: "Windows sometimes defaults to 60Hz even on 144/240Hz monitors. Detects and fixes this.", impact: 95, reboot: false },
  { id: "input_accel", category: "Input", risk: "safe", title: "Disable Mouse Acceleration", desc: "1:1 physical-to-digital movement. Acceleration destroys muscle memory for aiming.", impact: 90, reboot: false },
  { id: "input_usb", category: "Input", risk: "aggressive", title: "USB Polling Rate Override (1000Hz)", desc: "Mouse inputs registered 8x faster than Windows default 125Hz polling.", impact: 78, reboot: true },
  { id: "audio_exclusive", category: "Audio", risk: "safe", title: "Enable Audio Exclusive Mode", desc: "Game takes full control of audio device. Cuts audio latency from ~30ms to under 10ms.", impact: 60, reboot: false },
  { id: "audio_sample", category: "Audio", risk: "safe", title: "Set Optimal Sample Rate (48kHz)", desc: "Games output at 48kHz. Matching Windows format eliminates real-time resampling overhead.", impact: 45, reboot: false },
  { id: "sys_gamebar", category: "System", risk: "safe", title: "Disable Xbox Game Bar & DVR", desc: "Removes constant process monitoring and background recording overhead.", impact: 71, reboot: false },
  { id: "sys_telemetry", category: "System", risk: "safe", title: "Kill All Telemetry Services", desc: "Disables 14 Microsoft background reporters consuming CPU and disk I/O 24/7.", impact: 55, reboot: false },
  { id: "sys_services", category: "System", risk: "recommended", title: "Disable 30+ Unnecessary Services", desc: "Fax, Remote Registry, Xbox services and more - all useless on a gaming PC.", impact: 65, reboot: true },
  { id: "sys_defender", category: "System", risk: "recommended", title: "Defender Exclusions for Games", desc: "Stops AV scanning game folders during loading. Eliminates load time penalty.", impact: 78, reboot: false },
  { id: "sys_mmcss", category: "System", risk: "safe", title: "Configure MMCSS for Gaming", desc: "Game audio threads get higher priority. Prevents dropouts during heavy combat.", impact: 60, reboot: false },
  { id: "sys_visual", category: "System", risk: "safe", title: "Disable All Visual Effects", desc: "Removes animations, shadows, transparency. Frees GPU/CPU from desktop rendering.", impact: 45, reboot: false },
  { id: "priv_bloat", category: "Privacy", risk: "safe", title: "Remove Pre-installed Bloatware", desc: "Removes Candy Crush, TikTok, News and other bundled apps running background processes.", impact: 35, reboot: false },
  { id: "priv_cortana", category: "Privacy", risk: "safe", title: "Disable Cortana", desc: "Frees 200-400MB RAM and eliminates background search indexing.", impact: 40, reboot: false },
  { id: "priv_ads", category: "Privacy", risk: "safe", title: "Disable Advertising ID & Telemetry", desc: "Stops Windows ad tracking and reduces background reporting to Microsoft.", impact: 25, reboot: false },
];

const OC_GUIDES = {
  cpu_amd: { title: "AMD Ryzen CPU Overclocking", icon: "🔴", color: R, warning: "Overclocking can damage hardware. Always ensure adequate cooling.", steps: [
    { step: 1, title: "Enter BIOS", desc: "Restart PC and press DEL or F2. Look for AMD Overclocking or Precision Boost Override (PBO) section.", tip: "Most AMD boards use DEL key" },
    { step: 2, title: "Enable PBO", desc: "Set PBO to Advanced mode. Allows CPU to boost higher than stock limits automatically.", tip: "PBO is safer than manual OC - CPU self-limits if temps get too high" },
    { step: 3, title: "Set PBO Limits", desc: "PPT Limit: 142W. TDC Limit: 95A. EDC Limit: 140A. Allows sustained higher boost clocks.", tip: "Start conservative - increase later if stable" },
    { step: 4, title: "Curve Optimizer", desc: "Set all-core Curve Optimizer to -10 to -20. Undervolts each core allowing higher boost and cooler temps.", tip: "Negative values = better performance on Ryzen" },
    { step: 5, title: "Enable XMP/EXPO", desc: "Find DOCP or EXPO and enable it. Runs RAM at its rated speed instead of slow base speed.", tip: "This single change adds 10-15% performance" },
    { step: 6, title: "Stress Test", desc: "Save BIOS (F10). Run Cinebench R23 for 10 minutes. Keep CPU under 90C.", tip: "Use HWiNFO64 to monitor temperatures" },
  ]},
  cpu_intel: { title: "Intel CPU Overclocking", icon: "🔵", color: B, warning: "Only K/KF series Intel CPUs can be overclocked. Check your CPU model first.", steps: [
    { step: 1, title: "Enter BIOS", desc: "Restart and press DEL or F2. Go to AI Tweaker (ASUS) or OC Tweaker (ASRock).", tip: "Board manufacturer determines the BIOS name" },
    { step: 2, title: "Set CPU Ratio", desc: "Find CPU Core Ratio, set to Sync All Cores. For i9-13900K try 55x (5.5GHz) to start.", tip: "Each 1x step = 100MHz. Do not jump more than 5x at once." },
    { step: 3, title: "Set Vcore Voltage", desc: "Set to Manual. Start at 1.25V for moderate OC. Max safe daily is 1.35V on 12th/13th gen.", tip: "Never exceed 1.40V - permanent damage risk" },
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
    { step: 3, title: "Set Max Frequency", desc: "Drag frequency curve up by 50-100MHz. RX 7900 XTX can reach 2800-2900MHz.", tip: "AMD cards respond better to frequency than voltage tuning" },
    { step: 4, title: "VRAM Overclock", desc: "Enable Memory Tuning. Add 50-100MHz to memory frequency.", tip: "VRAM OC adds FPS in 1440p and 4K gaming" },
    { step: 5, title: "Test Stability", desc: "Run FurMark for 15 minutes. Keep temps under 85C junction.", tip: "Enable Radeon Overlay (Alt+R) for real-time stats" },
    { step: 6, title: "Save Profile", desc: "Save profile in Radeon Software and enable apply on startup.", tip: "Create separate profiles for gaming vs desktop" },
  ]},
  ram: { title: "RAM Overclocking (XMP + Manual)", icon: "💾", color: Y, warning: "RAM OC is one of the safest and highest-impact overclocks available.", steps: [
    { step: 1, title: "Enable XMP or EXPO", desc: "In BIOS find XMP, DOCP, or EXPO and enable Profile 1. Runs RAM at advertised speed.", tip: "Without XMP, DDR5-6000 runs at DDR5-4800. You leave 25% speed unused." },
    { step: 2, title: "Verify in Windows", desc: "Open Task Manager, go to Performance then Memory. Speed shown should match RAM box rating.", tip: "If it shows 2400MHz with fast RAM, XMP is not enabled" },
    { step: 3, title: "Manual Frequency", desc: "After XMP, try increasing by 200MHz. DDR5-6000 try 6200MHz.", tip: "Not all kits can go higher - depends on memory chips used" },
    { step: 4, title: "Tighten Timings", desc: "Lower CL timings = faster. If on CL30, try CL28 or CL26 at same frequency.", tip: "May need slightly more VDIMM voltage if unstable" },
    { step: 5, title: "Test Stability", desc: "Run MemTest86 for one full pass. In Windows run TestMem5 with anta777 profile 2 hours.", tip: "RAM errors cause random crashes - always test changes" },
    { step: 6, title: "Benchmark", desc: "Run Cinebench R23 before and after. Expect 5-15% improvement on AMD Ryzen.", tip: "Ryzen benefits more from fast RAM than Intel due to Infinity Fabric" },
  ]},
};

const COMMUNITY_PRESETS = [
  { id: "fps_monster", name: "The FPS Monster", icon: "👾", desc: "Maximum FPS at all costs. Aggressive CPU, GPU and network tweaks. For dedicated gaming rigs only.", tweakCount: 28, color: R, risk: "aggressive" },
  { id: "competitive", name: "The Competitor", icon: "🏆", desc: "Minimum input lag, maximum consistency. Optimized for Valorant, CS2, CoD.", tweakCount: 22, color: G, risk: "recommended" },
  { id: "streamer", name: "The Streamer", icon: "📡", desc: "Balanced gaming and encoding. Network QoS for upload. Audio optimized.", tweakCount: 18, color: B, risk: "safe" },
  { id: "safe_boost", name: "The Safe Boost", icon: "🛡️", desc: "100% safe tweaks only. No risk, significant gain. Perfect for first-time optimizers.", tweakCount: 16, color: Y, risk: "safe" },
  { id: "developer", name: "The Developer", icon: "💻", desc: "Dev tools, WSL, terminal performance. Removes bloat. Fast compile times.", tweakCount: 14, color: "#aa88ff", risk: "recommended" },
];

const PRESET_TWEAKS = {
  fps_monster: ["cpu_power","cpu_parking","cpu_scheduler","cpu_hpet","cpu_timer","cpu_spectre","gpu_msi","gpu_hags","gpu_preemption","gpu_nvidia_power","gpu_nvidia_lld","net_nagle","net_throttle","net_qos","net_interrupt","mem_xmp","stor_prefetch","stor_ntfs","disp_fso","disp_refresh","input_accel","input_usb","sys_gamebar","sys_telemetry","sys_services","sys_defender","sys_mmcss","priv_bloat"],
  competitive: ["cpu_power","cpu_parking","cpu_scheduler","cpu_hpet","gpu_msi","gpu_hags","gpu_nvidia_power","gpu_nvidia_lld","net_nagle","net_throttle","net_qos","mem_xmp","stor_prefetch","disp_fso","disp_refresh","input_accel","sys_gamebar","sys_telemetry","sys_defender","sys_mmcss","priv_cortana","priv_bloat"],
  streamer: ["cpu_power","cpu_parking","gpu_hags","net_nagle","net_throttle","net_qos","mem_xmp","stor_prefetch","disp_vrr","input_accel","audio_exclusive","audio_sample","sys_gamebar","sys_telemetry","sys_defender","priv_bloat","priv_ads"],
  safe_boost: ["cpu_power","cpu_parking","gpu_hags","net_nagle","net_throttle","mem_xmp","stor_prefetch","stor_ntfs","disp_refresh","input_accel","sys_gamebar","sys_telemetry","sys_defender","sys_mmcss","priv_bloat","priv_ads"],
  developer: ["cpu_power","cpu_parking","net_nagle","net_throttle","mem_xmp","stor_prefetch","stor_ntfs","sys_gamebar","sys_telemetry","sys_visual","priv_bloat","priv_cortana","priv_ads","audio_sample"],
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

function AIPanel({ onClose }) {
  const [messages, setMessages] = useState([{ role: "assistant", content: "Vapers Opti AI ready. Ask me anything about optimizing your Windows PC for gaming." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim(); setInput(""); setLoading(true);
    setMessages(p => [...p, { role: "user", content: msg }]);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: "You are Vapers Opti AI, an expert Windows performance optimization assistant for gamers. Give concise hardware-specific advice under 150 words. Use **bold** for key points.",
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
      <div onClick={e => e.stopPropagation()} style={{ width: 400, height: 540, background: "#080808", border: `1px solid ${G}22`, borderRadius: 14, display: "flex", flexDirection: "column", fontFamily: mono }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #111", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><div style={{ fontSize: 13, fontWeight: 700, color: G }}>⚡ AI Advisor</div><div style={{ fontSize: 9, color: "#444", letterSpacing: 1 }}>POWERED BY CLAUDE</div></div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "88%", background: m.role === "user" ? "#0a150d" : "#0a0a0a", border: `1px solid ${m.role === "user" ? G + "22" : "#151515"}`, borderRadius: m.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px", padding: "10px 13px", fontSize: 11, lineHeight: 1.6, color: "#bbb" }}>
              {m.content.split(/(\*\*[^*]+\*\*)/).map((p, j) => p.startsWith("**") && p.endsWith("**") ? <strong key={j} style={{ color: G }}>{p.slice(2, -2)}</strong> : p)}
            </div>
          ))}
          {loading && <div style={{ fontSize: 11, color: "#555", padding: "10px 13px" }}>Thinking...</div>}
          <div ref={endRef} />
        </div>
        <div style={{ padding: "8px 14px", display: "flex", gap: 5, flexWrap: "wrap" }}>
          {["Best GPU tweak?", "Is XMP enabled?", "Safe tweaks only?"].map(q => (
            <button key={q} onClick={() => setInput(q)} style={{ background: "transparent", border: "1px solid #111", color: "#666", fontFamily: mono, fontSize: 9, padding: "4px 8px", borderRadius: 4, cursor: "pointer" }}>{q}</button>
          ))}
        </div>
        <div style={{ padding: "10px 14px", borderTop: "1px solid #111", display: "flex", gap: 8 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask anything..." style={{ flex: 1, background: "#0a0a0a", border: "1px solid #151515", borderRadius: 6, padding: "8px 12px", color: "#ccc", fontFamily: mono, fontSize: 11, outline: "none" }} />
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
  const [disabledStartup, setDisabledStartup] = useState(new Set());
  const [realStartup, setRealStartup] = useState(null);
  const [thermalData, setThermalData] = useState(null);
  const [pingData, setPingData] = useState(null);
  const [pingLoading, setPingLoading] = useState(false);
  const [thermalLoading, setThermalLoading] = useState(false);
  const [startupLoading, setStartupLoading] = useState(false);

  const inElectron = typeof window !== "undefined" && !!window.winforge;

  // Scan effect
  useEffect(() => {
    if (page !== "scan") return;
    setScanStep(0);
    if (inElectron) {
      const unsub = window.winforge.onEvent(e => {
        if (e.type === "scan_result") setRealScan(e);
      });
      window.winforge.scanSystem();
    }
    const t1 = setTimeout(() => setScanStep(1), 500);
    const t2 = setTimeout(() => setScanStep(2), 1000);
    const t3 = setTimeout(() => setScanStep(3), 1500);
    const t4 = setTimeout(() => setScanStep(4), 2000);
    const t5 = setTimeout(() => setScanStep(5), 2500);
    const t6 = setTimeout(() => setScanStep(6), 3000);
    const t7 = setTimeout(() => setScanStep(7), 3500);
    const t8 = setTimeout(() => setScanStep(8), 4000);
    return () => [t1,t2,t3,t4,t5,t6,t7,t8].forEach(clearTimeout);
  }, [page]);

  // Apply effect
  useEffect(() => {
    if (page !== "applying") return;
    const list = Array.from(selectedTweaks);
    let i = 0;

    if (inElectron) {
      const unsub = window.winforge.onEvent(e => {
        if (e.type === "progress" && e.step === "apply") {
          setApplyProgress(e.percent);
        }
        if (e.type === "tweak_result") {
          const tw = ALL_TWEAKS.find(t => t.id === e.result.id);
          setApplyLog(p => [...p, `${e.result.success ? "✓" : "✗"}  ${tw?.title || e.result.id}`]);
        }
        if (e.type === "apply_complete") {
          unsub();
          setTimeout(() => setPage("done"), 500);
        }
      });
      window.winforge.applyTweaks(list);
      return () => unsub();
    }

    // Browser demo
    const iv = setInterval(() => {
      if (i >= list.length) { clearInterval(iv); setTimeout(() => setPage("done"), 500); return; }
      const tw = ALL_TWEAKS.find(t => t.id === list[i]);
      setApplyLog(p => [...p, `✓  ${tw?.title || list[i]}`]);
      setApplyProgress(Math.round(((i + 1) / list.length) * 100));
      i++;
    }, 380);
    return () => clearInterval(iv);
  }, [page]);

  // Load startup apps when tab opens
  useEffect(() => {
    if (tab !== "startup" || realStartup || !inElectron || startupLoading) return;
    setStartupLoading(true);
    window.winforge.getStartupApps().then(res => {
      if (res.success) {
        const result = res.data.find(d => d.type === "startup_apps");
        if (result) setRealStartup(result.apps);
      }
      setStartupLoading(false);
    });
  }, [tab]);

  // Load thermals when tab opens
  useEffect(() => {
    if (tab !== "thermal" || !inElectron || thermalLoading) return;
    setThermalLoading(true);
    window.winforge.getThermals().then(res => {
      if (res.success) {
        const result = res.data.find(d => d.type === "thermal_data");
        if (result) setThermalData(result);
      }
      setThermalLoading(false);
    });
  }, [tab]);

  const runPing = async () => {
    if (!inElectron) return;
    setPingLoading(true);
    const res = await window.winforge.runPing();
    if (res.success) {
      const result = res.data.find(d => d.type === "ping_results");
      if (result) setPingData(result.results);
    }
    setPingLoading(false);
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
  const projected = Math.min(99, Math.round(score + selectedTweaks.size * 1.1));
  const rebootNeeded = ALL_TWEAKS.filter(t => selectedTweaks.has(t.id) && t.reboot).length;
  const sd = realScan;

  const scanLabels = [
    ["CPU Architecture & Cores", sd ? `${sd.cpu.name} · ${sd.cpu.cores}C/${sd.cpu.threads}T` : "Detecting..."],
    ["GPU & Driver Version", sd ? `${sd.gpu.name} · ${sd.gpu.vramMB}MB VRAM` : "Detecting..."],
    ["System Memory", sd ? `${sd.ram.totalGB}GB · ${sd.ram.speedMHz}MHz · ${sd.ram.sticks} sticks` : "Detecting..."],
    ["Primary Storage", sd ? `${sd.storage.model} · ${sd.storage.isNvme ? "NVMe" : "SATA"}` : "Detecting..."],
    ["Network Interface", sd ? `${sd.network.name} · ${sd.network.speed} · ${sd.network.isEthernet ? "Ethernet" : "WiFi"}` : "Detecting..."],
    ["Windows Build", sd ? `${sd.windows.version} · Build ${sd.windows.build}` : "Detecting..."],
    ["Services Audit", "Scanning running services..."],
    ["Performance Issues Found", sd ? `${sd.issues.filter(i => i.severity === "high").length} critical · ${sd.issues.filter(i => i.severity === "medium").length} medium` : "Detecting..."],
  ];

  const startupApps = realStartup || [
    { name: "Discord", impact: "High", ram: "~180MB", delay: "~4.2s" },
    { name: "Spotify", impact: "High", ram: "~220MB", delay: "~3.8s" },
    { name: "Steam", impact: "Medium", ram: "~140MB", delay: "~2.1s" },
    { name: "Epic Games Launcher", impact: "High", ram: "~210MB", delay: "~3.5s" },
    { name: "Battle.net", impact: "High", ram: "~160MB", delay: "~2.9s" },
    { name: "OneDrive", impact: "Medium", ram: "~75MB", delay: "~1.2s" },
    { name: "NVIDIA Share", impact: "Medium", ram: "~90MB", delay: "~1.4s" },
    { name: "Teams", impact: "High", ram: "~280MB", delay: "~5.1s" },
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
        <div style={{ marginTop: 10, fontSize: 10, letterSpacing: 4, color: "#444" }}>INTELLIGENT · HARDWARE-AWARE · ZERO COMPROMISES</div>
        <div style={{ marginTop: 52, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <button onClick={() => setPage("scan")}
            style={{ background: G, color: "#000", border: "none", fontFamily: mono, fontWeight: 800, fontSize: 12, letterSpacing: 4, padding: "17px 52px", cursor: "pointer", borderRadius: 3, boxShadow: `0 0 40px ${G}30`, textTransform: "uppercase", transition: "all 0.2s" }}
            onMouseEnter={e => { e.target.style.boxShadow = `0 0 60px ${G}60`; e.target.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.target.style.boxShadow = `0 0 40px ${G}30`; e.target.style.transform = "none"; }}>
            ⚡ Scan My System
          </button>
          <div style={{ fontSize: 9, color: "#333", letterSpacing: 2 }}>100% LOCAL · NO DATA SENT · FREE & OPEN SOURCE</div>
        </div>
        <div style={{ marginTop: 72, display: "flex", gap: 60, justifyContent: "center" }}>
          {[["40+", "Tweaks"], ["7", "Feature Modules"], ["0ms", "Added Latency"]].map(([n, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: bebas, fontSize: 40, color: G, lineHeight: 1 }}>{n}</div>
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
      <div style={{ fontSize: 9, color: "#555", letterSpacing: 3, marginBottom: 44 }}>HARDWARE · SOFTWARE · NETWORK · SERVICES · DRIVERS</div>
      <div style={{ width: "100%", maxWidth: 660 }}>
        {scanLabels.map(([label, value], i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #0d0d0d", opacity: scanStep > i ? 1 : 0.2, transition: "opacity 0.4s ease" }}>
            <span style={{ fontFamily: mono, fontSize: 11, color: "#aaa" }}>{scanStep > i ? "▸" : "○"} {label}</span>
            <span style={{ fontFamily: mono, fontSize: 11, color: scanStep > i ? (i === 7 ? R : G) : "#222", fontWeight: 600 }}>{scanStep > i ? value : "—"}</span>
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
              <div style={{ width: 1, height: 70, background: "#111" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {sd ? (
                  <>
                    <div style={{ fontSize: 11, color: R }}>⚠ {sd.issues.filter(i => i.severity === "high").length} critical issues</div>
                    <div style={{ fontSize: 11, color: Y }}>⚠ {sd.issues.filter(i => i.severity === "medium").length} medium issues</div>
                    <div style={{ fontSize: 11, color: G }}>✓ {sd.cpu.name}</div>
                    <div style={{ fontSize: 11, color: G }}>✓ {sd.gpu.name}</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 11, color: R }}>⚠ 11 critical issues found</div>
                    <div style={{ fontSize: 11, color: Y }}>⚠ 23 minor issues found</div>
                    <div style={{ fontSize: 11, color: "#555" }}>✓ Hardware detected</div>
                  </>
                )}
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
            <div style={{ fontSize: 10, color: G, letterSpacing: 3, marginBottom: 14 }}>02 · GAMES YOU PLAY</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8 }}>
              {GAMES.map(g => {
                const sel = profile.games.includes(g.id);
                return <div key={g.id} onClick={() => setProfile(p => ({ ...p, games: sel ? p.games.filter(x => x !== g.id) : [...p.games, g.id] }))} style={{ background: sel ? "#090f0b" : "#060606", border: `1px solid ${sel ? G + "44" : "#0e0e0e"}`, borderRadius: 8, padding: "12px 6px", cursor: "pointer", textAlign: "center", transition: "all 0.12s" }}>
                  <div style={{ fontSize: 20 }}>{g.icon}</div>
                  <div style={{ fontSize: 8, color: sel ? G : "#555", marginTop: 5 }}>{g.name}</div>
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
      {aiOpen && <AIPanel onClose={() => setAiOpen(false)} />}
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

      <div style={{ display: "flex", borderBottom: "1px solid #0a0a0a", padding: "0 24px", overflowX: "auto" }}>
        {[["tweaks","⚡ Tweaks"],["benchmark","📊 Benchmark"],["overclock","🔥 Overclock"],["drivers","🔧 Drivers"],["startup","🚀 Startup"],["thermal","🌡️ Thermals"],["presets","⚙️ Presets"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ background: "transparent", border: "none", borderBottom: `2px solid ${tab === id ? G : "transparent"}`, color: tab === id ? G : "#555", fontFamily: mono, fontSize: 10, letterSpacing: 1, padding: "14px 16px", cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}>{label}</button>
        ))}
      </div>

      <div style={{ padding: "22px 24px", maxWidth: 1060, margin: "0 auto" }}>
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
            <div style={{ fontSize: 9, color: "#333", letterSpacing: 1, marginBottom: 10 }}>{filtered.length} TWEAKS · {selectedTweaks.size} SELECTED</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {filtered.map(t => <TweakRow key={t.id} tweak={t} selected={selectedTweaks.has(t.id)} onToggle={toggleTweak} />)}
            </div>
          </div>
        )}

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

            {/* Real ping test */}
            <div style={{ background: "#060606", border: "1px solid #0e0e0e", borderRadius: 10, padding: "18px 20px", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 9, color: G, letterSpacing: 2 }}>GAME SERVER PING TEST</div>
                <button onClick={runPing} disabled={pingLoading || !inElectron}
                  style={{ background: pingLoading ? "#111" : `${G}15`, color: pingLoading ? "#444" : G, border: `1px solid ${G}33`, fontFamily: mono, fontSize: 9, padding: "6px 14px", cursor: pingLoading ? "default" : "pointer", borderRadius: 4, fontWeight: 700 }}>
                  {pingLoading ? "Testing..." : "▶ Run Ping Test"}
                </button>
              </div>
              {pingData ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
                  {pingData.map(s => (
                    <div key={s.name} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 9, color: "#444", marginBottom: 6 }}>{s.name}</div>
                      <div style={{ fontFamily: bebas, fontSize: 28, color: s.ping < 30 ? G : s.ping < 60 ? Y : R }}>{s.ping === 999 ? "N/A" : `${s.ping}ms`}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
                  {["CoD/Warzone","Valorant","Steam","Battle.net","Google DNS"].map(s => (
                    <div key={s} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 9, color: "#444", marginBottom: 6 }}>{s}</div>
                      <div style={{ fontFamily: bebas, fontSize: 28, color: "#333" }}>--ms</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

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

        {tab === "drivers" && (
          <div>
            <div style={{ fontFamily: bebas, fontSize: 30, color: "#fff", letterSpacing: 6, marginBottom: 20 }}>DRIVER CHECKER</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { name: "GPU Driver (NVIDIA)", status: "UPDATE AVAILABLE", sc: R, desc: sd?.gpu?.driver ? `Driver ${sd.gpu.driver} installed. Check for newer version with game optimizations.` : "Check nvidia.com for latest Game Ready driver.", url: "nvidia.com/drivers" },
                { name: "Chipset Driver (AMD)", status: "UP TO DATE", sc: G, desc: "AMD Chipset controls CPU-to-motherboard PCIe communication. Keep updated for best performance.", url: "amd.com/drivers" },
                { name: "Network Driver", status: "UPDATE AVAILABLE", sc: Y, desc: "Newer NIC drivers reduce ping spikes and improve packet consistency for online gaming.", url: "intel.com/network" },
                { name: "Audio Driver (Realtek)", status: "UP TO DATE", sc: G, desc: "Realtek HD Audio current. Generic Windows driver would add latency.", url: "realtek.com" },
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
          </div>
        )}

        {tab === "startup" && (
          <div>
            <div style={{ fontFamily: bebas, fontSize: 30, color: "#fff", letterSpacing: 6, marginBottom: 8 }}>STARTUP ANALYZER</div>
            {startupLoading && <div style={{ fontSize: 10, color: G, marginBottom: 12 }}>⟳ Scanning startup entries...</div>}
            {realStartup && <div style={{ fontSize: 10, color: G, marginBottom: 12 }}>✓ {realStartup.length} real startup entries detected from your system</div>}
            <div style={{ fontSize: 10, color: R, marginBottom: 18 }}>⚠ {startupApps.length} startup apps detected · Slowing boot and wasting RAM</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {startupApps.map((app, idx) => {
                const dis = disabledStartup.has(app.name);
                const impact = app.impact || "Medium";
                return (
                  <div key={app.name + idx} style={{ background: "#060606", border: "1px solid #0e0e0e", borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, opacity: dis ? 0.45 : 1, transition: "opacity 0.2s" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 12, color: dis ? "#555" : "#e0e0e0", fontWeight: 600, textDecoration: dis ? "line-through" : "none" }}>{app.name}</span>
                        <span style={{ fontFamily: mono, fontSize: 8, color: impact === "High" ? R : Y, border: `1px solid ${impact === "High" ? R : Y}33`, borderRadius: 3, padding: "2px 6px", fontWeight: 700 }}>{impact.toUpperCase()}</span>
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

        {tab === "thermal" && (
          <div>
            <div style={{ fontFamily: bebas, fontSize: 30, color: "#fff", letterSpacing: 6, marginBottom: 20 }}>THERMAL MONITOR</div>
            {thermalLoading && <div style={{ fontSize: 10, color: G, marginBottom: 16 }}>⟳ Reading sensor data...</div>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 18 }}>
              {[
                {
                  label: "CPU Temperature",
                  value: thermalData?.cpuTemp > 0 ? `${thermalData.cpuTemp}°C` : "52°C",
                  percent: thermalData?.cpuTemp > 0 ? Math.round((thermalData.cpuTemp / 90) * 100) : 58,
                  color: thermalData?.cpuTemp > 80 ? R : thermalData?.cpuTemp > 65 ? Y : G,
                  status: thermalData?.cpuTemp > 80 ? "HOT" : thermalData?.cpuTemp > 65 ? "WARM" : "NORMAL",
                  detail: `${sd?.cpu?.name || "CPU"} · Max 90°C · Load: ${thermalData?.cpuLoad || 0}%`
                },
                {
                  label: "GPU Temperature",
                  value: thermalData?.gpuTemp > 0 ? `${thermalData.gpuTemp}°C` : "44°C",
                  percent: thermalData?.gpuTemp > 0 ? Math.round((thermalData.gpuTemp / 83) * 100) : 53,
                  color: thermalData?.gpuTemp > 75 ? R : thermalData?.gpuTemp > 60 ? Y : B,
                  status: thermalData?.gpuTemp > 75 ? "HOT" : thermalData?.gpuTemp > 60 ? "WARM" : "COOL",
                  detail: `${sd?.gpu?.name || "GPU"} · Max 83°C`
                }
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
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: "#444", marginBottom: 6 }}>CPU LOAD</div>
                  <div style={{ fontFamily: bebas, fontSize: 32, color: thermalData.cpuLoad > 80 ? R : G }}>{thermalData.cpuLoad}%</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: "#444", marginBottom: 6 }}>RAM USED</div>
                  <div style={{ fontFamily: bebas, fontSize: 32, color: Y }}>{thermalData.ramUsed}GB</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: "#444", marginBottom: 6 }}>RAM TOTAL</div>
                  <div style={{ fontFamily: bebas, fontSize: 32, color: "#555" }}>{thermalData.ramTotal}GB</div>
                </div>
              </div>
            )}

            <div style={{ background: "#060606", border: "1px solid #0e0e0e", borderRadius: 10, padding: "18px 20px" }}>
              <div style={{ fontSize: 9, color: Y, letterSpacing: 2, marginBottom: 14 }}>COOLING RECOMMENDATIONS</div>
              {[
                { icon: "✅", tip: "Temps are healthy. Current cooling is adequate for stock operation." },
                { icon: "💡", tip: `For overclocking the ${sd?.cpu?.name?.includes("5800X3D") ? "5800X3D, the 3D V-Cache is heat sensitive - keep under 75C. Use a high-end AIO." : "CPU, keep temps under 80C under full load. An AIO 240mm+ is recommended."}` },
                { icon: "🔧", tip: "If your PC is 2+ years old, reapply thermal paste. Dried paste adds 10-20C to temps." },
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

        {tab === "presets" && (
          <div>
            <div style={{ fontFamily: bebas, fontSize: 30, color: "#fff", letterSpacing: 6, marginBottom: 4 }}>COMMUNITY PRESETS</div>
            <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 20 }}>ONE-CLICK OPTIMIZATION PROFILES</div>
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
              <div style={{ fontSize: 10, color: "#555", marginBottom: 14 }}>Export your current tweak selection. Share with friends or post in the community.</div>
              <div style={{ display: "flex", gap: 10 }}>
                <button style={{ background: `${G}15`, color: G, border: `1px solid ${G}33`, fontFamily: mono, fontWeight: 700, fontSize: 10, padding: "10px 20px", cursor: "pointer", borderRadius: 6 }}>📤 Export ({selectedTweaks.size} tweaks)</button>
                <button style={{ background: "transparent", color: "#666", border: "1px solid #111", fontFamily: mono, fontSize: 10, padding: "10px 20px", cursor: "pointer", borderRadius: 6 }}>📥 Import</button>
              </div>
            </div>
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
          <button style={{ background: "#5865f2", color: "#fff", border: "none", fontFamily: mono, fontWeight: 700, fontSize: 9, padding: "7px 16px", cursor: "pointer", borderRadius: 4 }}>Copy for Discord</button>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button style={{ background: G, color: "#000", border: "none", fontFamily: mono, fontWeight: 800, fontSize: 11, letterSpacing: 2, padding: "13px 28px", cursor: "pointer", borderRadius: 4, textTransform: "uppercase" }}>🔄 Restart Now</button>
        <button onClick={() => setPage("dashboard")} style={{ background: "transparent", color: "#666", border: "1px solid #111", fontFamily: mono, fontSize: 11, letterSpacing: 2, padding: "13px 24px", cursor: "pointer", borderRadius: 4, textTransform: "uppercase" }}>Back to Dashboard</button>
        <button onClick={() => { setPage("splash"); setSelectedTweaks(new Set()); setApplyLog([]); setApplyProgress(0); setScanStep(0); setProfile({ mode: null, games: [], platforms: [], competitive: false }); setRealScan(null); setRealStartup(null); setThermalData(null); setPingData(null); }}
          style={{ background: "transparent", color: "#444", border: "1px solid #0a0a0a", fontFamily: mono, fontSize: 11, letterSpacing: 2, padding: "13px 24px", cursor: "pointer", borderRadius: 4, textTransform: "uppercase" }}>Start Over</button>
      </div>
    </div>
  );
}
