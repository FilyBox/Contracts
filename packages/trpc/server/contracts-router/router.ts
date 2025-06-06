import { ContractStatus, ExpansionPossibility } from '@prisma/client';
import { z } from 'zod';

import { findContracts } from '@documenso/lib/server-only/document/find-contracts';
import { getContractStatus } from '@documenso/lib/server-only/document/get-contract-status';
import { type GetContractsInput } from '@documenso/lib/server-only/document/get-contract-status';
import { prisma } from '@documenso/prisma';
import {
  ExtendedContractStatus,
  ExtendedExpansionPossibility,
} from '@documenso/prisma/types/extended-contracts';

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
        startDate: z.date(),
        endDate: z.date(),
        folderId: z.string().optional(),
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
        folderId,
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
          folderId,
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
            startDate: z.date(),
            endDate: z.date(),
            folderId: z.string().optional(),

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
        status: z.nativeEnum(ExtendedContractStatus).optional(),
        expansion: z.nativeEnum(ExtendedExpansionPossibility).optional(),
        query: z.string().optional(),
        page: z.number().optional(),
        perPage: z.number().optional(),
        period: z.enum(['7d', '14d', '30d']).optional(),
        orderBy: z.enum(['endDate', 'updatedAt']).optional(),
        orderByDirection: z.enum(['asc', 'desc']).optional().default('desc'),
        folderId: z.string().optional(),
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

        status,
        expansion,
        // release,
        folderId,
        orderByColumn,
        orderByDirection,
        period,
        // orderBy = 'createdAt',
      } = input;
      const { user, teamId } = ctx;
      const userId = user.id;
      const getStatOptions: GetContractsInput = {
        user,
        period,
        teamId,
        folderId,
        search: query,
      };
      const [stats] = await Promise.all([getContractStatus(getStatOptions)]);
      const [documents] = await Promise.all([
        findContracts({
          query,
          page,
          perPage,
          userId,
          expansion,
          status,
          folderId,
          teamId,
          period,
          orderBy: orderByColumn
            ? { column: orderByColumn, direction: orderByDirection }
            : undefined,
        }),
      ]);
      return { documents, status: stats };
    }),

  findContractsByDocumentId: authenticatedProcedure
    .input(z.object({ documentId: z.number() }))
    .query(async ({ input }) => {
      const { documentId } = input;
      const contract = await prisma.contract.findFirst({
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
        startDate: z.date(),
        endDate: z.date(),
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

      const olalo = await prisma.contract.update({
        where: { id },
        data,
      });

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

  deleteMultipleContractsByIds: authenticatedProcedure
    .input(z.object({ ids: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      const { ids } = input;
      const deletedContracts = await prisma.contract.deleteMany({
        where: { id: { in: ids } },
      });

      return deletedContracts;
    }),
});
