---
trigger: always_on
---

description: "Access control and authentication rules for Kinza Berlin app"
---

# 🔐 Access & Authentication Rules

## Role-Based Access Control
- **role_access**: Users can only access features permitted by their role (parent, organiser, admin, guest, partner)
- Always check user role before rendering UI components or allowing actions
- Use the role permission system defined in `src/auth/roles.ts`

## City Scoping
- **city_scope**: All content must be scoped to user.cityId; cross-city leakage is disallowed
- Every Firestore query must include city scoping filter
- Never display events or content from other cities

## Consent Management
- **consent_required**: Child profile and personalization features are gated behind explicit user consent
- Check consent status before collecting or using personal data
- Implement granular consent options as defined in privacy components

## Authentication Requirements
- **auth_required_save**: Users must be authenticated to save events or submit content
- Redirect unauthenticated users to login before allowing saves
- Show appropriate UI states for guest vs authenticated users

## Rate Limiting
- **submission_throttle**: Prevent users from submitting more than 5 events or comments within a 10-minute window
- Implement client-side and server-side throttling
- Show clear feedback when rate limits are reached

## Security
- **role_escalation_protection**: Users must not be able to self-promote their role (e.g. from organiser to admin)
- Role changes must be handled by admin-only functions
- Validate role permissions on both client and server
