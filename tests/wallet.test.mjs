import test from 'node:test';
import assert from 'node:assert/strict';
import { WalletSession, CHAIN_ID, walletError } from '../site/wallet.js';
const account = '0x' + 'ab'.repeat(20);
function mock(chain = CHAIN_ID) {
  const listeners = new Map();
  const calls = [];
  return { listeners, calls, on: (e,h) => listeners.set(e,h), removeListener: e => listeners.delete(e), request: async args => {
    calls.push(args);
    if (args.method === 'eth_requestAccounts') return [account];
    if (args.method === 'eth_chainId') return chain;
    if (args.method === 'wallet_switchEthereumChain') chain = CHAIN_ID;
  }};
}
test('connection shares public address without signing or payment', async () => {
  const p = mock(); const w = new WalletSession(p); await w.connect();
  assert.equal(w.state.ready, true); assert.equal(w.state.account, account);
  assert.deepEqual(p.calls.map(c=>c.method), ['eth_requestAccounts','eth_chainId']);
});
test('missing extension is actionable', async () => { await assert.rejects(new WalletSession().connect(), /Install MetaMask/); });
test('wrong network is not ready and switches explicitly', async () => {
  const w = new WalletSession(mock('0x1')); await w.connect(); assert.equal(w.state.ready,false);
  await w.switchNetwork(); assert.equal(w.state.ready,true);
});
test('unknown network adds Studionet then verifies it', async () => {
  const p = mock('0x1'); const original = p.request; let attempts = 0;
  p.request = async a => { if(a.method==='wallet_switchEthereumChain' && attempts++ === 0) throw {code:4902}; return original(a); };
  const w = new WalletSession(p); await w.connect(); await w.switchNetwork();
  assert.equal(w.state.ready,true); assert.ok(p.calls.some(c=>c.method==='wallet_addEthereumChain'));
});
test('account revocation and network changes clear readiness', async () => {
  const p=mock(); const w=new WalletSession(p); await w.connect();
  p.listeners.get('chainChanged')('0x1'); assert.equal(w.state.ready,false);
  p.listeners.get('accountsChanged')([]); assert.equal(w.state.connected,false);
});
test('local disconnect and disposal release listeners', async () => {
  const p=mock(); const w=new WalletSession(p); await w.connect(); w.dispose();
  assert.equal(w.state.account,null); assert.equal(p.listeners.size,0);
});
test('rejected and pending requests display useful errors', () => {
  assert.match(walletError({code:4001}), /cancelled/); assert.match(walletError({code:-32002}), /already open/);
});
test('invalid wallet address is rejected', async () => {
  const p=mock(); p.request=async a=>a.method==='eth_chainId'?CHAIN_ID:['invalid'];
  await assert.rejects(new WalletSession(p).connect(), /No wallet account/);
});
test('disconnect during pending connect cannot reconnect stale session', async () => {
  const p=mock(); let resolve; p.request=a=>a.method==='eth_requestAccounts'?new Promise(r=>resolve=r):Promise.resolve(CHAIN_ID);
  const w=new WalletSession(p); const pending=w.connect(); w.disconnect(); resolve([account]);
  await assert.rejects(pending,/changed during connection/); assert.equal(w.state.connected,false);
});
test('wallet UI and read-only browser tool reflect the same state', async () => {
  const nodes = new Map(); const events = new Map(); let tool; let options;
  const previousDocument = globalThis.document; const previousWindow = globalThis.window;
  globalThis.document = {
    querySelector(selector) {
      if (!nodes.has(selector)) nodes.set(selector, { textContent:'', hidden:false, disabled:false, addEventListener: (event,handler) => events.set(selector+event,handler) });
      return nodes.get(selector);
    },
    modelContext: { registerTool(t,o) { tool=t; options=o; } },
  };
  const pageEvents = new Map();
  globalThis.window = { ethereum:mock(), addEventListener:(e,h)=>pageEvents.set(e,h), dispatchEvent:()=>{} };
  try {
    await import('../site/wallet-ui.js');
    assert.equal(tool.name,'get_tenderproof_wallet_status');
    assert.equal(tool.annotations.readOnlyHint,true);
    assert.equal(tool.execute({}).connected,false);
    await events.get('[data-connect]click')();
    assert.equal(tool.execute({}).ready,true);
    assert.equal(tool.execute({}).transactionsEnabled,false);
    assert.equal(nodes.get('[data-wallet-account]').textContent,account);
    assert.throws(()=>tool.execute({unexpected:true}),/empty object/);
    events.get('[data-disconnect]click')();
    assert.equal(tool.execute({}).connected,false);
    pageEvents.get('pagehide')(); assert.equal(options.signal.aborted,true);
  } finally {
    globalThis.document=previousDocument; globalThis.window=previousWindow;
  }
});
