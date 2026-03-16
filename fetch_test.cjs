const fs = require('fs');
const https = require('https');

// Read env variables manually
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^"|"$/g, '');
    }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const anonKey = env.VITE_SUPABASE_ANON_KEY;

const queryUrl = `${supabaseUrl}/rest/v1/accounts_payable_payments?select=*,payable:accounts_payable(*,supplier:suppliers(*)),purchase_order:purchase_orders(*,supplier:suppliers!fk_supplier(*))&limit=5`;

https.get(queryUrl, {
    headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
    }
}, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            console.log("Status Code:", res.statusCode);
            console.log(JSON.stringify(JSON.parse(data), null, 2));
        } catch(e) {
            console.log("Raw output:", data);
        }
    });
}).on('error', (err) => {
    console.error("HTTP GET Error:", err);
});
