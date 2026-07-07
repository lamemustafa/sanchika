import {
  renderGalleryBaseStyles,
  renderGalleryHeroStyles,
  renderGalleryWorkbenchStyles,
} from "./page-style-core.js";
import {
  renderGalleryContractStyles,
  renderGallerySectionStyles,
} from "./page-style-content.js";
import { renderGalleryResponsiveStyles } from "./page-style-responsive.js";

export function renderGalleryPageStyles(): string {
  const parts = [
    renderGalleryBaseStyles(),
    renderGalleryHeroStyles(),
    renderGalleryWorkbenchStyles(),
    renderGallerySectionStyles(),
    renderGalleryContractStyles(),
    renderGalleryResponsiveStyles(),
  ];

  return `<style>${parts.join("")}</style>`;
}
