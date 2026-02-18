"use client";

import React, { useMemo, useState } from "react";
import MathMarkdown from "@/components/markdown/MathMarkdown";

type TimeOfDay = "morning" | "afternoon" | "evening";
type Situation = "meet" | "leave" | "thanks" | "please";
type Formality = "casual" | "polite";

function greeting(time: TimeOfDay) {
  if (time === "evening") return "Bonswa";
  return "Bonjou";
}

function pickPhrase(args: { time: TimeOfDay; situation: Situation; formality: Formality }) {
  const g = greeting(args.time);
  if (args.situation === "meet") {
    return args.formality === "polite"
      ? `${g}! Kijan ou ye?`
      : `${g}! Kijan ou ye?`;
  }
  if (args.situation === "leave") {
    return args.formality === "polite" ? "Orevwa. Pase yon bèl jounen." : "Orevwa.";
  }
  if (args.situation === "thanks") return args.formality === "polite" ? "Mèsi anpil." : "Mèsi.";
  return args.formality === "polite" ? "Tanpri." : "Tanpri.";
}

function englishHint(s: Situation) {
  if (s === "meet") return "Meet / say hello";
  if (s === "leave") return "Leave / say goodbye";
  if (s === "thanks") return "Say thanks";
  return "Say please";
}

export default function HCGreetingsSketch() {
  const [time, setTime] = useState<TimeOfDay>("morning");
  const [situation, setSituation] = useState<Situation>("meet");
  const [formality, setFormality] = useState<Formality>("polite");
  const [name, setName] = useState("Sophia");

  const phrase = useMemo(
    () => pickPhrase({ time, situation, formality }),
    [time, situation, formality],
  );

  const dialogue = useMemo(() => {
    const you = phrase;
    const reply = situation === "meet" ? "Mwen byen, mèsi. E ou menm?" : "Dakò. Orevwa!";
    return `${name}: ${you}\nFriend: ${reply}\n`;
  }, [phrase, situation, name]);

  const hud = useMemo(() => {
    return String.raw`
**Greetings**

- **Bonjou**: daytime hello  
- **Bonswa**: evening hello  
- **Orevwa**: goodbye  
- **Mèsi**: thanks  
- **Tanpri**: please  

Try switching **time** and **situation** and notice how the phrase changes.
`.trim();
  }, []);

  return (
    <div className="w-full">
      <div className="grid gap-3 md:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <div className="text-xs font-extrabold text-white/70">Time</div>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value as any)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/90 outline-none"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
            </div>

            <div>
              <div className="text-xs font-extrabold text-white/70">Situation</div>
              <select
                value={situation}
                onChange={(e) => setSituation(e.target.value as any)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/90 outline-none"
              >
                <option value="meet">Meet</option>
                <option value="leave">Leave</option>
                <option value="thanks">Thanks</option>
                <option value="please">Please</option>
              </select>
            </div>

            <div>
              <div className="text-xs font-extrabold text-white/70">Tone</div>
              <select
                value={formality}
                onChange={(e) => setFormality(e.target.value as any)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/90 outline-none"
              >
                <option value="polite">Polite</option>
                <option value="casual">Casual</option>
              </select>
            </div>

            <div>
              <div className="text-xs font-extrabold text-white/70">Your name</div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/90 outline-none"
              />
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
              <div className="text-xs font-extrabold text-white/70">Haitian Creole</div>
              <div className="mt-2 text-sm font-black text-white/90">{phrase}</div>
              <div className="mt-2 text-xs text-white/60">
                Context: {englishHint(situation)} ({time})
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div className="text-xs font-extrabold text-white/70">Mini dialogue</div>
              <pre className="mt-2 whitespace-pre-wrap text-xs text-white/85">{dialogue}</pre>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <MathMarkdown className="text-sm text-white/80 [&_.katex]:text-white/90" content={hud} />
        </div>
      </div>
    </div>
  );
}
