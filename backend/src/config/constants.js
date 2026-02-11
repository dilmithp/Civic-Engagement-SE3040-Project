export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator'
};

export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER: 500
};

// Issue Reporting Constants
export const ISSUE_STATUS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  WITHDRAWN: 'Withdrawn'
};

export const ISSUE_CATEGORIES = [
  'Pothole',
  'Broken Streetlight',
  'Illegal Dumping',
  'Water Leak',
  'Damaged Sidewalk',
  'Graffiti',
  'Traffic Signal',
  'Other'
];

// Open/Closed Principle: add new statuses here without changing transition logic
export const ALLOWED_TRANSITIONS = {
  [ISSUE_STATUS.PENDING]: [ISSUE_STATUS.IN_PROGRESS, ISSUE_STATUS.WITHDRAWN],
  [ISSUE_STATUS.IN_PROGRESS]: [ISSUE_STATUS.RESOLVED, ISSUE_STATUS.PENDING],
  [ISSUE_STATUS.RESOLVED]: [],
  [ISSUE_STATUS.WITHDRAWN]: []
};

// Roles that can move an issue to "Resolved"
export const RESOLVE_ROLES = [ROLES.ADMIN, 'official'];
