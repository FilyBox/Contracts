import { z } from 'zod';

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
    .mutation(async ({ input }) => {
      const { trackName, artist, duration, title, license, date } = input;

      const isrcSong = await prisma.isrcSongs.create({
        data: {
          trackName,
          artist,
          duration,
          title,
          license,
          date,
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

  findIsrcSongs: authenticatedProcedure.query(async ({ input }) => {
    const isrcSongs = await prisma.isrcSongs.findMany({
      orderBy: {
        id: 'asc',
      },
    });
    return isrcSongs;
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
