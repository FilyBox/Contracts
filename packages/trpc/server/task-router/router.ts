import { TaskPriority } from '@prisma/client';
import { z } from 'zod';

import { prisma } from '@documenso/prisma';

import { authenticatedProcedure, router } from '../trpc';

export type GetTaskByIdOptions = {
  id: number;
  userId: number;
  teamId?: number;
  folderId?: string | null;
};
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
    .query(async ({ input }: { input: { taskId: string } }) => {
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

  findTasks: authenticatedProcedure
    .input(
      z.object({
        userId: z.number(),
        teamId: z.number().optional(),
        projectId: z.number().optional(),
        folderId: z.number().optional(),
        status: z.enum(['PENDING', 'COMPLETED']).optional(),
        orderBy: z.enum(['createdAt', 'updatedAt']).optional(),
        orderDirection: z.enum(['asc', 'desc']).optional().default('desc'),
      }),
    )
    .query(async ({ input }) => {
      const {
        userId,
        teamId,
        projectId,
        folderId,
        status,
        orderBy = 'createdAt',
        orderDirection = 'desc',
      } = input;

      // Construir el objeto where para los filtros
      const where = {
        userId,
        ...(teamId && { teamId }),
        ...(projectId && { projectId }),
        ...(folderId && { folderId }),
        ...(status && { status }),
      };

      // Obtener todas las tareas que coincidan con los filtros
      const tasks = await prisma.task.findMany({
        where,
        include: {
          assignees: true,
          comments: true,
        },
        orderBy: {
          [orderBy]: orderDirection,
        },
      });

      return tasks;
    }),
  updateTask: authenticatedProcedure
    .input(
      z.object({
        taskId: z.number().min(1),
        title: z.string().min(1),
        description: z.string().optional(),
        priority: z.nativeEnum(TaskPriority),
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

  deleteTask: authenticatedProcedure
    .input(z.object({ taskId: z.number().min(1) }))
    .mutation(async ({ input }) => {
      const { taskId } = input;
      // Eliminar la tarea y sus subtareas
      await prisma.task.deleteMany({
        where: {
          id: taskId,
          OR: [
            { parentTaskId: taskId }, // Subtareas
            { id: taskId }, // Tarea principal
          ],
        },
      });
      return { success: true };
    }),

  getTaskById: authenticatedProcedure
    .input(z.object({ id: z.number(), userId: z.number(), teamId: z.number().optional() }))
    .query(async ({ input }) => {
      const { id, userId, teamId } = input;

      const task = await prisma.task.findFirst({
        where: {
          id,
          ...(teamId
            ? {
                team: {
                  id: teamId,
                  members: {
                    some: {
                      userId,
                    },
                  },
                },
              }
            : {
                userId,
                teamId: null,
              }),
        },
        include: {
          user: true,
          project: true,
          team: true,
          parentTask: true,
          subtasks: true,
        },
      });

      if (!task) {
        throw new Error('Task not found');
      }

      return task;
    }),
});
