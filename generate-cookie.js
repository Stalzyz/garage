const { encode } = require('next-auth/jwt');
const fs = require('fs');
const path = require('path');

async function generate() {
  const token = {
    name: "Test Admin",
    email: "superadmin@test.com",
    role: "SUPER_ADMIN",
    id: "test-1",
    customRole: null,
    permissions: []
  };

  const secret = process.env.AUTH_SECRET || "fallback-dev-secret-if-env-fails-12345";
  
  const encoded = await encode({
    token,
    secret,
  });

  const state = {
    cookies: [
      {
        name: 'next-auth.session-token',
        value: encoded,
        domain: 'localhost',
        path: '/',
        expires: -1,
        httpOnly: true,
        secure: false,
        sameSite: 'Lax'
      }
    ],
    origins: []
  };

  fs.mkdirSync(path.join(process.cwd(), 'playwright/.auth'), { recursive: true });
  fs.writeFileSync(path.join(process.cwd(), 'playwright/.auth/user.json'), JSON.stringify(state, null, 2));
  console.log("Cookie generated and saved successfully!");
}

generate().catch(console.error);
