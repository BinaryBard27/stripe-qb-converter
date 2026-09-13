"use client";

import { useState } from "react";

export default function ProUpgradePrompt() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  // Ads intentionally do not belong on the homepage or any /tools page.
  // If monetization is added later, place it on /blog pages only.
  return (
    <aside className="pro-upgrade-prompt" aria-label="Pro preview">
      <div>
        <span className="pro-badge">PRO PREVIEW</span>
        <h3>Do more with your next close.</h3>
        <p>Converting more than one file a month? Pro saves your mapping and handles batches.</p>
        <div className="pro-feature-row">
          <span>✓ Batch processing</span>
          <span>✓ Saved mappings</span>
          <span>✓ Still browser-only</span>
        </div>
      </div>
      <div className="pro-prompt-actions">
        <button type="button" className="pro-preview-button" onClick={() => window.alert("Pro preview — billing is not connected yet.")}>See Pro preview</button>
        <button type="button" className="pro-dismiss-button" onClick={() => setDismissed(true)} aria-label="Dismiss Pro prompt">Dismiss</button>
      </div>
    </aside>
  );
}
