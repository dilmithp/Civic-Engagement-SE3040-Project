// Team members will add their API endpoints here
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/sign-in',
    REGISTER: '/sign-up',
    LOGOUT: '/sign-out'
  },
  SURVEYS: {
    GET_ACTIVE: '/surveys/active',
    BASE: '/surveys'
  },
  GREEN_INITIATIVES: '/green-initiatives',
  GREEN_INITIATIVE_IMAGES: (id) => `/green-initiatives/${id}/images`,
  GREEN_INITIATIVE_IMAGE: (id, imageId) => `/green-initiatives/${id}/images/${imageId}`,
  ISSUES: {
    BASE: '/issues',
    MY_ISSUES: '/issues/my-issues',
  },
  GEOCODE: {
    FORWARD: '/geocode/forward',
    REVERSE: '/geocode/reverse',
  },
  DASHBOARD: {
    STATS: '/dashboard/stats'
  },
  MARKETPLACE: {
    BASE: '/marketplace',
    MINE: '/marketplace/mine'
  }
};
