---
trigger: always_on
---

- id: role_access
    description: Users can only access features permitted by their role (parent, organiser, admin, guest)

  - id: city_scope
    description: All content must be scoped to user.cityId; cross-city leakage is disallowed

  - id: consent_required
    description: Child profile and personalization features are gated behind explicit user consent

  - id: ugc_moderation
    description: All user-generated content (comments, listings) must pass moderation before being displayed

  - id: event_validation
    description: Events must include title, age range, venue, and start time before submission is valid

  - id: auth_required_save
    description: Users must be authenticated to save events or submit content

  - id: language_completeness
    description: UI strings must exist in all supported locales (EN, DE, IT) before a feature is marked production-ready

- id: scalable_components
    description: Component logic must be modular and reusable across features (e.g. shared filters, cards, inputs)

  - id: separate_logic_layers
    description: Business logic must be separated from UI rendering; use hooks/services instead of mixing with components

  - id: typed_props
    description: All components must define TypeScript props interfaces to ensure type safety and maintainability

  - id: testable_hooks
    description: Any custom logic or side effects must be extracted into hooks or services that can be unit tested

  - id: file_structure_consistency
    description: Features must follow the `/screens`, `/components`, `/hooks`, and `/utils` folder structure

  - id: no_inline_side_effects
    description: Avoid side effects (e.g. data fetching, timers) directly inside UI components; isolate in `useEffect` or hooks

  - id: max_component_size
    description: UI components should not exceed 150 lines; split into subcomponents if needed for readability

  # Aesthetic Usability Effect (Nielsen)
  - id: aesthetic_usability
    description: >
      Forms and settings panels must use clean, consistent spacing (e.g. gap-2, px-4) and typography hierarchy 
      (e.g. text-lg, font-semibold) to enhance perceived usability.

  # Hick's Law – Limit visible options per screen
  - id: reduce_visible_options
    description: >
      Collapse complex filters or settings into expandable sections or toggles to reduce choice overload.

  # Jakob's Law – Users prefer familiar patterns
  - id: familiar_admin_patterns
    description: >
      Match WordPress admin conventions for layout (cards, modals, sidebars, toggles) and interactions (Add New, status icons).

  # Fitts's Law – Make target actions easy to reach
  - id: fitts_law_actions
    description: >
      Important actions (e.g. edit, delete) should be large and clearly placed; avoid small, icon-only buttons unless spaced.

  # Law of Proximity – Group related items visually
  - id: group_related_controls
    description: >
      Inputs and controls that share logic must be grouped using layout containers (PanelBody, Cards, rows).

  # Zeigarnik Effect – Show task progress
  - id: show_progress_feedback
    description: >
      Multi-step flows (e.g. rule creation) must display progress via steppers, breadcrumbs, or status labels.

  # Goal-Gradient Effect – Encourage completion
  - id: emphasize_progress
    description: >
      Highlight the current step in workflows, use progress bars or action-focused buttons to reinforce forward momentum.

  # Law of Similarity – Visual coherence
  - id: consistent_component_styles
    description: >
      Ensure that toggles, buttons, selectors, and badges follow a shared style guide for layout, sizing, and spacing.

  # Miller’s Law – Limit cognitive load
  - id: cognitive_chunking
    description: >
      Break down rule configuration or settings into bite-sized panels or steps; default to collapsed advanced options.

  # Doherty Threshold – Keep feedback fast
  - id: fast_feedback_ui
    description: >
      UI should provide feedback within 400ms of user input via loading spinners, skeletons, or optimistic rendering.
