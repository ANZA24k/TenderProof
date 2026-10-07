# Submission notes

TenderProof is intended to be submitted as a GenLayer Intelligent Contract contribution.

## Why it is a contract primitive

TenderProof is reusable wherever a sponsor needs to publish a fixed rubric, bind applicants to exact public evidence, and resolve semantic requirements through independent validator judgment. It is not a generic AI decides demo: the contract does not ask validators to pick a winner, and the deterministic layer performs all state transitions, scoring, ranking, quotas, and settlement.

## Reviewer path

1. Read contracts/tenderproof.py.
2. Run genvm-lint check and python -m pytest -q.
3. Review evidence/fixtures/ for the synthetic tender and adversarial proposal text.
4. Read docs/ARCHITECTURE.md and docs/SECURITY.md.
5. Open the read-only site under site/ or the verified deployed URL once available.
6. Inspect deployment.studionet.json and evidence/pilot-record.json; null fields mean no value was observed.

## Claims boundary

This repository does not claim encrypted sealed bidding, legal procurement, identity verification, production escrow, cash value for test GEN, or a completed Studionet pilot until those facts are backed by genuine receipts and state reads.
