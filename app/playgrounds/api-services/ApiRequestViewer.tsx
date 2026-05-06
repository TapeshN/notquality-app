"use client";

import { useMemo, useState } from "react";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface Preset {
  label: string;
  method: HttpMethod;
  path: string;
  body: string;
}

const PRESETS: Preset[] = [
  { label: "List products", method: "GET", path: "/api/products", body: "" },
  { label: "Search products", method: "GET", path: "/api/products?search=headphones", body: "" },
  { label: "Products by category", method: "GET", path: "/api/products?category=Electronics", body: "" },
  { label: "List cart", method: "GET", path: "/api/cart/items", body: "" },
  {
    label: "Add to cart (invalid quantity)",
    method: "POST",
    path: "/api/cart/items",
    body: JSON.stringify({ productId: "replace-with-product-id", quantity: 0 }, null, 2),
  },
  { label: "Submit order", method: "POST", path: "/api/orders", body: "" },
  { label: "Get reports", method: "GET", path: "/api/reports", body: "" },
];

export default function ApiRequestViewer() {
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [path, setPath] = useState("/api/products");
  const [requestBody, setRequestBody] = useState("");
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseDuration, setResponseDuration] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<[string, string][]>([]);
  const [responseText, setResponseText] = useState("");
  const [running, setRunning] = useState(false);

  const parsedJson = useMemo(() => {
    if (!responseText) return "";
    try {
      return JSON.stringify(JSON.parse(responseText), null, 2);
    } catch {
      return responseText;
    }
  }, [responseText]);

  function applyPreset(preset: Preset) {
    setMethod(preset.method);
    setPath(preset.path);
    setRequestBody(preset.body);
  }

  async function executeRequest() {
    setRunning(true);
    setResponseStatus(null);
    setResponseDuration(null);
    setResponseHeaders([]);
    setResponseText("");

    const start = performance.now();
    try {
      const options: RequestInit = { method };
      if (method !== "GET" && method !== "DELETE") {
        options.headers = { "Content-Type": "application/json" };
        options.body = requestBody;
      }

      const response = await fetch(path, options);
      const elapsed = Math.round(performance.now() - start);
      const text = await response.text();

      setResponseStatus(response.status);
      setResponseDuration(elapsed);
      setResponseHeaders(Array.from(response.headers.entries()));
      setResponseText(text);
    } catch (error) {
      const elapsed = Math.round(performance.now() - start);
      setResponseStatus(0);
      setResponseDuration(elapsed);
      setResponseText(error instanceof Error ? error.message : "Unknown request error");
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="mb-8 rounded-lg border border-zinc-800 bg-zinc-900 p-4" data-testid="api-request-viewer">
      <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-zinc-500">
        Interactive Request Viewer
      </h2>

      <div className="mb-3 flex flex-wrap gap-2" data-testid="api-presets">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => applyPreset(preset)}
            className="rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:text-white"
            data-testid="api-preset-btn"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-[140px_1fr_auto]">
        <select
          value={method}
          onChange={(event) => setMethod(event.target.value as HttpMethod)}
          className="rounded-md border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm"
          data-testid="api-method-select"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
        <input
          value={path}
          onChange={(event) => setPath(event.target.value)}
          className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          data-testid="api-path-input"
        />
        <button
          onClick={() => void executeRequest()}
          disabled={running}
          className="rounded-md bg-zinc-200 px-3 py-2 text-sm font-medium text-zinc-900 disabled:opacity-60"
          data-testid="api-send-btn"
        >
          {running ? "Sending..." : "Send"}
        </button>
      </div>

      <textarea
        value={requestBody}
        onChange={(event) => setRequestBody(event.target.value)}
        placeholder='{"key":"value"}'
        className="mb-3 h-32 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-xs"
        data-testid="api-body-input"
      />

      <div className="mb-2 flex items-center gap-3 text-xs text-zinc-400">
        <span data-testid="api-response-status">Status: {responseStatus ?? "-"}</span>
        <span data-testid="api-response-time">Time: {responseDuration ?? "-"}ms</span>
      </div>

      <details className="mb-3 rounded-md border border-zinc-800 bg-zinc-950/40 p-2" data-testid="api-response-headers">
        <summary className="cursor-pointer text-xs text-zinc-400">Response headers</summary>
        <div className="mt-2 space-y-1 font-mono text-xs text-zinc-300">
          {responseHeaders.map(([key, value]) => (
            <p key={key}>
              {key}: {value}
            </p>
          ))}
        </div>
      </details>

      <pre
        className="max-h-80 overflow-auto rounded-md border border-zinc-800 bg-zinc-950 p-3 font-mono text-xs text-zinc-200"
        data-testid="api-response-body"
      >
        {parsedJson || "// Response appears here"}
      </pre>
    </section>
  );
}
