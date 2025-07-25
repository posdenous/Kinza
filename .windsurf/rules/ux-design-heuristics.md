---
trigger: always_on
---

description: "UX design principles and usability heuristics"
---

# 🧠 UX & Design Heuristics Rules

## Visual Design
- **aesthetic_usability**: Forms and settings panels must use clean, consistent spacing (e.g. gap-2, px-4) and typography hierarchy (e.g. text-lg, font-semibold) to enhance perceived usability
- **consistent_component_styles**: Ensure that toggles, buttons, selectors, and badges follow a shared style guide for layout, sizing, and spacing
- Use consistent design tokens and spacing
- Maintain visual hierarchy throughout the app

## Cognitive Load Management
- **reduce_visible_options**: Collapse complex filters or settings into expandable sections or toggles to reduce choice overload (Hick's Law)
- **cognitive_chunking**: Break down rule configuration or settings into bite-sized panels or steps; default to collapsed advanced options (Miller's Law)
- Limit choices presented to users
- Group related options together
- Use progressive disclosure

## Familiar Patterns
- **familiar_admin_patterns**: Match WordPress admin conventions for layout (cards, modals, sidebars, toggles) and interactions (Add New, status icons) (Jakob's Law)
- Use established UI patterns users already know
- Follow platform conventions (iOS/Android)
- Maintain consistency with popular apps

## Interaction Design
- **fitts_law_actions**: Important actions (e.g. edit, delete) should be large and clearly placed; avoid small, icon-only buttons unless spaced (Fitts's Law)
- **group_related_controls**: Inputs and controls that share logic must be grouped using layout containers (PanelBody, Cards, rows) (Law of Proximity)
- Make touch targets appropriately sized
- Group related controls visually
- Use adequate spacing between interactive elements

## Progress & Feedback
- **show_progress_feedback**: Multi-step flows (e.g. rule creation) must display progress via steppers, breadcrumbs, or status labels (Zeigarnik Effect)
- **emphasize_progress**: Highlight the current step in workflows, use progress bars or action-focused buttons to reinforce forward momentum (Goal-Gradient Effect)
- **fast_feedback_ui**: UI should provide feedback within 400ms of user input via loading spinners, skeletons, or optimistic rendering (Doherty Threshold)
- Always show progress in multi-step flows
- Provide immediate feedback for user actions
- Use loading states and skeleton screens

## Modal Management
- **no_modal_in_modal**: Do not nest modals; multi-step flows should transition across pages or use side panels to avoid cognitive overload
- Use single-level modals only
- Consider drawer/sheet patterns for mobile
- Provide clear exit paths from modals
How to Create These Files
Create each file in your .windsurf/rules/ directory:
access-authentication.md
content-integrity.md
localization.md
frontend-architecture.md
ux-design-heuristics.md
Copy the respective content into each file
The rules will automatically become active and will guide development decisions
These rules will now:

✅ Be automatically applied during development
✅ Help maintain consistency across the codebase
✅ Ensure compliance with your business requirements
✅ Guide architectural decisions
✅ Maintain UX standards
