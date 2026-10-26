import test from 'node:test';
import assert from 'node:assert/strict';
import {parseArgs,successful} from '../site/contract-core.js';
test('calldata preserves integers above JavaScript safe range',()=>{
 assert.deepEqual(parseArgs('evaluate_proposal',{tender_id:'9007199254740993',proposal_id:'0'}),[9007199254740993n,0n]);
 assert.throws(()=>parseArgs('evaluate_proposal',{tender_id:'-1',proposal_id:'0'}));
});
test('evidence commitment input rejects malformed digest',()=>{
 assert.throws(()=>parseArgs('commit_proposal',{tender_id:'0',commitment_sha256:'invalid',applicant_label:'Pilot'}));
});
test('finality alone is not execution success',()=>{
 assert.equal(successful({statusName:'FINALIZED',txExecutionResultName:'FINISHED_WITH_ERROR'}),false);
 assert.equal(successful({statusName:'ACCEPTED',txExecutionResultName:'FINISHED_WITH_RETURN'}),false);
 assert.equal(successful({statusName:'FINALIZED',txExecutionResultName:'FINISHED_WITH_RETURN'}),true);
 assert.equal(successful({statusName:'FINALIZED',consensus_data:{leader_receipt:[{mode:'leader',result:{status:'return'}},{mode:'validator',result:{status:'contract_error'}}]}}),true);
 assert.equal(successful({statusName:'FINALIZED',consensus_data:{leader_receipt:[{mode:'leader',result:{status:'error'}}]}}),false);
});
