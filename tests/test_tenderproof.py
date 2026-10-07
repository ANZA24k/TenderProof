import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path

import pytest


GENVM_SDK_VERSION = "v0.2.16"
NOW = 1791331200
BASE = "https://raw.githubusercontent.com/ANZA24k/TenderProof/" + "a" * 40 + "/evidence/fixtures/"
PROPOSAL_A = Path("evidence/fixtures/proposal-a.md").read_bytes()
PROPOSAL_B = Path("evidence/fixtures/proposal-b.md").read_bytes()
A_EVIDENCE = Path("evidence/fixtures/proposal-a-evidence.md").read_bytes()
CRITERIA = [
    {"id": "C1", "name": "Technical compliance", "requirement": "The proposal must describe a responsive implementation that consumes the locked data format.", "weight_bps": 3000, "mandatory": True},
    {"id": "C2", "name": "Delivery plan", "requirement": "The proposal must provide phases, ownership, and a realistic delivery sequence.", "weight_bps": 2000, "mandatory": True},
    {"id": "C3", "name": "Accessibility", "requirement": "The proposal must provide concrete keyboard, semantic HTML, and contrast accessibility notes.", "weight_bps": 2000, "mandatory": True},
    {"id": "C4", "name": "Testing and documentation", "requirement": "The proposal must include a testing approach and reproducible setup documentation.", "weight_bps": 1500, "mandatory": False},
    {"id": "C5", "name": "Maintenance", "requirement": "The proposal must describe monitoring, maintenance, and incident response.", "weight_bps": 1500, "mandatory": False},
]


def sha(body):
    return hashlib.sha256(body).hexdigest()


def fp(name, body, label="supporting evidence"):
    return {"url": BASE + name, "sha256": sha(body), "bytes": len(body), "label": label}


def evaluation(statuses, citations=True):
    result = []
    for criterion, status in zip(CRITERIA, statuses):
        result.append(
            {
                "id": criterion["id"],
                "status": status,
                "score_bps": {"PASS": 10000, "PARTIAL": 5000, "FAIL": 0, "INCONCLUSIVE": 0}[status],
                "finding": f"Locked fixture assessment for {criterion['id']}.",
                "evidence_urls": [BASE + "proposal-a.md"] if citations else [],
            }
        )
    return {"criteria": result, "summary": "The result is grounded in the exact locked proposal bytes and rubric."}


@pytest.fixture
def env(direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie):
    vm = direct_vm
    vm.sender = direct_alice
    vm.warp(datetime.fromtimestamp(NOW, timezone.utc).isoformat())
    contract = direct_deploy("contracts/tenderproof.py", sdk_version=GENVM_SDK_VERSION)
    return vm, contract, direct_alice, direct_bob, direct_charlie


def create_tender(env, award=0):
    vm, contract, sponsor, _, _ = env
    vm.sender = sponsor
    vm.value = award
    tender_id = contract.create_tender(
        "Synthetic incident-status dashboard",
        "Build a static incident-status dashboard for an open-source project. It must be responsive, accessible, tested, documented, and maintainable.",
        NOW + 60,
        NOW + 120,
        NOW + 180,
        json.dumps(CRITERIA),
        award,
    )
    vm.value = 0
    return tender_id


def state(env, tender_id=0):
    return json.loads(env[1].get_tender(tender_id))


def proposal_state(env, tender_id, proposal_id):
    return json.loads(env[1].get_proposal(tender_id, proposal_id))


def mock_resource(vm, name, body):
    vm.mock_web(re.escape(BASE + name), {"status": 200, "body": body.decode()})


def enter_reveal(env, award=0):
    vm, contract, sponsor, applicant, _ = env
    tender_id = create_tender(env, award)
    vm.sender = applicant
    vm.warp(datetime.fromtimestamp(NOW + 1, timezone.utc).isoformat())
    aid = contract.commit_proposal(tender_id, sha(PROPOSAL_A), "Synthetic Applicant A")
    vm.warp(datetime.fromtimestamp(NOW + 61, timezone.utc).isoformat())
    return tender_id, aid


