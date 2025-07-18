# Translation Refactoring Guide

This guide provides instructions on how to refactor components in the Kinza Berlin app to use the translation system. Following these guidelines will ensure consistency across the codebase and compliance with the language completeness rule.

## Prerequisites

Before refactoring components, make sure you have:

1. Run the extraction script to identify translatable text:
   ```
   node src/scripts/extractAllTranslations.js
   ```

2. Added the extracted keys to the translation files:
   - `src/translations/en.json`
   - `src/translations/de.json`
   - `src/translations/it.json`

## Refactoring Steps

### 1. Import the Translation Hook

Add the `useTranslation` hook to your component:

```tsx
import { useTranslation } from 'react-i18next';
```

### 2. Initialize the Translation Hook

Add the following line inside your component function:

```tsx
const { t } = useTranslation();
```

### 3. Replace Hardcoded Strings

Replace hardcoded strings with translation keys:

```tsx
// Before
<Text>Hello World</Text>

// After
<Text>{t('common.hello')}</Text>
```

### 4. Handle Dynamic Content

For strings with dynamic content, use interpolation:

```tsx
// Before
<Text>Welcome, {userName}</Text>

// After
<Text>{t('common.welcome', { name: userName })}</Text>
```

### 5. Update Accessibility Labels

Don't forget to update accessibility labels:

```tsx
// Before
<TouchableOpacity accessibilityLabel="Close button">

// After
<TouchableOpacity accessibilityLabel={t('common.close')}>
```

### 6. Use the Refactoring Script

For automated refactoring, use the refactoring script:

```
node src/scripts/refactorToTranslations.js path/to/component.tsx
```

## Best Practices

1. **Use Namespaces**: Organize translation keys by feature or component:
   ```
   events.title
   profile.settings
   common.save
   ```

2. **Reuse Common Keys**: For common UI elements, use keys from the `common` namespace:
   ```
   common.save
   common.cancel
   common.error
   ```

3. **Validate Completeness**: Use the `validateTranslationCompleteness` method from `TranslationContext` to ensure all keys exist in all languages.

4. **Test Language Switching**: Test your component with different languages to ensure proper rendering.

## Example: Before and After

### Before Refactoring

```tsx
import React from 'react';
import { View, Text, Button } from 'react-native';

const MyComponent = ({ count }) => {
  return (
    <View>
      <Text>Items in cart: {count}</Text>
      <Button title="Checkout" onPress={() => {}} />
    </View>
  );
};
```

### After Refactoring

```tsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { useTranslation } from 'react-i18next';

const MyComponent = ({ count }) => {
  const { t } = useTranslation();
  
  return (
    <View>
      <Text>{t('cart.itemsCount', { count })}</Text>
      <Button title={t('cart.checkout')} onPress={() => {}} />
    </View>
  );
};
```

## Translation Keys to Add

```json
{
  "cart": {
    "itemsCount": "Items in cart: {{count}}",
    "checkout": "Checkout"
  }
}
```

## Troubleshooting

- **Missing Translation Keys**: If you see keys like `[MISSING]` in your UI, add the missing key to all language files.
- **Type Errors**: For components that expect strings but receive translation objects, use string casting or update the component props.
- **Dynamic Keys**: For dynamic translation keys, use the bracket notation: `t(['namespace', dynamicKey].join('.'))`

## Validation

After refactoring, run the validation script to ensure all translations are complete:

```
node src/scripts/validateTranslations.js
```

This will report any missing translations across all supported languages.
