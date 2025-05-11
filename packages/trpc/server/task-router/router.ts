import { z } from 'zod';

import { prisma } from '@documenso/prisma';

import { authenticatedProcedure, router } from '../trpc';

export const taskRouter = router({
  createTask: authenticatedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        dueDate: z.date().optional(),
        tags: z.array(z.string()).optional().default([]),
        userId: z.number(),
        teamId: z.number().optional(),
        projectId: z.number().optional(),
        parentTaskId: z.number().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Desestructuración correcta que incluye projectId
      const { userId, teamId, projectId, parentTaskId, ...data } = input;

      // Verificar permisos si es tarea de equipo
      if (teamId && ctx.teamId !== teamId) {
        throw new Error('No tienes permisos para crear tareas en este equipo');
      }

      return await prisma.task.create({
        data: {
          ...data,
          status: 'PENDING',
          user: {
            connect: { id: userId },
          },
          ...(teamId && { team: { connect: { id: teamId } } }),
          ...(projectId && { project: { connect: { id: projectId } } }),
          ...(parentTaskId && { parentTask: { connect: { id: parentTaskId } } }),
        },
      });
    }),

  findTaskById: authenticatedProcedure
    .input(z.object({ taskId: z.string() }))
    .query(async ({ input }) => {
      const { taskId } = input;
      return await prisma.task.findUnique({
        where: { id: Number(taskId) },
        include: {
          user: true,
          project: true,
          team: true,
          parentTask: true,
          subtasks: true,
          // tags: true, // Removed because 'tags' is not a valid property in 'TaskInclude<DefaultArgs>'
        },
      });
    }),

  updateTask: authenticatedProcedure
    .input(
      z.object({
        taskId: z.number().min(1),
        title: z.string().min(1),
        description: z.string().optional(),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        dueDate: z.date().optional(),
        tags: z.array(z.string()).optional().default([]),
        userId: z.number(),
        teamId: z.number().optional(),
        projectId: z.number().optional(),
        parentTaskId: z.number().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { userId, teamId, projectId, parentTaskId, ...data } = input;

      // Verificar permisos si es tarea de equipo
      if (teamId && ctx.teamId !== teamId) {
        throw new Error('No tienes permisos para actualizar tareas en este equipo');
      }

      return await prisma.task.update({
        where: { id: Number(input.taskId) },
        data: {
          ...data,
          ...(teamId && { team: { connect: { id: teamId } } }),
          ...(projectId && { project: { connect: { id: projectId } } }),
          ...(parentTaskId && { parentTask: { connect: { id: parentTaskId } } }),
        },
      });
    }),

  // ... otros procedimientos de tareas
});
