/**
 * Environment Configuration Test
 * 
 * This script tests the environment configuration and API integrations
 * to ensure all security improvements are working correctly.
 */

// Test environment variables
console.log("🔧 Testing Environment Configuration...\n");

// Test environment variables directly
const fs = require('fs');
const path = require('path');

// Load .env.local if it exists
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

// Test 1: Environment Variable Check
console.log("1. Environment Variable Check:");
const requiredEnvVars = [
    'HEYGEN_API_KEY',
    'GEMINI_API_KEY',
    'CLOUDINARY_CLOUD_NAME',
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
];

let missingVars = [];
let configuredVars = [];

requiredEnvVars.forEach(varName => {
    if (process.env[varName]) {
        configuredVars.push(varName);
        console.log(`✅ ${varName}: Configured`);
    } else {
        missingVars.push(varName);
        console.log(`❌ ${varName}: Missing`);
    }
});

if (missingVars.length === 0) {
    console.log("\n✅ All required environment variables are configured!");
} else {
    console.log(`\n⚠️  ${missingVars.length} environment variables need configuration`);
}

// Test 2: Check .env.local file
console.log("\n2. Environment File Check:");
if (fs.existsSync(envPath)) {
    console.log("✅ .env.local file found");
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    console.log(`   Contains ${envLines.length} environment variables`);
} else {
    console.log("❌ .env.local file not found");
    console.log("   Copy .env.example to .env.local and configure your API keys");
}

// Test 3: Script Generation API Test
console.log("\n3. Script Generation Test:");
const testScriptGeneration = async () => {
    try {
        const testResume = `
      John Doe
      Software Engineer
      
      Experience:
      - 5 years of experience in full-stack development
      - Proficient in JavaScript, React, Node.js
      - Led team of 3 developers on e-commerce platform
      
      Education:
      - Bachelor's in Computer Science
      - Graduated with honors
      
      Skills:
      - Frontend: React, Vue.js, HTML5, CSS3
      - Backend: Node.js, Express, MongoDB
      - Tools: Git, Docker, AWS
    `;

        const response = await fetch('http://localhost:3000/api/GenerateScript', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                parsedResume: testResume
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log("✅ Script generation successful");
            console.log(`   Script length: ${data.script.length} characters`);
            console.log(`   Source: ${data.source}`);

            // Test for corrupted content
            const hasCorruption = /\*{2,}|\#{2,}|```|\[|\]/.test(data.script);
            if (hasCorruption) {
                console.log("⚠️  Warning: Script may contain formatting artifacts");
            } else {
                console.log("✅ Script is clean (no formatting artifacts detected)");
            }

            // Show first 200 characters
            console.log(`   Preview: "${data.script.substring(0, 200)}..."`);
        } else {
            console.log(`❌ Script generation failed: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.log(`❌ Script generation test error: ${error.message}`);
        console.log("   Make sure the development server is running (npm run dev)");
    }
};

// Run async test
testScriptGeneration();

console.log("\n📋 Test Summary:");
console.log("- Environment variables: Check output above");
console.log("- API configuration: Check output above");
console.log("- Script generation: Requires dev server running");
console.log("\nTo run the full test:");
console.log("1. Start dev server: npm run dev");
console.log("2. Run this test: node test-environment.js");
