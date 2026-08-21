/**
 * A selectable choice, shared by every component that presents a fixed list of
 * options (select, radio group, and anything similar added later).
 *
 * Values are strings because that is what form controls and URL query parameters
 * exchange. Callers holding richer domain objects map them to this shape, which
 * keeps the design system free of any domain type.
 */
export interface ChoiceOption {
  readonly value: string;
  readonly label: string;
  readonly disabled?: boolean;
}
