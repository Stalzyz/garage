import { FastifyInstance } from "fastify";
import { prisma } from "../db";

export default async function revenueRouter(fastify: FastifyInstance) {
  fastify.get("/stats", async (request, reply) => {
    try {
      // Fetch all paid invoices
      const invoices = await prisma.invoice.findMany({
        where: {
          status: "PAID",
        }
      });
      
      let agencyTotal = 0;
      let saasTotal = 0;
      let academyTotal = 0;

      invoices.forEach(inv => {
        if (inv.businessUnit === "AGENCY") agencyTotal += inv.paidAmount;
        if (inv.businessUnit === "SAAS") saasTotal += inv.paidAmount;
        if (inv.businessUnit === "ACADEMY") academyTotal += inv.paidAmount;
      });

      const total = agencyTotal + saasTotal + academyTotal;

      const streams = [
        { id: "agency", name: "Agency Services", amount: agencyTotal, percentage: total ? Math.round((agencyTotal/total)*100) : 0, trend: "+0%", trendUp: true, color: "bg-blue-500" },
        { id: "saas", name: "SaaS Subscriptions", amount: saasTotal, percentage: total ? Math.round((saasTotal/total)*100) : 0, trend: "+0%", trendUp: true, color: "bg-emerald-500" },
        { id: "academy", name: "Academy Tuition", amount: academyTotal, percentage: total ? Math.round((academyTotal/total)*100) : 0, trend: "+0%", trendUp: true, color: "bg-amber-500" },
      ];

      // Monthly data
      const monthlyDataMap: Record<string, { agency: number, saas: number, academy: number }> = {};
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      months.forEach(m => monthlyDataMap[m] = { agency: 0, saas: 0, academy: 0 });

      invoices.forEach(inv => {
        if (inv.paidAt) {
          const month = months[inv.paidAt.getMonth()];
          if (inv.businessUnit === "AGENCY") monthlyDataMap[month].agency += inv.paidAmount;
          if (inv.businessUnit === "SAAS") monthlyDataMap[month].saas += inv.paidAmount;
          if (inv.businessUnit === "ACADEMY") monthlyDataMap[month].academy += inv.paidAmount;
        }
      });

      const monthlyData = months.map(month => ({
        month,
        ...monthlyDataMap[month]
      }));

      return {
        total,
        streams,
        monthlyData
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: "Failed to fetch revenue stats" });
    }
  });
}
