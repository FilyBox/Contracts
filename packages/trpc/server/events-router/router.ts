import { z } from 'zod';

import { prisma } from '@documenso/prisma';

import { authenticatedProcedure, router } from '../trpc';

export type GetEventByIdOptions = {
  id: number;
  name: string;
  description?: string;
  image?: string;
  teamId?: number;
  venue?: string;
  artists: string[];
  beginning: Date;
  end: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
};

export const eventRouter = router({
  createEvent: authenticatedProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        image: z.string().optional(),
        teamId: z.number().optional(),
        venue: z.string().optional(),
        artists: z.array(z.string()).optional(),
        beginning: z.date().optional(),
        end: z.date().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      if (!input.name) {
        throw new Error('El nombre del evento es obligatorio');
      }

      try {
        return await prisma.event.create({
          data: {
            name: input.name,
            description: input.description,
            image: input.image,
            teamId: input.teamId,
            venue: input.venue,
            artists: input.artists
              ? {
                  connect: input.artists.map((artistId) => ({ id: Number(artistId) })),
                }
              : undefined,
            beginning: input.beginning ?? new Date(),
            end: input.end ?? new Date(),
          },
        });
      } catch (error) {
        console.error('Error creating event:', error);
        throw new Error('Error creating event');
      }
    }),
});
