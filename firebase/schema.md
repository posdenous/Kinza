# Kinza Berlin - Firebase Schema

## Collections

### users
- **id**: `string` (Firebase Auth UID)
- **role**: `string` (parent, organiser, admin, guest, partner)
- **email**: `string`
- **displayName**: `string`
- **photoURL**: `string` (optional)
- **cityId**: `string` (e.g., "berlin")
- **language**: `string` (en, de, it)
- **onboardingStep**: `string` (current onboarding step)
- **createdAt**: `timestamp`
- **lastLoginAt**: `timestamp`
- **consentGiven**: `boolean` (for child profile features)
- **savedEvents**: `array<string>` (event IDs)

### childProfiles
- **id**: `string` (auto-generated)
- **parentId**: `string` (reference to user.id)
- **name**: `string` (optional)
- **age**: `number` (in years)
- **interests**: `array<string>` (e.g., ["playgrounds", "music", "art"])
- **specialNeeds**: `array<string>` (optional)
- **createdAt**: `timestamp`

### events
- **id**: `string` (auto-generated)
- **title**: `object` (multilingual: {en: string, de: string, it: string})
- **description**: `object` (multilingual: {en: string, de: string, it: string})
- **organiserId**: `string` (reference to user.id)
- **organiserName**: `string`
- **venueId**: `string` (optional, reference to venues.id)
- **location**: `geopoint`
- **address**: `string`
- **cityId**: `string` (e.g., "berlin")
- **startTime**: `timestamp`
- **endTime**: `timestamp`
- **ageRange**: `object` ({min: number, max: number})
- **category**: `string` (e.g., "workshop", "playdate", "market")
- **tags**: `array<string>` (e.g., ["indoor", "stroller-friendly"])
- **images**: `array<string>` (URLs)
- **price**: `object` ({amount: number, currency: string})
- **isFree**: `boolean`
- **capacity**: `number` (optional)
- **status**: `string` (draft, pending, approved, rejected)
- **createdAt**: `timestamp`
- **updatedAt**: `timestamp`
- **featured**: `boolean`

### venues
- **id**: `string` (auto-generated)
- **name**: `object` (multilingual: {en: string, de: string, it: string})
- **description**: `object` (multilingual: {en: string, de: string, it: string})
- **ownerId**: `string` (reference to user.id)
- **location**: `geopoint`
- **address**: `string`
- **cityId**: `string` (e.g., "berlin")
- **category**: `string` (e.g., "cafe", "playground", "museum")
- **amenities**: `array<string>` (e.g., ["changing-table", "highchair"])
- **images**: `array<string>` (URLs)
- **website**: `string` (optional)
- **phone**: `string` (optional)
- **openingHours**: `object` (days of week with hours)
- **status**: `string` (pending, approved, rejected)
- **createdAt**: `timestamp`
- **updatedAt**: `timestamp`

### comments
- **id**: `string` (auto-generated)
- **userId**: `string` (reference to user.id)
- **userName**: `string`
- **userPhoto**: `string` (optional)
- **targetType**: `string` (event, venue)
- **targetId**: `string` (reference to event.id or venue.id)
- **content**: `string`
- **rating**: `number` (optional, 1-5)
- **status**: `string` (pending, approved, rejected)
- **createdAt**: `timestamp`
- **updatedAt**: `timestamp`

### reports
- **id**: `string` (auto-generated)
- **reporterId**: `string` (reference to user.id)
- **targetType**: `string` (event, venue, comment, user)
- **targetId**: `string` (reference to the reported item)
- **reason**: `string`
- **description**: `string` (optional)
- **status**: `string` (pending, reviewed, resolved)
- **createdAt**: `timestamp`
- **reviewedAt**: `timestamp` (optional)
- **reviewerId**: `string` (optional, reference to admin user.id)

## Security Rules

- Users can only read/write their own user document
- Child profiles can only be accessed by the parent user or admins
- Events with status "approved" are publicly readable
- Events can only be created/edited by users with organiser or admin role
- Comments with status "approved" are publicly readable
- Comments can only be created by authenticated users
- Reports can only be created by authenticated users
- Reports can only be read/updated by admin users
- All content is scoped to cityId for security
