import { Type, type Static } from '@sinclair/typebox';

export const CreateElementSchema = Type.Object({
  parentId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  value: Type.String({ minLength: 1 }),
});

export const UpdateElementSchema = Type.Object({
  elementId: Type.String({ minLength: 1 }),
  value: Type.String({ minLength: 1 }),
});

export const DeleteElementSchema = Type.Object({
  elementId: Type.String({ minLength: 1 }),
});

export const LoadElementSchema = Type.Object({
  elementId: Type.String({ minLength: 1 }),
});

export type CreateElementType = Static<typeof CreateElementSchema>;
export type UpdateElementType = Static<typeof UpdateElementSchema>;
export type DeleteElementType = Static<typeof DeleteElementSchema>;
export type LoadElementType = Static<typeof LoadElementSchema>;
