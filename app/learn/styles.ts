export const CSS = `
body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
body { background: #0c0c0c; }
.lx {
  --bg: #0c0c0c; --surface: #151515; --surface2: #1c1c1c; --line: #262626;
  --text: #f2efe9; --muted: #8b867e; --accent: #3fbf7f; --gold: #f2c94c;
  --again: #e5534b; --hard: #d9a441; --good: #3fbf7f; --easy: #5b9df5;
  --serif: Georgia, 'Times New Roman', serif;
  --sans: system-ui, -apple-system, 'Segoe UI', sans-serif;
  min-height: 100vh; min-height: 100dvh; background: var(--bg); color: var(--text);
  font-family: var(--sans); -webkit-font-smoothing: antialiased;
}
.lx * { box-sizing: border-box; }
.lx button { font: inherit; color: inherit; cursor: pointer; }
.lx-wrap { max-width: 640px; margin: 0 auto; padding: 20px 16px 48px; }
.lx-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 40px; }
.lx-link { background: none; border: 0; padding: 6px 0; color: var(--muted); font-size: 14px; text-decoration: none; }
.lx-link:hover { color: var(--text); }
.lx-hero { padding: 36px 0 28px; }
.lx-flag { font-size: 34px; line-height: 1; }
.lx-h1 { font-family: var(--serif); font-weight: 400; font-size: clamp(34px, 8vw, 48px); line-height: 1.05; margin: 14px 0 8px; letter-spacing: -0.01em; }
.lx-sub { color: var(--muted); font-size: 15px; margin: 0; }
.lx-counts { display: grid; grid-template-columns: repeat(3, 1fr); border: 1px solid var(--line); border-radius: 14px; overflow: hidden; }
.lx-count { padding: 16px 12px; text-align: center; }
.lx-count + .lx-count { border-left: 1px solid var(--line); }
.lx-count b { display: block; font-size: 28px; font-weight: 600; font-variant-numeric: tabular-nums; }
.lx-count span { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; }
.c-new { color: var(--easy); } .c-learn { color: var(--again); } .c-due { color: var(--good); }
.lx-primary { width: 100%; margin-top: 14px; padding: 16px; border-radius: 14px; border: 0; background: var(--text); color: #0c0c0c !important; font-weight: 600; font-size: 16px; }
.lx-primary:disabled { opacity: 0.35; cursor: default; }
.lx-secondary { width: 100%; margin-top: 10px; padding: 13px; border-radius: 14px; border: 1px solid var(--line); background: transparent; font-size: 15px; }
.lx-secondary:hover { background: var(--surface); }
.lx-done { margin-top: 14px; padding: 18px; border-radius: 14px; background: var(--surface); text-align: center; color: var(--muted); font-size: 15px; }
.lx-done strong { display: block; color: var(--text); font-family: var(--serif); font-weight: 400; font-size: 22px; margin-bottom: 4px; }
.lx-section { margin-top: 36px; }
.lx-h2 { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 500; margin: 0 0 12px; }
.lx-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
@media (min-width: 520px) { .lx-stats { grid-template-columns: repeat(4, 1fr); } }
.lx-stat { background: var(--surface); border-radius: 12px; padding: 14px; }
.lx-stat b { display: block; font-size: 22px; font-weight: 600; font-variant-numeric: tabular-nums; }
.lx-stat span { font-size: 12px; color: var(--muted); }
.lx-fc { display: flex; gap: 6px; align-items: flex-end; height: 92px; }
.lx-fc-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; justify-content: flex-end; }
.lx-fc-bar { width: 100%; max-width: 44px; background: var(--surface2); border-radius: 6px 6px 2px 2px; min-height: 3px; }
.lx-fc-col:first-child .lx-fc-bar { background: var(--good); }
.lx-fc-col small { font-size: 11px; color: var(--muted); }
.lx-fc-col em { font-style: normal; font-size: 11px; font-variant-numeric: tabular-nums; }
.lx-topic { display: flex; align-items: center; gap: 14px; padding: 14px 0; border-bottom: 1px solid var(--line); }
.lx-topic-main { flex: 1; min-width: 0; }
.lx-topic-name { font-size: 15px; }
.lx-topic-blurb { font-size: 13px; color: var(--muted); margin-top: 2px; }
.lx-prog { height: 3px; background: var(--surface2); border-radius: 2px; margin-top: 10px; overflow: hidden; }
.lx-prog > div { height: 100%; background: var(--accent); }
.lx-topic.off .lx-topic-main { opacity: 0.4; }
.lx-switch { position: relative; width: 40px; height: 24px; border-radius: 12px; border: 0; background: var(--surface2); flex-shrink: 0; transition: background .15s; }
.lx-switch::after { content: ''; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: var(--muted); transition: transform .15s, background .15s; }
.lx-switch[aria-checked="true"] { background: rgba(63,191,127,.3); }
.lx-switch[aria-checked="true"]::after { transform: translateX(16px); background: var(--accent); }
.lx-foot { display: flex; gap: 20px; justify-content: center; margin-top: 36px; }
.lx-about { color: var(--muted); font-size: 14px; line-height: 1.6; }
.lx-about p { margin: 0 0 10px; }

/* Study */
.lx-study { display: flex; flex-direction: column; min-height: 100vh; min-height: 100dvh; max-width: 640px; margin: 0 auto; padding: 12px 16px 0; }
.lx-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 44px; }
.lx-mini { display: flex; gap: 14px; font-variant-numeric: tabular-nums; font-size: 15px; font-weight: 600; }
.lx-mini span.cur { text-decoration: underline; text-underline-offset: 5px; }
.lx-icon { background: none; border: 0; color: var(--muted); padding: 8px; font-size: 14px; border-radius: 8px; }
.lx-icon:hover { color: var(--text); background: var(--surface); }
.lx-icon:disabled { opacity: .3; cursor: default; background: none; }
.lx-card { flex: 1; display: flex; flex-direction: column; justify-content: center; text-align: center; padding: 24px 0 28px; }
.lx-kicker { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 18px; }
.lx-word { font-family: var(--serif); font-size: clamp(32px, 9vw, 52px); line-height: 1.15; margin: 0; overflow-wrap: anywhere; }
.lx-word.en { font-family: var(--sans); font-weight: 500; font-size: clamp(26px, 7vw, 40px); }
.lx-say { display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; margin: 16px auto 0; border-radius: 50%; border: 1px solid var(--line); background: transparent; color: var(--muted) !important; }
.lx-say:hover { color: var(--text) !important; border-color: var(--muted); }
.lx-say.sm { width: 32px; height: 32px; margin: 0 0 0 8px; vertical-align: middle; }
.lx-rule { width: 40px; height: 1px; background: var(--line); margin: 28px auto; border: 0; }
.lx-answer { font-size: 22px; line-height: 1.35; }
.lx-ex { margin-top: 22px; font-size: 16px; line-height: 1.5; }
.lx-ex .pt { font-family: var(--serif); font-size: 19px; }
.lx-ex .en { color: var(--muted); margin-top: 4px; }
.lx-tip { margin: 22px auto 0; max-width: 460px; font-size: 14px; line-height: 1.5; color: var(--muted); background: var(--surface); border-radius: 10px; padding: 12px 14px; text-align: left; }
.lx-tip::before { content: 'Tip · '; color: var(--gold); }
.lx-input { width: 100%; max-width: 420px; margin: 26px auto 0; display: block; padding: 14px 16px; border-radius: 12px; border: 1px solid var(--line); background: var(--surface); color: var(--text); font: 18px var(--serif); text-align: center; outline: none; }
.lx-input:focus { border-color: var(--muted); }
.lx-result { margin-top: 18px; font-size: 15px; }
.lx-result.ok { color: var(--good); } .lx-result.close { color: var(--hard); } .lx-result.no { color: var(--again); }
.lx-result s { opacity: .7; }
.lx-actions { position: sticky; bottom: 0; padding: 12px 0 calc(16px + env(safe-area-inset-bottom)); background: linear-gradient(to bottom, rgba(12,12,12,0), var(--bg) 22%); }
.lx-reveal { width: 100%; padding: 18px; border-radius: 14px; border: 1px solid var(--line); background: var(--surface); font-size: 16px; font-weight: 500; }
.lx-reveal:hover { background: var(--surface2); }
.lx-grades { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.lx-grade { padding: 12px 4px; border-radius: 14px; border: 1px solid var(--line); background: var(--surface); display: flex; flex-direction: column; align-items: center; gap: 3px; }
.lx-grade b { font-weight: 600; font-size: 15px; }
.lx-grade small { font-size: 12px; color: var(--muted); font-variant-numeric: tabular-nums; }
.lx-grade.g1 b { color: var(--again); } .lx-grade.g2 b { color: var(--hard); } .lx-grade.g3 b { color: var(--good); } .lx-grade.g4 b { color: var(--easy); }
.lx-grade:hover { background: var(--surface2); }
.lx-keys { text-align: center; font-size: 12px; color: #55524d; margin-top: 10px; }
@media (hover: none) { .lx-keys { display: none; } }

/* Lists & forms */
.lx-search { width: 100%; padding: 12px 14px; border-radius: 12px; border: 1px solid var(--line); background: var(--surface); color: var(--text); font-size: 15px; outline: none; }
.lx-search:focus { border-color: var(--muted); }
.lx-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--line); }
.lx-row-main { flex: 1; min-width: 0; }
.lx-row-t { font-family: var(--serif); font-size: 17px; }
.lx-row-en { font-size: 13px; color: var(--muted); margin-top: 2px; }
.lx-badges { display: flex; gap: 4px; flex-shrink: 0; }
.lx-badge { font-size: 11px; padding: 3px 7px; border-radius: 6px; background: var(--surface2); color: var(--muted); font-variant-numeric: tabular-nums; white-space: nowrap; }
.lx-badge.learning { color: var(--again); } .lx-badge.review { color: var(--good); } .lx-badge.due { color: var(--gold); }
.lx-chips { display: flex; gap: 6px; overflow-x: auto; padding: 12px 0 4px; scrollbar-width: none; }
.lx-chips::-webkit-scrollbar { display: none; }
.lx-chip { flex-shrink: 0; padding: 7px 12px; border-radius: 99px; border: 1px solid var(--line); background: transparent; font-size: 13px; color: var(--muted) !important; }
.lx-chip.on { background: var(--text); color: #0c0c0c !important; border-color: var(--text); }
.lx-field { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 0; border-bottom: 1px solid var(--line); }
.lx-field label, .lx-field .lbl { font-size: 15px; }
.lx-field .hint { display: block; font-size: 13px; color: var(--muted); margin-top: 3px; }
.lx-select, .lx-num { padding: 9px 10px; border-radius: 10px; border: 1px solid var(--line); background: var(--surface); color: var(--text); font-size: 14px; max-width: 200px; }
.lx-num { width: 80px; text-align: center; }
.lx-danger { color: var(--again) !important; }
.lx-langs { display: grid; gap: 12px; margin-top: 28px; }
.lx-lang { display: flex; align-items: center; gap: 16px; padding: 20px; border-radius: 16px; background: var(--surface); border: 1px solid var(--line); color: var(--text); text-decoration: none; transition: border-color .15s; }
.lx-lang:hover { border-color: var(--muted); }
.lx-lang .flag { font-size: 32px; }
.lx-lang .name { font-family: var(--serif); font-size: 22px; }
.lx-lang .meta { font-size: 13px; color: var(--muted); margin-top: 3px; }
.lx-lang .go { margin-left: auto; color: var(--muted); }
`
