---
trigger: always_on
---

description: "Internationalization and localization requirements"
---

# 🌍 Localization & Internationalization Rules

## Translation Completeness
- **language_completeness**: UI strings must exist in all supported locales (EN, DE, IT) before a feature is marked production-ready
- Check all three language files before marking features complete
- Use proper i18n keys with descriptive names
- Test language switching functionality

## Fallback Strategy
- **fallback_locale_chain**: If a locale is missing, the system must fallback in order: userLocale → DE → EN
- Implement proper fallback logic in translation functions
- Never show empty strings or translation keys to users
- Log missing translations for future fixes

## Search Localization
- **translated_search_fields**: Search-indexed content must include localized title and description fields in supported languages
- Index content in all supported languages
- Implement language-aware search functionality
- Consider cultural differences in search behavior
