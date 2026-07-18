"use client";

/**
 * Access gate for /tools/* — the proxy redirects here when the
 * SMART_RESIZE_CODE cookie is missing. Styled to match the tool.
 */

import React, { useState } from "react";

export default function UnlockPage() {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || busy) return;
    setBusy(true);
    setErr("");
    const res = await fetch("/api/tools/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim() }),
    }).catch(() => null);
    if (res?.ok) {
      const from = new URLSearchParams(window.location.search).get("from");
      window.location.replace(from && from.startsWith("/tools") ? from : "/tools/smart-resize");
      return;
    }
    setErr(
      res && res.status === 401
        ? "That code isn't right — check with AJ."
        : "Something went wrong — try again."
    );
    setBusy(false);
  };

  return (
    <div className="sru-root">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <main className="sru-box">
        <div className="sru-eyebrow">Team access</div>
        <h1>
          Smart <span className="hl">Resize</span>
        </h1>
        <p>This tool is for the team. Enter the access code to continue.</p>
        <form onSubmit={submit}>
          <input
            type="password"
            autoFocus
            placeholder="Access code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            aria-label="Access code"
          />
          <button type="submit" disabled={!code.trim() || busy}>
            {busy ? "Checking…" : "Unlock"}
          </button>
        </form>
        {err && <div className="sru-err">{err}</div>}
      </main>
    </div>
  );
}

const CSS = `
.sru-root{--bg:#0d0c0a;--card:#141210;--ink:#eae5d8;--muted:#9a948a;--faint:#4a453d;--line:#2a2621;--accent:#ff5c38;--danger:#ff6b5e;
  --srf:var(--serif,Georgia,serif);--sns:var(--sans,system-ui,sans-serif);--mno:var(--mono,ui-monospace,monospace);
  background:radial-gradient(700px 380px at 50% -10%,rgba(255,92,56,.09),transparent 60%),var(--bg);
  color:var(--ink);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;font-family:var(--sns)}
.sru-root *{box-sizing:border-box}
.sru-box{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:36px 32px;max-width:400px;width:100%;text-align:center}
.sru-eyebrow{font-family:var(--mno);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);margin-bottom:14px}
.sru-root h1{font-family:var(--srf);font-weight:400;font-size:clamp(34px,6vw,44px);line-height:.95;letter-spacing:-.025em;margin:0;color:var(--ink)}
.sru-root h1 .hl{background:linear-gradient(180deg,transparent 62%,var(--accent) 62%,var(--accent) 92%,transparent 92%);padding:0 5px;font-style:italic}
.sru-root p{color:var(--muted);font-size:14px;margin:14px 0 22px}
.sru-root form{display:flex;flex-direction:column;gap:10px}
.sru-root input{border:1px solid var(--line);background:#1c1914;color:var(--ink);border-radius:999px;padding:12px 18px;font-size:14px;font-family:var(--mno);text-align:center;letter-spacing:.08em}
.sru-root input::placeholder{color:var(--faint);letter-spacing:normal}
.sru-root input:focus{outline:1px solid var(--accent);border-color:var(--accent)}
.sru-root button{border:1px solid var(--accent);background:var(--accent);color:#12110e;border-radius:999px;padding:12px;font-size:14px;font-weight:600;cursor:pointer;font-family:var(--sns);transition:all .2s}
.sru-root button:hover:not(:disabled){background:transparent;color:var(--accent)}
.sru-root button:disabled{opacity:.4;cursor:not-allowed}
.sru-err{color:var(--danger);font-size:13px;margin-top:14px}
@media (prefers-reduced-motion: reduce){.sru-root *{transition:none!important}}
`;
