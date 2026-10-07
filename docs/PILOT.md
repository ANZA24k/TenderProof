# Studionet pilot plan

The pilot is intentionally synthetic:

> Build a static incident-status dashboard for an open-source project.

Proposal A is designed to pass the five pilot criteria. Proposal B is designed to fail the mandatory accessibility criterion. Both are local project fixtures authored for testing; neither is a real bidder or company.

## Input preparation

After the fixture commit is known:

    TENDERPROOF_SOURCE_COMMIT=<real-40-char-lowercase-sha> python scripts/build_pilot_inputs.py

Copy the printed hashes and URLs into Studio method inputs. Never use a branch URL or an invented hash.

## Suggested compressed timing

Use a commitment window, reveal window, and review window long enough to complete the UI interactions, while keeping the windows clearly labelled as a testnet demonstration. The contract enforces the 30-second minimum gap and never skips authentication or validator agreement.

## Account roles

- Studio account A — sponsor and funder.
- Studio account B — Proposal A applicant.
- Studio account C — Proposal B applicant, if available.

Do not commit account secrets or assume addresses before Studio displays them.

## Evidence record

The pilot record starts as status: not-run. Once genuinely executed, record:

- deployment and method transaction identifiers;
- tender and proposal IDs;
- evaluation and challenge transaction identifiers;
- finalized tender/proposal readback;
- award/refund state and any transfer message identifier;
- screenshots or receipts only when they are genuine and attributable to this repository.
