const schemes = [
  {
    id: "SCH-001",
    title: "PM-KISAN Samman Nidhi",
    description:
      "Eligible farmers receive financial assistance under the PM-KISAN scheme.",
    category: "Agriculture",
    eligibility:
      "Eligible landholding farmer families as per applicable government rules.",
    benefits:
      "Financial assistance provided directly to eligible beneficiaries.",
    applicationUrl:
      "https://pmkisan.gov.in/",
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  {
    id: "SCH-002",
    title: "Pradhan Mantri Awas Yojana",
    description:
      "Housing support scheme for eligible beneficiaries.",
    category: "Housing",
    eligibility:
      "Eligible households meeting the applicable scheme criteria.",
    benefits:
      "Housing assistance as provided under the applicable PMAY program.",
    applicationUrl:
      "https://pmaymis.gov.in/",
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  {
    id: "SCH-003",
    title: "National Scholarship Scheme",
    description:
      "Scholarship support for eligible students.",
    category: "Education",
    eligibility:
      "Students meeting the eligibility conditions of the applicable scholarship.",
    benefits:
      "Financial support for eligible students.",
    applicationUrl:
      "https://scholarships.gov.in/",
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  {
    id: "SCH-004",
    title: "Ayushman Bharat",
    description:
      "Healthcare coverage support for eligible beneficiaries.",
    category: "Health",
    eligibility:
      "Beneficiaries meeting the applicable eligibility criteria.",
    benefits:
      "Healthcare benefits as provided under the applicable program.",
    applicationUrl:
      "https://pmjay.gov.in/",
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  {
    id: "SCH-005",
    title: "Skill Development Scheme",
    description:
      "Skill training and development opportunities for eligible citizens.",
    category: "Employment",
    eligibility:
      "Citizens meeting the eligibility requirements of the selected training program.",
    benefits:
      "Access to eligible skill development and training opportunities.",
    applicationUrl:
      "https://www.skillindia.gov.in/",
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

module.exports = schemes;