const { Client } = require('pg');

const variants = [
    "postgresql://postgres:@Brian1012@localhost:5432/ftms_dbn2?schema=public",
    "postgresql://postgres:%40Brian1012@localhost:5432/ftms_dbn2?schema=public",
    "postgres://postgres:@Brian1012@localhost:5432/ftms_dbn2",
    "postgres://postgres:%40Brian1012@localhost:5432/ftms_dbn2",
];

async function testConnection(url) {
    console.log(`Testing: ${url}`);
    const client = new Client({ connectionString: url });
    try {
        await client.connect();
        console.log("✅ SUCCESS!");
        await client.end();
        return true;
    } catch (err) {
        console.log(`❌ FAILED: ${err.message}`);
        return false;
    }
}

async function run() {
    for (const url of variants) {
        if (await testConnection(url)) break;
    }
}

run();
