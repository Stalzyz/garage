import { FastifyInstance } from "fastify";
import { prisma } from "../db";
import { z } from "zod";

const ProductSchema = z.object({
  categoryId: z.string(),
  name: z.string(),
  price: z.number(),
  billing: z.string(),
  description: z.string().optional(),
  features: z.array(z.string()),
  isPopular: z.boolean().default(false),
});

export default async function productsRouter(fastify: FastifyInstance) {
  // GET all products
  fastify.get("/", async (request, reply) => {
    try {
      const products = await prisma.product.findMany({
        orderBy: { createdAt: "desc" },
      });
      return products;
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: "Failed to fetch products" });
    }
  });

  // POST create product
  fastify.post("/", async (request, reply) => {
    try {
      const data = ProductSchema.parse(request.body);
      const product = await prisma.product.create({
        data,
      });
      return product;
    } catch (error: any) {
      request.log.error(error);
      return reply.code(400).send({ error: error.message || "Invalid input" });
    }
  });

  // DELETE product
  fastify.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.product.delete({
        where: { id },
      });
      return { success: true };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: "Failed to delete product" });
    }
  });
}
