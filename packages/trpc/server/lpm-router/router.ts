// If you need Prisma types, import them directly from "@prisma/client"
import type { Prisma } from '@prisma/client';
import { z } from 'zod';

import { findLpm } from '@documenso/lib/server-only/document/find-lpm';
import { prisma } from '@documenso/prisma';

import { authenticatedProcedure, router } from '../trpc';

export type GetLpmByIdOptions = {
  id: number;
  productId: string;
  productType: string;
  productTitle: string;
  productVersion?: string;
  productDisplayArtist: string;
  parentLabel?: string;
  label: string;
  originalReleaseDate?: string;
  releaseDate: string;
  upc: string;
  catalog: string;
  productPriceTier?: string;
  productGenre?: string;
  submissionStatus: string;
  productCLine: string;
  productPLine: string;
  preOrderDate?: string;
  exclusives?: string;
  explicitLyrics: string;
  productPlayLink?: string;
  linerNotes?: string;
  primaryMetadataLanguage: string;
  compilation?: string;
  pdfBooklet?: string;
  timedReleaseDate?: string;
  timedReleaseMusicServices?: string;
  lastProcessDate: string;
  importDate: string;
  createdBy: string;
  lastModified: string;
  submittedAt: string;
  submittedBy?: string;
  vevoChannel?: string;
  trackType: string;
  trackId: string;
  trackVolume?: boolean;
  trackNumber: string;
  trackName: string;
  trackVersion?: string;
  trackDisplayArtist: string;
  isrc: string;
  trackPriceTier?: string;
  trackGenre: string;
  audioLanguage: string;
  trackCLine: string;
  trackPLine: string;
  writersComposers: string;
  publishersCollectionSocieties: string;
  withholdMechanicals: string;
  preOrderType?: string;
  instantGratificationDate: string;
  duration: string;
  sampleStartTime: string;
  explicitLyricsTrack: string;
  albumOnly: string;
  lyrics?: string;
  additionalContributorsPerforming?: string;
  additionalContributorsNonPerforming?: string;
  producers?: string;
  continuousMix: string;
  continuouslyMixedIndividualSong: string;
  trackPlayLink: string;
};

