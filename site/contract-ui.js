import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { TransactionHashVariant } from 'genlayer-js/types';
import { ADDRESS, methods, parseArgs, stringify, successful } from './contract-core.js';
const client=createClient({chain:studionet});
const $=s=>document.querySelector(s);
const output=$('[data-chain-output]'), status=$('[data-tx-status]'), form=$('[data-call-form]');
const report=e=>{status.textContent=e?.message||String(e);};
const read=async(name,args=[])=>{
  const result=await client.readContract({address:ADDRESS,functionName:name,args,transactionHashVariant:TransactionHashVariant.LATEST_FINAL});
  return typeof result==='string'?JSON.parse(result):result;
};
let readGeneration=0;
async function refresh(){
  const generation=++readGeneration;
  output.textContent='Loading finalized state…';
  try { const id=BigInt($('[data-tender-id]').value||0); const [count,tender]=await Promise.all([read('get_tender_count'),read('get_tender',[id])]); if(generation===readGeneration)output.textContent=stringify({count,tender}); }
  catch(e){if(generation===readGeneration)output.textContent='Live read failed. No cached data is substituted. '+e.message;}
}
$('[data-refresh]').addEventListener('click',refresh);
const menu=$('[data-call-method]');
for(const name of Object.keys(methods)){const option=document.createElement('option');option.value=name;option.textContent=name.replaceAll('_',' ');menu.append(option);}
function fields(){const target=$('[data-call-fields]');target.replaceChildren();for(const field of methods[menu.value]){const [name,type]=field.split(':'); const label=document.createElement('label');label.textContent=name.replaceAll('_',' '); const input=document.createElement(type==='int'?'input':'textarea');input.name=name;input.required=true;if(type==='int'){input.inputMode='numeric';input.value=name==='award_amount'?'0':'';}if(name.endsWith('_json'))input.value='[]';label.append(input);target.append(label);}}
menu.addEventListener('change',fields);fields();
$('[data-example]').addEventListener('click',()=>{
  const now=Math.floor(Date.now()/1000),digest='7ff3f295216813b5a4f76d07c30cc5e15ceb1cc43c93a4a3debcb21346525e33';
  const values={tender_id:$('[data-tender-id]').value,proposal_id:'0',title:'Synthetic accessibility plan review',specification:'Assess the documented plan only, not an independently tested implementation.',commit_deadline:String(now+300),reveal_deadline:String(now+600),review_deadline:String(now+1200),criteria_json:JSON.stringify([{id:'C1',name:'Accessibility plan',requirement:'The proposal describes semantic HTML, keyboard navigation and visible focus states.',weight_bps:10000,mandatory:true}]),award_amount:'0',commitment_sha256:digest,applicant_label:'Synthetic applicant',proposal_sha256:digest,proposal_url:'https://raw.githubusercontent.com/ANZA24k/TenderProof/69acfc0b02947ba384bf5aebd3dd10ddaa4aa1cf/evidence/fixtures/proposal-a.md',evidence_json:'[]',new_evidence_json:'[]',reason:'Request review of the locked accessibility plan.'};
  for(const input of form.querySelectorAll('[name]'))if(input.name in values)input.value=values[input.name];
});
let busy=false;
async function track(hash,method){
  if(!/^0x[a-fA-F0-9]{64}$/.test(hash)) throw new Error('Invalid transaction hash');
  const link=$('[data-tx-link]');link.href=`https://explorer-studio.genlayer.com/tx/${hash}`;link.textContent=hash;link.hidden=false;
  status.textContent='Tracking consensus. A timeout does not mean the write failed.';
  for(let i=0;i<180;i++){
    const receipt=await client.getTransaction({hash});
    status.textContent=`${receipt.statusName||'PENDING'} · ${receipt.txExecutionResultName||'Awaiting execution'}`;
    if(receipt.statusName==='FINALIZED'){
      output.textContent=stringify(receipt);
      if(!successful(receipt))throw new Error('Finalized transaction did not return successfully. Inspect its receipt.');
      const leader=receipt.consensus_data?.leader_receipt?.find(r=>r.mode==='leader'&&r.result?.status==='return');
      const result=leader?.result?.payload?.readable;
      if(method==='create_tender'&&typeof result==='string'&&/^\d+$/.test(result))$('[data-tender-id]').value=result;
      status.textContent=`Finalized execution succeeded${result!==undefined?`; return: ${String(result).slice(0,400)}`:''}. Read the tender to inspect the actual verdict; success does not imply PASS.`;await refresh();return;
    }
    if(['CANCELED','UNDETERMINED'].includes(receipt.statusName))throw new Error(`Transaction ${receipt.statusName}; inspect receipt before retrying.`);
    await new Promise(resolve=>setTimeout(resolve,3000));
  }
  throw new Error('Tracking timed out. Resume the saved hash; do not resubmit blindly.');
}
form.addEventListener('submit',async event=>{
  event.preventDefault();if(busy)return;busy=true;const button=form.querySelector('button[type=submit]');button.disabled=true;
  try{
    if(localStorage.getItem('tenderproof-pending'))throw new Error('Resume the saved transaction before submitting another call.');
    const provider=window.tenderproofWallet?.provider();if(!provider)throw new Error('Connect MetaMask first.');
    const chain=await provider.request({method:'eth_chainId'});if(BigInt(chain)!==61999n)throw new Error('Switch to Studionet first.');
    const accounts=await provider.request({method:'eth_accounts'});if(!accounts[0])throw new Error('Connect MetaMask first.');
    const method=menu.value,args=parseArgs(method,Object.fromEntries(new FormData(form)));
    const value=method==='create_tender'?args.at(-1):0n;
    if(value!==0n)throw new Error('This public pilot only permits zero-GEN awards.');
    if(!$('[data-confirm-write]').checked)throw new Error('Review and confirm the testnet call first.');
    if(!window.confirm(`Submit ${method} to TenderProof on Studionet?\nContract: ${ADDRESS}\nAccount: ${accounts[0]}\nValue: 0 GEN\nArguments:\n${stringify(args)}`))return;
    const writer=createClient({chain:studionet,account:accounts[0],provider});status.textContent='Waiting for wallet approval…';
    const hash=await writer.writeContract({address:ADDRESS,functionName:method,args,value:0n,leaderOnly:false});
    localStorage.setItem('tenderproof-pending',hash);localStorage.setItem('tenderproof-pending-method',method);await track(hash,method);localStorage.removeItem('tenderproof-pending');localStorage.removeItem('tenderproof-pending-method');
  }catch(e){report(e);}finally{busy=false;button.disabled=false;}
});
$('[data-resume]').addEventListener('click',async()=>{if(busy)return;busy=true;try{const hash=localStorage.getItem('tenderproof-pending')||$('[data-track-hash]').value.trim();await track(hash,localStorage.getItem('tenderproof-pending-method'));localStorage.removeItem('tenderproof-pending');localStorage.removeItem('tenderproof-pending-method');}catch(e){report(e);}finally{busy=false;}});
$('[data-forget]').addEventListener('click',()=>{if(!busy&&window.confirm('Stop blocking new writes? This does not cancel the saved transaction. Check Explorer first to avoid duplicates.'))localStorage.removeItem('tenderproof-pending');});
refresh();
