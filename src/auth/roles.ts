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
  [UserRole.PARENT]: 'Registered family user seeking age-appropriate events and activities for their children',
  [UserRole.ORGANISER]: 'Individual or small organization that creates and hosts community events for families',
  [UserRole.ADMIN]: 'Kinza team members and moderators responsible for platform governance and safety',
  [UserRole.GUEST]: 'Unregistered user with read-only access to public content',
  [UserRole.PARTNER]: 'Commercial businesses and venues that promote kid-friendly services and host events'
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
  VIEW_LIMITED_MAP = 'view_limited_map',
  // Additional permissions for comprehensive testing
  EDIT_OWN_EVENT = 'edit_own_event',
  VIEW_EVENT_ANALYTICS = 'view_event_analytics',
  SAVE_EVENTS = 'save_events',
  SUBMIT_FEEDBACK = 'submit_feedback',
  VIEW_PUBLIC_CONTENT = 'view_public_content',
  MANAGE_VENUE = 'manage_venue',
  VIEW_VENUE_ANALYTICS = 'view_venue_analytics',
  PROMOTE_EVENTS = 'promote_events',
  DELETE_ANY_EVENT = 'delete_any_event',
  APPROVE_ORGANISER = 'approve_organiser',
  ACCESS_REPORTS = 'access_reports',
  VIEW_CITY_EVENTS = 'view_city_events',
  ACCESS_CROSS_CITY_DATA = 'access_cross_city_data',
  HANDLE_PERSONAL_DATA = 'handle_personal_data'
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
    Permission.VIEW_FULL_MAP,
    Permission.SAVE_EVENTS,
    Permission.SUBMIT_FEEDBACK,
    Permission.VIEW_CITY_EVENTS,
    Permission.HANDLE_PERSONAL_DATA
  ],
  [UserRole.ORGANISER]: [
    Permission.VIEW_EVENTS,
    Permission.CREATE_EVENT,
    Permission.EDIT_EVENT,
    Permission.COMMENT,
    Permission.SAVE_EVENT,
    Permission.VIEW_ANALYTICS,
    Permission.EDIT_PROFILE,
    Permission.VIEW_FULL_MAP,
    Permission.EDIT_OWN_EVENT,
    Permission.VIEW_EVENT_ANALYTICS,
    Permission.SAVE_EVENTS,
    Permission.SUBMIT_FEEDBACK,
    Permission.VIEW_CITY_EVENTS,
    Permission.HANDLE_PERSONAL_DATA
  ],
  [UserRole.ADMIN]: Object.values(Permission), // Admin has all permissions
  [UserRole.GUEST]: [
    Permission.VIEW_EVENTS,
    Permission.VIEW_LIMITED_MAP,
    Permission.VIEW_PUBLIC_CONTENT,
    Permission.VIEW_CITY_EVENTS
    // Note: Guests cannot save events, comment, or access personalized features
    // They must register to become Parent/Organiser for full functionality
  ],
  [UserRole.PARTNER]: [
    Permission.VIEW_EVENTS,
    Permission.CREATE_EVENT,
    Permission.EDIT_EVENT,
    Permission.COMMENT,
    Permission.SAVE_EVENT,
    Permission.VIEW_ANALYTICS,
    Permission.EDIT_PROFILE,
    Permission.VIEW_FULL_MAP,
    Permission.MANAGE_VENUE,
    Permission.VIEW_VENUE_ANALYTICS,
    Permission.PROMOTE_EVENTS,
    Permission.SAVE_EVENTS,
    Permission.VIEW_CITY_EVENTS,
    Permission.HANDLE_PERSONAL_DATA
  ]
};

/**
 * Check if a user has a specific permission
 * @param userRole The role of the user
 * @param permission The permission to check (can be Permission enum or string)
 * @returns boolean indicating if the user has the permission
 */
