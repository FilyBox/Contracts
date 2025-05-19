// import { TRPCError } from '@trpc/server';
import type { Prisma } from '@prisma/client';
import { Release, TypeOfRelease } from '@prisma/client';
import { DateTime } from 'luxon';
import { z } from 'zod';

import { findRelease } from '@documenso/lib/server-only/document/find-releases';
import { type GetStatsInput } from '@documenso/lib/server-only/document/get-priority';
import { getTeamById } from '@documenso/lib/server-only/team/get-team';
// import { jobs } from '@documenso/lib/jobs/client';
// import { getTemplateById } from '@documenso/lib/server-only/template/get-template-by-id';
import { prisma } from '@documenso/prisma';
import { ExtendedRelease, ExtendedReleaseType } from '@documenso/prisma/types/extended-release';

import { authenticatedProcedure, router } from '../trpc';

export type GetTaskByIdOptions = {
  id: number;
  userId: number;
  teamId?: number;
  folderId?: string | null;
};

export const releaseRouter = router({
  createRelease: authenticatedProcedure
    .input(
      z.object({
        date: z.string().optional(),
        artist: z.string().optional(),
        lanzamiento: z.string().optional(),
        typeOfRelease: z.nativeEnum(TypeOfRelease).optional(),
        release: z.nativeEnum(Release).optional(),
        uploaded: z.string().optional(),
        streamingLink: z.string().optional(),
        assets: z.string().optional(),
        canvas: z.boolean().optional(),
        cover: z.boolean().optional(),
        audioWAV: z.boolean().optional(),
        video: z.boolean().optional(),
        banners: z.boolean().optional(),
        pitch: z.boolean().optional(),
        EPKUpdates: z.boolean().optional(),
        WebSiteUpdates: z.boolean().optional(),
        Biography: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { user, teamId } = ctx;
      const userId = user.id;
      const { ...inputData } = input;
      // Verificar permisos si es tarea de equipo
      if (teamId && ctx.teamId !== teamId) {
        throw new Error('No tienes permisos para crear releases en este equipo');
      }

      if (teamId) {
        const team = await getTeamById({ userId, teamId });
        if (!team) {
          throw new Error('Team not found');
        }

        const releaseCreated = await prisma.releases.create({
          data: {
            ...inputData,
            userId,
            teamId: team.id,
          },
        });

        return releaseCreated;
      }

      const releaseCreated = await prisma.releases.create({
        data: {
          ...input,
          userId,
        },
      });

      return releaseCreated;
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

  findRelease: authenticatedProcedure
    .input(
      z.object({
        // userId: z.number(),
        query: z.string().optional(),
        page: z.number().optional(),
        perPage: z.number().optional(),
        period: z.enum(['7d', '14d', '30d']).optional(),
        type: z.nativeEnum(ExtendedReleaseType).optional(),
        release: z.nativeEnum(ExtendedRelease).optional(),
        orderBy: z.enum(['createdAt', 'updatedAt']).optional(),
        orderByDirection: z.enum(['asc', 'desc']).optional().default('desc'),
        orderByColumn: z
          .enum(['id', 'lanzamiento', 'typeOfRelease', 'createdAt', 'updatedAt'])
          .optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const {
        query,
        type,
        page,
        perPage,
        // release,
        orderByColumn,
        orderByDirection,
        period,
        // orderBy = 'createdAt',
      } = input;
      const { user, teamId } = ctx;
      const userId = user.id;
      // Construir el objeto where para los filtros
      const where: Prisma.ReleasesWhereInput = {
        ...(teamId && { teamId }),
        ...(query && {
          OR: [{ lanzamiento: { contains: query, mode: 'insensitive' } }],
        }),
      };

      if (type && type !== ExtendedReleaseType.ALL) {
        where.typeOfRelease = type;
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

      let createdAt: Prisma.ReleasesWhereInput['createdAt'];

      if (period) {
        const daysAgo = parseInt(period.replace(/d$/, ''), 10);

        const startOfPeriod = DateTime.now().minus({ days: daysAgo }).startOf('day');

        createdAt = {
          gte: startOfPeriod.toJSDate(),
        };
      }

      where.createdAt = createdAt;
      console.log('where', where);
      // const [stats] = await Promise.all([getStats(getStatOptions)]);
      const [documents] = await Promise.all([
        findRelease({
          query,
          page,
          perPage,
          userId,
          teamId,
          period,

          orderBy: orderByColumn
            ? { column: orderByColumn, direction: orderByDirection }
            : undefined,
        }),
      ]);
      console.log('releases', documents);
      // const releases = await prisma.releases.findMany({
      //   where,

      //   orderBy: {
      //     [orderBy]: orderDirection,
      //   },
      // });

      return documents;
    }),

  updateRelease: authenticatedProcedure
    .input(
      z.object({
        id: z.number().min(1),
        date: z.string().optional(),
        artist: z.string().optional(),
        lanzamiento: z.string().optional(),
        typeOfRelease: z.nativeEnum(TypeOfRelease).optional(),
        release: z.nativeEnum(Release).optional(),
        uploaded: z.string().optional(),
        streamingLink: z.string().optional(),
        assets: z.string().optional(),
        canvas: z.boolean().optional(),
        cover: z.boolean().optional(),
        audioWAV: z.boolean().optional(),
        video: z.boolean().optional(),
        banners: z.boolean().optional(),
        pitch: z.boolean().optional(),
        EPKUpdates: z.boolean().optional(),
        WebSiteUpdates: z.boolean().optional(),
        Biography: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { ...data } = input;

      // Verificar permisos si es tarea de equipo
      // if (teamId && ctx.teamId !== teamId) {
      //   throw new Error('No tienes permisos para actualizar tareas en este equipo');
      // }

      return await prisma.releases.update({
        where: { id: Number(input.id) },
        data: {
          ...data,
        },
      });
    }),

  deleteRelease: authenticatedProcedure
    .input(z.object({ releaseId: z.number().min(1) }))
    .mutation(async ({ input }) => {
      const { releaseId } = input;
      // Eliminar la tarea y sus subtareas
      await prisma.releases.deleteMany({
        where: {
          id: releaseId,
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
