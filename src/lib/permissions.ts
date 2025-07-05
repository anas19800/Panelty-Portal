import type { User } from './mock-data';

export const ROLES = {
    BRANCH_MANAGER: 'branch_manager',
    REGIONAL_MANAGER: 'regional_manager',
    QUALITY_OFFICER: 'quality_officer',
    SENIOR_MANAGEMENT: 'senior_management',
    SYSTEM_ADMIN: 'system_admin',
} as const;

export const PERMISSIONS = {
    DASHBOARD: 'dashboard',
    VIOLATIONS: 'violations',
    OBJECTIONS: 'objections',
    BRANCHES: 'branches',
    USERS: 'users',
    MANAGEMENT: 'management',
} as const;

type Role = User['role'];
export type Permission = 'none' | 'read_own' | 'read_all' | 'write';
export type Feature = typeof PERMISSIONS[keyof typeof PERMISSIONS];

const rolePermissions: Record<string, Record<Feature, Permission>> = {
    [ROLES.BRANCH_MANAGER]: {
        [PERMISSIONS.DASHBOARD]: 'read_own',
        [PERMISSIONS.VIOLATIONS]: 'read_own',
        [PERMISSIONS.OBJECTIONS]: 'read_own',
        [PERMISSIONS.BRANCHES]: 'read_own',
        [PERMISSIONS.USERS]: 'none',
        [PERMISSIONS.MANAGEMENT]: 'none',
    },
    [ROLES.REGIONAL_MANAGER]: {
        [PERMISSIONS.DASHBOARD]: 'read_own',
        [PERMISSIONS.VIOLATIONS]: 'read_own',
        [PERMISSIONS.OBJECTIONS]: 'read_own',
        [PERMISSIONS.BRANCHES]: 'read_own',
        [PERMISSIONS.USERS]: 'none',
        [PERMISSIONS.MANAGEMENT]: 'none',
    },
    [ROLES.QUALITY_OFFICER]: {
        [PERMISSIONS.DASHBOARD]: 'read_all',
        [PERMISSIONS.VIOLATIONS]: 'write',
        [PERMISSIONS.OBJECTIONS]: 'write',
        [PERMISSIONS.BRANCHES]: 'read_all',
        [PERMISSIONS.USERS]: 'none',
        [PERMISSIONS.MANAGEMENT]: 'none',
    },
    [ROLES.SENIOR_MANAGEMENT]: {
        [PERMISSIONS.DASHBOARD]: 'read_all',
        [PERMISSIONS.VIOLATIONS]: 'read_all',
        [PERMISSIONS.OBJECTIONS]: 'read_all',
        [PERMISSIONS.BRANCHES]: 'read_all',
        [PERMISSIONS.USERS]: 'none',
        [PERMISSIONS.MANAGEMENT]: 'none',
    },
    [ROLES.SYSTEM_ADMIN]: {
        [PERMISSIONS.DASHBOARD]: 'read_all',
        [PERMISSIONS.VIOLATIONS]: 'write',
        [PERMISSIONS.OBJECTIONS]: 'write',
        [PERMISSIONS.BRANCHES]: 'write',
        [PERMISSIONS.USERS]: 'write',
        [PERMISSIONS.MANAGEMENT]: 'write',
    },
};

// This map allows us to handle old data that might still be in the database
const roleMigrationMap: Record<string, string> = {
  'مدير فرع': ROLES.BRANCH_MANAGER,
  'مدير إقليمي': ROLES.REGIONAL_MANAGER,
  'مسؤول جودة': ROLES.QUALITY_OFFICER,
  'إدارة عليا': ROLES.SENIOR_MANAGEMENT,
  'مسؤول نظام': ROLES.SYSTEM_ADMIN,
};


export function getPermission(role: Role | undefined, feature: Feature): Permission {
    if (!role) return 'none';
    
    // Check if the role is an old Arabic value and map it to the new key for backward compatibility.
    const mappedRole = roleMigrationMap[role] || role;
    
    // @ts-ignore
    return rolePermissions[mappedRole]?.[feature] ?? 'none';
}
