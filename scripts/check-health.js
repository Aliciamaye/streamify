#!/usr/bin/env node

/**
 * Health Check Script
 * Monitors server uptime and alerts if down
 */

const http = require('http');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

function checkEndpoint(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            if (res.statusCode === 200 || res.statusCode === 304) {
                resolve(true);
            } else {
                reject(new Error(`Status code: ${res.statusCode}`));
            }
        }).on('error', reject);
    });
}

async function runHealthCheck() {
    console.log('🏥 Running health checks...\n');

    const checks = [
        { name: 'Frontend', url: FRONTEND_URL },
        { name: 'Backend', url: `${BACKEND_URL}/health` },
    ];

    let allHealthy = true;

    for (const check of checks) {
        try {
            await checkEndpoint(check.url);
            console.log(`✅ ${check.name}: UP`);
        } catch (error) {
            console.error(`❌ ${check.name}: DOWN - ${error.message}`);
            allHealthy = false;
        }
    }

    if (allHealthy) {
        console.log('\n🎉 All systems operational!');
        process.exit(0);
    } else {
        console.log('\n⚠️  Some services are down!');
        process.exit(1);
    }
}

runHealthCheck();
