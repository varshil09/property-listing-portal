const { sendPasswordResetEmail } = require('./utils/emailService');
require('dotenv').config();

async function testEmail() {
  const result = await sendPasswordResetEmail('test@example.com', 'test-token-123', 'Test User');
  console.log(result);
}

testEmail();