# Verification record

This file is deliberately conservative. It is a checklist for replacing not-observed values with genuine evidence.

## Repository

- [ ] source commit recorded
- [ ] CI workflow completed successfully on that commit
- [ ] no secrets committed
- [ ] fixture hashes generated from the source commit

## Contract

- [ ] genvm-lint check observed in GitHub Actions
- [ ] direct tests observed in GitHub Actions
- [ ] deployment transaction finalized on Studionet
- [ ] contract address read from the deployment receipt
- [ ] schema/state read back from the same contract

## Pilot

- [ ] tender creation finalized
- [ ] Proposal A commitment and reveal finalized
- [ ] Proposal B commitment and reveal finalized
- [ ] at least one evaluation finalized
- [ ] challenge/recheck finalized, if completed
- [ ] finalization finalized after the review deadline
- [ ] winning score and winner read from state
- [ ] award or refund message genuinely observed
- [ ] transfer settlement read back, if available

Nothing in this checklist is marked complete by prose alone. The companion JSON records are the machine-readable source of truth.
