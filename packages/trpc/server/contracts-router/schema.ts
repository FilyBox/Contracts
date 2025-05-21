import { z } from 'zod';

import { ZContractsSchema } from '@documenso/lib/types/contracts';
import { ZFindResultResponse, ZFindSearchParamsSchema } from '@documenso/lib/types/search-params';

// import { ExtendedIsrcSongs, ExtendedIsrcSongsType } from '@documenso/prisma/types/extended-IsrcSongs';

/**
 * Required for empty responses since we currently can't 201 requests for our openapi setup.
 *
 * Without this it will throw an error in Speakeasy SDK when it tries to parse an empty response.
 */
export const ZSuccessResponseSchema = z.object({
  success: z.literal(true),
});

export const ZGenericSuccessResponse = {
  success: true,
} satisfies z.infer<typeof ZSuccessResponseSchema>;

export const ZFindContractsRequestSchema = ZFindSearchParamsSchema.extend({
  orderByColumn: z.enum(['createdAt']).optional(),
  orderByDirection: z.enum(['asc', 'desc']).describe('').default('desc'),
});

export const ZFindContractsInternalRequestSchema = ZFindContractsRequestSchema.extend({
  period: z.enum(['7d', '14d', '30d']).optional(),
});

export const ZFindContractsResponseSchema = ZFindResultResponse.extend({
  data: ZContractsSchema.array(),
});

export type TFindContractsRequest = z.infer<typeof ZFindContractsRequestSchema>;
export type TFindContractsInternalRequest = z.infer<typeof ZFindContractsInternalRequestSchema>;
export type TFindContractsResponse = z.infer<typeof ZFindContractsResponseSchema>;

export const ZFindContractsInternalResponseSchema = ZFindResultResponse.extend({
  data: ZContractsSchema.array(),
});

export type TFindContractsInternalResponse = z.infer<typeof ZFindContractsInternalResponseSchema>;
