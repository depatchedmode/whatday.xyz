import { ethers } from 'ethers';

const TOKENS = {
    'Monday': '0x1ef139c77e8210F42DEF7A8e9246D1475f78F0B7',
    'Tuesday': '0x36Aaf72b781Fa7ff68b37f3e6fA78Df04cCb20e6',
    'Wednesday': '0x1A6239bFfdAE38Eab75993a1f9db58bd6d201bc3',
    'Thursday': '0x0412CCe86F6d9f77e8Bf3951f6a1B338D0dC6733',
    'Friday': '0x114314F1B45BDC4a5263c4c274A7Fc5b568c587f',
    'Saturday': null, // need to re-launch
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

const MULTICALL3_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11';
const MULTICALL3_ABI = [
    'function aggregate((address target, bytes callData)[] calls) external view returns (uint256 blockNumber, bytes[] returnData)'
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

function encodeFunction(contract, functionName, params = []) {
    return contract.interface.encodeFunctionData(functionName, params);
}

async function multicall(calls) {
    const multicall = new ethers.Contract(MULTICALL3_ADDRESS, MULTICALL3_ABI, provider);
    const callStructs = calls.map(({ address, callData }) => ([
        address, callData
    ]));
    
    const [, returnData] = await multicall.aggregate(callStructs);
    return returnData;
}

async function getTokenData(tokenAddress) {
    if (!tokenAddress) return null;
    
    try {
        console.log(`Getting pool for token: ${tokenAddress}`);
        const poolAddress = await factory.getPool(tokenAddress, WETH_ADDRESS, FEE);
        console.log(`Pool address: ${poolAddress}`);
        
        if (poolAddress === '0x0000000000000000000000000000000000000000') {
            console.log('No pool found for this token');
            return null;
        }

        const pool = new ethers.Contract(poolAddress, POOL_ABI, provider);
        const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

        // Prepare all calls
        const calls = [
            {
                address: poolAddress,
                callData: encodeFunction(pool, 'token0')
            },
            {
                address: poolAddress,
                callData: encodeFunction(pool, 'token1')
            },
            {
                address: poolAddress,
                callData: encodeFunction(pool, 'slot0')
            },
            {
                address: tokenAddress,
                callData: encodeFunction(token, 'decimals')
            },
            {
                address: tokenAddress,
                callData: encodeFunction(token, 'totalSupply')
            }
        ];

        // Execute all calls in one batch
        const results = await multicall(calls);

        // Decode results
        const token0 = pool.interface.decodeFunctionResult('token0', results[0])[0];
        const token1 = pool.interface.decodeFunctionResult('token1', results[1])[0];
        const slot0 = pool.interface.decodeFunctionResult('slot0', results[2]);
        const decimals = token.interface.decodeFunctionResult('decimals', results[3])[0];
        const totalSupply = token.interface.decodeFunctionResult('totalSupply', results[4])[0];

        // Calculate price from sqrtPriceX96
        const isToken0 = token0.toLowerCase() === tokenAddress.toLowerCase();
        const sqrtPriceX96 = BigInt(slot0[0]);
        const sqrtPrice = Number(sqrtPriceX96) / (2 ** 96);
        const priceInETH = isToken0 
            ? sqrtPrice * sqrtPrice
            : 1 / (sqrtPrice * sqrtPrice);

        return {
            decimals: Number(decimals),
            totalSupply: totalSupply.toString(),
            price: priceInETH
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

const TICKERS = {
    'Monday': 'MON',
    'Tuesday': 'TUE',
    'Wednesday': 'WED',
    'Thursday': 'THU',
    'Friday': 'FRI',
    'Saturday': 'SAT',
    'Sunday': 'SUN',
};

async function updateUI() {
    const currentDayElement = document.getElementById('currentDay');
    const tokenListElement = document.getElementById('tokenList');
    
    try {
        const tokenPromises = Object.entries(TOKENS).map(async ([day, address]) => {
            if (!address) {
                return { day, fdv: 0 };
            }
            const tokenData = await getTokenData(address);
            const fdv = await calculateFDV(tokenData);
            return { day, fdv };
        });

        const tokenValues = await Promise.all(tokenPromises);

        // Sort by FDV descending for ranking
        const sorted = [...tokenValues].sort((a, b) => b.fdv - a.fdv);
        const rankMap = {};
        sorted.forEach((t, i) => { rankMap[t.day] = i + 1; });

        const highestToken = sorted[0] || { day: '—', fdv: 0 };
        currentDayElement.textContent = highestToken.day.toUpperCase();

        // Render table rows
        tokenListElement.innerHTML = tokenValues
            .map(({ day, fdv }) => {
                const address = TOKENS[day];
                const ticker = TICKERS[day] || day.slice(0, 3).toUpperCase();
                const rank = rankMap[day];
                const isWinner = day === highestToken.day;
                const fdvStr = fdv > 0 
                    ? `Ξ${fdv.toLocaleString(undefined, { maximumFractionDigits: 4 })}` 
                    : '—';
                
                return `
                    <tr class="${isWinner ? 'winner-row' : ''}">
                        <td class="ticker">${address 
                            ? `<a href="https://www.clanker.world/clanker/${address}" target="_blank">${ticker}</a>` 
                            : ticker}</td>
                        <td class="name">${day}</td>
                        <td class="fdv">${fdvStr}</td>
                        <td>${address ? rank : '—'}</td>
                    </tr>
                `;
            })
            .join('');

    } catch (error) {
        console.error('Error in updateUI:', error);
        currentDayElement.textContent = 'ERR';
    }
}

// Update every 30 seconds
updateUI();
setInterval(updateUI, 30000); 