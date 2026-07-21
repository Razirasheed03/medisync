export const DEPARTMENTS = [
  "GENERAL_MEDICINE",
  "CARDIOLOGY",
  "DERMATOLOGY",
  "NEUROLOGY",
  "ORTHOPEDICS",
  "PEDIATRICS",
  "ENT",
  "OPHTHALMOLOGY",
] as const;

export type Department = (typeof DEPARTMENTS)[number];
