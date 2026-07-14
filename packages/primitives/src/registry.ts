import { actionPrimitiveSpecs } from "./contracts/actions.js";
import { formStatusPrimitiveSpecs } from "./contracts/form-status.js";
import { layoutCorePrimitiveSpecs } from "./contracts/layout-core.js";
import { layoutPlanePrimitiveSpecs } from "./contracts/layout-planes.js";
import { typographyPrimitiveSpecs } from "./contracts/typography.js";
import { searchFeedbackPrimitiveSpecs } from "./contracts/search-feedback.js";
import { statePrimitiveSpecs } from "./contracts/states.js";
import { processPrimitiveSpecs } from "./contracts/process.js";
import { navigationDataPrimitiveSpecs } from "./contracts/navigation-data.js";
import type { PrimitiveContract } from "./contracts/types.js";

export const primitiveSpecs = [
  actionPrimitiveSpecs[0],
  actionPrimitiveSpecs[3],
  formStatusPrimitiveSpecs[0],
  formStatusPrimitiveSpecs[1],
  ...layoutCorePrimitiveSpecs,
  ...layoutPlanePrimitiveSpecs,
  ...typographyPrimitiveSpecs,
  actionPrimitiveSpecs[1],
  actionPrimitiveSpecs[2],
  ...searchFeedbackPrimitiveSpecs,
  ...statePrimitiveSpecs,
  ...processPrimitiveSpecs,
  ...navigationDataPrimitiveSpecs,
] as const satisfies readonly PrimitiveContract[];

export const primitiveGroups = Object.freeze({
  legacy: Object.freeze([
    actionPrimitiveSpecs[0],
    actionPrimitiveSpecs[3],
    formStatusPrimitiveSpecs[0],
    formStatusPrimitiveSpecs[1],
  ]),
  foundation: Object.freeze([
    ...layoutCorePrimitiveSpecs,
    ...layoutPlanePrimitiveSpecs,
    ...typographyPrimitiveSpecs,
    actionPrimitiveSpecs[0],
    actionPrimitiveSpecs[1],
    actionPrimitiveSpecs[2],
    actionPrimitiveSpecs[3],
  ]),
  searchStateFeedback: Object.freeze([
    ...searchFeedbackPrimitiveSpecs,
    ...statePrimitiveSpecs,
    ...processPrimitiveSpecs,
    ...navigationDataPrimitiveSpecs,
  ]),
});

export type PrimitiveName = (typeof primitiveSpecs)[number]["name"];
export type PrimitiveSpecFor<Name extends PrimitiveName> = Extract<(typeof primitiveSpecs)[number], { name: Name }>;
export type PrimitiveToneFor<Name extends PrimitiveName> = PrimitiveSpecFor<Name>["tones"][number];
export type PrimitiveSizeFor<Name extends PrimitiveName> = PrimitiveSpecFor<Name>["sizes"][number];
