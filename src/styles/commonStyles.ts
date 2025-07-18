/**
 * Kinza Design System - Common Styles
 * 
 * This file contains reusable style patterns used throughout the application.
 * Import these styles to ensure consistency across components.
 */

import { StyleSheet } from 'react-native';
import * as theme from './theme';

// Card styles for consistent card appearance
export const cardStyles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.ui.card,
    borderRadius: theme.borders.radius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing[4],
    borderWidth: 1,
    borderColor: theme.colors.ui.border,
    ...theme.shadows.md,
  },
  header: {
    padding: theme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.ui.border,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.heading,
    color: theme.colors.text.dark,
  },
  body: {
    padding: theme.spacing[4],
  },
  footer: {
    padding: theme.spacing[4],
    borderTopWidth: 1,
    borderTopColor: theme.colors.ui.border,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: theme.colors.ui.border,
  },
});

// Form styles for consistent form appearance
export const formStyles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing[4],
  },
  fieldGroup: {
    marginBottom: theme.spacing[4],
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.heading,
    color: theme.colors.text.dark,
    marginBottom: theme.spacing[1],
  },
  input: {
    backgroundColor: theme.colors.ui.input,
    borderRadius: theme.borders.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.ui.border,
    padding: theme.spacing[3],
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.body,
    color: theme.colors.text.dark,
    minHeight: 48,
  },
  inputError: {
    borderColor: theme.colors.ui.error,
  },
  errorText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.body,
    color: theme.colors.ui.error,
    marginTop: theme.spacing[1],
  },
  helpText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.body,
    color: theme.colors.text.light,
    marginTop: theme.spacing[1],
  },
  characterCount: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.body,
    color: theme.colors.text.light,
    textAlign: 'right',
    marginTop: theme.spacing[1],
  },
  characterCountWarning: {
    color: theme.colors.ui.warning,
  },
  characterCountError: {
    color: theme.colors.ui.error,
  },
});

// Button styles for consistent button appearance
export const buttonStyles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borders.radius.md,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    minHeight: 48,
    minWidth: 100,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  text: {
    backgroundColor: 'transparent',
    paddingHorizontal: theme.spacing[2],
  },
  disabled: {
    opacity: 0.5,
  },
  small: {
    paddingVertical: theme.spacing[1],
    paddingHorizontal: theme.spacing[2],
    minHeight: 36,
  },
  large: {
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[6],
    minHeight: 56,
  },
  buttonText: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.button,
    textAlign: 'center',
  },
  primaryText: {
    color: theme.colors.text.inverse,
  },
  secondaryText: {
    color: theme.colors.text.inverse,
  },
  outlineText: {
    color: theme.colors.primary,
  },
  textButtonText: {
    color: theme.colors.primary,
  },
  icon: {
    marginRight: theme.spacing[2],
  },
});

// List styles for consistent list appearance
export const listStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    padding: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.ui.border,
    backgroundColor: theme.colors.ui.card,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.heading,
    color: theme.colors.text.dark,
    marginBottom: theme.spacing[1],
  },
  itemDescription: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.body,
    color: theme.colors.text.light,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borders.radius.md,
    marginRight: theme.spacing[3],
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.ui.border,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[6],
  },
  emptyText: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.body,
    color: theme.colors.text.light,
    textAlign: 'center',
    marginTop: theme.spacing[3],
  },
});

// Badge styles for consistent badge appearance
export const badgeStyles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing[1],
    paddingHorizontal: theme.spacing[2],
    borderRadius: theme.borders.radius.full,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
  },
  success: {
    backgroundColor: theme.colors.ui.success,
  },
  warning: {
    backgroundColor: theme.colors.ui.warning,
  },
  error: {
    backgroundColor: theme.colors.ui.error,
  },
  info: {
    backgroundColor: theme.colors.ui.info,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  outlinePrimary: {
    borderColor: theme.colors.primary,
  },
  outlineSecondary: {
    borderColor: theme.colors.secondary,
  },
  text: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.body,
    fontWeight: 'bold',
  },
  textLight: {
    color: theme.colors.text.inverse,
  },
  textDark: {
    color: theme.colors.text.dark,
  },
  icon: {
    marginRight: theme.spacing[1],
  },
});

// Layout styles for consistent layout patterns
export const layoutStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.ui.background,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing[4],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: theme.spacing[4],
  },
});
