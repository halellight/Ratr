export interface LeaderBiography {
  id: string
  fullName: string
  position: string
  category: string
  biography: string
  keyAchievements: string[]
  education: string[]
  careerHighlights: string[]
  currentFocus: string[]
  yearsInOffice: number
  previousRoles: string[]
  controversies?: string[]
  socialMedia?: {
    twitter?: string
    facebook?: string
    instagram?: string
  }
}

export const leaderBiographies: Record<string, LeaderBiography> = {
  president: {
    id: "president",
    fullName: "Bola Ahmed Tinubu",
    position: "President of Nigeria",
    category: "Executive",
    biography:
      "Bola Ahmed Tinubu is a Nigerian politician who has served as the 16th President of Nigeria since May 29, 2023. A former Governor of Lagos State (1999-2007), he is credited with transforming Lagos into Nigeria's commercial hub through innovative policies and infrastructure development.",
    keyAchievements: [
      "Transformed Lagos State's internally generated revenue from ₦600 million to ₦51 billion monthly",
      "Established the Lagos State Resident Registration Agency (LASRRA)",
      "Created the Bus Rapid Transit (BRT) system in Lagos",
      "Founded Alpha Beta Consulting, a major tax consulting firm",
      "Mentored numerous political leaders across Nigeria",
    ],
    education: [
      "Bachelor's degree in Business Administration, Chicago State University (1979)",
      "Various executive education programs",
    ],
    careerHighlights: [
      "Governor of Lagos State (1999-2007)",
      "Senator representing Lagos West (1993-1999)",
      "National Leader of the All Progressives Congress (APC)",
      "President of Nigeria (2023-present)",
    ],
    currentFocus: [
      "Economic recovery and diversification",
      "Infrastructure development",
      "Security improvements",
      "Youth empowerment and job creation",
      "Subsidy removal and economic reforms",
    ],
    yearsInOffice: 2,
    previousRoles: [
      "Governor of Lagos State",
      "Senator",
      "Accountant at Arthur Andersen",
      "Treasurer, Mobil Oil Nigeria",
    ],
  },
  vp: {
    id: "vp",
    fullName: "Kashim Shettima",
    position: "Vice President of Nigeria",
    category: "Executive",
    biography:
      "Kashim Shettima is a Nigerian politician and banker who serves as the 15th Vice President of Nigeria since May 29, 2023. He previously served as Governor of Borno State from 2011 to 2019, leading the state during challenging security situations.",
    keyAchievements: [
      "Led Borno State through the Boko Haram insurgency with resilience",
      "Established multiple educational institutions in Borno State",
      "Implemented agricultural development programs",
      "Built over 1,000 primary and secondary schools",
      "Created job opportunities for over 100,000 youth",
    ],
    education: [
      "Bachelor's degree in Agricultural Economics, University of Maiduguri",
      "Various banking and finance certifications",
    ],
    careerHighlights: [
      "Governor of Borno State (2011-2019)",
      "Senator representing Borno Central (2019-2023)",
      "General Manager, Zenith Bank",
      "Vice President of Nigeria (2023-present)",
    ],
    currentFocus: [
      "Supporting presidential initiatives",
      "Northern Nigeria development",
      "Security coordination",
      "Agricultural development",
      "Youth and women empowerment",
    ],
    yearsInOffice: 2,
    previousRoles: [
      "Governor of Borno State",
      "Senator",
      "Banking Executive at Zenith Bank",
      "Agricultural Economics graduate",
    ],
  },
  finance: {
    id: "finance",
    fullName: "Wale Edun",
    position: "Minister of Finance & Coordinating Minister of the Economy",
    category: "Economic Team",
    biography:
      "Wale Edun is a Nigerian economist and investment banker who serves as Minister of Finance and Coordinating Minister of the Economy. He has extensive experience in financial markets, economic policy, and investment banking across Africa.",
    keyAchievements: [
      "Led economic reforms in Lagos State as Commissioner for Finance",
      "Managed Nigeria's debt restructuring programs",
      "Established innovative financing mechanisms for infrastructure",
      "Implemented tax reforms that increased IGR significantly",
      "Advised on major privatization programs",
    ],
    education: [
      "Bachelor's degree in Economics, University of Lagos",
      "Master's in Economics, Harvard University",
      "Various certifications in finance and economics",
    ],
    careerHighlights: [
      "Commissioner for Finance, Lagos State (1999-2007)",
      "Investment banker with Goldman Sachs",
      "Managing Director, Mandarin Securities",
      "Minister of Finance (2023-present)",
    ],
    currentFocus: [
      "Economic stabilization and growth",
      "Debt management and restructuring",
      "Revenue generation and tax reforms",
      "Investment promotion",
      "Financial sector development",
    ],
    yearsInOffice: 2,
    previousRoles: [
      "Lagos State Commissioner for Finance",
      "Investment Banker",
      "Economic Advisor",
      "Private Sector Executive",
    ],
  },
  health: {
    id: "health",
    fullName: "Prof. Muhammad Ali Pate",
    position: "Coordinating Minister of Health & Social Welfare",
    category: "Social Services",
    biography:
      "Professor Muhammad Ali Pate is a globally recognized health expert and former World Bank Global Director for Health, Nutrition and Population. He has led major health initiatives across Africa and globally, with expertise in health systems strengthening and global health policy.",
    keyAchievements: [
      "Led Nigeria's successful polio eradication campaign",
      "Established the Nigeria Centre for Disease Control (NCDC)",
      "Managed global health programs affecting millions",
      "Implemented innovative health financing mechanisms",
      "Authored numerous publications on global health",
    ],
    education: [
      "MBBS, Ahmadu Bello University",
      "MPH, Harvard School of Public Health",
      "Various fellowships in global health",
    ],
    careerHighlights: [
      "Minister of State for Health (2011-2013)",
      "Global Director, World Bank Health, Nutrition & Population",
      "CEO, Big Win Philanthropy",
      "Coordinating Minister of Health (2023-present)",
    ],
    currentFocus: [
      "Healthcare system strengthening",
      "Universal health coverage",
      "Disease prevention and control",
      "Health workforce development",
      "Digital health transformation",
    ],
    yearsInOffice: 2,
    previousRoles: [
      "World Bank Global Director",
      "Former Minister of State for Health",
      "Global Health Expert",
      "Medical Doctor and Public Health Specialist",
    ],
  },
  works: {
    id: "works",
    fullName: "Dave Umahi",
    position: "Minister of Works",
    category: "Infrastructure",
    biography:
      "Dave Umahi is a Nigerian politician and engineer who serves as Minister of Works. He previously served as Governor of Ebonyi State from 2015 to 2023, where he was known for massive infrastructure development and urban transformation projects.",
    keyAchievements: [
      "Transformed Ebonyi State with modern infrastructure",
      "Built multiple flyovers, roads, and modern buildings",
      "Established Ebonyi State University",
      "Created industrial parks and economic zones",
      "Implemented innovative urban planning projects",
    ],
    education: ["Bachelor's degree in Civil Engineering", "Various engineering and management certifications"],
    careerHighlights: [
      "Governor of Ebonyi State (2015-2023)",
      "Chairman, South East Governors Forum",
      "Civil Engineer and Contractor",
      "Minister of Works (2023-present)",
    ],
    currentFocus: [
      "National road infrastructure development",
      "Bridge construction and maintenance",
      "Highway modernization projects",
      "Infrastructure financing mechanisms",
      "Public-private partnerships in infrastructure",
    ],
    yearsInOffice: 2,
    previousRoles: [
      "Governor of Ebonyi State",
      "Civil Engineer",
      "Construction Company Owner",
      "Infrastructure Development Expert",
    ],
  },
  // Add more biographies for other officials...
}

// Helper function to get biography by ID
export function getLeaderBiography(id: string): LeaderBiography | null {
  return leaderBiographies[id] || null
}

// Helper function to get all biographies
export function getAllBiographies(): LeaderBiography[] {
  return Object.values(leaderBiographies)
}
