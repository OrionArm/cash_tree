import type { Static } from '@sinclair/typebox';
import {
  TreeNodeSchema,
  OperationResultSchema,
  LoadResultSchema,
  CacheOperationSchema,
  OperationsListSchema,
  ApplyChangesSchema,
} from '@backend/dto/response/cache.schemas';

export type TreeNode = Static<typeof TreeNodeSchema>;
export type OperationResult = Static<typeof OperationResultSchema>;
export type LoadResult = Static<typeof LoadResultSchema>;
export type CacheOperation = Static<typeof CacheOperationSchema>;
export type OperationsList = Static<typeof OperationsListSchema>;
export type ApplyChangesResponse = Static<typeof ApplyChangesSchema>;
