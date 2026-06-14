import { useState, useEffect, useRef } from "react";

const C = {
  black: "#050505",
  black2: "#0d0d0d",
  black3: "#111111",
  glass: "rgba(255,255,255,0.04)",
  glassBorder: "rgba(255,255,255,0.08)",
  red: "#8b0000",
  redBright: "#c0392b",
  redGlow: "rgba(139,0,0,0.25)",
  redSoft: "rgba(139,0,0,0.12)",
  gold: "#c9a84c",
  white: "#ffffff",
  white60: "rgba(255,255,255,0.6)",
  white30: "rgba(255,255,255,0.3)",
  white10: "rgba(255,255,255,0.1)",
  white6: "rgba(255,255,255,0.06)",
};

const TEAMS = [
  "Argentina","France","Brazil","England","Spain","Germany",
  "Portugal","Netherlands","Belgium","Croatia","Morocco","USA",
  "Japan","Senegal","Mexico","Canada","Uruguay","Colombia",
  "Denmark","Switzerland","Poland","Serbia","Ecuador","Qatar",
  "Iran","South Korea","Australia","Ghana","Cameroon","Tunisia",
  "Saudi Arabia","Costa Rica"
];

const FLAGS = {
  Argentina:"🇦🇷", France:"🇫🇷", Brazil:"🇧🇷", England:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  Spain:"🇪🇸", Germany:"🇩🇪", Portugal:"🇵🇹", Netherlands:"🇳🇱",
  Belgium:"🇧🇪", Croatia:"🇭🇷", Morocco:"🇲🇦", USA:"🇺🇸",
  Japan:"🇯🇵", Senegal:"🇸🇳", Mexico:"🇲🇽", Canada:"🇨🇦",
  Uruguay:"🇺🇾", Colombia:"🇨🇴", Denmark:"🇩🇰", Switzerland:"🇨🇭",
  Poland:"🇵🇱", Serbia:"🇷🇸", Ecuador:"🇪🇨", Qatar:"🇶🇦",
  Iran:"🇮🇷", "South Korea":"🇰🇷", Australia:"🇦🇺", Ghana:"🇬🇭",
  Cameroon:"🇨🇲", Tunisia:"🇹🇳", "Saudi Arabia":"🇸🇦", "Costa Rica":"🇨🇷"
};

const SCHEDULE = [
  { date:"Jun 11", match:"Mexico vs Canada", venue:"SoFi Stadium, LA", time:"8:00 PM EST" },
  { date:"Jun 12", match:"USA vs Colombia", venue:"MetLife Stadium, NJ", time:"6:00 PM EST" },
  { date:"Jun 13", match:"Argentina vs Morocco", venue:"AT&T Stadium, TX", time:"9:00 PM EST" },
  { date:"Jun 14", match:"France vs Brazil", venue:"Rose Bowl, CA", time:"9:00 PM EST" },
  { date:"Jun 15", match:"Spain vs Germany", venue:"Hard Rock Stadium, FL", time:"6:00 PM EST" },
  { date:"Jun 16", match:"Portugal vs England", venue:"Levi's Stadium, CA", time:"9:00 PM EST" },
];

const SYSTEM_PROMPT = `You are GoalMind AI — a world-class football analyst and prediction expert for FIFA World Cup 2026. Deep knowledge of stats, tactics, players, history.

RULES:
- Always give direct confident prediction — never vague
- Win probability: "Team A Win: X% | Draw: X% | Team B Win: X%"
- Back with real stats and reasoning
- Keep responses sharp (max 180 words)
- If user writes Roman Urdu, respond in Roman Urdu
- HOT TAKE: bold, controversial, mic-drop ending
- Never say "I cannot predict" — always take a stance
- Mention confidence: LOW / MEDIUM / HIGH / VERY HIGH

WC 2026: Hosts USA/Canada/Mexico, Jun 11–Jul 19, 48 teams, 104 matches.
Top contenders: Argentina, France, Brazil, England, Spain, Germany, Portugal, Netherlands
Dark horses: Morocco, USA, Japan, Croatia, Senegal`;

async function askGoalMind(messages) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages,
    }),
  });
  const data = await res.json();
  return data.content?.map(b => b.text || "").join("") || "Error.";
}

// ── Atoms ──────────────────────────────────────────────────────────────────

