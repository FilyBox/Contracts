// import { TRPCError } from '@trpc/server';
import type { Prisma } from '@prisma/client';
import { DateTime } from 'luxon';
import { z } from 'zod';

import { type GetStatsInput, getStats } from '@documenso/lib/server-only/document/get-priority';
import { getTeamById } from '@documenso/lib/server-only/team/get-team';
// import { jobs } from '@documenso/lib/jobs/client';
// import { getTemplateById } from '@documenso/lib/server-only/template/get-template-by-id';
import { prisma } from '@documenso/prisma';
import { ExtendedTaskPriority } from '@documenso/prisma/types/extended-task-priority';

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
        // userId: z.number(),
        // teamId: z.number().optional(),
        projectId: z.number().optional(),
        parentTaskId: z.number().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { user, teamId } = ctx;
      // Desestructuración correcta que incluye projectId
      const { projectId, parentTaskId, ...data } = input;
      const userId = user.id;
      // Verificar permisos si es tarea de equipo
      if (teamId && ctx.teamId !== teamId) {
        throw new Error('No tienes permisos para crear tareas en este equipo');
      }

      if (teamId) {
        const team = await getTeamById({ userId, teamId });
        if (!team) {
          throw new Error('Team not found');
        }

        return await prisma.task.create({
          data: {
            ...data,
            status: 'PENDING',
            userId,
            teamId: team.id,
            ...(projectId && { projectId }),
            ...(parentTaskId && { parentTaskId }),
          },
        });
      }

      return await prisma.task.create({
        data: {
          ...data,
          status: 'PENDING',
          userId,
          ...(projectId && { projectId }),
          ...(parentTaskId && { parentTaskId }),
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
        // userId: z.number(),
        query: z.string().optional(),
        teamId: z.number().optional(),
        projectId: z.number().optional(),
        folderId: z.number().optional(),
        page: z.number().optional(),
        perPage: z.number().optional(),
        period: z.enum(['7d', '14d', '30d']).optional(),
        priority: z.nativeEnum(ExtendedTaskPriority).optional(),
        status: z.enum(['PENDING', 'COMPLETED']).optional(),
        orderBy: z.enum(['createdAt', 'updatedAt']).optional(),
        orderDirection: z.enum(['asc', 'desc']).optional().default('desc'),
      }),
    )
    .query(async ({ input, ctx }) => {
      const {
        projectId,
        query,
        priority,
        period,
        orderBy = 'createdAt',
        orderDirection = 'desc',
      } = input;
      const { user, teamId } = ctx;
      const userId = user.id;
      // Construir el objeto where para los filtros
      const where: Prisma.TaskWhereInput = {
        userId: userId,
        ...(teamId && { teamId }),
        ...(projectId && { projectId }),
        ...(query && {
          OR: [{ title: { contains: query, mode: 'insensitive' } }],
        }),
      };

      if (priority && priority !== ExtendedTaskPriority.ALL) {
        where.priority = priority;
      }

      const getStatOptions: GetStatsInput = {
        user,
        period,
        search: query,
      };

      if (teamId) {
        const team = await getTeamById({ userId: user.id, teamId });
        getStatOptions.team = {
          teamId: team.id,
          teamEmail: team.teamEmail?.email,
          currentTeamMemberRole: team.currentTeamMember?.role,
          currentUserEmail: user.email,
          userId: user.id,
        };
      }

      let createdAt: Prisma.TaskWhereInput['createdAt'];

      if (period) {
        const daysAgo = parseInt(period.replace(/d$/, ''), 10);

        const startOfPeriod = DateTime.now().minus({ days: daysAgo }).startOf('day');

        createdAt = {
          gte: startOfPeriod.toJSDate(),
        };
      }

      if (!teamId) {
        where.teamId = null;
      }

      where.createdAt = createdAt;

      const [stats] = await Promise.all([getStats(getStatOptions)]);
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

      return { tasks, stats };
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

  // uploadTemplate: authenticatedProcedure

  // uploadBulkSend: authenticatedProcedure
  //   .input(
  //     z.object({
  //       taskId: z.number(),
  //       teamId: z.number().optional(),
  //       csv: z.string().min(1),
  //       sendImmediately: z.boolean(),
  //     }),
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     const { taskId, teamId, csv, sendImmediately } = input;
  //     const { user } = ctx;

  //     if (csv.length > 4 * 1024 * 1024) {
  //       throw new TRPCError({
  //         code: 'BAD_REQUEST',
  //         message: 'File size exceeds 4MB limit',
  //       });
  //     }

  //     const task = await getTemplateById({
  //       id: taskId,
  //       teamId,
  //       userId: user.id,
  //     });

  //     if (!task) {
  //       throw new TRPCError({
  //         code: 'NOT_FOUND',
  //         message: 'Template not found',
  //       });
  //     }

  //     await jobs.triggerJob({
  //       name: 'internal.bulk-send-template',
  //       payload: {
  //         userId: user.id,
  //         teamId,
  //         taskId,
  //         csvContent: csv,
  //         sendImmediately,
  //         requestMetadata: ctx.metadata.requestMetadata,
  //       },
  //     });

  //     return { success: true };
  //   }),
});