export const lpmRouter = router({
  createLpm: authenticatedProcedure
    .input(
      z.object({
        productId: z.string(),
        productType: z.string(),
        productTitle: z.string(),
        productVersion: z.string().optional(),
        productDisplayArtist: z.string(),
        parentLabel: z.string().optional(),
        label: z.string(),
        artists: z
          .array(
            z.object({
              id: z.number(),
              artistName: z.string().nullable(),
            }),
          )
          .optional(),
        originalReleaseDate: z.date().optional(),
        releaseDate: z.date(),
        upc: z.string(),
        catalog: z.string(),
        productPriceTier: z.string().optional(),
        productGenre: z.string(),
        submissionStatus: z.string(),
        productCLine: z.string(),
        productPLine: z.string(),
        preOrderDate: z.date().optional(),
        exclusives: z.string().optional(),
        explicitLyrics: z.string(),
        productPlayLink: z.string().optional(),
        linerNotes: z.string().optional(),
        primaryMetadataLanguage: z.string(),
        compilation: z.string().optional(),
        pdfBooklet: z.string().optional(),
        timedReleaseDate: z.date().optional(),
        timedReleaseMusicServices: z.date().optional(),
        lastProcessDate: z.date(),
        importDate: z.date(),
        createdBy: z.string(),
        lastModified: z.date(),
        submittedAt: z.date(),
        submittedBy: z.string().optional(),
        vevoChannel: z.string().optional(),
        trackType: z.string(),
        trackId: z.string(),
        trackVolume: z.boolean().optional(),
        trackNumber: z.string(),
        trackName: z.string(),
        trackVersion: z.string().optional(),
        trackDisplayArtist: z.string(),
        isrc: z.string(),
        trackPriceTier: z.string().optional(),
        trackGenre: z.string(),
        audioLanguage: z.string(),
        trackCLine: z.string(),
        trackPLine: z.string(),
        writersComposers: z.string(),
        publishersCollectionSocieties: z.string(),
        withholdMechanicals: z.string(),
        preOrderType: z.string().optional(),
        instantGratificationDate: z.date().optional(),
        duration: z.string(),
        sampleStartTime: z.string(),
        explicitLyricsTrack: z.string(),
        albumOnly: z.string(),
        lyrics: z.string().optional(),
        additionalContributorsPerforming: z.string().optional(),
        additionalContributorsNonPerforming: z.string().optional(),
        producers: z.string().optional(),
        continuousMix: z.string(),
        continuouslyMixedIndividualSong: z.string(),
        trackPlayLink: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { user, teamId } = ctx;
      const userId = user.id;
      const { artists, ...data } = input;

      console.log('artists to create:', artists);
      const allData = { ...data, userId, ...(teamId ? { teamId } : {}) };

      return await prisma.lpm.create({
        // data: {
        //   ...cleanedInput,
        //   userId,
        //   ...(teamId ? { teamId } : {}), // Add teamId if it exists
        // } as unknown as Prisma.lpmCreateInput,
        data: {
          ...data,
          user: {
            connect: { id: userId },
          },
          ...(teamId ? { team: { connect: { id: teamId } } } : {}),
          lpmArtists: {
            create:
              artists?.map((artist) => ({
                artistName: artist.artistName?.trim() || '',
                user: {
                  connect: { id: userId },
                },
                ...(teamId ? { team: { connect: { id: teamId } } } : {}),
                artist: {
                  connectOrCreate: {
                    where: { name: artist.artistName?.trim() || '' },
                    create: {
                      name: artist.artistName?.trim() || '',
                      user: {
                        connect: { id: userId },
                      },
                      ...(teamId ? { team: { connect: { id: teamId } } } : {}),
                    },
                  },
                },
              })) || [],
          },
        },
      });
    }),

  createManyMusic: authenticatedProcedure
    .input(
      z.object({
        music: z.array(
          z.object({
            productId: z.string(),
            productType: z.string(),
            productTitle: z.string(),
            productVersion: z.string().optional(),
            productDisplayArtist: z.string(),
            parentLabel: z.string().optional(),
            label: z.string(),
            originalReleaseDate: z.date().optional(),
            releaseDate: z.date(),
            upc: z.string(),
            catalog: z.string(),
            productPriceTier: z.string().optional(),
            productGenre: z.string(),
            submissionStatus: z.string(),
            productCLine: z.string(),
            productPLine: z.string(),
            preOrderDate: z.date().optional(),
            exclusives: z.string().optional(),
            explicitLyrics: z.string(),
            productPlayLink: z.string().optional(),
            linerNotes: z.string().optional(),
            primaryMetadataLanguage: z.string(),
            compilation: z.string().optional(),
            pdfBooklet: z.string().optional(),
            timedReleaseDate: z.date().optional(),
            timedReleaseMusicServices: z.date().optional(),
            lastProcessDate: z.date(),
            importDate: z.date(),
            createdBy: z.string(),
            lastModified: z.date(),
            submittedAt: z.date(),
            submittedBy: z.string().optional(),
            vevoChannel: z.string().optional(),
            trackType: z.string(),
            trackId: z.string(),
            trackVolume: z.boolean().optional(),
            trackNumber: z.string(),
            trackName: z.string(),
            trackVersion: z.string().optional(),
            trackDisplayArtist: z.string(),
            isrc: z.string(),
            trackPriceTier: z.string().optional(),
            trackGenre: z.string(),
            audioLanguage: z.string(),
            trackCLine: z.string(),
            trackPLine: z.string(),
            writersComposers: z.string(),
            publishersCollectionSocieties: z.string(),
            withholdMechanicals: z.string(),
            preOrderType: z.string().optional(),
            instantGratificationDate: z.date(),
            duration: z.string(),
            sampleStartTime: z.string(),
            explicitLyricsTrack: z.string(),
            albumOnly: z.string(),
            lyrics: z.string().optional(),
            additionalContributorsPerforming: z.string().optional(),
            additionalContributorsNonPerforming: z.string().optional(),
            producers: z.string().optional(),
            continuousMix: z.string(),
            continuouslyMixedIndividualSong: z.string(),
            trackPlayLink: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { music } = input;
      const { user, teamId } = ctx;
      const userId = user.id;

      // Process in batches to avoid timeout
      const BATCH_SIZE = 30; // Adjust based on your needs
      const allResults = [];

      for (let i = 0; i < music.length; i += BATCH_SIZE) {
        const batch = music.slice(i, i + BATCH_SIZE);

        const batchResults = await prisma.$transaction(
          async (prismaClient) => {
            const createdRecords = [];
            for (const file of batch) {
              console.log('Creating LPM record for:', file.productTitle);
              const result = await prismaClient.lpm.create({
                data: {
                  ...file,
                  user: {
                    connect: { id: userId },
                  },
                  ...(teamId ? { team: { connect: { id: teamId } } } : {}),
                  lpmArtists: {
                    create: file.trackDisplayArtist.split(',').map((artistName) => ({
                      artistName: artistName.trim(),
                      user: {
                        connect: { id: userId },
                      },
                      ...(teamId ? { team: { connect: { id: teamId } } } : {}),
                      artist: {
                        connectOrCreate: {
                          where: { name: artistName.trim() },
                          create: {
                            name: artistName.trim(),
                            user: {
                              connect: { id: userId },
                            },
                            ...(teamId ? { team: { connect: { id: teamId } } } : {}),
                          },
                        },
                      },
                    })),
                  },
                },
              });
              createdRecords.push(result);
            }
            return createdRecords;
          },
          {
            maxWait: 10000, // 10 seconds
            timeout: 30000, // 30 seconds
          },
        );

        allResults.push(...batchResults);
      }
      return allResults.length;
    }),

  findLpmUniqueArtists: authenticatedProcedure.query(async ({ ctx }) => {
    const { user, teamId } = ctx;
    const userId = user.id;

    const uniqueArtists = await prisma.lpmProductDisplayArtists.findMany({
      where: {
        ...(teamId ? { teamId } : { teamId: null, userId }),
      },
      distinct: ['artistName'],
      orderBy: {
        artistName: 'asc',
      },
    });

    return uniqueArtists;
  }),

  findLpmById: authenticatedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const { id } = input;
      return await prisma.lpm.findUnique({
        where: { id },
        // include: {

        // },
      });
    }),
  findLpm: authenticatedProcedure
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
        artistIds: z.array(z.number()).optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const {
        query,
        page,
        perPage,
        // release,
        orderByColumn,
        artistIds,
        orderByDirection,
        period,
        // orderBy = 'createdAt',
      } = input;

      const { user, teamId } = ctx;
      const userId = user.id;

      const [documents] = await Promise.all([
        findLpm({
          query,

          artistIds,
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
  updateLpmById: authenticatedProcedure
    .input(
      z.object({
        id: z.number(),
        productId: z.string(),
        productType: z.string(),
        productTitle: z.string(),
        productVersion: z.string().optional(),
        productDisplayArtist: z.string(),
        parentLabel: z.string().optional(),
        label: z.string(),
        artists: z
          .array(
            z.object({
              id: z.number(),
              artistName: z.string().nullable(),
            }),
          )
          .optional(),
        originalReleaseDate: z.date().optional(),
        releaseDate: z.date(),
        upc: z.string(),
        catalog: z.string(),
        productPriceTier: z.string().optional(),
        productGenre: z.string(),
        submissionStatus: z.string(),
        productCLine: z.string(),
        productPLine: z.string(),
        preOrderDate: z.date().optional(),
        exclusives: z.string().optional(),
        explicitLyrics: z.string(),
        productPlayLink: z.string().optional(),
        linerNotes: z.string().optional(),
        primaryMetadataLanguage: z.string(),
        compilation: z.string().optional(),
        pdfBooklet: z.string().optional(),
        timedReleaseDate: z.date().optional(),
        timedReleaseMusicServices: z.date().optional(),
        lastProcessDate: z.date(),
        importDate: z.date(),
        createdBy: z.string(),
        lastModified: z.date(),
        submittedAt: z.date(),
        submittedBy: z.string().optional(),
        vevoChannel: z.string().optional(),
        trackType: z.string(),
        trackId: z.string(),
        trackVolume: z.boolean().optional(),
        trackNumber: z.string(),
        trackName: z.string(),
        trackVersion: z.string().optional(),
        trackDisplayArtist: z.string(),
        isrc: z.string(),
        trackPriceTier: z.string().optional(),
        trackGenre: z.string(),
        audioLanguage: z.string(),
        trackCLine: z.string(),
        trackPLine: z.string(),
        writersComposers: z.string(),
        publishersCollectionSocieties: z.string(),
        withholdMechanicals: z.string(),
        preOrderType: z.string().optional(),
        instantGratificationDate: z.date().optional(),
        duration: z.string(),
        sampleStartTime: z.string(),
        explicitLyricsTrack: z.string(),
        albumOnly: z.string(),
        lyrics: z.string().optional(),
        additionalContributorsPerforming: z.string().optional(),
        additionalContributorsNonPerforming: z.string().optional(),
        producers: z.string().optional(),
        continuousMix: z.string(),
        continuouslyMixedIndividualSong: z.string(),
        trackPlayLink: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, artists, ...data } = input;
      const { user, teamId } = ctx;
      const userId = user.id;

      console.log('Updating LPM with ID:', id);
      console.log('updating artists:', artists);
      const pepe = await prisma.lpm.update({
        where: { id },
        data: {
          ...data,
          lpmArtists:
            artists && artists.length > 0
              ? {
                  deleteMany: {}, // remove existing artists
                  create: artists.map((artist) => ({
                    artistName: artist.artistName?.trim() || '',
                    user: {
                      connect: { id: userId },
                    },
                    ...(teamId ? { team: { connect: { id: teamId } } } : {}),
                    artist: {
                      connectOrCreate: {
                        where: { name: artist.artistName?.trim() || '' },
                        create: {
                          name: artist.artistName?.trim() || '',
                          user: {
                            connect: { id: userId },
                          },
                          ...(teamId ? { team: { connect: { id: teamId } } } : {}),
                        },
                      },
                    },
                  })),
                }
              : {
                  deleteMany: {}, // remove existing artists if no new artists provided
                },
        },
        include: {
          lpmArtists: true,
        },
      });

      console.log('pepe', pepe);

      return pepe;
    }),
  deleteLpmById: authenticatedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const { id } = input;
      return await prisma.lpm.delete({
        where: { id },
      });
    }),
});
