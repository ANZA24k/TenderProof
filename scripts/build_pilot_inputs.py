"""Print genuine pilot inputs for a known source commit.

This script never invents deployment, transaction, or consensus values. Supply
TENDERPROOF_SOURCE_COMMIT only after the fixture commit exists.
"""

import hashlib
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / "evidence" / "fixtures"
commit = os.environ.get("TENDERPROOF_SOURCE_COMMIT", "")
if len(commit) != 40 or any(ch not in "0123456789abcdef" for ch in commit):
    raise SystemExit("Set TENDERPROOF_SOURCE_COMMIT to a real 40-character lowercase commit SHA.")

def item(name, label):
    body = (FIXTURES / name).read_bytes()
    return {
        "url": f"https://raw.githubusercontent.com/ANZA24k/TenderProof/{commit}/evidence/fixtures/{name}",
        "sha256": hashlib.sha256(body).hexdigest(),
        "bytes": len(body),
        "label": label,
    }

print(json.dumps({
    "proposal_a": item("proposal-a.md", "proposal"),
    "proposal_b": item("proposal-b.md", "proposal"),
    "proposal_a_evidence": item("proposal-a-evidence.md", "challenge evidence"),
}, indent=2, sort_keys=True))
