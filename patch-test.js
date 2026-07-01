const http = require('http');
async function test() {
  const login = await fetch('http://localhost:4000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@grekam.com', password: 'password123' })
  });
  const cookies = login.headers.get('set-cookie');
  
  const props = await fetch('http://localhost:4000/api/v1/crm/proposals', { headers: { cookie: cookies }});
  const propsJson = await props.json();
  const id = propsJson.data[0]?.id;
  
  if (!id) return;
  
  const payload = {
    title: "Updated Title",
    notes: "Updated Notes",
    items: [
      { description: "Test Item", quantity: 1, unitPrice: 100 }
    ]
  };

  const res = await fetch(`http://localhost:4000/api/v1/crm/proposals/${id}`, {
    method: 'PATCH',
    headers: { cookie: cookies, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  console.log(res.status, await res.text());
}
test();
