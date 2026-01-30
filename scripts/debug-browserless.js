const https = require('https');

// Read args
const apiKey = process.argv[2];
const targetUrl = "https://gabson.com/vacatures/growth-marketeer-36-40-uur/";

if (!apiKey) {
    console.error("Please provide API KEY as argument");
    process.exit(1);
}

// Minimal body: ONLY URL
const payload = JSON.stringify({
    url: targetUrl
});

console.log("Sending payload:", payload);

const options = {
    hostname: 'chrome.browserless.io',
    // Stealth and waitFor via Query Params? 
    // Docs say ?stealth=true works. 
    // Docs don't explicitly say ?waitFor=... works for /content but common pattern.
    path: `/content?token=${apiKey}&stealth=true`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length,
        // Add UA header
        'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
};

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');
    let body = '';
    res.on('data', (chunk) => {
        body += chunk;
    });
    res.on('end', () => {
        console.log(`BODY LENGTH: ${body.length}`);
        if (res.statusCode !== 200) console.log("ERROR BODY:", body);
        else console.log("SUCCESS. Preview:", body.substring(0, 200));
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(payload);
req.end();
