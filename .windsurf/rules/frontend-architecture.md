---
trigger: always_on
---

description: "Frontend code quality and architecture standards"
---

# 🧱 Frontend Architecture & Code Quality Rules

## Component Design
- **scalable_components**: Component logic must be modular and reusable across features (e.g. shared filters, cards, inputs)
- Create shared components in `/components` directory
- Use composition over inheritance
- Design for reusability from the start

## Separation of Concerns
- **separate_logic_layers**: Business logic must be separated from UI rendering; use hooks/services instead of mixing with components
- Extract business logic into custom hooks
- Keep components focused on rendering
- Use service layers for complex operations

## Type Safety
- **typed_props**: All components must define TypeScript props interfaces to ensure type safety and maintainability
- Define proper interfaces for all component props
- Use strict TypeScript configuration
- Avoid `any` types

## Testing Requirements
- **testable_hooks**: Any custom logic or side effects must be extracted into hooks or services that can be unit tested
- **test_coverage_required**: All new components and services must include at least one unit or integration test before merge
- Write tests for all custom hooks
- Include both unit and integration tests
- Maintain high test coverage

## File Organization
- **file_structure_consistency**: Features must follow the `/screens`, `/components`, `/hooks`, and `/utils` folder structure
- Organize files by feature when appropriate
- Use consistent naming conventions
- Keep related files together

## Performance Rules
- **no_inline_side_effects**: Avoid side effects (e.g. data fetching, timers) directly inside UI components; isolate in `useEffect` or hooks
- **max_component_size**: UI components should not exceed 150 lines; split into subcomponents if needed for readability
- **no_direct_api_in_components**: UI components must not directly import `axios` or API modules; use service or hook abstractions
- Keep components small and focused
- Use proper dependency arrays in useEffect
- Implement proper cleanup for subscriptions
