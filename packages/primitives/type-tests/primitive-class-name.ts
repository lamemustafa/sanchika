import { primitiveClassName } from "../src/index";

primitiveClassName("Button", "brand", "md");
primitiveClassName("Card", "warning", "lg");
primitiveClassName("Badge", "success", "sm");
primitiveClassName("Field", "danger", "lg");

// @ts-expect-error Unknown primitives must not produce plausible class names.
primitiveClassName("Toast", "neutral", "md");

// @ts-expect-error Button does not support the success tone.
primitiveClassName("Button", "success", "md");

// @ts-expect-error Badge does not support the lg size.
primitiveClassName("Badge", "success", "lg");

// @ts-expect-error Field does not support the brand tone.
primitiveClassName("Field", "brand", "md");