function GlassCard({ children, style = {}, accent = false }) {
  return (
    <div style={{
      background: accent ? `rgba(139,0,0,0.10)` : C.glass,
      border: `1px solid ${accent ? "rgba(139,0,0,0.35)" : C.glassBorder}`,
      borderRadius: 18,
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      padding: 18,
      ...style,
    }}>{children}</div>
  );
}

function RedBtn({ children, onClick, disabled, gold = false, style = {} }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: "100%",
      background: disabled
        ? "rgba(255,255,255,0.06)"
        : gold
          ? `linear-gradient(135deg, ${C.gold}, #a07830)`
          : `linear-gradient(135deg, ${C.red}, ${C.redBright})`,
      color: disabled ? C.white30 : C.white,
      border: "none",
      borderRadius: 12,
      padding: "13px",
      fontWeight: 700,
      fontSize: 14,
      cursor: disabled ? "not-allowed" : "pointer",
      letterSpacing: "0.02em",
      ...style,
    }}>{children}</button>
  );
}

function TeamSelect({ value, onChange, exclude, placeholder = "Select team…" }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      background: "rgba(255,255,255,0.05)",
      color: C.white,
      border: `1px solid ${C.glassBorder}`,
      borderRadius: 10,
      padding: "11px 14px",
      fontSize: 14,
      width: "100%",
      cursor: "pointer",
      appearance: "none",
      outline: "none",
    }}>
      <option value="">{placeholder}</option>
      {TEAMS.filter(t => t !== exclude).map(t => (
        <option key={t} value={t} style={{ background: "#111" }}>
          {FLAGS[t] || "🏳️"} {t}
        </option>
      ))}
    </select>
  );
}

function Dots() {
  const [d, setD] = useState(".");
  useEffect(() => {
    const id = setInterval(() => setD(p => p.length >= 3 ? "." : p + "."), 420);
    return () => clearInterval(id);
  }, []);
  return <span>{d}</span>;
}

function ProbBar({ a, draw, b, labelA, labelB }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { setTimeout(() => setAnimated(true), 80); }, []);
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:C.white60, marginBottom:6 }}>
        <span>{labelA}</span><span>Draw</span><span>{labelB}</span>
      </div>
      <div style={{ display:"flex", borderRadius:99, overflow:"hidden", height:9 }}>
        <div style={{ width: animated ? `${a}%` : "0%", background:`linear-gradient(90deg,${C.red},${C.redBright})`, transition:"width 1s ease" }} />
        <div style={{ width:`${draw}%`, background:"rgba(255,255,255,0.18)" }} />
        <div style={{ width: animated ? `${b}%` : "0%", background:`linear-gradient(90deg,#1565c0,#1e88e5)`, transition:"width 1s ease" }} />
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:7, fontSize:15, fontWeight:800 }}>
        <span style={{ color:C.redBright }}>{a}%</span>
        <span style={{ color:C.white30, fontSize:13 }}>{draw}%</span>
        <span style={{ color:"#1e88e5" }}>{b}%</span>
      </div>
    </div>
  );
}

