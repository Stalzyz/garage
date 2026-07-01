with open("apps/api/src/hr/employees.router.ts", "r") as f:
    content = f.read()

reset_route = """
  // POST /api/v1/hr/employees/:id/reset-password
  server.post('/:id/reset-password', {
    schema: {
      params: z.object({ id: z.string() })
    }
  }, async (req, reply) => {
    const employee = await server.prisma.employee.findUnique({
      where: { id: req.params.id },
      include: { user: true }
    });
    
    if (!employee || !employee.user) {
      return reply.status(404).send({ error: "Employee or User not found" });
    }

    const tempPassword = Math.random().toString(36).slice(-8) + "!";
    const passwordHash = crypto.createHash('sha256').update(tempPassword).digest('hex');

    await server.prisma.user.update({
      where: { id: employee.userId },
      data: { passwordHash }
    });

    return reply.status(200).send({ 
      message: "Password reset successfully", 
      credentials: { email: employee.user.email, password: tempPassword } 
    });
  });
"""

if "// POST /api/v1/hr/employees/:id/reset-password" not in content:
    content = content.replace("export default async function employeesRoutes(app: FastifyInstance) {\n  const server = app.withTypeProvider<ZodTypeProvider>();", "export default async function employeesRoutes(app: FastifyInstance) {\n  const server = app.withTypeProvider<ZodTypeProvider>();\n" + reset_route)
    with open("apps/api/src/hr/employees.router.ts", "w") as f:
        f.write(content)
