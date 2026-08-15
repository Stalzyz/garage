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
