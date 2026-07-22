const Fastify = require('fastify');
const routes = require('./apps/api/dist/hr/employees.router').default;

const app = Fastify();
app.withTypeProvider = () => app;

app.decorate('prisma', {
  user: {
    findUnique: async () => null,
    create: async (data) => ({ id: 'user-id', ...data.data })
  },
  employee: {
    create: async (data) => ({ id: 'emp-id', ...data.data })
  },
  $transaction: async (cb) => cb({
    user: { create: async (data) => ({ id: 'user-id', ...data.data }) },
    employee: { create: async (data) => ({ id: 'emp-id', ...data.data }) }
  })
});

app.register(routes, { prefix: '/hr/employees' });

app.listen({ port: 3001 }, (err) => {
  if (err) throw err;
  console.log('Test server running');
});
