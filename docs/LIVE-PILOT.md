# Genuine Studionet pilot — 2026-10-08

Contract: `0xfCe8679513b27B9Cb730bD3C2EAbC763A97634C3`

Explorer: https://explorer-studio.genlayer.com/address/0xfCe8679513b27B9Cb730bD3C2EAbC763A97634C3

Source: GitHub commit `69acfc0b02947ba384bf5aebd3dd10ddaa4aa1cf`; contract SHA-256 `ec93824539d8f92b048ce0b62c2b7fe042ce5361f3090830668ba2f8a4d75c33`.

Studio execution mode was Normal (Full Consensus), not Leader Only or Simulation Mode. Deployment, tender creation, Proposal A commitment, reveal, and evaluation all finalized. The reveal authenticated the exact commit-pinned fixture bytes.

Evaluation transaction `0x54cd73c73d3e8fbea8a94a63fb68a88630f645623a8d2e27e8d624882ca75a1d` shows execution SUCCESS, but its verdict is UNRESOLVED with all five criteria INCONCLUSIVE, score 0, and eligible false. The equivalence output reports `reviewer returned an invalid or unsafe result`. This is a real fail-closed result, not evidence that Proposal A passed. The precise rejected reviewer field was not exposed by this deployed contract's diagnostic output; no unsupported root-cause assertion is made.

This run has one applicant and a zero-GEN award. The sponsor and applicant are the same sandbox address. Proposal B, distinct-account comparison, challenge/recheck, and funded transfer were not executed. MetaMask software paths have mocked-provider/UI coverage, but the user's real extension has not been used. These limits must remain explicit in submissions and handoff.

Settlement transaction `0x30a77d59ed45a37fea8246266a8d89051a2647001af53a597c6d0d200c2f9128` finalized after the review deadline. The finalized tender readback has status REFUNDED, finalized true, winner null, award_amount 0, award_status NONE, and both transfer-emitted flags false. No actual GEN transfer occurred.

Use evidence/pilot-record.json for transaction IDs and captured final state. Passing tests and a finalized transaction do not imply a successful semantic verdict, transfer settlement, or production readiness.
