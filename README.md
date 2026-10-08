# TenderProof

TenderProof is a public, evidence-bound tender and RFP evaluation protocol implemented as a GenLayer Intelligent Contract.

It separates deterministic procurement state from GenLayer consensus judgment:

- deterministic code locks the tender, rubric, commitments, phases, quotas, score arithmetic, ranking, and settlement;
- validators independently fetch the exact committed proposal and evidence, then assess each locked criterion;
- the contract calculates the weighted score and winner from coarse PASS / PARTIAL / FAIL / INCONCLUSIVE buckets.

## Verification status

This repository records only observed values. The contract and public evidence site are implemented; deployment and the Studionet pilot remain **not populated until genuinely executed**.

| Item | Status |
| --- | --- |
| GitHub source | [ANZA24k/TenderProof](https://github.com/ANZA24k/TenderProof) |
| Evidence site | [TenderProof on ChatGPT Sites](https://tenderproof.ansaf1st34.chatgpt.site) — published, owner-private |
| Network | Studionet prototype |
| Chain ID | 61999 |
| Contract address | Not deployed |
| Deployment transaction | Not observed |
| Pilot tender | Not run |
| Winner / award | Not observed |
| CI | Runs from .github/workflows/check.yml |
| Direct tests | python -m pytest -q |
| Linter | genvm-lint check contracts/tenderproof.py |

Do not read the empty deployment fields as a failed transaction. They are deliberately null until a real Studio receipt and finalized state are captured.

## What is implemented

- multiple tenders with explicit COMMITTING → REVEALING → REVIEW → READY_TO_FINALIZE → AWARDED / REFUNDED phases;
- exact native GEN funding on tender creation through the current payable method;
- immutable title, specification, criteria, weights, and mandatory flags;
- one proposal per wallet and duplicate commitment prevention;
- commit/reveal using the lowercase SHA-256 of exact proposal UTF-8 bytes;
- HTTPS commit-pinned raw GitHub evidence allowlist;
- exact-byte authentication before proposal evaluation;
- bounded supporting evidence and bounded challenge evidence;
- independent leader and validator review of the same evidence;
- strict result schema and coarse deterministic score buckets;
- mandatory-criterion disqualification and INCONCLUSIVE fail-closed behavior;
- append-only evaluation and challenge history;
- deterministic score ranking and SHA-256 tie break;
- one final award or refund path with an emitted native GEN transfer;
- accounting views, event history, direct-mode tests, linter configuration, and a reviewer-focused static site.

## Important limitation

TenderProof is not encrypted sealed bidding. The commitment hides proposal content only while the applicant keeps the bytes private. The chain stores a commitment hash; the applicant later publishes a public immutable URL for reveal. It is a Studionet/testnet prototype, not legally binding procurement, and test GEN is not cash.

## Repository map

- contracts/tenderproof.py — the Intelligent Contract.
- tests/test_tenderproof.py — direct-mode contract and security tests.
- evidence/fixtures/ — synthetic tender and proposal documents.
- evidence/ — deployment and pilot records; values are null until observed.
- site/ — reviewer evidence site with MetaMask connection and Studionet switching.
- docs/ — architecture, specification, security, testing, deployment, pilot, verification, and submission notes.
- scripts/ — fixture integrity and real-commit input helpers.
- .github/workflows/ — contract and wallet CI. Hosting uses ChatGPT Sites only.

## Local checks

Use Python 3.12+:

    python -m pip install -r requirements-dev.txt
    genvm-lint check contracts/tenderproof.py
    genvm-lint typecheck contracts/tenderproof.py
    python -m pytest -q
    python scripts/verify_fixtures.py

See docs/DEPLOYMENT.md before using Studio. Never commit a private key, seed phrase, token, or fabricated receipt.

## Website and wallet

Run `npm test` for the dependency-free wallet tests and `npm run build` to produce `dist/`. Serve `dist/` over HTTP or HTTPS; module scripts cannot run from file:// URLs.

The wallet connection uses MetaMask's EIP-1193 provider and EIP-6963 discovery. It requests only the public account and chain ID. Studionet switching is user initiated. Account revocation, network changes, pending requests, rejection, and local disconnect are handled. No seed phrase, private key, message signature, or transaction is requested. Local disconnect does not revoke MetaMask's site permissions.

Transactions are deliberately unavailable until a genuine finalized contract deployment is recorded. Passing mocked-provider tests does not mean a real user's MetaMask extension or on-chain settlement was tested.
