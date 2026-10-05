const fetch = require('node-fetch');

async function testQuilttAuth() {
  const apiSecret = 'qltt_1s34LHfOiPRUfiYfOP3VHDC-41fd7eb16aeb25e23c5b8e47627db4152b10dd82c6849f1c280f3f9caa8171421ef39cf1';
  
  try {
    const sessionRes = await fetch('https://auth.quiltt.io/v1/users/sessions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiSecret,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    if (!sessionRes.ok) {
      console.log('Session Error:', await sessionRes.text());
    } else {
      const sessionJson = await sessionRes.json();
      console.log('Successfully minted session. Profile ID created:', sessionJson.profileId);
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testQuilttAuth();
