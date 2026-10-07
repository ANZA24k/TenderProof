# Architecture

## Boundary

TenderProof has one primary on-chain component: contracts/tenderproof.py.

The static site is a read-only evidence surface. It does not connect wallets, sign transactions, host a backend, or invent live state. If deployment.studionet.json is still unconfigured, it says so.

## Deterministic layer

The contract controls:

- sender authorization and one-wallet proposal limits;
- phase transitions based on the deterministic transaction timestamp;
- tender and rubric immutability;
- SHA-256 commitment and reveal matching;
- URL, hash, size, and count bounds;
- criterion weights and score-bucket arithmetic;
- mandatory failure and inconclusive handling;
- challenge quotas and append-only revision history;
- winner ranking and the tie-break digest;
- accounting and the single final settlement path.

Persistent collections use the current GenLayer Python SDK shapes: TreeMap[u256, str] for JSON records and DynArray[str] for bounded event history. Storing bounded JSON records makes the public views easy to inspect while keeping the deterministic mutation surface explicit.

## Consensus layer

reveal_proposal uses strict equality over normalized byte fingerprints. It never stores raw fetched bytes.

evaluate_proposal uses gl.vm.run_nondet_unsafe:

1. the leader fetches the exact proposal and all locked evidence;
2. the leader asks the LLM for one structured criterion result per locked criterion;
3. the validator independently fetches the same URLs;
4. the validator independently evaluates the same locked rubric;
5. the validator accepts only when material decision fields match: criterion ID, status, and score bucket;
6. only the consensus result enters deterministic storage.

Reasoning text and citation subsets do not affect winner ranking, but citations must still be URLs from the locked evidence set.

## Settlement

The sponsor funds a tender with a payable create_tender call. The amount is stored in award_amount and included in escrow.

After the review deadline, anyone may call finalize_tender. The contract marks the terminal state and reserves the award or refund before emitting the current documented external transfer message to the winner or sponsor. The stored boolean records that the message was emitted by the finalized contract execution; it is not presented as independent proof of recipient balance settlement.
