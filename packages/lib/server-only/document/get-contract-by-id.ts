import type { Prisma } from '@prisma/client';
import { TeamMemberRole } from '@prisma/client';
import { match } from 'ts-pattern';

import { prisma } from '@documenso/prisma';

import { AppError, AppErrorCode } from '../../errors/app-error';
import { DocumentVisibility } from '../../types/document-visibility';
import { getTeamById } from '../team/get-team';

export type GetDocumentByIdOptions = {
  documentId: number;
  userId: number;
  teamId?: number;
};

export const getContractById = async ({ documentId, userId, teamId }: GetDocumentByIdOptions) => {
  console.log('documentId', documentId);
  const documentWhereInput = await getDocumentWhereInput({
    documentId: documentId,
    userId,
    teamId,
  });

  const document = await prisma.contract.findFirst({
    where: {
      documentId: documentId,
    },
  });

  if (!document) {
    throw new AppError(AppErrorCode.NOT_FOUND, {
      message: 'Contract could not be found',
    });
  }

  return document;
};

export type GetDocumentWhereInputOptions = {
  documentId: number;
  userId: number;
  teamId?: number;

  /**
   * Whether to return a filter that allows access to both the user and team documents.
   * This only applies if `teamId` is passed in.
   *
   * If true, and `teamId` is passed in, the filter will allow both team and user documents.
   * If false, and `teamId` is passed in, the filter will only allow team documents.
   *
   * Defaults to false.
   */
  overlapUserTeamScope?: boolean;
};

/**
 * Generate the where input for a given Prisma document query.
 *
 * This will return a query that allows a user to get a document if they have valid access to it.
 */
export const getDocumentWhereInput = async ({
  documentId,
  userId,
  teamId,
  overlapUserTeamScope = false,
}: GetDocumentWhereInputOptions) => {
  const documentWhereInput: Prisma.ContractWhereInput = {
    documentId: documentId,
  };

  return {
    ...documentWhereInput,
  };
};