export const hasPermission = (userRole: UserRole, permission: Permission | string): boolean => {
  if (!userRole || !permission) return false;
  const userPermissions = rolePermissions[userRole] || [];
  return userPermissions.some(p => p === permission || p.toString() === permission.toString());
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
  AdminDashboardScreen: [UserRole.ADMIN],
  ReportReview: [UserRole.ADMIN],
  ReportReviewScreen: [UserRole.ADMIN],
  ModerationQueue: [UserRole.ADMIN],
  ModerationQueueScreen: [UserRole.ADMIN],
  
  // Organiser screens
  OrganiserDashboard: [UserRole.ORGANISER, UserRole.ADMIN],
  OrganiserDashboardScreen: [UserRole.ORGANISER, UserRole.ADMIN],
  
  // Partner screens
  PartnerDashboard: [UserRole.PARTNER, UserRole.ADMIN],
  PartnerDashboardScreen: [UserRole.PARTNER, UserRole.ADMIN],
  
  // Privacy screens (require authentication)
  Privacy: [UserRole.PARENT, UserRole.ORGANISER, UserRole.ADMIN, UserRole.PARTNER],
  PrivacyScreen: [UserRole.PARENT, UserRole.ORGANISER, UserRole.ADMIN, UserRole.PARTNER],
  Trust: Object.values(UserRole), // Trust and safety info should be accessible to all
  TrustScreen: Object.values(UserRole),
  
  // Authenticated user screens
  SubmitEvent: [UserRole.ORGANISER, UserRole.ADMIN],
  SubmitEventScreen: [UserRole.ORGANISER, UserRole.ADMIN],
  
  // Public screens (accessible by all roles including guests)
  Home: Object.values(UserRole), // Guests see limited version without personalization
  HomeScreen: Object.values(UserRole),
  Search: Object.values(UserRole), // Guests can search but cannot save results
  SearchScreen: Object.values(UserRole),
  Map: Object.values(UserRole), // Guests see limited map without full location features
  MapScreen: Object.values(UserRole),
  EventDetail: Object.values(UserRole), // Guests can view but cannot interact (save/comment)
  EventDetailScreen: Object.values(UserRole),
  
  // Guest-restricted screens (require registration)
  Profile: [UserRole.PARENT, UserRole.ORGANISER, UserRole.ADMIN, UserRole.PARTNER],
  ProfileScreen: [UserRole.PARENT, UserRole.ORGANISER, UserRole.ADMIN, UserRole.PARTNER],
  SavedEvents: [UserRole.PARENT, UserRole.ORGANISER, UserRole.ADMIN, UserRole.PARTNER],
  SavedEventsScreen: [UserRole.PARENT, UserRole.ORGANISER, UserRole.ADMIN, UserRole.PARTNER],
  Comments: [UserRole.PARENT, UserRole.ORGANISER, UserRole.ADMIN, UserRole.PARTNER], // View-only for guests
  CommentsScreen: [UserRole.PARENT, UserRole.ORGANISER, UserRole.ADMIN, UserRole.PARTNER],
};

/**
 * Get role hierarchy for a user role (from highest to lowest privilege)
 * @param userRole The user role
 * @returns Array of roles in hierarchy order
 */
export const getRoleHierarchy = (userRole: UserRole | string): UserRole[] => {
  if (!userRole) return [];
  
  switch (userRole) {
    case UserRole.ADMIN:
      return [UserRole.ADMIN, UserRole.ORGANISER, UserRole.PARENT, UserRole.PARTNER, UserRole.GUEST];
    case UserRole.ORGANISER:
      return [UserRole.ORGANISER, UserRole.PARENT, UserRole.GUEST];
    case UserRole.PARENT:
      return [UserRole.PARENT, UserRole.GUEST];
    case UserRole.PARTNER:
      return [UserRole.PARTNER, UserRole.GUEST];
    case UserRole.GUEST:
      return [UserRole.GUEST];
    default:
      return [];
  }
};

/**
 * Check if a user role can access a specific screen
 * @param userRole The role of the user
 * @param screenName The name of the screen
 * @returns boolean indicating if the user can access the screen
 */
export const canAccessScreen = (userRole: UserRole | string, screenName: string): boolean => {
  if (!userRole || !screenName) return false;
  
  // Handle screen name variations (convert to consistent format)
  const normalizedScreenName = screenName.replace(/Screen$/, '');
  const screenKey = Object.keys(screenAccessControl).find(key => 
    key.toLowerCase() === normalizedScreenName.toLowerCase() ||
    key.toLowerCase() === screenName.toLowerCase()
  );
  
  if (!screenKey) return false;
  
  const allowedRoles = screenAccessControl[screenKey as keyof typeof screenAccessControl];
  return allowedRoles ? allowedRoles.includes(userRole as UserRole) : false;
};