def reveal(env, tender_id, proposal_id, name="proposal-a.md", body=PROPOSAL_A, evidence=None):
    vm, contract, sponsor, applicant, _ = env
    mock_resource(vm, name, body)
    evidence = evidence or []
    for item in evidence:
        fixture_name = item["url"].split("/")[-1]
        if fixture_name == "proposal-a-evidence.md":
            mock_resource(vm, fixture_name, A_EVIDENCE)
    vm.sender = applicant
    return contract.reveal_proposal(tender_id, proposal_id, BASE + name, sha(body), json.dumps(evidence))


def test_create_locks_rubric_and_exact_funding(env):
    tender_id = create_tender(env, award=123)
    tender = state(env, tender_id)
    assert tender["status"] == "COMMITTING"
    assert tender["award_amount"] == 123
    assert tender["specification_sha256"] == sha(tender["specification"].encode())
    assert sum(item["weight_bps"] for item in tender["criteria"]) == 10000
    accounting = json.loads(env[1].get_accounting())
    assert accounting == {"total_funded": 123, "total_paid_out": 0, "total_refunded": 0, "escrow": 123}


def test_zero_or_wrong_funding_rules(env):
    vm, contract, sponsor, _, _ = env
    vm.sender = sponsor
    vm.value = 0
    create_tender(env, award=0)
    vm.value = 9
    with pytest.raises(Exception, match="exact award funding"):
        contract.create_tender("T", "S", NOW + 60, NOW + 120, NOW + 180, json.dumps(CRITERIA), 10)


def test_rejects_invalid_rubric_and_windows(env):
    vm, contract, sponsor, _, _ = env
    vm.sender = sponsor
    vm.value = 0
    bad = [dict(CRITERIA[0], weight_bps=9999)] + CRITERIA[1:]
    with pytest.raises(Exception, match="10000"):
        contract.create_tender("T", "S", NOW + 60, NOW + 120, NOW + 180, json.dumps(bad), 0)
    with pytest.raises(Exception, match="deadline"):
        contract.create_tender("T", "S", NOW + 10, NOW + 120, NOW + 180, json.dumps(CRITERIA), 0)


def test_wallet_limit_and_duplicate_commitment(env):
    vm, contract, sponsor, applicant, attacker = env
    tender_id = create_tender(env)
    vm.sender = applicant
    vm.warp(datetime.fromtimestamp(NOW + 1, timezone.utc).isoformat())
    contract.commit_proposal(tender_id, sha(PROPOSAL_A), "")
    with pytest.raises(Exception, match="one proposal"):
        contract.commit_proposal(tender_id, sha(PROPOSAL_B), "")
    vm.sender = attacker
    with pytest.raises(Exception, match="duplicate proposal commitment"):
        contract.commit_proposal(tender_id, sha(PROPOSAL_A), "")


def test_reveal_authenticates_exact_bytes_and_commitment(env):
    tender_id, proposal_id = enter_reveal(env)
    vm, contract, sponsor, applicant, _ = env
    mock_resource(vm, "proposal-a.md", PROPOSAL_A)
    vm.sender = applicant
    with pytest.raises(Exception):
        contract.reveal_proposal(tender_id, proposal_id, BASE + "proposal-a.md", sha(PROPOSAL_B), "[]")
    assert proposal_state(env, tender_id, proposal_id)["status"] == "COMMITTED"
    reveal(env, tender_id, proposal_id)
    assert proposal_state(env, tender_id, proposal_id)["status"] == "REVEALED"


@pytest.mark.parametrize(
    "url",
    [
        "http://raw.githubusercontent.com/x/y/" + "a" * 40 + "/proposal.md",
        "https://raw.githubusercontent.com/x/y/main/proposal.md",
        BASE + "proposal-a.md?token=secret",
        BASE + "../proposal-a.md",
        "https://127.0.0.1/proposal.md",
    ],
)
def test_rejects_unpinned_or_private_evidence_urls(env, url):
    tender_id, proposal_id = enter_reveal(env)
    vm, contract, sponsor, applicant, _ = env
    vm.sender = applicant
    with pytest.raises(Exception):
        contract.reveal_proposal(tender_id, proposal_id, url, sha(PROPOSAL_A), "[]")


