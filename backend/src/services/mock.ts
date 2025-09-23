import type { TreeNode } from '../dto/types';

// const elements = [
//   {
//     id: 'root',
//     parentId: null,
//     value: 'Root Element',
//     isDeleted: false,
//     children: [
//       {
//         id: 'A1',
//         parentId: 'root',
//         value: '1 Item 1',
//         isDeleted: false,
//         children: [
//           {
//             id: 'A2_1',
//             parentId: 'A1',
//             value: '2 Item 1',
//             isDeleted: false,
//             children: [
//               {
//                 id: 'A3',
//                 parentId: 'A2_1',
//                 value: '3 Item 1',
//                 isDeleted: false,
//                 children: [
//                   {
//                     id: 'A4',
//                     parentId: 'A3',
//                     value: '4 Item 1',
//                     isDeleted: false,
//                     children: [
//                       {
//                         id: 'A5',
//                         parentId: 'A4',
//                         value: '4 Item 2',
//                         isDeleted: false,
//                         children: [],
//                       },
//                     ],
//                   },
//                 ],
//               },
//             ],
//           },
//           {
//             id: 'A2_2',
//             parentId: 'A1',
//             value: '2 Item 2',
//             isDeleted: false,
//             children: [],
//           },
//         ],
//       },
//       {
//         id: 'B1',
//         parentId: 'root',
//         value: '1 Item 2',
//         isDeleted: false,
//         children: [
//           {
//             id: 'B2',
//             parentId: 'B1',
//             value: '2 Item 1',
//             isDeleted: false,
//             children: [
//               {
//                 id: 'B3',
//                 parentId: 'B2',
//                 value: '3 Item 1',
//                 isDeleted: false,
//                 children: [],
//               },
//             ],
//           },
//         ],
//       },
//     ],
//   },
// ];

export const elementsList: TreeNode[] = [
  {
    id: 'root',
    parentId: null,
    value: 'Root Element',
    isDeleted: false,
    children: [],
  },
  {
    id: 'A1',
    parentId: 'root',
    value: 'A1',
    isDeleted: false,
    children: [],
  },
  {
    id: 'A2_1',
    parentId: 'A1',
    value: 'A2_1',
    isDeleted: false,
    children: [],
  },
  {
    id: 'A3',
    parentId: 'A2_1',
    value: 'A3',
    isDeleted: false,
    children: [],
  },
  {
    id: 'A4',
    parentId: 'A3',
    value: 'A4',
    isDeleted: false,
    children: [],
  },
  {
    id: 'A5',
    parentId: 'A4',
    value: 'A5',
    isDeleted: false,
    children: [],
  },
  {
    id: 'A2_2',
    parentId: 'A1',
    value: 'A2_2',
    isDeleted: false,
    children: [],
  },
  {
    id: 'B1',
    parentId: 'root',
    value: 'B1',
    isDeleted: false,
    children: [],
  },
  {
    id: 'B2',
    parentId: 'B2',
    value: '2 Item 1',
    isDeleted: false,
    children: [],
  },
  {
    id: 'B3',
    parentId: 'B3',
    value: '3 Item 1',
    isDeleted: false,
    children: [],
  },
];
