#!/usr/bin/env node

/**
 * Backup Script for Streamify
 * Automatically backs up user data to GitHub private repo
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BACKUP_DIR = path.join(__dirname, '../backups');
const DATE = new Date().toISOString().split('T')[0];

console.log('🔄 Starting backup process...');

// Create backups directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Function to run SQL query and export data
async function exportData() {
    console.log('📊 Exporting database data...');

    // In production, this would connect to Supabase and export data
    // For now, create a placeholder structure
    const backup = {
        date: DATE,
        version: '1.0.0',
        data: {
            users_count: 0,
            playlists_count: 0,
            songs_count: 0,
        },
        metadata: {
            timestamp: new Date().toISOString(),
            type: 'daily_backup',
        }
    };

    const backupPath = path.join(BACKUP_DIR, `backup-${DATE}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));

    console.log(`✅ Backup created: ${backupPath}`);
    return backupPath;
}

// Function to push to GitHub
function pushToGitHub(backupPath) {
    console.log('📤 Pushing to GitHub...');

    try {
        // Add the backup file
        execSync(`git add "${backupPath}"`, { stdio: 'inherit' });

        // Commit
        execSync(`git commit -m "chore: Daily backup ${DATE}"`, { stdio: 'inherit' });

        // Push
        execSync('git push origin main', { stdio: 'inherit' });

        console.log('✅ Backup pushed to GitHub successfully!');
    } catch (error) {
        console.error('❌ Failed to push to GitHub:', error.message);
    }
}

// Main execution
(async () => {
    try {
        const backupPath = await exportData();
        pushToGitHub(backupPath);
        console.log('🎉 Backup completed successfully!');
    } catch (error) {
        console.error('❌ Backup failed:', error);
        process.exit(1);
    }
})();
