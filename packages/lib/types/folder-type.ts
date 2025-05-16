import { z } from 'zod';

export const FolderType = {
  DOCUMENT: 'DOCUMENT',
  TEMPLATE: 'TEMPLATE',
  CHAT: 'CHAT',
  TASK: 'TASK',
} as const;

export const ZFolderTypeSchema = z.enum([
  FolderType.DOCUMENT,
  FolderType.TEMPLATE,
  FolderType.CHAT,
]);

// export const ZFolderTypeSchema = z.enum([FolderType.DOCUMENT, FolderType.TEMPLATE]);
export type TFolderType = z.infer<typeof ZFolderTypeSchema>;
