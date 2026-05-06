"use client";

import { useState } from "react";

export default function AccessibilityLabView() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-zinc-800 bg-zinc-900 p-4" data-testid="a11y-form-panel">
        <h2 className="mb-2 text-lg font-semibold">Form issues</h2>
        <div className="space-y-2">
          <input
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
            placeholder="Email without label"
            data-testid="a11y-email-input"
          />
          <input
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
            placeholder="Password without label"
            type="password"
            data-testid="a11y-password-input"
          />
        </div>
      </section>

      <section className="rounded-md border border-zinc-800 bg-zinc-900 p-4" data-testid="a11y-contrast-panel">
        <h2 className="mb-2 text-lg font-semibold">Contrast and focus issues</h2>
        <p className="text-zinc-500" data-testid="a11y-low-contrast">
          This paragraph uses low contrast text.
        </p>
        <button
          className="mt-3 rounded-md bg-zinc-700 px-3 py-2 text-zinc-400"
          data-testid="a11y-unfocused-btn"
        >
          Button with weak focus visibility
        </button>
      </section>

      <section className="rounded-md border border-zinc-800 bg-zinc-900 p-4" data-testid="a11y-modal-panel">
        <h2 className="mb-2 text-lg font-semibold">Modal keyboard behavior</h2>
        <button
          onClick={() => setShowModal(true)}
          className="rounded-md border border-zinc-700 px-3 py-2 text-sm"
          data-testid="a11y-open-modal"
        >
          Open modal
        </button>

        {showModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" data-testid="a11y-modal">
            <div className="w-full max-w-sm rounded-md bg-zinc-900 p-4">
              <p className="mb-3">Tab focus is not trapped in this modal.</p>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-md bg-zinc-200 px-3 py-2 text-sm text-zinc-900"
                data-testid="a11y-close-modal"
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
