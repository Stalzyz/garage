const fetch = require('node-fetch');
async function test() {
  const res = await fetch('http://localhost:3000/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'email=admin%40grekam.in&password=Medusa09%40'
  });
  console.log("Status:", res.status);
  const cookies = res.headers.raw()['set-cookie'];
  console.log("Cookies:", cookies);
}
test();
