export const PHILHEALTH_MEMBERSHIP_TYPE_OPTIONS = [
  { value: "EMPLOYED", label: "Employed (Direct Contributor)" },
  { value: "SELF_EMPLOYED", label: "Self-Employed / Voluntary" },
  { value: "INDIGENT", label: "Indigent / Sponsored" },
  { value: "OFW", label: "Overseas Filipino Worker (OFW)" },
  { value: "LIFETIME", label: "Lifetime Member" },
  { value: "DEPENDENT", label: "Dependent" },
  { value: "OTHER", label: "Other" },
] as const

export type PhilHealthMembershipTypeValue =
  (typeof PHILHEALTH_MEMBERSHIP_TYPE_OPTIONS)[number]["value"]
