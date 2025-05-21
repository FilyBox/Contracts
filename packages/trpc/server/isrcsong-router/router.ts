import { z } from 'zod';

import { findIsrc } from '@documenso/lib/server-only/document/find-isrc';
import { prisma } from '@documenso/prisma';

import { authenticatedProcedure, router } from '../trpc';

export type GetIsrcSongsByIdOptions = {
  id: number;
  trackName?: string;
  artist?: string;
  duration?: string;
  title?: string;
  license?: string;
  date?: string;
};

export const IsrcSongsRouter = router({
  createIsrcSongs: authenticatedProcedure
    .input(
      z.object({
        trackName: z.string().optional(),
        artist: z.string().optional(),
        duration: z.string().optional(),
        title: z.string().optional(),
        license: z.string().optional(),
        date: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { user, teamId } = ctx;
      const userId = user.id;
      const { trackName, artist, duration, title, license, date } = input;

      const isrcSong = await prisma.isrcSongs.create({
        data: {
          trackName,
          artist,
          duration,
          title,
          license,
          date,
          userId,
          ...(teamId ? { teamId } : {}),
        },
      });

      return isrcSong;
    }),

  createManyIsrcSongs: authenticatedProcedure
    .input(
      z.object({
        isrcSongs: z.array(
          z.object({
            trackName: z.string().optional(),
            artist: z.string().optional(),
            duration: z.string().optional(),
            title: z.string().optional(),
            license: z.string().optional(),
            date: z.string().optional(),
            isrc: z.string().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      const { isrcSongs } = input;
      const createdIsrcSongs = await prisma.isrcSongs.createMany({
        data: isrcSongs,
      });
      return createdIsrcSongs;
    }),

  findIsrcSongs: authenticatedProcedure
    .input(
      z.object({
        // userId: z.number(),
        query: z.string().optional(),
        page: z.number().optional(),
        perPage: z.number().optional(),
        period: z.enum(['7d', '14d', '30d']).optional(),
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

      const [documents] = await Promise.all([
        findIsrc({
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
      return documents;
    }),

  updateIsrcSongsById: authenticatedProcedure
    .input(
      z.object({
        id: z.number(),
        trackName: z.string().optional(),
        artist: z.string().optional(),
        duration: z.string().optional(),
        title: z.string().optional(),
        license: z.string().optional(),
        date: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      console.log('updating isrc song', id, 'and data:', data);

      const olalo = await prisma.isrcSongs.update({
        where: { id },
        data,
      });
      console.log('The cable si jala bato', olalo);

      return olalo;
    }),

  deleteIsrcSongsById: authenticatedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const { id } = input;
      const deletedIsrcSong = await prisma.isrcSongs.delete({
        where: { id },
      });

      return deletedIsrcSong;
    }),
});
