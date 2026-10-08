export const CHAIN_ID = '0xf22f'; // Studionet 61999
export const NETWORK = {
  chainId: CHAIN_ID, chainName: 'GenLayer Studionet',
  nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
  rpcUrls: ['https://studio.genlayer.com/api'],
  blockExplorerUrls: ['https://explorer-studio.genlayer.com'],
};
const validAccount = value => typeof value === 'string' && /^0x[0-9a-f]{40}$/i.test(value);
export class WalletSession {
  constructor(provider, onChange = () => {}) {
    this.provider = provider;
    this.onChange = onChange;
    this.state = { account: null, chainId: null, connected: false, ready: false };
    this.generation = 0;
    this.listeners = {
      accountsChanged: accounts => { this.generation++; this.update({ account: validAccount(accounts?.[0]) ? accounts[0] : null }); },
      chainChanged: chainId => { this.generation++; this.update({ chainId }); },
      disconnect: () => this.disconnect(),
    };
    for (const [event, handler] of Object.entries(this.listeners)) provider?.on?.(event, handler);
  }
  update(patch) {
    this.state = { ...this.state, ...patch };
    this.state.connected = !!this.state.account;
    this.state.ready = this.state.connected && String(this.state.chainId).toLowerCase() === CHAIN_ID;
    this.onChange({ ...this.state });
    return this.state;
  }
  async connect() {
    if (!this.provider?.request) throw new Error('Install MetaMask, then reopen this page in the same browser.');
    const generation = ++this.generation;
    const accounts = await this.provider.request({ method: 'eth_requestAccounts' });
    const chainId = await this.provider.request({ method: 'eth_chainId' });
    if (generation !== this.generation) throw new Error('Wallet changed during connection. Please reconnect.');
    if (!validAccount(accounts?.[0])) throw new Error('No wallet account was selected.');
    return this.update({ account: accounts[0], chainId });
  }
  async switchNetwork() {
    if (!this.state.connected) throw new Error('Connect your wallet first.');
    try {
      await this.provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: CHAIN_ID }] });
    } catch (error) {
      if (error.code !== 4902) throw error;
      await this.provider.request({ method: 'wallet_addEthereumChain', params: [NETWORK] });
      await this.provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: CHAIN_ID }] });
    }
    const chainId = await this.provider.request({ method: 'eth_chainId' });
    return this.update({ chainId });
  }
  disconnect() {
    this.generation++;
    return this.update({ account: null, chainId: null });
  }
  dispose() {
    for (const [event, handler] of Object.entries(this.listeners)) this.provider?.removeListener?.(event, handler);
    this.disconnect();
  }
}
export function walletError(error) {
  if (error?.code === 4001) return 'Request cancelled in your wallet. Nothing was sent.';
  if (error?.code === -32002) return 'A wallet request is already open. Check MetaMask.';
  return error?.message || 'Wallet request failed. Nothing was sent.';
}