function AICard({ children, loading, loadingLabel = "GoalMind is analyzing" }) {
  if (loading) return (
    <GlassCard style={{ textAlign:"center", padding:28 }}>
      <div style={{ fontSize:36, marginBottom:10 }}>⚽</div>
      <div style={{ color:C.redBright, fontWeight:700, fontSize:15 }}>{loadingLabel}<Dots /></div>
      <div style={{ fontSize:12, color:C.white30, marginTop:5 }}>Cross-checking stats, form, head-to-head…</div>
    </GlassCard>
  );
  return (
    <GlassCard accent style={{ borderTop:`2px solid ${C.red}` }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
        <span style={{ fontSize:20 }}>🤖</span>
        <span style={{ fontSize:13, fontWeight:700, color:C.redBright, letterSpacing:"0.05em", textTransform:"uppercase" }}>GoalMind AI</span>
      </div>
      <div style={{ fontSize:14, color:"rgba(255,255,255,0.88)", lineHeight:1.75, whiteSpace:"pre-wrap" }}>
        {children}
      </div>
    </GlassCard>
  );
}

// ── Splash / Hero ──────────────────────────────────────────────────────────

function SplashScreen({ onEnter }) {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 120); }, []);

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:100,
      background:`linear-gradient(180deg, #050505 0%, #0d0000 60%, #050505 100%)`,
      display:"flex", flexDirection:"column", alignItems:"center",
      overflow:"hidden",
    }}>
      {/* Red spotlight behind CR7 */}
      <div style={{
        position:"absolute", top:"10%", left:"50%", transform:"translateX(-50%)",
        width:340, height:340,
        background:"radial-gradient(circle, rgba(139,0,0,0.45) 0%, transparent 70%)",
        pointerEvents:"none",
      }} />

      {/* CR7 Illustrated Hero */}
      <div style={{
        position:"absolute", top:0, left:"50%", transform:"translateX(-50%)",
        width:"100%", maxWidth:480, height:"72vh",
        opacity: show ? 1 : 0, transition:"opacity 0.9s ease",
        overflow:"hidden",
      }}>
        {/* Stadium lights */}
        <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0,
          background:"radial-gradient(ellipse at 30% 20%, rgba(139,0,0,0.5) 0%, transparent 55%), radial-gradient(ellipse at 70% 10%, rgba(180,30,0,0.3) 0%, transparent 45%)",
        }}/>

        {/* Jersey number big */}
        <div style={{
          position:"absolute", top:"5%", left:"50%", transform:"translateX(-50%)",
          fontSize:180, fontWeight:900, color:"rgba(139,0,0,0.12)",
          lineHeight:1, userSelect:"none", letterSpacing:"-10px",
        }}>7</div>

        {/* CR7 silhouette SVG */}
        <svg viewBox="0 0 300 500" style={{
          position:"absolute", bottom:0, left:"50%", transform:"translateX(-50%)",
          width:"75%", height:"auto",
          maskImage:"linear-gradient(to bottom, black 50%, transparent 95%)",
          WebkitMaskImage:"linear-gradient(to bottom, black 50%, transparent 95%)",
        }}>
          {/* Body silhouette - player celebrating with arm raised */}
          <g fill="rgba(200,30,30,0.85)">
            {/* Head */}
            <ellipse cx="150" cy="55" rx="28" ry="32"/>
            {/* Neck */}
            <rect x="140" y="82" width="20" height="18" rx="5"/>
            {/* Torso */}
            <path d="M100,100 Q150,90 200,100 L210,220 Q150,230 90,220 Z"/>
            {/* Jersey number 7 on chest */}
            <text x="150" y="175" textAnchor="middle" fontSize="36" fontWeight="900" fill="rgba(255,255,255,0.9)">7</text>
            {/* Left arm raised up - celebrating */}
            <path d="M100,110 Q60,80 30,30 Q25,20 35,18 Q45,16 50,28 Q75,75 108,130 Z"/>
            <ellipse cx="32" cy="22" rx="12" ry="10" transform="rotate(-20,32,22)"/>
            {/* Right arm down */}
            <path d="M200,110 Q230,150 240,190 Q243,200 235,202 Q227,204 224,194 Q215,155 195,125 Z"/>
            <ellipse cx="236" cy="197" rx="12" ry="10" transform="rotate(10,236,197)"/>
            {/* Shorts */}
            <path d="M95,215 Q150,225 205,215 L200,290 Q150,298 100,290 Z"/>
            {/* Left leg */}
            <path d="M100,285 Q88,350 85,400 Q83,412 95,413 Q107,414 108,402 Q112,352 122,290 Z"/>
            <ellipse cx="91" cy="415" rx="16" ry="10"/>
            {/* Right leg */}
            <path d="M178,290 Q188,352 192,402 Q193,414 205,413 Q217,412 215,400 Q212,350 200,285 Z"/>
            <ellipse cx="209" cy="415" rx="16" ry="10"/>
          </g>
          {/* White highlights on jersey */}
          <path d="M130,102 Q150,95 170,102 L168,140 Q150,145 132,140 Z" fill="rgba(255,255,255,0.15)"/>
        </svg>

        {/* Portugal flag colors strip */}
        <div style={{
          position:"absolute", bottom:0, left:0, right:0, height:4,
          background:"linear-gradient(90deg, #006600 33%, #FF0000 33%)",
          opacity:0.6,
        }}/>

        {/* Stars above - 5 Ballon d'Or */}
        <div style={{
          position:"absolute", top:"8%", left:"50%", transform:"translateX(-50%)",
          display:"flex", gap:6, fontSize:16,
        }}>
          {[...Array(5)].map((_, i) => (
            <span key={i} style={{ color:C.gold, textShadow:`0 0 8px ${C.gold}` }}>★</span>
          ))}
        </div>

        {/* CR7 name tag */}
        <div style={{
          position:"absolute", top:"14%", left:"50%", transform:"translateX(-50%)",
          background:"rgba(139,0,0,0.4)", border:"1px solid rgba(139,0,0,0.6)",
          borderRadius:8, padding:"4px 16px", whiteSpace:"nowrap",
        }}>
          <span style={{ fontSize:13, fontWeight:800, color:C.white, letterSpacing:"0.15em" }}>
            CRISTIANO RONALDO
          </span>
        </div>
      </div>

      {/* Bottom content */}
      <div style={{
        position:"absolute", bottom:0, left:0, right:0,
        padding:"0 24px 44px",
        opacity: show ? 1 : 0, transition:"opacity 1.1s ease 0.4s",
        display:"flex", flexDirection:"column", alignItems:"center",
        textAlign:"center",
      }}>
        {/* Live badge */}
        <div style={{
          display:"inline-flex", alignItems:"center", gap:6,
          background:"rgba(139,0,0,0.25)", border:"1px solid rgba(139,0,0,0.5)",
          borderRadius:99, padding:"5px 14px", marginBottom:16,
        }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:C.redBright }} />
          <span style={{ fontSize:11, fontWeight:700, color:C.redBright, letterSpacing:"0.1em" }}>
            FIFA WORLD CUP 2026 · LIVE NOW
          </span>
        </div>

        {/* Title */}
        <div style={{ fontSize:38, fontWeight:900, color:C.white, lineHeight:1.1, marginBottom:8, letterSpacing:"-0.02em" }}>
          Goal<span style={{ color:C.redBright }}>Mind</span>
        </div>
        <div style={{ fontSize:13, color:C.white60, marginBottom:6 }}>
          AI-Powered World Cup Predictions
        </div>
        <div style={{ fontSize:12, color:C.white30, marginBottom:28 }}>
          48 Teams · 104 Matches · Jun 11 – Jul 19, 2026
        </div>

        {/* CR7 quote */}
        <div style={{
          background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
          borderLeft:`3px solid ${C.red}`, borderRadius:"0 10px 10px 0",
          padding:"12px 16px", marginBottom:28, textAlign:"left", width:"100%",
        }}>
          <div style={{ fontSize:13, color:C.white60, fontStyle:"italic", lineHeight:1.6 }}>
            "Your love makes me strong, your hate makes me unstoppable."
          </div>
          <div style={{ fontSize:11, color:C.gold, marginTop:6, fontWeight:700 }}>— Cristiano Ronaldo</div>
        </div>

        <RedBtn onClick={onEnter} style={{ fontSize:16, padding:"15px", borderRadius:14 }}>
          Enter GoalMind ⚡
        </RedBtn>
      </div>
    </div>
  );
}

