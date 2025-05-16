import { Role } from '@prisma/client';
import { z } from 'zod';

import { prisma } from '@documenso/prisma';

import { authenticatedProcedure, router } from '../trpc';

export type GetArtistByIdOptions = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  teamId?: number;
  avatarImageId?: string | null;
  disabled: boolean;
  event?: string[];
  url: string;
  song?: string[];
};

export const artistRouter = router({
  createArtist: authenticatedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        role: z.nativeEnum(Role).array().optional(),
        event: z.array(z.string()).optional(),
        song: z.array(z.string()).optional(),
        url: z.string().optional(),
        disabled: z.boolean().optional(),
        teamId: z.number().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { teamId, ...data } = input;

      // Verificar permisos si es tarea de equipo
      if (teamId && ctx.teamId !== teamId) {
        throw new Error('No tienes permisos para crear tareas en este equipo');
      }

      return await prisma.artist.create({
        data: {
          ...data,
          name: input.name,
          roles: input.role?.map((role) => role || '') || [],
          event: input.event
            ? {
                connect: input.event.map((eventId) => ({ id: Number(eventId) })),
              }
            : undefined,
          songs: input.song
            ? {
                connect: input.song.map((songId) => ({ id: Number(songId) })),
              }
            : undefined,
          url: input.url,
          disabled: input.disabled,
          createdAt: new Date(),
          updatedAt: new Date(),

          // status: 'PENDING', // Removed as it is not defined in the Prisma schema
          team: teamId ? { connect: { id: teamId } } : { create: undefined },
        },
      });
    }),
  findArtistById: authenticatedProcedure
    .input(z.object({ artistId: z.string() }))
    .query(async ({ input }: { input: { artistId: string } }) => {
      const { artistId } = input;
      return await prisma.artist.findUnique({
        where: { id: Number(artistId) },
        include: {
          team: true,
          event: true,
          songs: true,

          // tags: true, // Removed because 'tags' is not a valid property in 'TaskInclude<DefaultArgs>'
        },
      });
    }),
  findArtists: authenticatedProcedure
    .input(
      z.object({
        teamId: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const { teamId } = input;

      return await prisma.artist.findMany({
        where: {
          teamId: teamId,
        },
        include: {
          team: true,
          event: true,
          songs: true,
        },
      });
    }),

  updateArtist: authenticatedProcedure
    .input(
      z.object({
        ArtistId: z.number(),
        name: z.string().min(1),
        role: z.nativeEnum(Role).array().optional(),
        event: z.array(z.string()).optional(),
        song: z.array(z.string()).optional(),
        url: z.string().optional(),
        disabled: z.boolean().optional(),
        teamId: z.number().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { ArtistId, teamId, ...data } = input;

      // Verificar permisos si es tarea de equipo
      if (teamId && ctx.teamId !== teamId) {
        throw new Error('No tienes permisos para crear tareas en este equipo');
      }

      return await prisma.artist.update({
        where: { id: Number(ArtistId) },
        data: {
          ...data,
          name: input.name,
          roles: input.role?.map((role) => role || '') || [],
          event: input.event
            ? {
                connect: input.event.map((eventId) => ({ id: Number(eventId) })),
              }
            : undefined,
          songs: input.song
            ? {
                connect: input.song.map((songId) => ({ id: Number(songId) })),
              }
            : undefined,
          url: input.url,
          disabled: input.disabled,
          updatedAt: new Date(),
        },
      });
    }),

  deleteArtist: authenticatedProcedure
    .input(z.object({ artistId: z.number() }))
    .mutation(async ({ input }) => {
      const { artistId } = input;

      return await prisma.artist.delete({
        where: { id: Number(artistId) },
      });
    }),
});
