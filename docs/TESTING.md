# Testing

The repository follows the current GenLayer testing split:

- direct mode is used for fast deterministic logic and mocked web/LLM boundaries;
- Studio/integration execution is a separate verification step and is not implied by direct tests;
- genvm-lint is run in CI for contract safety and type checking.

## Covered cases

The direct suite covers creation bounds, weight totals, exact funding, deadlines, one-wallet and duplicate-commitment rules, commit/reveal mismatch, URL security, exact-byte authentication, prompt-injection fixture data, independent validator disagreement, PASS/PARTIAL/FAIL/INCONCLUSIVE buckets, mandatory disqualification, append-only challenge/recheck behavior, deterministic score arithmetic, finalization, refund, accounting, and finalization replay.

Mocked LLM and web results prove contract validation and control flow only. They do not prove public consensus, model quality, or network availability.

## Commands

    python -m pytest -q
    genvm-lint check contracts/tenderproof.py
    genvm-lint typecheck contracts/tenderproof.py
    python scripts/verify_fixtures.py

The CI workflow is the source of truth for the observed GitHub Actions result. A local pass should not be described as a Studionet pass.
