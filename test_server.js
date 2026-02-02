const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const VERIFY_TOKEN = 'my_test_token_123';

async function testVerification() {
    try {
        console.log('Testing GET /webhook verification...');
        const challenge = '11223344';
        const response = await axios.get(`${BASE_URL}/webhook`, {
            params: {
                'hub.mode': 'subscribe',
                'hub.verify_token': VERIFY_TOKEN,
                'hub.challenge': challenge
            }
        });

        if (response.status === 200 && response.data.toString() === challenge) {
            console.log('✅ Verification Passed');
        } else {
            console.log('❌ Verification Failed', response.status, response.data);
        }
    } catch (error) {
        console.log('❌ Verification Error:', error.message);
    }
}

async function testEventHandling() {
    try {
        console.log('\nTesting POST /webhook event handling...');
        const payload = {
            object: 'whatsapp_business_account',
            entry: [{
                changes: [{
                    value: {
                        messaging_product: 'whatsapp',
                        metadata: { phone_number_id: '123456789' },
                        messages: [{
                            from: '9876543210',
                            text: { body: 'Hello World' }
                        }]
                    }
                }]
            }]
        };

        const response = await axios.post(`${BASE_URL}/webhook`, payload);

        if (response.status === 200) {
            console.log('✅ Event Handling Passed');
        } else {
            console.log('❌ Event Handling Failed', response.status);
        }
    } catch (error) {
        console.log('❌ Event Handling Error:', error.message);
    }
}

async function runTests() {
    // Wait a bit for server to start if ran immediately
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testVerification();
    await testEventHandling();
}

runTests();
