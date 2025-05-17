import { z } from 'zod';

import { prisma } from '@documenso/prisma';
import { songRoles } from '@documenso/prisma/generated/types';

// Update the import path if the trpc module is located elsewhere, for example:
import { authenticatedProcedure, router } from '../trpc';

// Or, if the file does not exist, create 'trpc.ts' in the correct directory with the required exports.

export type GetWriterByIdOptions = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  teamId?: number;
  avatarImageId?: string | null;
  disabled: boolean;
  // event?: string[];
  url: string;
  song?: string[];
};

export const writerRouter = router({
  createWriter: authenticatedProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        role: z.nativeEnum(songRoles).array().optional(),
        // event: z.array(z.string()).optional(),
        song: z.array(z.string()).optional(),
        url: z.string().optional(),
        createdAt: z.date().optional(),
        updatedAt: z.date().optional(),
        disabled: z.boolean().optional(),
        teamId: z.number().optional(),
        avatarImageId: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      if (!input.name) {
        throw new Error('El nombre del escritor es obligatorio');
      }

      try {
        return await prisma.writers.create({
          data: {
            name: input.name,
            songroles: input.role ?? [],
            // event: input.event
            //   ? {
            //       connect: input.event.map((eventId) => ({ id: Number(eventId) })),
            //     }
            //   : undefined,
            // songs: input.song
            //   ? {
            //       connect: input.song.map((songId) => ({ id: Number(songId) })),
            //     }
            //   : undefined,
            url: input.url,
            disabled: input.disabled ?? false,
            createdAt: input.createdAt ?? new Date(),
            updatedAt: input.updatedAt ?? new Date(),
            teamId: input.teamId,
            avatarImageId: input.avatarImageId,
          },
        });
      } catch (error) {
        console.error('Error creating writer:', error);
        throw new Error('Error creating writer');
      }
    }),
});
