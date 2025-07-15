---
description: Onboarding and Event Submission
---

- id: onboarding_parent
    steps:
      - pick_language
      - request_location_or_zip
      - child_profile_setup
      - interest_selection
      - optional_authentication
      - welcome_tour

  - id: event_submission
    steps:
      - organiser_login
      - submit_event_form
      - autosave_draft
      - review_pending_status
      - notify_on_approval

  - id: report_content
    steps:
      - user_flag_content
      - optional_note
      - add_to_moderation_queue
      - notify_admin

  - id: swap_listing_create
    steps:
      - choose_category
      - upload_photos
      - write_description
      - post_to_swap_board

  - id: weekly_digest
    steps:
      - gather_saved_event_data
      - compile_digest
      - send_via_fcm_and_email