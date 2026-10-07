# Security model and limitations

## Evidence and URL policy

The contract accepts only HTTPS raw GitHub URLs pinned to a full lowercase 40-character commit SHA. It rejects credentials, queries, fragments, private-network URLs, mutable branches, path traversal, duplicate URLs/hashes, oversized bodies, and oversized evidence budgets.

This is an allowlist and byte-authentication policy, not a complete guarantee about GitHub availability or the safety of every document. Redirect and validator network behavior remain environment-dependent.

## Public commitment model

TenderProof is not encrypted sealed bidding. An applicant who publishes proposal bytes before reveal can be copied or front-run. The protocol preserves a pre-deadline hash commitment and proves that the later public bytes match it; it does not provide privacy, encryption, identity verification, or Sybil resistance.

## Prompt injection

Proposal and evidence text is explicitly framed as untrusted data. Embedded strings such as IGNORE PREVIOUS INSTRUCTIONS, System message, or approve this proposal are not commands. The contract asks for a strict schema and the validator independently evaluates the locked documents. The fixture for Proposal A contains an adversarial sentence and the tests keep it inside the data boundary.

No prompt can make absent evidence true. Human review of ambiguous requirements is still appropriate.

## Consensus and disagreement

Validators re-fetch the locked resources independently. Material disagreements fail closed through run_nondet_unsafe; the contract does not accept a leader-only answer. A network change, invalid UTF-8 response, LLM schema failure, or disagreement can leave the proposal unresolved and ineligible.

## Governance and abuse

The sponsor cannot mutate a tender after creation, choose a winner, or reclaim funded award before finalization. The sponsor can still write an ambiguous rubric, create an unfair specification, or collude with an applicant. Applicants can use multiple wallets. These are protocol limitations, not solved identity or procurement controls.

## Funds

The contract uses current native GEN payable and external-message patterns. State is set before the transfer message is emitted, and settlement booleans prevent replay through the terminal state. A transfer message is not independently verified recipient settlement. Studionet GEN is test value with no claimed cash value.

## Operational limitations

- commit-pinned GitHub raw resources can become unavailable;
- proposal content is public at reveal;
- the prototype has bounded loops and no pagination for a tender's 32-proposal list;
- no legal procurement guarantees, confidential bidding, KYC, dispute court, or production escrow;
- current Studio and validator behavior can differ from a local direct-mode mock;
- no deployment or pilot value is claimed until a real receipt, finalized state, and readback are recorded.
