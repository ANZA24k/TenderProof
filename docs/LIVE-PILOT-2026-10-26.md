# Current live pilot — 2026-10-26

Contract: https://explorer-studio.genlayer.com/address/0xd4861ebFc42D7bd813999FF23a831Cda6c4dcFB0

Website: https://tenderproof-anza24k.netlify.app/

Source SHA-256: 208cde95b97d23e9f0cd9094845bf2775288eaff5ea43c1bdf135ed2ef9347d8; deployed source readback matched byte for byte. The contract prompt explicitly specifies schema bounds; malformed reviewer results remain fail-closed with bounded diagnostics. The exact cause of earlier generic reviewer failures was not observed.

Tender 0 assesses one locked accessibility-plan criterion against the original commit-pinned synthetic Proposal A. It does not verify a deployed implementation.

| Operation | Finalized transaction |
| --- | --- |
| create_tender | https://explorer-studio.genlayer.com/tx/0xb86dd8e12a709d83620d9a0b1b3e7c99a3d780f048e4a16dadf7712a2a35ea1a |
| commit_proposal | https://explorer-studio.genlayer.com/tx/0x2da485cb956ca4bf54b400706d83922c2c5b277f886a37cc1aa0fcc4d3ac24c1 |
| reveal_proposal | https://explorer-studio.genlayer.com/tx/0x3ab3aa85dc20adfc067add82797728cd4d62739bb224560cdc1c7c71f965bf16 |
| evaluate_proposal | https://explorer-studio.genlayer.com/tx/0xec083ed5f25f564bb2bdf39972d0b80d0d233f8bc5692f4bb6ee9745c11a235a |
| finalize_tender | https://explorer-studio.genlayer.com/tx/0x5ed8d37cb54aa7b8af83863bf4f778b89772330194a8b043c1db4780f6c35107 |

Final readback: AWARDED, finalized true, winner 0x51292144203eCb173cbb89c20F0BD6975c29ff5C, winning_score_bps 10000, award_amount 0, award_status NONE. No award or refund transfer emitted.

The live SDK pilot uses a disposable local test account. The production browser independently verified finalized state reads, form examples, missing-extension handling, and receipt tracking. Real MetaMask extension signing, funded settlement, separate-account bidding and challenge/recheck were not verified in this run. Public frontend writes are limited to zero-GEN awards.

Historical deployments and failed/inconclusive runs remain preserved; they are not rewritten as passes.
