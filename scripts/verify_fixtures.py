"""Verify the checked-in synthetic fixture set without claiming a live pilot."""

from hashlib import sha256
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / "evidence" / "fixtures"
EXPECTED = {
    "proposal-a.md": "Synthetic Proposal A",
    "proposal-b.md": "Synthetic negative",
    "proposal-a-evidence.md": "Synthetic Proposal A",
    "proposal-b-evidence.md": "Synthetic Proposal B",
    "tender-spec.md": "Synthetic Tender",
}

for filename, marker in EXPECTED.items():
    body = (FIXTURES / filename).read_bytes()
    assert body, f"{filename} is empty"
    assert marker.encode() in body, f"{filename} lost its fixture marker"
    print(f"{filename}: {len(body)} bytes sha256={sha256(body).hexdigest()}")

print("fixture integrity: ok")
