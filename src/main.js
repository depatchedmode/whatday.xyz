import { ethers } from 'ethers';

const TOKENS = {
    'Monday': '0x1ef139c77e8210F42DEF7A8e9246D1475f78F0B7',
    'Tuesday': '0x36Aaf72b781Fa7ff68b37f3e6fA78Df04cCb20e6',
    'Wednesday': '0x1A6239bFfdAE38Eab75993a1f9db58bd6d201bc3',
    'Thursday': '0x0412CCe86F6d9f77e8Bf3951f6a1B338D0dC6733',
    'Friday': null, // TBD
    'Saturday': '0x309e3df326E6eeB280Dbb3CFfC650CCCa8FAEA0e',
    'Sunday': '0x17000F2d038BFD9282aB195718d690F9031d8012'
};

const WETH_ADDRESS = '0x4200000000000000000000000000000000000006';
const FACTORY_ADDRESS = '0x33128a8fc17869897dce68ed026d694621f6fdfd';

const FACTORY_ABI = [
    'function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)'
];

const POOL_ABI = [
    'function token0() external view returns (address)',
    'function token1() external view returns (address)',
    'function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)'
];

const ERC20_ABI = [
    'function decimals() external view returns (uint8)',
    'function totalSupply() external view returns (uint256)'
];

const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
provider.getNetwork().then(network => {
    console.log('Connected to network:', {
        name: network.name,
        chainId: network.chainId
    });
}).catch(error => {
    console.error('Failed to connect to network:', error);
});
const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);

const FEE = 10000; // 1% fee tier

// Add this helper function for delays
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function getTokenData(tokenAddress) {
    if (!tokenAddress) return null;
    
    try {
        console.log(`Getting pool for token: ${tokenAddress}`);
        
        // Only check 1% fee tier
        const poolAddress = await factory.getPool(tokenAddress, WETH_ADDRESS, FEE);
        console.log(`Pool address: ${poolAddress}`);
        
        if (poolAddress === '0x0000000000000000000000000000000000000000') {
            console.log('No pool found for this token');
            return null;
        }

        console.log('Creating contract instances...');
        const pool = new ethers.Contract(poolAddress, POOL_ABI, provider);
        const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

        console.log('Fetching pool and token data...');
        // Get data sequentially instead of in parallel
        const token0 = await pool.token0();
        console.log('token0:', token0);
        await delay(100);
        
        const token1 = await pool.token1();
        console.log('token1:', token1);
        await delay(100);
        
        const slot0 = await pool.slot0();
        console.log('slot0:', slot0);
        await delay(100);
        
        const decimals = await token.decimals();
        console.log('decimals:', decimals);
        await delay(100);
        
        const totalSupply = await token.totalSupply();
        console.log('totalSupply:', totalSupply.toString());

        // Calculate price from sqrtPriceX96
        const isToken0 = token0.toLowerCase() === tokenAddress.toLowerCase();
        console.log('isToken0:', isToken0);
        const sqrtPriceX96 = BigInt(slot0[0]);
        console.log('sqrtPriceX96:', sqrtPriceX96.toString());
        
        const sqrtPrice = Number(sqrtPriceX96) / (2 ** 96); // Convert to decimal
        const priceInETH = isToken0 
            ? sqrtPrice * sqrtPrice
            : 1 / (sqrtPrice * sqrtPrice);
        console.log('Calculated price in ETH:', priceInETH);

        return {
            decimals: Number(decimals),
            totalSupply: totalSupply.toString(),
            price: priceInETH  // Price in ETH
        };
    } catch (error) {
        console.error(`Error fetching data for ${tokenAddress}:`, error);
        console.error('Full error:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        return null;
    }
}

async function calculateFDV(tokenData) {
    if (!tokenData) return 0;
    
    console.log('Calculating FDV with data:', tokenData);
    const supply = Number(BigInt(tokenData.totalSupply)) / (10 ** tokenData.decimals);
    console.log('Calculated supply:', supply);
    const fdv = supply * tokenData.price;
    console.log('Calculated FDV:', fdv);
    return fdv;
}

async function updateUI() {
    console.log('Starting UI update...');
    const currentDayElement = document.getElementById('currentDay');
    const tokenListElement = document.getElementById('tokenList');
    
    try {
        console.log('Fetching data for all tokens...');
        // Process tokens sequentially instead of in parallel
        const tokenValues = [];
        for (const [day, address] of Object.entries(TOKENS)) {
            console.log(`Processing ${day} token at ${address}`);
            if (!address) {
                tokenValues.push({ day, fdv: 0 });
                continue;
            }
            const tokenData = await getTokenData(address);
            console.log(`Token data for ${day}:`, tokenData);
            const fdv = await calculateFDV(tokenData);
            console.log(`FDV for ${day}:`, fdv);
            tokenValues.push({ day, fdv });
            await delay(500); // Add delay between tokens
        }

        // Find the highest FDV
        const highestToken = tokenValues.reduce((max, current) => {
            console.log(`Comparing ${current.day}(${current.fdv}) with ${max.day}(${max.fdv})`);
            return current.fdv > max.fdv ? current : max;
        }, { day: 'None', fdv: 0 });
        
        console.log('Highest token:', highestToken);

        // Update the current day display
        currentDayElement.textContent = highestToken.day;

        // Update the token list
        tokenListElement.innerHTML = tokenValues
            .map(({ day, fdv }) => {
                const address = TOKENS[day];
                const content = `<strong>${day}</strong>: Ξ${fdv.toLocaleString(undefined, {
                    maximumFractionDigits: 4
                })} FDV`;
                
                return `
                    <div class="token-item ${day === highestToken.day ? 'highest' : ''}">
                        ${address 
                            ? `<a href="https://www.clanker.world/clanker/${address}" target="_blank" rel="noopener noreferrer">${content}</a>`
                            : 'Day not yet launched'
                        }
                    </div>
                `;
            })
            .join('');

    } catch (error) {
        console.error('Error in updateUI:', error);
        console.error('Full error:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        currentDayElement.textContent = 'Error loading data';
    }
}

// Update every 30 seconds
updateUI();
setInterval(updateUI, 30000); 