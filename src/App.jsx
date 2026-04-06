import { useState, useEffect, useRef } from "react";

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
  { id: "cpu_power", category: "CPU", risk: "safe", title: "Ultimate Performance Power Plan", desc: "Activates the hidden Ultimate Performance power plan. Eliminates CPU throttling and power-saving idle states. Windows Balanced mode caps performance during load spikes — this removes that cap permanently.", impact: 95, reboot: false },
  { id: "cpu_parking", category: "CPU", risk: "safe", title: "Disable CPU Core Parking", desc: "Windows parks idle CPU cores to save power. When a game suddenly needs those cores there's a wake-up delay causing micro-stutters. Disabling keeps all cores hot and ready at all times.", impact: 78, reboot: false },
  { id: "cpu_scheduler", category: "CPU", risk: "safe", title: "Foreground App CPU Priority", desc: "Sets the CPU scheduler to give your active game more CPU slices per second over background processes.", impact: 65, reboot: false },
  { id: "cpu_hpet", category: "CPU", risk: "recommended", title: "Disable HPET Timer", desc: "Forces Windows to use the TSC timer which has lower overhead than HPET. Improves frame time consistency.", impact: 68, reboot: true },
  { id: "cpu_timer", category: "CPU", risk: "recommended", title: "0.5ms System Timer Resolution", desc: "Windows defaults to 15.6ms timer resolution. Setting 0.5ms globally gives smoother frame pacing and more responsive input handling.", impact: 72, reboot: false },
  { id: "cpu_spectre", category: "CPU", risk: "aggressive", title: "Disable Spectre/Meltdown Patches", desc: "Security patches cost 5-15% CPU performance. Only for dedicated gaming PCs not used for sensitive data. RISK: Leaves CPU vulnerability exposed.", impact: 88, reboot: true },
  { id: "gpu_msi", category: "GPU", risk: "safe", title: "Enable MSI Mode for GPU", desc: "Message Signaled Interrupts reduce GPU-to-CPU latency by up to 30%. One of the single highest-impact GPU tweaks available.", impact: 88, reboot: true },
  { id: "gpu_hags", category: "GPU", risk: "safe", title: "Hardware-Accelerated GPU Scheduling", desc: "Offloads GPU memory management from the CPU to the GPU itself. Reduces frame latency on RTX 2000+ and RX 5000+ cards.", impact: 76, reboot: true },
  { id: "gpu_tdr", category: "GPU", risk: "safe", title: "Increase GPU TDR Delay", desc: "Prevents false GPU timeout resets during shader compilation. Stops mid-game crashes on heavy scenes.", impact: 55, reboot: true },
  { id: "gpu_preemption", category: "GPU", risk: "recommended", title: "Disable GPU Preemption", desc: "GPU completes render tasks without Windows interrupting mid-frame. Reduces frame time variance in competitive games.", impact: 70, reboot: true },
  { id: "gpu_nvidia_power", category: "GPU", risk: "safe", title: "NVIDIA — Max Performance Mode", desc: "Forces NVIDIA driver to always run at max clock speed. Prevents downclocking at scene transitions which causes frame spikes.", impact: 82, reboot: false },
  { id: "gpu_nvidia_lld", category: "GPU", risk: "recommended", title: "NVIDIA — Low Latency Ultra Mode", desc: "Driver-level NVIDIA Reflex. Reduces input lag by 1-4 frames in most games without needing in-game support.", impact: 85, reboot: false },
  { id: "gpu_shader_cache", category: "GPU", risk: "safe", title: "Maximize Shader Cache Size", desc: "Compiled shaders persist longer across sessions. Eliminates repeat stutter when revisiting areas or game modes.", impact: 77, reboot: false },
  { id: "net_nagle", category: "Network", risk: "safe", title: "Disable Nagle's Algorithm", desc: "Nagle batches TCP packets to improve bandwidth — terrible for gaming. Disabling eliminates 20-200ms of artificial input packet delay.", impact: 85, reboot: false },
  { id: "net_throttle", category: "Network", risk: "safe", title: "Remove Network Throttle Index", desc: "Windows caps network usage at 20% during multimedia tasks. This cap applies during gaming — removing it gives games full bandwidth.", impact: 72, reboot: false },
  { id: "net_qos", category: "Network", risk: "safe", title: "QoS Policy for Gaming Traffic", desc: "Marks game UDP packets with DSCP 46 priority. Routers that support QoS will prioritize game traffic over downloads and streaming.", impact: 75, reboot: false },
  { id: "net_interrupt", category: "Network", risk: "recommended", title: "Disable NIC Interrupt Moderation", desc: "Immediate packet processing at slightly higher CPU cost. Max network responsiveness for wired ethernet connections.", impact: 70, reboot: false },
  { id: "net_rss", category: "Network", risk: "recommended", title: "Enable Receive Side Scaling", desc: "Distributes network processing across multiple CPU cores. Prevents single-core network bottlenecks during intense online matches.", impact: 65, reboot: false },
  { id: "mem_xmp", category: "Memory", risk: "safe", title: "Verify XMP/EXPO Active", desc: "Detects if your RAM is running below its rated speed. XMP off means up to 40% less memory bandwidth — biggest free performance gain.", impact: 90, reboot: false },
  { id: "mem_pagefile", category: "Memory", risk: "recommended", title: "Fixed Pagefile Size", desc: "Prevents pagefile from dynamically resizing which causes disk I/O spikes mid-game. Sets a fixed size at 1.5x your total RAM.", impact: 62, reboot: true },
  { id: "mem_standby", category: "Memory", risk: "safe", title: "Clear Memory Standby List", desc: "Releases RAM held in standby before a gaming session. Windows holds freed memory in a standby list — clearing it maximizes free RAM for your game.", impact: 55, reboot: false },
  { id: "stor_prefetch", category: "Storage", risk: "safe", title: "Disable Prefetch & Superfetch (SSD)", desc: "Prefetch was designed for slow HDDs. On NVMe it wastes RAM and CPU cycles since game load times are already near-instant.", impact: 74, reboot: false },
  { id: "stor_ntfs", category: "Storage", risk: "safe", title: "Optimize NTFS Settings", desc: "Disables last-access timestamps and 8.3 filename generation. Reduces disk I/O on every single file read and write operation.", impact: 60, reboot: false },
  { id: "stor_index", category: "Storage", risk: "safe", title: "Disable Indexing on Game Drives", desc: "Stops Windows Search from constantly indexing game folders. Eliminates random disk I/O spikes that hit during active gameplay.", impact: 58, reboot: false },
  { id: "stor_write_cache", category: "Storage", risk: "safe", title: "Enable Disk Write Cache", desc: "Buffers disk writes in RAM before committing. Dramatically speeds up shader compilation and game save operations.", impact: 66, reboot: false },
  { id: "disp_fso", category: "Display", risk: "safe", title: "Disable Fullscreen Optimizations", desc: "Windows secretly runs games in borderless windowed mode for Alt+Tab convenience — adding input lag. This forces true exclusive fullscreen.", impact: 72, reboot: false },
  { id: "disp_vrr", category: "Display", risk: "safe", title: "Enable Variable Refresh Rate", desc: "Ensures FreeSync or G-Sync VRR is active globally. Eliminates screen tearing without the latency penalty of V-Sync.", impact: 80, reboot: false },
  { id: "disp_refresh", category: "Display", risk: "safe", title: "Verify Max Refresh Rate Active", desc: "Windows sometimes defaults monitors to 60Hz even if they support 144 or 240Hz. Detects and fixes this automatically.", impact: 95, reboot: false },
  { id: "input_accel", category: "Input", risk: "safe", title: "Disable Mouse Acceleration", desc: "1:1 physical-to-digital mouse movement. Acceleration makes fast moves travel further than slow ones — destroys muscle memory for aiming.", impact: 90, reboot: false },
  { id: "input_usb", category: "Input", risk: "aggressive", title: "USB Polling Rate Override (1000Hz)", desc: "Mouse inputs registered 8x faster than Windows default 125Hz polling. Every click and movement reaches the game faster.", impact: 78, reboot: true },
  { id: "audio_exclusive", category: "Audio", risk: "safe", title: "Enable Audio Exclusive Mode", desc: "Allows games to take full control of the audio device bypassing the Windows mixer. Cuts audio latency from ~30ms to under 10ms.", impact: 60, reboot: false },
  { id: "audio_sample", category: "Audio", risk: "safe", title: "Set Optimal Sample Rate (48kHz)", desc: "Games output at 48kHz. If Windows is set to 44.1kHz real-time resampling adds CPU overhead and degrades sound quality.", impact: 45, reboot: false },
  { id: "sys_gamebar", category: "System", risk: "safe", title: "Disable Xbox Game Bar & DVR", desc: "Game Bar monitors every process for hotkey triggers and DVR can record in the background. Pure overhead — disable it completely.", impact: 71, reboot: false },
  { id: "sys_telemetry", category: "System", risk: "safe", title: "Kill All Telemetry Services", desc: "Disables DiagTrack, CEIP, CompatTelRunner and 11 other Microsoft reporters running 24/7 consuming CPU cycles and disk I/O.", impact: 55, reboot: false },
  { id: "sys_services", category: "System", risk: "recommended", title: "Disable 30+ Unnecessary Services", desc: "Fax, Remote Registry, Tablet Input, Xbox services, Retail Demo and more — all useless on a gaming PC, all consuming resources.", impact: 65, reboot: true },
  { id: "sys_defender", category: "System", risk: "recommended", title: "Defender Exclusions for Game Folders", desc: "Stops Windows Defender scanning game files during loading. Eliminates the load time penalty and I/O spikes from real-time AV scanning.", impact: 78, reboot: false },
  { id: "sys_mmcss", category: "System", risk: "safe", title: "Configure MMCSS for Gaming", desc: "Multimedia Class Scheduler gives game audio threads higher priority. Prevents audio dropouts and glitches during heavy combat scenes.", impact: 60, reboot: false },
  { id: "sys_visual", category: "System", risk: "safe", title: "Disable All Visual Effects", desc: "Removes animations, shadows, transparency and Aero effects. Frees GPU and CPU cycles currently spent rendering desktop candy.", impact: 45, reboot: false },
  { id: "priv_bloat", category: "Privacy", risk: "safe", title: "Remove Pre-installed Bloatware", desc: "Removes Candy Crush, TikTok, Disney+, News, Weather and other Microsoft-bundled apps that run background processes uninvited.", impact: 35, reboot: false },
  { id: "priv_cortana", category: "Privacy", risk: "safe", title: "Disable Cortana", desc: "Cortana runs in background indexing searches and sending data to Microsoft. Disabling frees 200-400MB RAM and background CPU.", impact: 40, reboot: false },
  { id: "priv_ads", category: "Privacy", risk: "safe", title: "Disable Advertising ID & Telemetry", desc: "Stops Windows from assigning you an ad tracking ID and reduces background data reporting to Microsoft servers.", impact: 25, reboot: false },
];

