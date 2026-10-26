export const ADDRESS = '0xfCe8679513b27B9Cb730bD3C2EAbC763A97634C3';
export const methods = {
  create_tender: ['title','specification','commit_deadline:int','reveal_deadline:int','review_deadline:int','criteria_json','award_amount:int'],
  commit_proposal: ['tender_id:int','commitment_sha256','applicant_label'],
  reveal_proposal: ['tender_id:int','proposal_id:int','proposal_url','proposal_sha256','evidence_json'],
  evaluate_proposal: ['tender_id:int','proposal_id:int'],
  challenge_proposal: ['tender_id:int','proposal_id:int','reason','new_evidence_json'],
  advance_tender: ['tender_id:int'], finalize_tender: ['tender_id:int'],
};
export function parseArgs(method, values) {
  if (!methods[method]) throw new Error('Unknown contract method');
  return methods[method].map(field => {
    const [name,type] = field.split(':'); const value=values[name]?.trim();
    if (!value) throw new Error(`${name} is required`);
    if (type==='int') { if (!/^\d+$/.test(value)) throw new Error(`${name} must be a non-negative integer`); return BigInt(value); }
    if (name.endsWith('_json')) JSON.parse(value);
    if (name.includes('sha256') && !/^[a-f0-9]{64}$/.test(value)) throw new Error('Expected lowercase SHA-256');
    return value;
  });
}
export const stringify = value => JSON.stringify(value, (_,v)=>typeof v==='bigint'?v.toString():v,2);
export function successful(receipt) {
  const leader=receipt.consensus_data?.leader_receipt;
  const decisions=Array.isArray(leader)?leader.filter(r=>r.mode==='leader'):[];
  const returned=decisions.length>0&&decisions.every(r=>r.result?.status==='return');
  return receipt.statusName==='FINALIZED' && (receipt.txExecutionResultName==='FINISHED_WITH_RETURN'||returned);
}
