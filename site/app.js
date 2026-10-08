(() => {
  const by = (selector) => document.querySelector(selector);
  const set = (selector, value) => {
    const node = by(selector);
    if (node) node.textContent = value;
  };

  fetch("deployment.studionet.json", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error("deployment record unavailable");
      return response.json();
    })
    .then((record) => {
      set("[data-network]", record.network || "Studionet");
      set("[data-chain-id]", String(record.chainId || "61999"));
      set("[data-contract]", record.contractAddress || "Not deployed");
      set("[data-pilot]", record.pilotTenderId === null || record.pilotTenderId === undefined ? "Not run" : String(record.pilotTenderId));
      const message = by("[data-live-message]");
      if (record.status === "finalized" && record.contractAddress) {
        message.textContent = "TenderProof deployment is finalized on Studionet. This page shows captured, verified receipts—not a continuous live state feed. Inspect the contract in the explorer for current state.";
        message.classList.add("is-live");
      } else {
        message.textContent = "No finalized deployment is configured. Synthetic fixtures below are clearly separate from live chain state.";
      }
    })
    .catch(() => {
      set("[data-live-message]", "Live deployment data is unavailable; no fallback values are being displayed.");
    });

  fetch("pilot-record.json", { cache: "no-store" })
    .then((response) => response.json())
    .then((record) => {
      const status = record.status === "finalized" ? "Finalized — no eligible winner" : record.status === "in-progress" ? "Live pilot in progress" : "Not run";
      set("[data-phase-commit]", record.proposals?.some(p => p.commitTransaction) ? "Finalized" : "Not run");
      set("[data-phase-reveal]", record.proposals?.some(p => p.revealTransaction) ? "Finalized" : "Not run");
      set("[data-phase-review]", record.evaluations?.length ? "Finalized · INCONCLUSIVE" : "Not run");
      set("[data-outcome]", record.winner ? "Winner recorded" : status);
    })
    .catch(() => set("[data-outcome]", "Not observed"));
})();