// ── Screens ────────────────────────────────────────────────────────────────

function HomeScreen({ setTab }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

      {/* Hero card */}
      <GlassCard style={{
        background:`linear-gradient(135deg, rgba(139,0,0,0.18), rgba(0,0,0,0.4))`,
        border:`1px solid rgba(139,0,0,0.3)`,
        position:"relative", overflow:"hidden", padding:22,
      }}>
        <div style={{ position:"absolute", top:-30, right:-30, fontSize:130, opacity:0.04, transform:"rotate(-15deg)" }}>⚽</div>
        <div style={{ fontSize:11, color:C.gold, fontWeight:700, letterSpacing:"0.1em", marginBottom:8 }}>
          ⚡ FIFA WORLD CUP 2026
        </div>
        <div style={{ fontSize:22, fontWeight:900, color:C.white, lineHeight:1.2, marginBottom:6 }}>
          AI Predictions<br/>Powered by GoalMind
        </div>
        <div style={{ fontSize:12, color:C.white60, marginBottom:18 }}>
          USA · Canada · Mexico · 48 Teams
        </div>
        <button onClick={() => setTab("predict")} style={{
          background:`linear-gradient(135deg,${C.red},${C.redBright})`,
          color:C.white, border:"none", borderRadius:10,
          padding:"10px 20px", fontWeight:700, fontSize:13, cursor:"pointer",
        }}>
          Predict a Match →
        </button>
      </GlassCard>

      {/* Quick actions */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {[
          { icon:"🤖", label:"AI Predict", sub:"Match prediction", tab:"predict", color:C.redBright },
          { icon:"🔥", label:"Hot Take", sub:"Bold AI opinions", tab:"hottake", color:C.gold },
          { icon:"📊", label:"Team Stats", sub:"Deep analysis", tab:"teams", color:"#29b6f6" },
          { icon:"🏆", label:"Bracket", sub:"Full tournament", tab:"bracket", color:"#ab47bc" },
        ].map(({ icon, label, sub, tab, color }) => (
          <button key={tab} onClick={() => setTab(tab)} style={{
            background:C.glass, border:`1px solid ${C.glassBorder}`,
            borderRadius:14, padding:"16px 12px",
            display:"flex", flexDirection:"column", alignItems:"flex-start",
            gap:6, cursor:"pointer", textAlign:"left",
          }}>
            <span style={{ fontSize:26 }}>{icon}</span>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color }}>{label}</div>
              <div style={{ fontSize:11, color:C.white30, marginTop:2 }}>{sub}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Schedule */}
      <GlassCard>
        <div style={{ fontSize:13, fontWeight:700, color:C.white, marginBottom:14, display:"flex", alignItems:"center", gap:6 }}>
          <span>📅</span> Upcoming Matches
        </div>
        {SCHEDULE.map((m, i) => (
          <div key={i} style={{
            display:"flex", justifyContent:"space-between", alignItems:"center",
            padding:"10px 0",
            borderBottom: i < SCHEDULE.length-1 ? `1px solid ${C.white6}` : "none",
          }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:C.white }}>{m.match}</div>
              <div style={{ fontSize:11, color:C.white30, marginTop:2 }}>{m.venue}</div>
            </div>
            <div style={{ textAlign:"right", flexShrink:0, marginLeft:12 }}>
              <div style={{ fontSize:11, color:C.gold, fontWeight:700 }}>{m.date}</div>
              <div style={{ fontSize:10, color:C.white30, marginTop:2 }}>{m.time}</div>
            </div>
          </div>
        ))}
      </GlassCard>
    </div>
  );
}

