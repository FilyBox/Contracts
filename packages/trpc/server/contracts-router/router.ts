import { ContractStatus, ExpansionPossibility, Release } from '@prisma/client';
import { z } from 'zod';

import { findContracts } from '@documenso/lib/server-only/document/find-contracts';
import { prisma } from '@documenso/prisma';

import { authenticatedProcedure, router } from '../trpc';

export type GetContractsByIdOptions = {
  id: number;
  trackName?: string;
  artist?: string;
  duration?: string;
  title?: string;
  license?: string;
  date?: string;
};

export const contractsRouter = router({
  createContracts: authenticatedProcedure
    .input(
      z.object({
        title: z.string(),
        fileName: z.string().optional(),
        artists: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        isPossibleToExpand: z
          .nativeEnum(ExpansionPossibility)
          .optional()
          .default('NO_ESPECIFICADO'),
        possibleExtensionTime: z.string().optional(),
        status: z.nativeEnum(ContractStatus).optional().default('NO_ESPECIFICADO'),
        documentId: z.number(),
        summary: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { user, teamId } = ctx;
      const userId = user.id;
      const {
        title,
        fileName,
        artists,
        startDate,
        endDate,
        isPossibleToExpand,
        possibleExtensionTime,
        status,
        documentId,
        summary,
      } = input;

      const contract = await prisma.contract.create({
        data: {
          title,
          fileName,
          artists,
          startDate,
          endDate,
          isPossibleToExpand,
          possibleExtensionTime,
          status,
          documentId,
          summary,
          userId,
          ...(teamId ? { teamId } : {}),
        },
      });
      return contract;
    }),

  createManyContracts: authenticatedProcedure
    .input(
      z.object({
        Contracts: z.array(
          z.object({
            title: z.string(),
            fileName: z.string().optional(),
            artists: z.string(),
            startDate: z.string(),
            endDate: z.string(),
            isPossibleToExpand: z
              .nativeEnum(ExpansionPossibility)
              .optional()
              .default('NO_ESPECIFICADO'),
            possibleExtensionTime: z.string().optional(),
            status: z.nativeEnum(ContractStatus).optional().default('NO_ESPECIFICADO'),
            documentId: z.number(),
            summary: z.string().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { Contracts } = input;
      const { user, teamId } = ctx;
      const userId = user.id;
      const createdContracts = await prisma.contract.createMany({
        data: Contracts,
      });
      return createdContracts;
    }),

  findContracts: authenticatedProcedure
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
          .enum([
            'teamId',
            'userId',
            'createdAt',
            'updatedAt',
            'artists',
            'status',
            'title',
            'fileName',
            'startDate',
            'endDate',
            'isPossibleToExpand',
            'possibleExtensionTime',
            'documentId',
            'summary',
          ])
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
        findContracts({
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

  findContractsByDocumentId: authenticatedProcedure
    .input(z.object({ documentId: z.number() }))
    .query(async ({ input }) => {
      const { documentId } = input;
      const contract = await prisma.contract.findUnique({
        where: { documentId },
      });
      return contract;
    }),

  updateContractsById: authenticatedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string(),
        fileName: z.string().optional(),
        artists: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        isPossibleToExpand: z
          .nativeEnum(ExpansionPossibility)
          .optional()
          .default('NO_ESPECIFICADO'),
        possibleExtensionTime: z.string().optional(),
        status: z.nativeEnum(ContractStatus).optional().default('NO_ESPECIFICADO'),
        documentId: z.number(),
        summary: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      console.log('updating isrc song', id, 'and data:', data);

      const olalo = await prisma.contract.update({
        where: { id },
        data,
      });
      console.log('The cable si jala bato', olalo);

      return olalo;
    }),

  deleteContractsById: authenticatedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const { id } = input;
      const deletedIsrcSong = await prisma.contract.delete({
        where: { id },
      });

      return deletedIsrcSong;
    }),
});
