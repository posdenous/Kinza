// Role definitions and access control for Kinza Berlin app

/**
 * User role types
 */
export enum UserRole {
  PARENT = 'parent',
  ORGANISER = 'organiser',
  ADMIN = 'admin',
  GUEST = 'guest',
  PARTNER = 'partner'
}

/**
 * Role descriptions
 */
export const roleDescriptions = {
  [UserRole.PARENT]: 'Primary user – discover events, connect locally',
  [UserRole.ORGANISER]: 'Hosts or venues posting events',
  [UserRole.ADMIN]: 'Kinza team or moderators',
  [UserRole.GUEST]: 'New or anonymous user',
  [UserRole.PARTNER]: 'Businesses promoting kid-friendly places'
};

/**
 * Permission types
 */
export enum Permission {
  VIEW_EVENTS = 'view_events',
  CREATE_EVENT = 'create_event',
  EDIT_EVENT = 'edit_event',
  DELETE_EVENT = 'delete_event',
  COMMENT = 'comment',
  SAVE_EVENT = 'save_event',
  MODERATE_CONTENT = 'moderate_content',
  MANAGE_USERS = 'manage_users',
  VIEW_ANALYTICS = 'view_analytics',
  EDIT_PROFILE = 'edit_profile',
  VIEW_FULL_MAP = 'view_full_map',
  VIEW_LIMITED_MAP = 'view_limited_map'
}

/**
 * Role-based permissions mapping
 */
export const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.PARENT]: [
    Permission.VIEW_EVENTS,
    Permission.COMMENT,
    Permission.SAVE_EVENT,
    Permission.EDIT_PROFILE,
    Permission.VIEW_FULL_MAP
  ],
  [UserRole.ORGANISER]: [
    Permission.VIEW_EVENTS,
    Permission.CREATE_EVENT,
    Permission.EDIT_EVENT,
    Permission.COMMENT,
    Permission.SAVE_EVENT,
    Permission.VIEW_ANALYTICS,
    Permission.EDIT_PROFILE,
    Permission.VIEW_FULL_MAP
  ],
  [UserRole.ADMIN]: [
    Permission.VIEW_EVENTS,
    Permission.CREATE_EVENT,
    Permission.EDIT_EVENT,
    Permission.DELETE_EVENT,
    Permission.COMMENT,
    Permission.SAVE_EVENT,
    Permission.MODERATE_CONTENT,
    Permission.MANAGE_USERS,
    Permission.VIEW_ANALYTICS,
    Permission.EDIT_PROFILE,
    Permission.VIEW_FULL_MAP
  ],
  [UserRole.GUEST]: [
    Permission.VIEW_EVENTS,
    Permission.VIEW_LIMITED_MAP
  ],
  [UserRole.PARTNER]: [
    Permission.VIEW_EVENTS,
    Permission.CREATE_EVENT,
    Permission.EDIT_EVENT,
    Permission.COMMENT,
    Permission.SAVE_EVENT,
    Permission.VIEW_ANALYTICS,
    Permission.EDIT_PROFILE,
    Permission.VIEW_FULL_MAP
  ]
};

/**
 * Check if a user has a specific permission
 * @param userRole The role of the user
 * @param permission The permission to check
 * @returns boolean indicating if the user has the permission
 */
export const hasPermission = (userRole: UserRole, permission: Permission): boolean => {
  return rolePermissions[userRole]?.includes(permission) || false;
};

/**
 * Get all permissions for a specific role
 * @param role The user role
 * @returns Array of permissions for the role
 */
export const getPermissionsForRole = (role: UserRole): Permission[] => {
  return rolePermissions[role] || [];
};

/**
 * Screen access control definitions
 */
export const screenAccessControl = {
  // Admin-only screens
  AdminDashboard: [UserRole.ADMIN],
  ReportReview: [UserRole.ADMIN],
  ModerationQueue: [UserRole.ADMIN],
  
  // Organiser screens
  OrganiserDashboard: [UserRole.ORGANISER, UserRole.ADMIN],
  
  // Authenticated user screens
  Privacy: [UserRole.PARENT, UserRole.ORGANISER, UserRole.ADMIN, UserRole.PARTNER],
  SubmitEvent: [UserRole.ORGANISER, UserRole.ADMIN, UserRole.PARTNER],
  
  // Public screens (accessible by all roles including guests)
  Home: Object.values(UserRole),
  Search: Object.values(UserRole),
  Map: Object.values(UserRole),
  EventDetail: Object.values(UserRole),
};

/**
 * Check if a user role can access a specific screen
 * @param userRole The role of the user
 * @param screenName The name of the screen
 * @returns boolean indicating if the user can access the screen
 */
export const canAccessScreen = (userRole: UserRole, screenName: string): boolean => {
  const allowedRoles = screenAccessControl[screenName as keyof typeof screenAccessControl];
  return allowedRoles ? allowedRoles.includes(userRole) : false;
};