function PredictScreen() {
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [probs, setProbs] = useState(null);

  async function predict() {
    if (!teamA || !teamB) return;
    setLoading(true); setResult(null); setProbs(null);
    try {
      const text = await askGoalMind([{
        role:"user",
        content:`Predict: ${teamA} vs ${teamB}. Give win probability (format: "${teamA} Win: X% | Draw: X% | ${teamB} Win: X%"), top 3 reasons, upset factor, confidence level, and verdict.`
      }]);
      setResult(text);
      const nums = [...text.matchAll(/(\d+)%/g)].map(m => parseInt(m[1])).filter(n => n <= 100);
      if (nums.length >= 3) setProbs({ a:nums[0], d:nums[1], b:nums[2] });
    } catch { setResult("Error — please try again."); }
    setLoading(false);
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ fontSize:20, fontWeight:900, color:C.white }}>🤖 AI Match Prediction</div>

      <GlassCard>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div>
            <div style={{ fontSize:11, color:C.white30, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.07em" }}>Team A</div>
            <TeamSelect value={teamA} onChange={setTeamA} exclude={teamB} />
          </div>
          <div style={{ textAlign:"center", fontSize:16, color:C.white30, fontWeight:900, letterSpacing:"0.1em" }}>VS</div>
          <div>
            <div style={{ fontSize:11, color:C.white30, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.07em" }}>Team B</div>
            <TeamSelect value={teamB} onChange={setTeamB} exclude={teamA} />
          </div>
          <RedBtn onClick={predict} disabled={!teamA || !teamB || loading}>
            {loading ? "Analyzing…" : "Get Prediction ⚡"}
          </RedBtn>
        </div>
      </GlassCard>

      {loading && <AICard loading loadingLabel="GoalMind is analyzing" />}

      {result && !loading && (
        <>
          {probs && (
            <GlassCard>
              <div style={{ fontSize:12, fontWeight:700, color:C.white, marginBottom:12, textTransform:"uppercase", letterSpacing:"0.07em" }}>
                📊 Win Probability
              </div>
              <ProbBar a={probs.a} draw={probs.d} b={probs.b} labelA={teamA} labelB={teamB} />
            </GlassCard>
          )}
          <AICard>{result}</AICard>
        </>
      )}
    </div>
  );
}

function TeamsScreen() {
  const [team, setTeam] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  async function analyze() {
    if (!team) return;
    setLoading(true); setAnalysis(null);
    try {
      const text = await askGoalMind([{
        role:"user",
        content:`Analyze ${team} for FIFA World Cup 2026. Cover: last 10 matches W-D-L, goals scored/conceded, key players, strengths, weaknesses, form rating /10, World Cup chances.`
      }]);
      setAnalysis(text);
    } catch { setAnalysis("Error — try again."); }
    setLoading(false);
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ fontSize:20, fontWeight:900, color:C.white }}>📊 Team Analysis</div>
      <GlassCard>
        <div style={{ fontSize:11, color:C.white30, marginBottom:8, textTransform:"uppercase", letterSpacing:"0.07em" }}>Select Team</div>
        <TeamSelect value={team} onChange={setTeam} />
        <div style={{ marginTop:12 }}>
          <RedBtn onClick={analyze} disabled={!team || loading} gold>
            {loading ? "Analyzing…" : `Analyze ${team || "Team"} 📊`}
          </RedBtn>
        </div>
      </GlassCard>

      {loading && <AICard loading loadingLabel={`Analyzing ${team}`} />}
      {analysis && !loading && (
        <GlassCard accent style={{ borderTop:`2px solid ${C.gold}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <span style={{ fontSize:34 }}>{FLAGS[team] || "🏳️"}</span>
            <div>
              <div style={{ fontSize:16, fontWeight:800, color:C.white }}>{team}</div>
              <div style={{ fontSize:11, color:C.gold }}>FIFA World Cup 2026</div>
            </div>
          </div>
          <div style={{ fontSize:14, color:"rgba(255,255,255,0.88)", lineHeight:1.75, whiteSpace:"pre-wrap" }}>
            {analysis}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

function HotTakeScreen() {
  const [team, setTeam] = useState("");
  const [loading, setLoading] = useState(false);
  const [take, setTake] = useState(null);

  async function fire() {
    setLoading(true); setTake(null);
    const prompt = team
      ? `HOTTEST most controversial hot take about ${team} in FIFA World Cup 2026. Bold, no filter, mic-drop ending. 🔥`
      : `HOTTEST most controversial hot take about FIFA World Cup 2026 — who shocks everyone, who is overrated. Be savage! 🔥`;
    try {
      const text = await askGoalMind([{ role:"user", content:prompt }]);
      setTake(text);
    } catch { setTake("Error — try again."); }
    setLoading(false);
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {/* Header */}
      <GlassCard style={{
        background:`linear-gradient(135deg, rgba(139,0,0,0.22), rgba(180,80,0,0.10))`,
        border:`1px solid rgba(139,0,0,0.35)`,
        textAlign:"center", padding:24,
      }}>
        <div style={{ fontSize:48, marginBottom:6 }}>🔥</div>
        <div style={{ fontSize:22, fontWeight:900, color:C.white }}>Hot Take Mode</div>
        <div style={{ fontSize:13, color:C.white30, marginTop:4 }}>Bold. Unfiltered. Controversial.</div>
      </GlassCard>

      <GlassCard>
        <div style={{ fontSize:11, color:C.white30, marginBottom:8, textTransform:"uppercase", letterSpacing:"0.07em" }}>
          Pick a team (optional)
        </div>
        <TeamSelect value={team} onChange={setTeam} placeholder="Any team (or leave blank)" />
        <div style={{ marginTop:12 }}>
          <button onClick={fire} disabled={loading} style={{
            width:"100%",
            background:`linear-gradient(135deg,${C.red},#b71c1c,${C.gold})`,
            color:C.white, border:"none", borderRadius:12,
            padding:"14px", fontWeight:800, fontSize:15, cursor:"pointer",
            letterSpacing:"0.03em",
          }}>
            {loading ? "Cooking up heat…" : "🔥 Drop the Hot Take"}
          </button>
        </div>
      </GlassCard>

      {loading && <AICard loading loadingLabel="GoalMind is loading up" />}

      {take && !loading && (
        <>
          <GlassCard style={{ border:`1px solid rgba(139,0,0,0.4)`, borderTop:`2px solid ${C.redBright}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
              <span style={{ fontSize:22 }}>🔥</span>
              <span style={{ fontSize:13, fontWeight:700, color:C.redBright, textTransform:"uppercase", letterSpacing:"0.06em" }}>
                GoalMind Hot Take
              </span>
            </div>
            <div style={{ fontSize:14, color:"rgba(255,255,255,0.9)", lineHeight:1.78, whiteSpace:"pre-wrap" }}>
              {take}
            </div>
          </GlassCard>
          <RedBtn onClick={fire}>🔥 Another Hot Take</RedBtn>
        </>
      )}
    </div>
  );
}

function BracketScreen() {
  const [loading, setLoading] = useState(false);
  const [bracket, setBracket] = useState(null);

  async function gen() {
    setLoading(true); setBracket(null);
    try {
      const text = await askGoalMind([{
        role:"user",
        content:`Give full FIFA World Cup 2026 bracket prediction: top picks from groups, Round of 16, Quarter Finals, Semi Finals, Final, and predicted Champion. Confident reasoning for key picks.`
      }]);
      setBracket(text);
    } catch { setBracket("Error — try again."); }
    setLoading(false);
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ fontSize:20, fontWeight:900, color:C.white }}>🏆 Bracket Prediction</div>

      <GlassCard style={{ textAlign:"center", padding:28 }}>
        <div style={{ fontSize:54, marginBottom:10 }}>🏆</div>
        <div style={{ fontSize:16, fontWeight:700, color:C.white, marginBottom:6 }}>
          Full Tournament Bracket
        </div>
        <div style={{ fontSize:13, color:C.white30, marginBottom:20 }}>
          Groups → Round of 32 → Quarter Finals → Final
        </div>
        <RedBtn onClick={gen} disabled={loading} gold>
          {loading ? "Predicting…" : "Generate Full Bracket 🏆"}
        </RedBtn>
      </GlassCard>

      {loading && <AICard loading loadingLabel="Building bracket" />}

      {bracket && !loading && (
        <GlassCard style={{ border:`1px solid rgba(201,168,76,0.35)`, borderTop:`2px solid ${C.gold}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
            <span style={{ fontSize:22 }}>🏆</span>
            <span style={{ fontSize:13, fontWeight:700, color:C.gold, textTransform:"uppercase", letterSpacing:"0.06em" }}>
              GoalMind Bracket
            </span>
          </div>
          <div style={{ fontSize:14, color:"rgba(255,255,255,0.88)", lineHeight:1.78, whiteSpace:"pre-wrap" }}>
            {bracket}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

function ChatScreen() {
  const [msgs, setMsgs] = useState([
    { role:"assistant", text:"Assalam o Alaikum! Main GoalMind AI hoon ⚽\n\nKoi bhi football sawaal poochho — match prediction, team analysis, ya World Cup 2026 ke baare mein! 🏆🔥" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef();

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, loading]);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = { role:"user", text:input };
    const next = [...msgs, userMsg];
    setMsgs(next); setInput(""); setLoading(true);
    try {
      const apiMsgs = next.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content:m.text }));
      const reply = await askGoalMind(apiMsgs);
      setMsgs(m => [...m, { role:"assistant", text:reply }]);
    } catch {
      setMsgs(m => [...m, { role:"assistant", text:"Kuch masla aaya — dobara try karo!" }]);
    }
    setLoading(false);
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 160px)", minHeight:400 }}>
      <div style={{ fontSize:20, fontWeight:900, color:C.white, marginBottom:12 }}>💬 Ask GoalMind</div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:10, paddingBottom:8 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            maxWidth:"88%",
            background: m.role === "user"
              ? `linear-gradient(135deg,${C.red},${C.redBright})`
              : C.glass,
            border: m.role === "assistant" ? `1px solid ${C.glassBorder}` : "none",
            borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
            padding:"12px 14px",
          }}>
            {m.role === "assistant" && (
              <div style={{ fontSize:11, color:C.redBright, fontWeight:700, marginBottom:6, letterSpacing:"0.06em" }}>
                🤖 GOALMIND AI
              </div>
            )}
            <div style={{ fontSize:14, color:"rgba(255,255,255,0.9)", lineHeight:1.72, whiteSpace:"pre-wrap" }}>
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{
            alignSelf:"flex-start", background:C.glass,
            border:`1px solid ${C.glassBorder}`,
            borderRadius:"16px 16px 16px 4px", padding:"12px 14px",
          }}>
            <div style={{ fontSize:11, color:C.redBright, fontWeight:700, marginBottom:6 }}>🤖 GOALMIND AI</div>
            <div style={{ color:C.redBright, fontSize:14 }}>Thinking<Dots /></div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Suggestions */}
      <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap" }}>
        {["Argentina jeeta ga? 🇦🇷","France ka kya scene ha?","Dark horse kaun ha?"].map(q => (
          <button key={q} onClick={() => setInput(q)} style={{
            background:C.glass, border:`1px solid ${C.glassBorder}`,
            borderRadius:99, padding:"6px 12px",
            fontSize:11, color:C.white60, cursor:"pointer",
          }}>{q}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{ display:"flex", gap:8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Koi bhi sawaal poochho… ⚽"
          style={{
            flex:1,
            background:"rgba(255,255,255,0.05)",
            color:C.white,
            border:`1px solid ${C.glassBorder}`,
            borderRadius:12,
            padding:"12px 14px",
            fontSize:14,
            outline:"none",
          }}
        />
        <button onClick={send} disabled={!input.trim() || loading} style={{
          background: input.trim() ? `linear-gradient(135deg,${C.red},${C.redBright})` : C.glass,
          color:C.white,
          border:"none",
          borderRadius:12,
          padding:"12px 16px",
          fontWeight:800,
          fontSize:16,
          cursor:"pointer",
          flexShrink:0,
        }}>➤</button>
      </div>
    </div>
  );
}

// ── Shell ──────────────────────────────────────────────────────────────────

const NAV = [
  { id:"home",    icon:"🏠", label:"Home"    },
  { id:"predict", icon:"🤖", label:"Predict" },
  { id:"hottake", icon:"🔥", label:"Hot Take"},
  { id:"bracket", icon:"🏆", label:"Bracket" },
  { id:"chat",    icon:"💬", label:"Ask AI"  },
];

export default function App() {
  const [splash, setSplash] = useState(true);
  const [tab, setTab] = useState("home");

  const screens = {
    home:    <HomeScreen setTab={setTab} />,
    predict: <PredictScreen />,
    teams:   <TeamsScreen />,
    hottake: <HotTakeScreen />,
    bracket: <BracketScreen />,
    chat:    <ChatScreen />,
  };

  if (splash) return <SplashScreen onEnter={() => setSplash(false)} />;

  return (
    <div style={{
      background:`linear-gradient(160deg, #050505 0%, #0d0000 50%, #050505 100%)`,
      minHeight:"100vh",
      fontFamily:"Inter, -apple-system, sans-serif",
      color:C.white,
      display:"flex",
      flexDirection:"column",
      maxWidth:480,
      margin:"0 auto",
      position:"relative",
    }}>

      {/* Top bar */}
      <div style={{
        padding:"14px 18px 12px",
        display:"flex",
        alignItems:"center",
        justifyContent:"space-between",
        borderBottom:`1px solid ${C.glassBorder}`,
        position:"sticky", top:0, zIndex:10,
        background:"rgba(5,5,5,0.85)",
        backdropFilter:"blur(16px)",
        WebkitBackdropFilter:"blur(16px)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:22 }}>⚽</span>
          <span style={{ fontSize:19, fontWeight:900, letterSpacing:"-0.02em" }}>
            Goal<span style={{ color:C.redBright }}>Mind</span>
          </span>
        </div>
        <div style={{
          display:"inline-flex", alignItems:"center", gap:5,
          background:"rgba(139,0,0,0.18)", border:"1px solid rgba(139,0,0,0.4)",
          borderRadius:99, padding:"4px 10px",
        }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:C.redBright }} />
          <span style={{ fontSize:10, fontWeight:700, color:C.redBright, letterSpacing:"0.08em" }}>WC 2026 LIVE</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex:1, padding:"16px 16px 90px", overflowY:"auto" }}>
        {screens[tab]}
      </div>

      {/* Bottom nav */}
      <div style={{
        position:"fixed", bottom:0,
        left:"50%", transform:"translateX(-50%)",
        width:"100%", maxWidth:480,
        background:"rgba(5,5,5,0.92)",
        backdropFilter:"blur(20px)",
        WebkitBackdropFilter:"blur(20px)",
        borderTop:`1px solid ${C.glassBorder}`,
        display:"flex",
        zIndex:20,
        paddingBottom:"env(safe-area-inset-bottom)",
      }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} style={{
            flex:1,
            display:"flex",
            flexDirection:"column",
            alignItems:"center",
            gap:3,
            padding:"10px 0 8px",
            background:"none",
            border:"none",
            cursor:"pointer",
            color: tab === n.id ? C.redBright : "rgba(255,255,255,0.35)",
            transition:"color 0.2s",
            position:"relative",
          }}>
            {tab === n.id && (
              <div style={{
                position:"absolute",
                top:0, left:"20%", right:"20%",
                height:2,
                background:C.redBright,
                borderRadius:"0 0 4px 4px",
              }} />
            )}
            <span style={{ fontSize:20 }}>{n.icon}</span>
            <span style={{ fontSize:10, fontWeight: tab === n.id ? 700 : 400 }}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
