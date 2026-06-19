/**
 * Sacrament Policies — Single source of truth for eligibility, scheduling,
 * preparation requirements, and contact info for each sacrament.
 * 
 * Used by: Sacraments page, Parish Assistant AI, New Here page, SEO.
 * Admin-editable in future via siteSettings key "sacrament_policies".
 */

export interface SacramentPolicy {
  id: string;
  name: string;
  shortDescription: string;
  eligibility: string[];
  preparation: string[];
  scheduling: string;
  contact: {
    method: string; // "phone" | "email" | "office"
    label: string;
    value: string;
  };
  notes?: string;
  scheduleMassRef?: { dayOfWeek: number; position: "first" | "last" };
}

export const DEFAULT_SACRAMENT_POLICIES: SacramentPolicy[] = [
  {
    id: "baptism",
    name: "Baptism",
    shortDescription: "Welcome your child into the faith through the waters of Baptism.",
    eligibility: [
      "At least one parent must be a practicing Catholic",
      "A Catholic godparent (sponsor) is required",
      "Parents must attend a Baptism preparation class (held monthly)",
    ],
    preparation: [
      "Contact parish office at least two months in advance",
      "Attend Baptism preparation class",
      "Provide godparent sponsor certificate",
    ],
    scheduling: "Baptisms are celebrated on select Sundays after the late Sunday Mass, or by special arrangement.",
    scheduleMassRef: { dayOfWeek: 0, position: "last" }, // references last Sunday Mass from schedule engine
    contact: {
      method: "phone",
      label: "Parish Office",
      value: "(914) 273-9724",
    },
    notes: "Adults seeking Baptism are welcomed through the RCIA program (Rite of Christian Initiation of Adults). RCIA prepares unbaptized adults to receive Baptism, Confirmation, and First Eucharist at the Easter Vigil.",
  },
  {
    id: "first-communion",
    name: "First Holy Communion",
    shortDescription: "Children receive the Body of Christ for the first time, typically in spring of 2nd grade.",
    eligibility: [
      "Child must be baptized Catholic",
      "Enrolled in 2nd grade CCD or Catholic school",
      "Completed 1st grade religious education",
    ],
    preparation: [
      "Two years of religious education (1st and 2nd grade CCD)",
      "Parent participation in preparation meetings is required",
      "Regular attendance at Sunday Mass throughout the preparation year",
      "First Reconciliation before First Communion",
    ],
    scheduling: "First Communion is typically celebrated in the spring of 2nd grade.",
    contact: {
      method: "email",
      label: "Religious Education Office",
      value: "reled@stpatrickinarmonk.org",
    },
  },
  {
    id: "confirmation",
    name: "Confirmation",
    shortDescription: "Completes the grace of Baptism and strengthens us to be witnesses of Christ.",
    eligibility: [
      "Baptized Catholic in good standing",
      "Enrolled in 8th grade CCD or Catholic school",
      "Completed two-year preparation (7th and 8th grade)",
    ],
    preparation: [
      "Two-year preparation through CCD (7th and 8th grade)",
      "Community service hours requirement",
      "Confirmation retreat attendance",
      "Selection of a Confirmation saint and sponsor",
    ],
    scheduling: "Confirmation is typically celebrated in the spring. Check the CCD Calendar for the latest schedule.",
    contact: {
      method: "email",
      label: "Religious Education Office",
      value: "reled@stpatrickinarmonk.org",
    },
    notes: "Adults who were baptized Catholic but never confirmed may prepare through the RCIA program or through individual preparation with a priest.",
  },
  {
    id: "marriage",
    name: "Marriage",
    shortDescription: "Celebrate your love and commitment in the Sacrament of Matrimony.",
    eligibility: [
      "At least one party must be Catholic",
      "Both parties must be free to marry in the Catholic Church",
      "Contact parish at least six months before desired wedding date",
    ],
    preparation: [
      "Meet with the priest or deacon for marriage preparation",
      "Complete a Pre-Cana program or equivalent preparation course",
      "Gather required documents (baptismal certificates, freedom to marry, etc.)",
      "Plan the wedding liturgy with the celebrant",
    ],
    scheduling: "Contact the parish office at least six months before your desired wedding date. Weddings are typically celebrated on Saturdays.",
    contact: {
      method: "phone",
      label: "Parish Office",
      value: "(914) 273-9724",
    },
    notes: "Non-parishioners may request to be married at St. Patrick in Armonk. Additional guidelines and fees apply.",
  },
  {
    id: "reconciliation",
    name: "Reconciliation (Confession)",
    shortDescription: "Experience God's mercy and forgiveness in the Sacrament of Reconciliation.",
    eligibility: [
      "Any baptized Catholic who has reached the age of reason",
    ],
    preparation: [
      "Examine your conscience before confession",
      "No appointment needed for regular Saturday hours",
    ],
    scheduling: "Every Saturday afternoon before Vigil Mass (4:30–5:00 PM), or by appointment with a priest.",
    contact: {
      method: "phone",
      label: "Parish Office",
      value: "(914) 273-9724",
    },
  },
  {
    id: "anointing",
    name: "Anointing of the Sick",
    shortDescription: "Spiritual strength and healing for those who are seriously ill or preparing for surgery.",
    eligibility: [
      "Any Catholic who is seriously ill, facing surgery, or elderly",
      "May be received more than once",
    ],
    preparation: [
      "Contact the parish office to arrange a visit",
      "In emergencies, call the parish office immediately",
    ],
    scheduling: "Available by appointment. In emergencies, contact the parish office at any time.",
    contact: {
      method: "phone",
      label: "Parish Office",
      value: "(914) 273-9724",
    },
  },
];

/**
 * Get a sacrament policy by ID.
 */
export function getSacramentPolicy(id: string): SacramentPolicy | undefined {
  return DEFAULT_SACRAMENT_POLICIES.find(p => p.id === id);
}

/**
 * Generate a plain-text summary of all sacrament policies for AI context.
 */
export function generateSacramentPoliciesSummary(): string {
  return DEFAULT_SACRAMENT_POLICIES.map(p => {
    const lines = [
      `## ${p.name}`,
      p.shortDescription,
      `Eligibility: ${p.eligibility.join("; ")}`,
      `Preparation: ${p.preparation.join("; ")}`,
      `Scheduling: ${p.scheduling}`,
      `Contact: ${p.contact.label} — ${p.contact.value}`,
    ];
    if (p.notes) lines.push(`Note: ${p.notes}`);
    return lines.join("\n");
  }).join("\n\n");
}
