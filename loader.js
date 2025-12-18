const readline = require('readline');

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    red: '\x1b[31m'
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function clearLine() {
    process.stdout.write('\r\x1b[K');
}

function colorLog(message, color = colors.cyan) {
    console.log(`${color}${colors.bright}${message}${colors.reset}`);
}

async function simulateDownload() {
    const totalMB = Math.floor(Math.random() * 500) + 100;
    let downloadedMB = 0;
    
    while (downloadedMB < totalMB) {
        const increment = Math.floor(Math.random() * 15) + 5;
        downloadedMB = Math.min(downloadedMB + increment, totalMB);
        
        const progress = Math.floor((downloadedMB / totalMB) * 20);
        const progressBar = '█'.repeat(progress) + '░'.repeat(20 - progress);
        const percentage = Math.floor((downloadedMB / totalMB) * 100);
        
        clearLine();
        process.stdout.write(`${colors.yellow}${colors.bright}Join successful, Downloading changes... ${colors.green}${downloadedMB}MB${colors.yellow}/${colors.green}${totalMB}MB ${colors.blue}[${progressBar}] ${colors.magenta}${percentage}%${colors.reset}`);
        
        if (downloadedMB < totalMB) {
            await sleep(200);
        }
    }
    
    console.log('');
}

async function main() {
    colorLog('Crab-Engine Builder started...', colors.cyan);
    await sleep(2000);
    
    colorLog('Checking Bedrock-Protocol requirements...', colors.yellow);
    await sleep(5000);
    
    colorLog('Requirements passed!', colors.green);
    await sleep(500);
    
    colorLog('Relay bot joining on Bedrock-dedicated server at location 62.143.6.12:19132...', colors.blue);
    await sleep(7000);
    
    await simulateDownload();
    
    colorLog('Crab-Engine synced! Do /reload locally', colors.magenta);
}

main().catch(console.error);