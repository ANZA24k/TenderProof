// Explicit opt-in only: creates zero-value synthetic Studionet records.
import {createAccount,createClient} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import {writeFile} from 'node:fs/promises';
if(!process.argv.includes('--execute-zero-gen'))throw new Error('Requires --execute-zero-gen');
const account=createAccount(),client=createClient({chain:studionet,account});
const address='0xfCe8679513b27B9Cb730bD3C2EAbC763A97634C3';
const record={account:account.address,contract:address,transactions:[]};
const save=()=>writeFile('evidence/sdk-pilot.json',JSON.stringify(record,null,2));
async function call(functionName,args){
 const hash=await client.writeContract({address,functionName,args,value:0n,leaderOnly:false});
 record.transactions.push({functionName,hash});await save();console.log(functionName,hash);
 for(let i=0;i<100;i++){
  let tx;try{tx=await client.getTransaction({hash});}catch(error){console.log('Receipt unavailable; retaining hash for retry.');await new Promise(r=>setTimeout(r,3000));continue;}
  if(tx.statusName==='FINALIZED'){
   record.transactions.at(-1).status='FINALIZED';record.transactions.at(-1).execution=tx.consensus_data?.leader_receipt?.map(r=>r.result?.status)||tx.txExecutionResultName||null;await save();return;
  }
  await new Promise(r=>setTimeout(r,2000));
 }
 throw new Error('Transaction tracking timed out; inspect recorded hash before retrying');
}
const read=async(name,args=[])=>{const r=await client.readContract({address,functionName:name,args});return typeof r==='string'?JSON.parse(r):r;};
const waitUntil=async t=>{while(Date.now()/1000<t)await new Promise(r=>setTimeout(r,1000));};
const id=BigInt(await read('get_tender_count'));record.tenderId=Number(id);
const now=Math.floor(Date.now()/1000),commit=now+150,reveal=now+240,review=now+420;
const criteria=JSON.stringify([{id:'C1',name:'Accessibility plan',requirement:'The submitted proposal describes semantic HTML, keyboard navigation and visible focus states. Assess the documented plan, not deployed implementation.',weight_bps:10000,mandatory:true}]);
await call('create_tender',['Synthetic accessibility plan review','Assess the submitted written plan only. This is not proof of a real implementation.',commit,reveal,review,criteria,0n]);
const hash='7ff3f295216813b5a4f76d07c30cc5e15ceb1cc43c93a4a3debcb21346525e33';
await call('commit_proposal',[id,hash,'Synthetic SDK applicant']);
await waitUntil(commit+2);
await call('reveal_proposal',[id,0n,'https://raw.githubusercontent.com/ANZA24k/TenderProof/69acfc0b02947ba384bf5aebd3dd10ddaa4aa1cf/evidence/fixtures/proposal-a.md',hash,'[]']);
await waitUntil(reveal+2);
await call('evaluate_proposal',[id,0n]);
record.proposal=await read('get_proposal',[id,0n]);await save();console.log('proposal',record.proposal.status);
await waitUntil(review+2);
await call('finalize_tender',[id]);record.finalState=await read('get_tender',[id]);await save();console.log('finalState',record.finalState.status);process.exit();
