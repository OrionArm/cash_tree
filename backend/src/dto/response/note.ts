import { TreeNode } from '../types';

export type ElementResponse = TreeNode;
export type CacheTreeResponse = TreeNode[];

export type OperationResultResponse = {
  success: boolean;
  message: string;
  element?: TreeNode;
  error?: string;
};

export type LoadToCacheResultResponse = {
  success: boolean;
  message: string;
  error?: string;
};

export type ApplyChangesResponse = {
  success: boolean;
  appliedOperations: number;
  errors: string[];
  message: string;
};
