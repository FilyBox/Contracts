import { prisma } from '@documenso/prisma';

import { AppError, AppErrorCode } from '../../errors/app-error';

export type GetTaskByIdOptions = {
  id: number;
  externalId?: string;
  userId: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: Date | null;
  assignees: string[];
  comments: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date;
  teamId?: number;
  projectId?: number;
  parentTaskId?: number | null;
  subtasksId?: number[] | null;
  folderId?: number | null;
};

export const getTaskById = async ({ id, userId, teamId, folderId = null }: GetTaskByIdOptions) => {
  const task = await prisma.task.findFirst({
    where: {
      id,
      ...(teamId
        ? {
            team: {
              id: teamId,
              members: {
                some: {
                  userId,
                },
              },
            },
          }
        : {
            userId,
            teamId: null,
          }),
      ...(folderId ? { folderId } : {}),
    },
    include: {
      // directLink: true,
      // templateDocumentData: true,
      // taskMeta: true,
      // recipients: true,
      // fields: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      // folder: true,
    },
  });

  if (!task) {
    throw new AppError(AppErrorCode.NOT_FOUND, {
      message: 'Task not found',
    });
  }

  return task;
};
