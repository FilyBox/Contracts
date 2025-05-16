import type { Prisma } from '@prisma/client';
import { z } from 'zod';

import { prisma } from '@documenso/prisma';

import { authenticatedProcedure, router } from '../trpc';

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
    .mutation(async ({ input }) => {
      // Remove undefined properties to satisfy Prisma's strict typing
      const cleanedInput = Object.fromEntries(
        Object.entries(input).filter(([_, v]) => v !== undefined),
      );
      return await prisma.lpm.create({
        data: cleanedInput as unknown as Prisma.LpmCreateInput,
      });
    }),
  findLpmById: authenticatedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const { id } = input;
      return await prisma.lpm.findUnique({
        where: { id },
      });
    }),

  //En esta función se buscan todos los lpm que coincidan con los parámetros de búsqueda
  findLpm: authenticatedProcedure.query(async () => {
    return await prisma.lpm.findMany({});
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
      return await prisma.lpm.update({
        where: { id },
        data,
      });
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
