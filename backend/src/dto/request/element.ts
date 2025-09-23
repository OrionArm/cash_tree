export type LoadElementRequest = {
  elementId: string;
};
export type DeleteElementRequest = LoadElementRequest;
export type GetElementRequest = LoadElementRequest;

export type CreateElementRequest = {
  parentId: string | null;
  value: string;
};

export type UpdateElementRequest = LoadElementRequest & {
  value: string;
};
