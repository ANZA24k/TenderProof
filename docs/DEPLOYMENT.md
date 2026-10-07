# Deployment

## Current network

The current official Studio documentation lists Studionet as the stable hosted development environment with chain ID 61999. Use the Studio interface and built-in funded accounts/faucet. Do not request a wallet connection just to run the prototype.

Official references:

- https://docs.genlayer.com/developers/intelligent-contracts/tools/genlayer-studio
- https://docs.genlayer.com/developers/intelligent-contracts/tools/genlayer-studio/deploying-contract
- https://docs.genlayer.com/developers/intelligent-contracts/tools/genlayer-studio/execute-transaction
- https://docs.genlayer.com/developers/intelligent-contracts/features/value-transfers

## Studio sequence

1. Run the repository checks and keep the deployed source commit recorded.
2. Open https://studio.genlayer.com/ and select Studionet.
3. Load contracts/tenderproof.py.
4. Deploy the no-argument constructor.
5. Record the genuine deployment transaction and contract address.
6. Use the sponsor account to call payable create_tender with a small test-GEN value equal to award_amount.
7. Use distinct funded accounts for Proposal A and Proposal B commitments and reveals.
8. Use the exact fixture byte hashes and raw URLs pinned to the source commit that contains those fixtures.
9. Advance through the compressed windows; call evaluation and, if practical, one challenge/recheck.
10. After the review deadline, call finalize_tender.
11. Read the finalized tender, proposal records, accounting, and transaction/message receipts.
12. Update deployment.studionet.json, evidence/pilot-record.json, and docs/VERIFICATION.md with only the observed values, then rerun CI.

Do not manually fill any identifier. If a step cannot be executed or finalized, leave it null and document the blocker.

## Transfer interpretation

The contract records the transfer message emitted during finalization. The final record must distinguish:

- emitted message identifier, if Studio exposes it;
- finalized parent transaction;
- observed recipient balance change, if actually read;
- whether the transfer was only queued/emitted versus independently read back.

A test-GEN transfer is not a production escrow guarantee.
