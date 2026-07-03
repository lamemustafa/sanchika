# Tokens

Sanchika tokens use semantic roles, not raw product colors.

## Source Of Truth

Define color tokens as OKLCH CSS variables. Hex values can appear in research or
docs only as explanatory comments.

The CSS token file owns raw OKLCH values. TypeScript token metadata should refer
to CSS variable names and usage guidance, not duplicate color values.

## Standards References

- W3C CSS Custom Properties:
  https://www.w3.org/TR/css-variables-1/
- W3C Design Tokens Community Group:
  https://www.w3.org/community/design-tokens/

Use these as direction for portability and variable-based authoring. Sanchika V0
does not claim conformance to an unfinished design-token exchange format.

## Theme Strategy

V0 ships one canonical light theme. Dark and high-contrast themes are non-goals
for this scaffold, but semantic role names must make future remapping possible.

## Motion Tokens

Motion uses separate duration and easing variables:

```css
--sk-motion-duration-standard: 180ms;
--sk-motion-duration-loading: 720ms;
--sk-motion-easing-standard: ease-out;
--sk-motion-easing-linear: linear;
```

Do not combine duration and easing into one variable. Transitions and loading
animations need different timing semantics, and shorthand variables are easy to
misuse.

## Primitive Consumption

Import token variables before primitive styles:

```css
@import "@sanchika/tokens/theme.css";
@import "@sanchika/primitives/styles.css";
```

Primitive CSS may use `var(--sk-...)`, `color-mix()`, layout values, and state
selectors, but it must not duplicate raw OKLCH or hex color values. Product
surfaces can override Sanchika variables at a theme boundary rather than editing
primitive selectors.

## Naming

Use the `sk` prefix for CSS variables:

```css
--sk-color-bg-base: oklch(...);
--sk-space-4: 1rem;
```
