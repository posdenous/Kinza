# Kinza Berlin

A cross-platform app designed to connect parents in Berlin with family-friendly events, venues, and communities. Built with React Native (Expo) and Firebase, optimized for quick iteration and user-centered design.

## Features

- Event & location discovery (geo-based)
- Map view + filters (indoor, stroller-friendly, etc.)
- Save & share events
- User-generated tips/comments
- Multilingual UI (DE/EN/IT)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/kinza-berlin.git
cd kinza-berlin
```

2. Install dependencies
```
npm install
# or
yarn install
```

3. Start the development server
```
npm start
# or
yarn start
```

## Project Structure

```
/src
  /components - Reusable UI components
  /screens - Main app screens
  /hooks - Custom React hooks
  /utils - Utility functions
  /styles - Global styles
  /auth - Authentication related code
/firebase - Firebase configuration and functions
/types - TypeScript type definitions
/assets - Images, fonts, etc.
```

## User Roles

Kinza Berlin implements a comprehensive role-based access control system with 5 distinct user types:

### **👨‍👩‍👧‍👦 PARENT** - Primary Family User
**Registered family user seeking age-appropriate events and activities for their children**
- ✅ View and save family-friendly events
- ✅ Comment and engage in community discussions
- ✅ Access child profile management (with GDPR consent)
- ✅ Full map and location services
- ✅ Personalized recommendations

### **📅 ORGANISER** - Community Event Creator
**Individual or small organization that creates and hosts community events for families**
- ✅ All Parent permissions
- ✅ Create and manage community events
- ✅ View event analytics and attendance
- ✅ Access Organiser Dashboard
- ✅ Verification badge for trusted organizers

### **🏢 PARTNER** - Commercial Business
**Commercial businesses and venues that promote kid-friendly services and host events**
- ✅ All Organiser permissions
- ✅ Enhanced business analytics
- ✅ Multiple venue location management
- ✅ Promotional features and event highlighting
- ✅ Commercial event categories

### **⚡ ADMIN** - Platform Administrator
**Kinza team members and moderators responsible for platform governance and safety**
- ✅ All user permissions across all roles
- ✅ Content moderation and approval tools
- ✅ User management and platform oversight
- ✅ System analytics and health monitoring
- ✅ Admin Dashboard with moderation queue

### **👤 GUEST** - Unregistered Browser
**Unregistered user with read-only access to public content**
- ✅ Browse public events (limited details)
- ✅ Basic search and filtering
- ✅ Limited map view
- ❌ Cannot save events, comment, or access personalized features
- 🔄 **Conversion paths:** Register as Parent, Organiser, or Partner for full functionality

### **Role Hierarchy & Permissions:**
```
ADMIN > PARTNER ≥ ORGANISER > PARENT > GUEST
```

### **Documentation:**
- **Comprehensive Guide:** [`docs/ALL_ROLES_DEFINITION.md`](docs/ALL_ROLES_DEFINITION.md)
- **Guest Role Details:** [`docs/GUEST_ROLE_DEFINITION.md`](docs/GUEST_ROLE_DEFINITION.md)
- **Implementation:** [`src/auth/roles.ts`](src/auth/roles.ts)

## Testing

### **Testing Dashboard**
Access the unified testing dashboard to test all user flows and roles:
```bash
open testing-dashboard.html
```

The dashboard provides:
- **Interactive HTML previews** for all user flows
- **Role-based screen access** testing
- **Complete user journey** validation
- **Multilingual support** verification

### **Unit Tests**
Run comprehensive role-based access control tests:
```bash
npm test
```

### **E2E Testing**
Run automated browser tests with Playwright:
```bash
npx playwright test --ui
```

### **Available Test Flows:**
- **Mobile App Preview** - Complete app experience
- **Parent Onboarding** - GDPR-compliant registration
- **Privacy & Trust** - Privacy settings and safety features
- **Admin Dashboard** - Content moderation tools
- **Organiser Dashboard** - Event management interface
- **Comment System** - Pagination and moderation
- **Saved Events** - Event collection functionality

## Multilingual Support

The app supports English, German, and Italian languages for all UI elements.
