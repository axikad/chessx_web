import { Role } from '../types';

export const mockRoles: Role[] = [
  {
    id: 'role_01',
    name: 'Super Admin',
    description: 'Full unconstrained platform authority with system configuration, billing, and credential management.',
    userCount: 2,
    isSystem: true,
    permissions: [
      { module: 'Users', view: true, create: true, edit: true, delete: true },
      { module: 'Products', view: true, create: true, edit: true, delete: true },
      { module: 'Orders', view: true, create: true, edit: true, delete: true },
      { module: 'Customers', view: true, create: true, edit: true, delete: true },
      { module: 'Reports', view: true, create: true, edit: true, delete: true },
      { module: 'Settings', view: true, create: true, edit: true, delete: true },
    ],
  },
  {
    id: 'role_02',
    name: 'Administrator',
    description: 'Elevated permissions to manage users, content catalog, pricing, customer disputes, and reports.',
    userCount: 4,
    isSystem: true,
    permissions: [
      { module: 'Users', view: true, create: true, edit: true, delete: false },
      { module: 'Products', view: true, create: true, edit: true, delete: true },
      { module: 'Orders', view: true, create: true, edit: true, delete: true },
      { module: 'Customers', view: true, create: true, edit: true, delete: false },
      { module: 'Reports', view: true, create: true, edit: false, delete: false },
      { module: 'Settings', view: true, create: false, edit: true, delete: false },
    ],
  },
  {
    id: 'role_03',
    name: 'Store Manager',
    description: 'Operational team lead in charge of inventory updates, order fulfillment, and promotions.',
    userCount: 7,
    isSystem: false,
    permissions: [
      { module: 'Users', view: true, create: false, edit: false, delete: false },
      { module: 'Products', view: true, create: true, edit: true, delete: false },
      { module: 'Orders', view: true, create: true, edit: true, delete: false },
      { module: 'Customers', view: true, create: false, edit: true, delete: false },
      { module: 'Reports', view: true, create: false, edit: false, delete: false },
      { module: 'Settings', view: false, create: false, edit: false, delete: false },
    ],
  },
  {
    id: 'role_04',
    name: 'Content Editor',
    description: 'Copywriters and catalog specialists responsible for product descriptions and media gallery.',
    userCount: 5,
    isSystem: false,
    permissions: [
      { module: 'Users', view: false, create: false, edit: false, delete: false },
      { module: 'Products', view: true, create: true, edit: true, delete: false },
      { module: 'Orders', view: false, create: false, edit: false, delete: false },
      { module: 'Customers', view: false, create: false, edit: false, delete: false },
      { module: 'Reports', view: false, create: false, edit: false, delete: false },
      { module: 'Settings', view: false, create: false, edit: false, delete: false },
    ],
  },
  {
    id: 'role_05',
    name: 'Support Agent',
    description: 'Frontline support personnel answering customer tickets, checking order status, and customer notes.',
    userCount: 12,
    isSystem: false,
    permissions: [
      { module: 'Users', view: false, create: false, edit: false, delete: false },
      { module: 'Products', view: true, create: false, edit: false, delete: false },
      { module: 'Orders', view: true, create: false, edit: true, delete: false },
      { module: 'Customers', view: true, create: false, edit: true, delete: false },
      { module: 'Reports', view: false, create: false, edit: false, delete: false },
      { module: 'Settings', view: false, create: false, edit: false, delete: false },
    ],
  }
];
