export interface TreeNode {
  id: string;
  parentId: string | null;
  value: string;
  isDeleted: boolean;
  children: TreeNode[];
}
