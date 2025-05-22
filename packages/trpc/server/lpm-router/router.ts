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
        originalReleaseDate: z.string().optional(),
        releaseDate: z.string(),
        upc: z.string(),
        catalog: z.string(),
        productPriceTier: z.string().optional(),
        productGenre: z.string().optional(),
        submissionStatus: z.string(),
        productCLine: z.string(),
        productPLine: z.string(),
        preOrderDate: z.string().optional(),
        exclusives: z.string().optional(),
        explicitLyrics: z.string(),
        productPlayLink: z.string().optional(),
        linerNotes: z.string().optional(),
        primaryMetadataLanguage: z.string(),
        compilation: z.string().optional(),
        pdfBooklet: z.string().optional(),
        timedReleaseDate: z.string().optional(),
        timedReleaseMusicServices: z.string().optional(),
        lastProcessDate: z.string(),
        importDate: z.string(),
        createdBy: z.string(),
        lastModified: z.string(),
        submittedAt: z.string(),
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
        instantGratificationDate: z.string(),
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
      // Remove undefined properties to satisfy Prisma's strict typing
      const cleanedInput = Object.fromEntries(
        Object.entries(input).filter(([_, v]) => v !== undefined),
      );

      return await prisma.lpm.create({
        data: {
          ...cleanedInput,
          userId,
          ...(teamId ? { teamId } : {}), // Add teamId if it exists
        } as unknown as Prisma.lpmCreateInput,
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
            originalReleaseDate: z.string().optional(),
            releaseDate: z.string(),
            upc: z.string(),
            catalog: z.string(),
            productPriceTier: z.string().optional(),
            productGenre: z.string(),
            submissionStatus: z.string(),
            productCLine: z.string(),
            productPLine: z.string(),
            preOrderDate: z.string().optional(),
            exclusives: z.string().optional(),
            explicitLyrics: z.string(),
            productPlayLink: z.string().optional(),
            linerNotes: z.string().optional(),
            primaryMetadataLanguage: z.string(),
            compilation: z.string().optional(),
            pdfBooklet: z.string().optional(),
            timedReleaseDate: z.string().optional(),
            timedReleaseMusicServices: z.string().optional(),
            lastProcessDate: z.string(),
            importDate: z.string(),
            createdBy: z.string(),
            lastModified: z.string(),
            submittedAt: z.string(),
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
            instantGratificationDate: z.string(),
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
      const musicWithUserInfo = music.map((item) => ({
        ...item,
        userId,
        ...(teamId ? { teamId } : {}),
      }));
      const createdMusic = await prisma.lpm.createMany({
        data: musicWithUserInfo,
      });
      return createdMusic;
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
        findLpm({
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
        originalReleaseDate: z.string().optional(),
        releaseDate: z.string(),
        upc: z.string(),
        catalog: z.string(),
        productPriceTier: z.string().optional(),
        productGenre: z.string().optional(),
        submissionStatus: z.string(),
        productCLine: z.string(),
        productPLine: z.string(),
        preOrderDate: z.string().optional(),
        exclusives: z.string().optional(),
        explicitLyrics: z.string(),
        productPlayLink: z.string().optional(),
        linerNotes: z.string().optional(),
        primaryMetadataLanguage: z.string(),
        compilation: z.string().optional(),
        pdfBooklet: z.string().optional(),
        timedReleaseDate: z.string().optional(),
        timedReleaseMusicServices: z.string().optional(),
        lastProcessDate: z.string(),
        importDate: z.string(),
        createdBy: z.string(),
        lastModified: z.string(),
        submittedAt: z.string(),
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
        instantGratificationDate: z.string(),
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
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      console.log('Updating LPM with ID:', id, 'and data:', data);

      const pepe = await prisma.lpm.update({
        where: { id },
        data,
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
