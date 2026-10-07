# Protocol specification

## Commitment scheme

For a proposal with exact UTF-8 bytes B:

    commitment_sha256 = lowercase_hex(SHA256(B))

The applicant commits only this 64-character digest before the commitment deadline. During reveal, the applicant supplies a commit-pinned raw GitHub URL and the expected digest. The contract independently retrieves the bytes and requires the digest to match both the reveal value and the earlier commitment.

Supporting evidence is supplied as bounded URL/hash/byte-length records during reveal. Challenge evidence is appended; original proposal bytes and the locked rubric cannot be replaced.

## Phases

- COMMITTING: applicants may commit one proposal each.
- REVEALING: applicants may reveal and authenticate a committed proposal.
- REVIEW: anyone may evaluate revealed proposals; the sponsor or applicant may use one bounded challenge quota each.
- READY_TO_FINALIZE: the review deadline has passed.
- AWARDED: an eligible winner was ranked and the optional award transfer was emitted.
- REFUNDED: no eligible proposal existed and the optional award refund was emitted.

Phase boundaries are timestamp based and require at least 30 seconds between windows. The pilot may use compressed windows, but it does not weaken evidence checks or authorization.

## Rubric

Criteria are locked as a JSON array at creation. Each item contains id, name, requirement, weight_bps, and mandatory. Weights must total 10,000 basis points. The pilot fixture uses C1 technical compliance (3000), C2 delivery (2000), C3 accessibility (2000), C4 testing/documentation (1500), and C5 maintenance (1500).

## Evaluation

Each criterion receives exactly one bucket:

- PASS → 10,000 basis points of that criterion;
- PARTIAL → 5,000;
- FAIL → 0;
- INCONCLUSIVE → 0 and the proposal is not awardable.

The weighted score is the sum of criterion.weight_bps * criterion.score_bps / 10000.

A mandatory FAIL produces DISQUALIFIED. Any INCONCLUSIVE produces UNRESOLVED. Only EVALUATED proposals are eligible.

## Ranking

Eligible proposals are ranked by the highest weighted score. If scores tie, the lowest lexical digest wins:

    SHA256(tender_id || "|" || commitment_sha256 || "|" || lowercase(applicant_address))

The sponsor has no winner-selection method and cannot override a validator result.

## Challenge

The applicant may challenge once and the sponsor may challenge once per proposal. A challenge must append new evidence or use a reason beginning with REVISION: to identify a specific decision revision. Historical evaluations are never overwritten; a recheck appends a new revision.
