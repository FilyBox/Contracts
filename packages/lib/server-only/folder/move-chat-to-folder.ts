import { TeamMemberRole } from '@prisma/client';
import { match } from 'ts-pattern';

import { AppError, AppErrorCode } from '@documenso/lib/errors/app-error';
import { DocumentVisibility } from '@documenso/lib/types/document-visibility';
import { FolderType } from '@documenso/lib/types/folder-type';
import type { ApiRequestMetadata } from '@documenso/lib/universal/extract-request-metadata';
import { prisma } from '@documenso/prisma';

export interface MoveChatToFolderOptions {
  userId: number;
  teamId?: number;
  documentId: number;
  folderId?: string | null;
  requestMetadata?: ApiRequestMetadata;
}

export const moveChatToFolder = async ({
  userId,
  teamId,
  documentId,
  folderId,
}: MoveChatToFolderOptions) => {
  let teamMemberRole = null;

  if (teamId !== undefined) {
    try {
      const team = await prisma.team.findFirstOrThrow({
        where: {
          id: teamId,
          members: {
            some: {
              userId,
            },
          },
        },
        include: {
          members: {
            where: {
              userId,
            },
            select: {
              role: true,
            },
          },
        },
      });

      teamMemberRole = team.members[0].role;
    } catch (error) {
      console.error('Error finding team:', error);
      throw new AppError(AppErrorCode.NOT_FOUND, {
        message: 'Team not found',
      });
    }
  }

  const visibilityFilters = match(teamMemberRole)
    .with(TeamMemberRole.ADMIN, () => ({
      visibility: {
        in: [
          DocumentVisibility.EVERYONE,
          DocumentVisibility.MANAGER_AND_ABOVE,
          DocumentVisibility.ADMIN,
        ],
      },
    }))
    .with(TeamMemberRole.MANAGER, () => ({
      visibility: {
        in: [DocumentVisibility.EVERYONE, DocumentVisibility.MANAGER_AND_ABOVE],
      },
    }))
    .otherwise(() => ({ visibility: DocumentVisibility.EVERYONE }));
  const documentWhereClause = {
    id: documentId,
    ...(teamId
      ? {
          OR: [
            { teamId, ...visibilityFilters },
            { userId, teamId },
          ],
        }
      : { userId, teamId: null }),
  };

  const document = await prisma.document.findFirst({
    where: documentWhereClause,
  });
  if (!document) {
    throw new AppError(AppErrorCode.NOT_FOUND, {
      message: 'Document not found',
    });
  }

  if (folderId) {
    const folderWhereClause = {
      id: folderId,
      type: { equals: FolderType.CHAT },
      ...(teamId
        ? {
            OR: [
              { teamId, ...visibilityFilters },
              { userId, teamId },
            ],
          }
        : { userId, teamId: null }),
    };
    const folder = await prisma.folder.findFirst({
      where: folderWhereClause,
    });
    console.log('folder', folder);

    if (!folder) {
      throw new AppError(AppErrorCode.NOT_FOUND, {
        message: 'Folder not found',
      });
    }
  }

  return await prisma.document.update({
    where: {
      id: documentId,
    },
    data: {
      folderId,
    },
  });
};