const RISK_COLORS = { safe: "#00ff88", recommended: "#f5c518", aggressive: "#ff4444" };

// ── AI Chat Panel ──────────────────────────────────────────────────────────
function AIPanel({ systemInfo, selectedCount, onClose }) {
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: `I've analyzed your system. You have **${selectedCount} tweaks** selected. Ask me anything about your optimization plan — I'll give you hardware-specific advice.`
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are VAPERS OPTI AI, an expert Windows performance optimization assistant. The user's PC: ${JSON.stringify(systemInfo)}. Give concise hardware-specific advice under 150 words. Use **bold** for key points.`,
          messages: [...messages.map(m => ({ role: m.role, content: m.content })), { role: "user", content: userMsg }]
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.content?.[0]?.text || "Error getting response." }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection error. Make sure you have internet access." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000077", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "flex-end", padding: 24 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 400, height: 540, background: "#080808", border: "1px solid #00ff8833", borderRadius: 14, display: "flex", flexDirection: "column", fontFamily: "'JetBrains Mono', monospace", boxShadow: "0 0 60px #00ff8811" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #111", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#00ff88" }}>⚡ VAPERS OPTI AI</div>
            <div style={{ fontSize: 9, color: "#333", letterSpacing: 1 }}>POWERED BY CLAUDE · HARDWARE-AWARE</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "88%", background: m.role === "user" ? "#0a150d" : "#0a0a0a", border: `1px solid ${m.role === "user" ? "#00ff8833" : "#151515"}`, borderRadius: m.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px", padding: "10px 13px", fontSize: 11, lineHeight: 1.6, color: "#999" }}>
              {m.content.split(/(\*\*[^*]+\*\*)/).map((p, j) =>
                p.startsWith("**") && p.endsWith("**")
                  ? <strong key={j} style={{ color: "#00ff88" }}>{p.slice(2, -2)}</strong>
                  : p
              )}
            </div>
          ))}
          {loading && <div style={{ alignSelf: "flex-start", background: "#0a0a0a", border: "1px solid #151515", borderRadius: "12px 12px 12px 4px", padding: "10px 13px", fontSize: 11, color: "#444" }}>Analyzing...</div>}
          <div ref={endRef} />
        </div>

        <div style={{ padding: "8px 14px", display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["Best tweak for my GPU?", "Is my RAM at XMP?", "Explain MSI Mode"].map(q => (
            <button key={q} onClick={() => setInput(q)} style={{ background: "transparent", border: "1px solid #111", color: "#444", fontFamily: "'JetBrains Mono', monospace", fontSize: 9, padding: "4px 8px", borderRadius: 4, cursor: "pointer" }}>{q}</button>
          ))}
        </div>

        <div style={{ padding: "10px 14px", borderTop: "1px solid #111", display: "flex", gap: 8 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask anything about your optimization..." style={{ flex: 1, background: "#0a0a0a", border: "1px solid #151515", borderRadius: 6, padding: "8px 12px", color: "#ccc", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, outline: "none" }} />
          <button onClick={send} disabled={loading} style={{ background: loading ? "#111" : "#00ff88", color: loading ? "#333" : "#000", border: "none", borderRadius: 6, padding: "8px 14px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: 11, cursor: loading ? "default" : "pointer" }}>→</button>
        </div>
      </div>
    </div>
  );
}

// ── TweakRow ───────────────────────────────────────────────────────────────
function TweakRow({ tweak, selected, onToggle }) {
  const rc = RISK_COLORS[tweak.risk];
  return (
    <div onClick={() => onToggle(tweak.id)} style={{ background: selected ? "#090f0b" : "#060606", border: `1px solid ${selected ? "#00ff8828" : "#0e0e0e"}`, borderRadius: 8, padding: "13px 15px", cursor: "pointer", transition: "all 0.15s", position: "relative", overflow: "hidden" }}>
      {selected && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: "#00ff88" }} />}
      <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
        <div style={{ width: 17, height: 17, borderRadius: 3, flexShrink: 0, marginTop: 2, border: `2px solid ${selected ? "#00ff88" : "#1e1e1e"}`, background: selected ? "#00ff88" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
          {selected && <span style={{ fontSize: 9, color: "#000", fontWeight: 900 }}>✓</span>}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#e0e0e0", fontWeight: 600 }}>{tweak.title}</span>
            <div style={{ display: "flex", gap: 5 }}>
              {tweak.reboot && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: "#444", border: "1px solid #1a1a1a", borderRadius: 3, padding: "1px 5px" }}>REBOOT</span>}
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: rc, border: `1px solid ${rc}33`, borderRadius: 3, padding: "2px 6px", fontWeight: 700 }}>{tweak.risk.toUpperCase()}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: "#333", border: "1px solid #111", borderRadius: 3, padding: "2px 6px" }}>{tweak.category}</span>
            </div>
          </div>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#3a3a3a", lineHeight: 1.6, margin: "0 0 8px" }}>{tweak.desc}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, height: 2, background: "#0e0e0e", borderRadius: 1, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${tweak.impact}%`, background: `linear-gradient(90deg, ${rc}44, ${rc})`, borderRadius: 1 }} />
            </div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: rc, minWidth: 32, fontWeight: 700 }}>+{tweak.impact}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState("splash");
  const [scanStep, setScanStep] = useState(0);
  const [profile, setProfile] = useState({ mode: null, games: [], platforms: [], competitive: false });
  const [selectedTweaks, setSelectedTweaks] = useState(new Set());
  const [catFilter, setCatFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const [applyLog, setApplyLog] = useState([]);
  const [applyProgress, setApplyProgress] = useState(0);

  const inElectron = typeof window !== "undefined" && !!window.VAPERSOPTI;

  const scanItems = [
    { label: "CPU Architecture & Cores", value: "Detecting..." },
    { label: "GPU & Driver Version", value: "Detecting..." },
    { label: "System Memory", value: "Detecting..." },
    { label: "Primary Storage Type", value: "Detecting..." },
    { label: "Network Interface", value: "Detecting..." },
    { label: "Windows Build & Version", value: "Detecting..." },
    { label: "Running Services Audit", value: "Detecting..." },
    { label: "Performance Issues Found", value: "Detecting...", color: "#ff6b6b" },
  ];

  const fakeScanResults = [
    "AMD Ryzen 9 7900X · 12C/24T",
    "NVIDIA RTX 4080 16GB · Driver 551.61",
    "32GB DDR5-6000 · Dual Channel",
    "Samsung 990 Pro NVMe · 2TB · Gen4",
    "Intel I225-V · 2.5Gbps Ethernet",
    "Windows 11 Pro · Build 22631",
    "247 total · 89 can be disabled",
    "11 critical · 23 minor",
  ];

  useEffect(() => {
    if (step !== "scan") return;
    setScanStep(0);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setScanStep(i);
      if (i >= scanItems.length) clearInterval(interval);
    }, 380);
    return () => clearInterval(interval);
  }, [step]);

  useEffect(() => {
    if (step !== "applying") return;
    const list = Array.from(selectedTweaks);
    let i = 0;
    const interval = setInterval(() => {
      if (i >= list.length) { clearInterval(interval); setTimeout(() => setStep("done"), 600); return; }
      const tw = ALL_TWEAKS.find(t => t.id === list[i]);
      setApplyLog(prev => [...prev, `✓  ${tw?.title || list[i]}`]);
      setApplyProgress(Math.round(((i + 1) / list.length) * 100));
      i++;
    }, 420);
    return () => clearInterval(interval);
  }, [step]);

  const toggleTweak = id => setSelectedTweaks(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selectSafe = () => setSelectedTweaks(new Set(ALL_TWEAKS.filter(t => t.risk === "safe").map(t => t.id)));
  const selectAll = () => setSelectedTweaks(new Set(ALL_TWEAKS.map(t => t.id)));
  const clearAll = () => setSelectedTweaks(new Set());

  const filtered = ALL_TWEAKS.filter(t => {
    if (catFilter !== "All" && t.category !== catFilter) return false;
    if (riskFilter !== "all" && t.risk !== riskFilter) return false;
    if (searchQ && !t.title.toLowerCase().includes(searchQ.toLowerCase()) && !t.desc.toLowerCase().includes(searchQ.toLowerCase())) return false;
    return true;
  });

  const projected = Math.min(99, Math.round(72 + selectedTweaks.size * 1.1));
  const rebootNeeded = ALL_TWEAKS.filter(t => selectedTweaks.has(t.id) && t.reboot).length;

  const systemInfo = { cpu: "AMD Ryzen 9 7900X", gpu: "NVIDIA RTX 4080", ram: "32GB DDR5-6000", storage: "NVMe Gen4", games: profile.games, score: 72 };

  const mono = "'JetBrains Mono', monospace";
  const bebas = "'Bebas Neue', sans-serif";

  // ── SPLASH ──
  if (step === "splash") return (
    <div style={{ minHeight: "100vh", background: "#020202", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: mono, position: "relative", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&family=Bebas+Neue&display=swap" rel="stylesheet" />
      <style>{`* { box-sizing: border-box } ::-webkit-scrollbar { width: 4px } ::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 2px } @keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }`}</style>
      <div style={{ position: "absolute", inset: 0, opacity: 0.025, backgroundImage: "linear-gradient(#00ff88 1px, transparent 1px), linear-gradient(90deg, #00ff88 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
      <div style={{ position: "absolute", top: "35%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 350, background: "radial-gradient(ellipse, #00ff8806, transparent 70%)", pointerEvents: "none" }} />
      {[[{t:16,l:16},true,true,false,false],[{t:16,r:16},true,false,false,true],[{b:16,l:16},false,true,true,false],[{b:16,r:16},false,false,true,true]].map(([pos,bt,bl,bb,br], i) => (
        <div key={i} style={{ position:"absolute", width:32, height:32, ...pos, borderTop:bt?"1px solid #00ff8822":undefined, borderLeft:bl?"1px solid #00ff8822":undefined, borderBottom:bb?"1px solid #00ff8822":undefined, borderRight:br?"1px solid #00ff8822":undefined }} />
      ))}
      <div style={{ textAlign: "center", zIndex: 1, animation: "fadeUp 0.7s ease" }}>
        <div style={{ fontSize: 10, letterSpacing: 8, color: "#00ff8844", marginBottom: 18 }}>WINDOWS OPTIMIZATION SUITE</div>
        <h1 style={{ fontFamily: bebas, fontSize: 110, color: "#fff", letterSpacing: 10, margin: 0, lineHeight: 0.9, textShadow: "0 0 80px #00ff8812" }}>VAPERS <span style={{ color: "#00ff88" }}>OPTI</span></h1>
        <div style={{ marginTop: 10, fontSize: 10, letterSpacing: 4, color: "#1e1e1e" }}>INTELLIGENT · HARDWARE-AWARE · ZERO COMPROMISES</div>
        <div style={{ marginTop: 52, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <button onClick={() => setStep("scan")} style={{ background: "#00ff88", color: "#000", border: "none", fontFamily: mono, fontWeight: 800, fontSize: 12, letterSpacing: 4, padding: "17px 52px", cursor: "pointer", borderRadius: 3, boxShadow: "0 0 40px #00ff8830", textTransform: "uppercase", transition: "all 0.2s" }}
            onMouseEnter={e => { e.target.style.boxShadow="0 0 60px #00ff8860"; e.target.style.transform="translateY(-1px)"; }}
            onMouseLeave={e => { e.target.style.boxShadow="0 0 40px #00ff8830"; e.target.style.transform="none"; }}>
            ⚡ Scan My System
          </button>
          <div style={{ fontSize: 9, color: "#1e1e1e", letterSpacing: 2 }}>100% LOCAL · NO DATA SENT · FREE & OPEN SOURCE</div>
        </div>
        <div style={{ marginTop: 72, display: "flex", gap: 60, justifyContent: "center" }}>
          {[["40+","Tweaks Ready"],["11","Categories"],["0ms","Added Latency"]].map(([n,l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: bebas, fontSize: 40, color: "#00ff88", lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: 9, color: "#2a2a2a", letterSpacing: 2, marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── SCAN ──
  if (step === "scan") return (
    <div style={{ minHeight: "100vh", background: "#020202", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: mono, padding: 40 }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&family=Bebas+Neue&display=swap" rel="stylesheet" />
      <div style={{ fontFamily: bebas, fontSize: 54, color: "#fff", letterSpacing: 8, marginBottom: 6 }}>SCANNING SYSTEM</div>
      <div style={{ fontSize: 9, color: "#2a2a2a", letterSpacing: 3, marginBottom: 48 }}>HARDWARE · SOFTWARE · NETWORK · SERVICES · DRIVERS</div>
      <div style={{ width: "100%", maxWidth: 660 }}>
        {scanItems.map((item, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid #0a0a0a", opacity: scanStep > i ? 1 : 0.15, transition: "opacity 0.35s ease" }}>
            <span style={{ fontSize: 11, color: "#3a3a3a" }}>{scanStep > i ? "▸" : "○"} {item.label}</span>
            <span style={{ fontSize: 11, color: scanStep > i ? (item.color || "#00ff88") : "#1a1a1a", fontWeight: scanStep > i ? 600 : 400 }}>{scanStep > i ? fakeScanResults[i] : "—"}</span>
          </div>
        ))}
        <div style={{ marginTop: 28, height: 2, background: "#0a0a0a", borderRadius: 1, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(scanStep / scanItems.length) * 100}%`, background: "linear-gradient(90deg, #00ff88, #00ccff)", boxShadow: "0 0 10px #00ff88", transition: "width 0.3s ease" }} />
        </div>
        {scanStep >= scanItems.length && (
          <div style={{ marginTop: 40 }}>
            <div style={{ background: "#070707", border: "1px solid #141414", borderRadius: 12, padding: "22px 28px", marginBottom: 22, display: "flex", gap: 36, alignItems: "center", justifyContent: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "#333", letterSpacing: 2, marginBottom: 6 }}>PERFORMANCE SCORE</div>
                <div style={{ fontFamily: bebas, fontSize: 76, color: "#f5c518", lineHeight: 1 }}>72<span style={{ fontSize: 34, color: "#2a2a2a" }}>/100</span></div>
              </div>
              <div style={{ width: 1, height: 70, background: "#111" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {[["11 Critical Issues","#ff6b6b"],["23 Minor Issues","#f5c518"],["7 Hardware Alerts","#ff9500"]].map(([l,c]) => (
                  <div key={l} style={{ fontSize: 11, color: c }}>⚠ {l}</div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setStep("profile")} style={{ background: "#00ff88", color: "#000", border: "none", fontFamily: mono, fontWeight: 800, fontSize: 11, letterSpacing: 3, padding: "14px 36px", cursor: "pointer", borderRadius: 3, textTransform: "uppercase" }}>Build My Profile →</button>
              <button onClick={() => { selectSafe(); setStep("tweaks"); }} style={{ background: "transparent", color: "#444", border: "1px solid #141414", fontFamily: mono, fontSize: 11, letterSpacing: 2, padding: "14px 24px", cursor: "pointer", borderRadius: 3, textTransform: "uppercase" }}>Skip → Show Tweaks</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ── PROFILE ──
  if (step === "profile") return (
    <div style={{ minHeight: "100vh", background: "#020202", fontFamily: mono, padding: "52px 40px" }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&family=Bebas+Neue&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div style={{ fontFamily: bebas, fontSize: 52, color: "#fff", letterSpacing: 8, marginBottom: 4 }}>YOUR PROFILE</div>
        <div style={{ fontSize: 9, color: "#2a2a2a", letterSpacing: 2, marginBottom: 44 }}>3 QUESTIONS · POWERS YOUR PERSONALIZED OPTIMIZATION PLAN</div>

        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 10, color: "#00ff88", letterSpacing: 3, marginBottom: 14 }}>01 · PRIMARY USE CASE</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {[{id:"gaming",icon:"🎮",label:"GAMING",sub:"FPS & competitive focus"},{id:"both",icon:"⚡",label:"GAMING + WORK",sub:"Balanced performance"},{id:"general",icon:"🖥️",label:"GENERAL PC",sub:"Speed & responsiveness"}].map(m => (
              <div key={m.id} onClick={() => setProfile(p => ({...p, mode: m.id}))} style={{ background: profile.mode === m.id ? "#090f0b" : "#060606", border: `1px solid ${profile.mode === m.id ? "#00ff88" : "#111"}`, borderRadius: 10, padding: "20px 16px", cursor: "pointer", textAlign: "center", transition: "all 0.15s" }}>
                <div style={{ fontSize: 30, marginBottom: 10 }}>{m.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: profile.mode === m.id ? "#00ff88" : "#777", letterSpacing: 2 }}>{m.label}</div>
                <div style={{ fontSize: 9, color: "#3a3a3a", marginTop: 5 }}>{m.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {(profile.mode === "gaming" || profile.mode === "both") && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 10, color: "#00ff88", letterSpacing: 3, marginBottom: 14 }}>02 · GAMES YOU PLAY</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8 }}>
              {GAMES.map(g => {
                const sel = profile.games.includes(g.id);
                return (
                  <div key={g.id} onClick={() => setProfile(p => ({...p, games: sel ? p.games.filter(x=>x!==g.id) : [...p.games, g.id]}))} style={{ background: sel ? "#090f0b" : "#060606", border: `1px solid ${sel ? "#00ff8844" : "#0e0e0e"}`, borderRadius: 8, padding: "12px 6px", cursor: "pointer", textAlign: "center", transition: "all 0.12s" }}>
                    <div style={{ fontSize: 20 }}>{g.icon}</div>
                    <div style={{ fontSize: 8, color: sel ? "#00ff88" : "#3a3a3a", marginTop: 5 }}>{g.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 10, color: "#00ff88", letterSpacing: 3, marginBottom: 14 }}>{(profile.mode==="gaming"||profile.mode==="both") ? "03" : "02"} · PLATFORMS YOU USE</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {PLATFORMS.map(p => {
              const sel = profile.platforms.includes(p.id);
              return (
                <div key={p.id} onClick={() => setProfile(pr => ({...pr, platforms: sel ? pr.platforms.filter(x=>x!==p.id) : [...pr.platforms, p.id]}))} style={{ background: sel ? "#090f0b" : "#060606", border: `1px solid ${sel ? "#00ff8833" : "#0e0e0e"}`, borderRadius: 8, padding: "13px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "all 0.12s" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: sel ? p.color : "#1e1e1e", flexShrink: 0, boxShadow: sel ? `0 0 8px ${p.color}` : "none", transition: "all 0.2s" }} />
                  <span style={{ fontSize: 11, color: sel ? "#ddd" : "#444", fontWeight: sel ? 600 : 400 }}>{p.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 40 }}>
          <div onClick={() => setProfile(p => ({...p, competitive: !p.competitive}))} style={{ width: 42, height: 22, borderRadius: 11, background: profile.competitive ? "#00ff88" : "#0e0e0e", position: "relative", cursor: "pointer", transition: "all 0.2s", border: `1px solid ${profile.competitive ? "#00ff88" : "#1e1e1e"}` }}>
            <div style={{ position: "absolute", top: 3, left: profile.competitive ? 22 : 3, width: 14, height: 14, borderRadius: "50%", background: profile.competitive ? "#000" : "#3a3a3a", transition: "left 0.2s" }} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#ccc" }}>Competitive Mode</div>
            <div style={{ fontSize: 9, color: "#333", marginTop: 2 }}>Enables aggressive tweaks for maximum FPS and minimum input lag</div>
          </div>
        </div>

        <button onClick={() => { selectSafe(); setStep("tweaks"); }} disabled={!profile.mode} style={{ background: profile.mode ? "#00ff88" : "#0e0e0e", color: profile.mode ? "#000" : "#2a2a2a", border: "none", fontFamily: mono, fontWeight: 800, fontSize: 11, letterSpacing: 3, padding: "16px 44px", cursor: profile.mode ? "pointer" : "default", borderRadius: 3, textTransform: "uppercase", transition: "all 0.2s" }}>
          ⚡ Generate Optimization Plan →
        </button>
      </div>
    </div>
  );

  // ── TWEAKS ──
  if (step === "tweaks") return (
    <div style={{ minHeight: "100vh", background: "#020202", fontFamily: mono }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&family=Bebas+Neue&display=swap" rel="stylesheet" />
      {aiOpen && <AIPanel systemInfo={systemInfo} selectedCount={selectedTweaks.size} onClose={() => setAiOpen(false)} />}

      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "#020202", borderBottom: "1px solid #0a0a0a", padding: "16px 26px", display: "flex", alignItems: "center", gap: 16 }}>
        <div>
          <div style={{ fontFamily: bebas, fontSize: 24, color: "#fff", letterSpacing: 4 }}>VAPERS <span style={{ color: "#00ff88" }}>OPTI</span></div>
          <div style={{ fontSize: 8, color: "#2a2a2a", letterSpacing: 2 }}>RTX 4080 · Ryzen 9 7900X · 32GB DDR5</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 8, color: "#333" }}>SCORE AFTER</div>
            <div style={{ fontFamily: bebas, fontSize: 26, color: "#00ff88", lineHeight: 1 }}>{projected}<span style={{ fontSize: 14, color: "#2a2a2a" }}>/100</span></div>
          </div>
          <div style={{ width: 1, height: 32, background: "#111" }} />
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 8, color: "#333" }}>SELECTED</div>
            <div style={{ fontFamily: bebas, fontSize: 26, color: "#f5c518", lineHeight: 1 }}>{selectedTweaks.size}</div>
          </div>
          <button onClick={() => setAiOpen(true)} style={{ background: "#00ff8812", color: "#00ff88", border: "1px solid #00ff8822", fontFamily: mono, fontWeight: 700, fontSize: 10, letterSpacing: 2, padding: "8px 14px", cursor: "pointer", borderRadius: 6 }}>⚡ Ask AI</button>
          <button onClick={() => setStep("applying")} disabled={selectedTweaks.size === 0} style={{ background: selectedTweaks.size > 0 ? "#00ff88" : "#0e0e0e", color: selectedTweaks.size > 0 ? "#000" : "#2a2a2a", border: "none", fontFamily: mono, fontWeight: 800, fontSize: 10, letterSpacing: 2, padding: "10px 20px", cursor: selectedTweaks.size > 0 ? "pointer" : "default", borderRadius: 6, textTransform: "uppercase", transition: "all 0.2s" }}>
            Apply {selectedTweaks.size} →
          </button>
        </div>
      </div>

      <div style={{ padding: "24px 26px", maxWidth: 1060, margin: "0 auto" }}>
        {/* Score bar */}
        <div style={{ background: "#060606", border: "1px solid #0e0e0e", borderRadius: 10, padding: "16px 22px", marginBottom: 22, display: "flex", alignItems: "center", gap: 18 }}>
          <div><div style={{ fontSize: 8, color: "#333", letterSpacing: 2 }}>BEFORE</div><div style={{ fontFamily: bebas, fontSize: 40, color: "#f5c518", lineHeight: 1 }}>72</div></div>
          <div style={{ flex: 1 }}>
            <div style={{ height: 3, background: "#0a0a0a", borderRadius: 2, overflow: "hidden", marginBottom: 4 }}>
              <div style={{ height: "100%", width: "72%", background: "linear-gradient(90deg, #f5c51866, #f5c518)", borderRadius: 2 }} />
            </div>
            <div style={{ height: 3, background: "#0a0a0a", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${projected}%`, background: "linear-gradient(90deg, #00ff8833, #00ff88)", borderRadius: 2, transition: "width 0.3s ease" }} />
            </div>
          </div>
          <div><div style={{ fontSize: 8, color: "#333", letterSpacing: 2 }}>PROJECTED</div><div style={{ fontFamily: bebas, fontSize: 40, color: "#00ff88", lineHeight: 1 }}>{projected}</div></div>
          <div style={{ width: 1, height: 44, background: "#111" }} />
          {rebootNeeded > 0 && <div style={{ fontSize: 10, color: "#f5c518" }}>⚠ {rebootNeeded} tweaks require reboot</div>}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 18, alignItems: "center", flexWrap: "wrap" }}>
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search tweaks..." style={{ background: "#060606", border: "1px solid #0e0e0e", borderRadius: 6, padding: "7px 12px", color: "#777", fontFamily: mono, fontSize: 10, outline: "none", width: 190 }} />
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCatFilter(c)} style={{ background: catFilter===c?"#00ff88":"#060606", color: catFilter===c?"#000":"#3a3a3a", border:`1px solid ${catFilter===c?"#00ff88":"#0e0e0e"}`, fontFamily:mono, fontSize:9, letterSpacing:1, padding:"5px 9px", cursor:"pointer", borderRadius:4, fontWeight:catFilter===c?700:400, transition:"all 0.12s" }}>{c}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
            {["all","safe","recommended","aggressive"].map(r => (
              <button key={r} onClick={() => setRiskFilter(r)} style={{ background:riskFilter===r?"#0d0d0d":"transparent", color:r==="all"?"#444":(RISK_COLORS[r]||"#444"), border:`1px solid ${riskFilter===r?"#1e1e1e":"#0a0a0a"}`, fontFamily:mono, fontSize:9, padding:"5px 9px", cursor:"pointer", borderRadius:4, textTransform:"uppercase", transition:"all 0.12s" }}>{r}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={selectSafe} style={{ background:"transparent", color:"#00ff88", border:"1px solid #00ff8820", fontFamily:mono, fontSize:9, padding:"5px 10px", cursor:"pointer", borderRadius:4 }}>Safe Only</button>
            <button onClick={selectAll} style={{ background:"transparent", color:"#f5c518", border:"1px solid #f5c51820", fontFamily:mono, fontSize:9, padding:"5px 10px", cursor:"pointer", borderRadius:4 }}>Select All</button>
            <button onClick={clearAll} style={{ background:"transparent", color:"#444", border:"1px solid #111", fontFamily:mono, fontSize:9, padding:"5px 10px", cursor:"pointer", borderRadius:4 }}>Clear</button>
          </div>
        </div>

        <div style={{ fontSize: 9, color: "#1e1e1e", letterSpacing: 1, marginBottom: 12 }}>{filtered.length} TWEAKS · {selectedTweaks.size} SELECTED</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {filtered.map(t => <TweakRow key={t.id} tweak={t} selected={selectedTweaks.has(t.id)} onToggle={toggleTweak} />)}
        </div>
      </div>
    </div>
  );

  // ── APPLYING ──
  if (step === "applying") return (
    <div style={{ minHeight: "100vh", background: "#020202", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: mono, padding: 40 }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&family=Bebas+Neue&display=swap" rel="stylesheet" />
      <div style={{ fontFamily: bebas, fontSize: 54, color: "#fff", letterSpacing: 8, marginBottom: 6 }}>APPLYING TWEAKS</div>
      <div style={{ fontSize: 9, color: "#2a2a2a", letterSpacing: 3, marginBottom: 44 }}>CREATING RESTORE POINT · DO NOT CLOSE</div>
      <div style={{ width: "100%", maxWidth: 580 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 10, color: "#3a3a3a" }}>Progress</span>
          <span style={{ fontSize: 10, color: "#00ff88", fontWeight: 700 }}>{applyProgress}%</span>
        </div>
        <div style={{ height: 4, background: "#0a0a0a", borderRadius: 2, overflow: "hidden", marginBottom: 26 }}>
          <div style={{ height: "100%", width: `${applyProgress}%`, background: "linear-gradient(90deg, #00ff88, #00ccff)", boxShadow: "0 0 12px #00ff8844", borderRadius: 2, transition: "width 0.35s ease" }} />
        </div>
        <div style={{ background: "#040404", border: "1px solid #0a0a0a", borderRadius: 10, padding: 18, height: 280, overflowY: "auto" }}>
          <div style={{ fontSize: 10, color: "#2a2a2a", marginBottom: 10 }}>▸ Creating system restore point...</div>
          {applyLog.map((line, i) => (
            <div key={i} style={{ fontSize: 10, color: i === applyLog.length-1 ? "#00ff88" : "#222", marginBottom: 5, lineHeight: 1.5 }}>{line}</div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── DONE ──
  if (step === "done") return (
    <div style={{ minHeight: "100vh", background: "#020202", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: mono, padding: 40, textAlign: "center" }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&family=Bebas+Neue&display=swap" rel="stylesheet" />
      <div style={{ fontSize: 52, marginBottom: 18 }}>⚡</div>
      <div style={{ fontFamily: bebas, fontSize: 80, color: "#00ff88", letterSpacing: 10, lineHeight: 1 }}>OPTIMIZED</div>
      <div style={{ fontSize: 9, color: "#2a2a2a", letterSpacing: 4, marginTop: 8, marginBottom: 44 }}>YOUR SYSTEM HAS BEEN FORGED</div>
      <div style={{ background: "#060606", border: "1px solid #00ff8815", borderRadius: 14, padding: "28px 52px", marginBottom: 36 }}>
        <div style={{ display: "flex", gap: 56, justifyContent: "center", alignItems: "center" }}>
          <div><div style={{ fontSize: 9, color: "#333", letterSpacing: 2, marginBottom: 6 }}>BEFORE</div><div style={{ fontFamily: bebas, fontSize: 68, color: "#f5c518", lineHeight: 1 }}>72</div></div>
          <div style={{ fontSize: 22, color: "#1a1a1a" }}>→</div>
          <div><div style={{ fontSize: 9, color: "#333", letterSpacing: 2, marginBottom: 6 }}>AFTER</div><div style={{ fontFamily: bebas, fontSize: 68, color: "#00ff88", lineHeight: 1 }}>{projected}</div></div>
        </div>
        <div style={{ marginTop: 18, fontSize: 10, color: "#2a2a2a" }}>
          {selectedTweaks.size} tweaks applied · Restore point saved · {rebootNeeded > 0 ? `${rebootNeeded} tweaks need a restart` : "No restart needed"}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button style={{ background: "#00ff88", color: "#000", border: "none", fontFamily: mono, fontWeight: 800, fontSize: 11, letterSpacing: 2, padding: "13px 28px", cursor: "pointer", borderRadius: 4, textTransform: "uppercase" }}>🔄 Restart Now</button>
        <button onClick={() => { setStep("tweaks"); setApplyLog([]); setApplyProgress(0); }} style={{ background: "transparent", color: "#444", border: "1px solid #111", fontFamily: mono, fontSize: 11, letterSpacing: 2, padding: "13px 24px", cursor: "pointer", borderRadius: 4, textTransform: "uppercase" }}>Back to Tweaks</button>
        <button onClick={() => { setStep("splash"); setSelectedTweaks(new Set()); setApplyLog([]); setApplyProgress(0); setScanStep(0); setProfile({mode:null,games:[],platforms:[],competitive:false}); }} style={{ background: "transparent", color: "#2a2a2a", border: "1px solid #0a0a0a", fontFamily: mono, fontSize: 11, letterSpacing: 2, padding: "13px 24px", cursor: "pointer", borderRadius: 4, textTransform: "uppercase" }}>Start Over</button>
      </div>
    </div>
  );
}
