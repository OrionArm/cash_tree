import { Type } from '@sinclair/typebox';

export const TreeNodeSchema = Type.Recursive(
  (This) =>
    Type.Object({
      id: Type.String(),
      parentId: Type.Union([Type.String(), Type.Null()]),
      value: Type.String(),
      isDeleted: Type.Boolean(),
      children: Type.Array(This),
    }),
  { $id: 'TreeNode' },
);

export const OperationResultSchema = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  error: Type.Optional(Type.String()),
  element: Type.Optional(TreeNodeSchema),
});

export const LoadResultSchema = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
});

export const CacheOperationSchema = Type.Object({
  type: Type.Union([
    Type.Literal('create'),
    Type.Literal('update'),
    Type.Literal('delete'),
  ]),
  elementId: Type.String(),
  parentId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  value: Type.Optional(Type.String()),
});

export const OperationsListSchema = Type.Object({
  operations: Type.Array(CacheOperationSchema),
  hasOperations: Type.Boolean(),
});

export const ApplyChangesSchema = Type.Object({
  success: Type.Boolean(),
  appliedOperations: Type.Number(),
  errors: Type.Array(Type.String()),
  message: Type.String(),
  deletedElementIds: Type.Optional(Type.Array(Type.String())),
});