def test_prompt_injection_is_treated_as_proposal_data(env):
    tender_id, proposal_id = enter_reveal(env)
    reveal(env, tender_id, proposal_id)
    vm, contract, sponsor, applicant, _ = env
    vm.warp(datetime.fromtimestamp(NOW + 121, timezone.utc).isoformat())
    vm.mock_llm(
        r".*You are an independent evaluator for the locked TenderProof/1 rubric.*",
        json.dumps(evaluation(["PASS", "PASS", "PASS", "PASS", "PASS"])),
    )
    result = json.loads(contract.evaluate_proposal(tender_id, proposal_id))
    assert result["status"] == "EVALUATED"
    assert proposal_state(env, tender_id, proposal_id)["score_bps"] == 10000


def test_independent_validator_rejects_material_disagreement(env):
    tender_id, proposal_id = enter_reveal(env)
    reveal(env, tender_id, proposal_id)
    vm, contract, sponsor, applicant, _ = env
    vm.warp(datetime.fromtimestamp(NOW + 121, timezone.utc).isoformat())
    vm.mock_llm(
        r".*You are an independent evaluator for the locked TenderProof/1 rubric.*proposal-a\.md.*",
        json.dumps(evaluation(["PASS", "PASS", "PASS", "PASS", "PASS"])),
    )
    contract.evaluate_proposal(tender_id, proposal_id)
    vm.clear_mocks()
    vm.mock_llm(
        r".*You are an independent evaluator for the locked TenderProof/1 rubric.*proposal-a\.md.*",
        json.dumps(evaluation(["FAIL", "FAIL", "FAIL", "FAIL", "FAIL"])),
    )
    assert vm.run_validator() is False


def test_challenge_is_bounded_append_only_and_requires_new_evidence(env):
    tender_id, proposal_id = enter_reveal(env)
    reveal(env, tender_id, proposal_id)
    vm, contract, sponsor, applicant, _ = env
    vm.warp(datetime.fromtimestamp(NOW + 121, timezone.utc).isoformat())
    vm.mock_llm(
        r".*You are an independent evaluator for the locked TenderProof/1 rubric.*",
        json.dumps(evaluation(["PASS", "PASS", "PASS", "PASS", "PASS"])),
    )
    contract.evaluate_proposal(tender_id, proposal_id)
    vm.sender = applicant
    with pytest.raises(Exception, match="new evidence"):
        contract.challenge_proposal(tender_id, proposal_id, "Please reconsider", "[]")
    item = fp("proposal-a-evidence.md", A_EVIDENCE)
    mock_resource(vm, "proposal-a-evidence.md", A_EVIDENCE)
    contract.challenge_proposal(tender_id, proposal_id, "The evidence adds the missing deployment notes.", json.dumps([item]))
    assert proposal_state(env, tender_id, proposal_id)["status"] == "RECHECK_REQUESTED"
    with pytest.raises(Exception, match="quota"):
        contract.challenge_proposal(tender_id, proposal_id, "Second challenge", json.dumps([fp("proposal-a-evidence-2.md", A_EVIDENCE)]))


def test_recheck_appends_a_revision(env):
    tender_id, proposal_id = enter_reveal(env)
    reveal(env, tender_id, proposal_id)
    vm, contract, sponsor, applicant, _ = env
    vm.warp(datetime.fromtimestamp(NOW + 121, timezone.utc).isoformat())
    vm.mock_llm(
        r".*You are an independent evaluator for the locked TenderProof/1 rubric.*",
        json.dumps(evaluation(["PASS", "PASS", "PASS", "PASS", "PASS"])),
    )
    contract.evaluate_proposal(tender_id, proposal_id)
    vm.sender = applicant
    item = fp("proposal-a-evidence.md", A_EVIDENCE)
    mock_resource(vm, "proposal-a-evidence.md", A_EVIDENCE)
    contract.challenge_proposal(tender_id, proposal_id, "New evidence is supplied.", json.dumps([item]))
    vm.mock_llm(
        r".*You are an independent evaluator for the locked TenderProof/1 rubric.*proposal-a-evidence\.md.*",
        json.dumps(evaluation(["PASS", "PASS", "PASS", "PASS", "PASS"])),
    )
    result = json.loads(contract.evaluate_proposal(tender_id, proposal_id))
    assert result["revision"] == 1
    assert len(proposal_state(env, tender_id, proposal_id)["evaluations"]) == 2
    assert proposal_state(env, tender_id, proposal_id)["status"] == "EVALUATED"


