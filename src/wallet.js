import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';

let currentWallet = null;

const adapters = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
];

function getAvailableAdapter() {
  // Prefer Phantom, fall back to Solflare
  for (const adapter of adapters) {
    if (adapter.readyState === 'Installed' || adapter.readyState === 'Loadable') {
      return adapter;
    }
  }
  return adapters[0]; // default to Phantom (will prompt install)
}

function updateButton(connected, address) {
  const btn = document.getElementById('connectWallet');
  if (!btn) return;
  if (connected && address) {
    btn.textContent = address.slice(0, 4) + '…' + address.slice(-4);
    btn.style.color = '#33d778';
  } else {
    btn.textContent = 'CONNECT';
    btn.style.color = '#9945FF';
  }
}

async function handleConnect() {
  if (currentWallet && currentWallet.connected) {
    await currentWallet.disconnect();
    currentWallet = null;
    updateButton(false);
    return;
  }

  const adapter = getAvailableAdapter();
  try {
    await adapter.connect();
    currentWallet = adapter;
    updateButton(true, adapter.publicKey.toBase58());

    adapter.on('disconnect', () => {
      currentWallet = null;
      updateButton(false);
    });
  } catch (err) {
    console.error('Wallet connect failed:', err);
  }
}

export function initWallet() {
  const btn = document.getElementById('connectWallet');
  if (btn) {
    btn.addEventListener('click', handleConnect);
  }
}
