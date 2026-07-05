import { z } from 'zod';
import { insertTeacherSchema, insertReviewSchema, insertPyqSchema, insertUserSchema, teachers, reviews, pyqs, users } from './schema';

export type { InsertUser, InsertTeacher, InsertReview, InsertPyq } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  forbidden: z.object({
    message: z.string(),
  }),
  conflict: z.object({
    message: z.string(),
  })
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({
        email: z.string().email(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: insertUserSchema.extend({
        email: z.string().email(),
      }),
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>().nullable(),
      },
    },
  },
  teachers: {
    list: {
      method: 'GET' as const,
      path: '/api/teachers',
      responses: {
        200: z.array(z.custom<typeof teachers.$inferSelect & { reviewCount: number }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/teachers/:id',
      responses: {
        200: z.custom<typeof teachers.$inferSelect & { reviewCount: number }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/teachers',
      input: insertTeacherSchema,
      responses: {
        201: z.custom<typeof teachers.$inferSelect>(),
        400: errorSchemas.validation,
        403: errorSchemas.forbidden,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/teachers/:id',
      input: insertTeacherSchema.partial(),
      responses: {
        200: z.custom<typeof teachers.$inferSelect>(),
        400: errorSchemas.validation,
        403: errorSchemas.forbidden,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/teachers/:id',
      responses: {
        204: z.void(),
        403: errorSchemas.forbidden,
        404: errorSchemas.notFound,
      },
    },
  },
  reviews: {
    list: {
      method: 'GET' as const,
      path: '/api/teachers/:teacherId/reviews',
      responses: {
        200: z.array(z.custom<typeof reviews.$inferSelect & { studentUsername: string }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/reviews',
      input: insertReviewSchema.omit({ studentId: true }), // studentId from session
      responses: {
        201: z.custom<typeof reviews.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        409: errorSchemas.conflict, // Already reviewed
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/reviews/:id',
      input: insertReviewSchema.omit({ studentId: true, teacherId: true }).partial(),
      responses: {
        200: z.custom<typeof reviews.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden, // Not own review
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/reviews/:id',
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden, // Admin only
        404: errorSchemas.notFound,
      },
    },
  },
  pyqs: {
    update: {
      method: 'PUT' as const,
      path: '/api/pyqs/:id',
      responses: {
        200: z.custom<typeof pyqs.$inferSelect>(),
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden,
        404: errorSchemas.notFound,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/teachers/:teacherId/pyqs',
      responses: {
        200: z.array(z.custom<typeof pyqs.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/pyqs',
      input: z.any(), // FormData not easily schema-defined here, handled in route
      responses: {
        201: z.custom<typeof pyqs.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden,
      },
    },
  },
  leaderboard: {
    list: {
      method: 'GET' as const,
      path: '/api/leaderboard',
      responses: {
        200: z.array(z.object({
          userId: z.number(),
          email: z.string(),
          reviewCount: z.number(),
          pyqCount: z.number(),
          points: z.number(),
        })),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
