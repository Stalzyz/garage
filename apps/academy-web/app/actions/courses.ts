"use server";

import { prisma } from "../../src/lib/prisma";

export async function getCourses() {
  try {
    const dbCourses = await prisma.course.findMany({
      where: { isPublished: true },
      select: { 
        id: true, 
        name: true,
        code: true,
        lmsCourse: { select: { thumbnail: true } } 
      }
    });
    return dbCourses.map((c) => ({
      title: c.name,
      code: c.code,
      coverImage: c.lmsCourse?.thumbnail || null
    }));
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    return [];
  }
}

export async function getHiringPartners() {
  try {
    const partners = await prisma.placementCompany.findMany({
      select: {
        name: true,
        logoUrl: true,
      },
      take: 15,
    });
    return partners;
  } catch (error) {
    console.error("Failed to fetch placement companies:", error);
    return [];
  }
}

export async function getEducators() {
  try {
    const educators = await prisma.educator.findMany({
      where: {
        verificationStatus: "VERIFIED"
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
          }
        }
      },
      take: 4,
    });
    return educators;
  } catch (error) {
    console.error("Failed to fetch educators:", error);
    return [];
  }
}

export async function getPortfolioProjects() {
  try {
    const projects = await prisma.portfolioProject.findMany({
      include: {
        portfolio: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
    return projects;
  } catch (error) {
    console.error("Failed to fetch portfolio projects:", error);
    return [];
  }
}
