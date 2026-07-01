const http = require('http');
async function test() {
  const login = await fetch('http://localhost:4000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@grekam.com', password: 'password123' })
  });
  const cookies = login.headers.get('set-cookie');
  console.log('Cookies:', cookies);
  
  const props = await fetch('http://localhost:4000/api/v1/crm/proposals', { headers: { cookie: cookies }});
  const propsJson = await props.json();
  console.log('Props:', JSON.stringify(propsJson).slice(0, 200));
}
test();
