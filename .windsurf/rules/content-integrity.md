---
trigger: always_on
---

description: "Content validation and integrity rules for user-generated content"
---

# 📄 Content Integrity & Validation Rules

## UGC Moderation
- **ugc_moderation**: All user-generated content (comments, listings) must pass moderation before being displayed
- Use the `useUgcModeration` hook for all user-generated content
- Wrap content with `ModerationWrapper` component
- Never display unmoderated content to public users

## Event Validation
- **event_validation**: Events must include title, age range, venue, and start time before submission is valid
- Use the `useEventValidation` hook for form validation
- Show clear error messages for missing required fields
- Prevent submission until all required fields are completed

## Media Handling
- **image_size_limits**: Uploaded images must be under 1MB and use approved formats (JPEG, WEBP)
- Validate file size and format before upload
- Show progress indicators during upload
- Provide clear error messages for invalid files

## Recurring Events
- **recurring_event_handling**: Recurring events must clearly define frequency, end date, and exceptions to be valid
- Implement proper recurring event UI with clear controls
- Validate recurring event parameters before submission
- Handle edge cases like holidays and exceptions
