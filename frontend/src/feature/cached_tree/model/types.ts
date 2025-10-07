export interface UpdateNodePayload {
  id: string;
  value: string;
}

export interface AddChildPayload {
  parentId: string;
  name: string;
}