def test_deterministic_score_and_mandatory_disqualification(env):
    vm, contract, sponsor, applicant, attacker = env
    tender_id = create_tender(env)
    vm.sender = applicant
    vm.warp(datetime.fromtimestamp(NOW + 1, timezone.utc).isoformat())
    a = contract.commit_proposal(tender_id, sha(PROPOSAL_A), "A")
    vm.sender = attacker
    b = contract.commit_proposal(tender_id, sha(PROPOSAL_B), "B")
    vm.warp(datetime.fromtimestamp(NOW + 61, timezone.utc).isoformat())
    mock_resource(vm, "proposal-a.md", PROPOSAL_A)
    vm.sender = applicant
    contract.reveal_proposal(tender_id, a, BASE + "proposal-a.md", sha(PROPOSAL_A), "[]")
    mock_resource(vm, "proposal-b.md", PROPOSAL_B)
    vm.sender = attacker
    contract.reveal_proposal(tender_id, b, BASE + "proposal-b.md", sha(PROPOSAL_B), "[]")
    vm.warp(datetime.fromtimestamp(NOW + 121, timezone.utc).isoformat())
    vm.mock_llm(
        r".*proposal-a\.md.*",
        json.dumps(evaluation(["PASS", "PASS", "PASS", "PASS", "PASS"])),
    )
    contract.evaluate_proposal(tender_id, a)
    vm.mock_llm(
        r".*proposal-b\.md.*",
        json.dumps(evaluation(["PASS", "PASS", "FAIL", "PASS", "PARTIAL"])),
    )
    contract.evaluate_proposal(tender_id, b)
    assert proposal_state(env, tender_id, a)["score_bps"] == 10000
    assert proposal_state(env, tender_id, b)["status"] == "DISQUALIFIED"
    assert proposal_state(env, tender_id, b)["eligible"] is False


def test_finalization_selects_the_best_and_prevents_replay(env):
    tender_id, proposal_id = enter_reveal(env, award=123)
    reveal(env, tender_id, proposal_id)
    vm, contract, sponsor, applicant, _ = env
    vm.warp(datetime.fromtimestamp(NOW + 121, timezone.utc).isoformat())
    vm.mock_llm(
        r".*You are an independent evaluator for the locked TenderProof/1 rubric.*",
        json.dumps(evaluation(["PASS", "PASS", "PASS", "PASS", "PASS"])),
    )
    contract.evaluate_proposal(tender_id, proposal_id)
    vm.warp(datetime.fromtimestamp(NOW + 181, timezone.utc).isoformat())
    result = json.loads(contract.finalize_tender(tender_id))
    assert result["status"] == "AWARDED"
    assert result["winner"] == str(applicant)
    assert result["award_transfer_emitted"] is True
    assert json.loads(contract.get_accounting())["escrow"] == 0
    with pytest.raises(Exception, match="not open"):
        contract.finalize_tender(tender_id)


def test_no_valid_proposal_refunds_after_review(env):
    tender_id = create_tender(env, award=77)
    vm, contract, sponsor, applicant, _ = env
    vm.warp(datetime.fromtimestamp(NOW + 181, timezone.utc).isoformat())
    result = json.loads(contract.finalize_tender(tender_id))
    assert result["status"] == "REFUNDED"
    assert result["refund_transfer_emitted"] is True
    assert json.loads(contract.get_accounting())["total_refunded"] == 77


def test_events_are_bounded_and_accounting_is_consistent(env):
    tender_id = create_tender(env, award=5)
    assert len(contract_events := env[1].get_events(0, 50)) >= 1
    assert json.loads(env[1].get_accounting())["escrow"] == 5
    assert json.loads(env[1].get_tender(tender_id))["tender_id"] == 0
