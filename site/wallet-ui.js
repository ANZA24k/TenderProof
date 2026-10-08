import { WalletSession, walletError } from './wallet.js';
const select = selector => document.querySelector(selector);
const connect = select('[data-connect]');
const switchButton = select('[data-switch]');
const disconnect = select('[data-disconnect]');
const status = select('[data-wallet-status]');
let provider = window.ethereum?.providers?.find(p => p.isMetaMask) || window.ethereum;
// EIP-6963 supports MetaMask alongside other installed wallet extensions.
window.addEventListener('eip6963:announceProvider', event => {
  if (event.detail?.info?.rdns === 'io.metamask' && !session.state.connected) {
    session.dispose();
    provider = event.detail.provider;
    session = new WalletSession(provider, render);
  }
});
function render(state) {
  select('[data-wallet-account]').textContent = state.account || 'Not connected';
  select('[data-wallet-network]').textContent = state.chainId ? (state.ready ? 'Studionet · 61999' : `Wrong network · ${state.chainId}`) : 'Not selected';
  switchButton.hidden = !state.connected || state.ready;
  disconnect.hidden = !state.connected;
  connect.textContent = state.connected ? 'Reconnect MetaMask' : 'Connect MetaMask';
  status.textContent = state.ready ? 'Wallet connected to Studionet. No signature or transaction requested.' : state.connected ? 'Switch to Studionet to use this project. This is a test network.' : 'Connect only shares your public address. No seed phrase, signature, or payment is requested.';
}
let session = new WalletSession(provider, render);
window.dispatchEvent(new Event('eip6963:requestProvider'));
async function run(action) {
  connect.disabled = switchButton.disabled = true;
  try { await action(); } catch (error) { status.textContent = walletError(error); }
  finally { connect.disabled = switchButton.disabled = false; }
}
connect.addEventListener('click', () => run(() => session.connect()));
switchButton.addEventListener('click', () => run(() => session.switchNetwork()));
disconnect.addEventListener('click', () => session.disconnect());
render(session.state);
// Expose current public state only; agents cannot silently initiate wallet requests.
if (document.modelContext?.registerTool) {
  const lifecycle = new AbortController();
  try {
    Promise.resolve(document.modelContext.registerTool({
      name: 'get_tenderproof_wallet_status',
      description: 'Read the public wallet connection and network state shown on TenderProof. Does not request access or sign transactions.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute(input) {
        if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).length) throw new Error('Expected an empty object.');
        return { ...session.state, transactionsEnabled: false };
      },
    }, { signal: lifecycle.signal })).catch(() => {});
    window.addEventListener('pagehide', () => lifecycle.abort(), { once: true });
  } catch { /* Unsupported browser registry must not interrupt the wallet UI. */ }
}
