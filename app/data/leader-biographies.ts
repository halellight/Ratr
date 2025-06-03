export interface LeaderBiography {
  id: string
  fullName: string
  position: string
  category: string
  biography: string
  keyAchievements: string[]
  currentFocus: string[]
  yearsInOffice: string
  education?: string
  previousRoles?: string[]
  socialMedia?: {
    twitter?: string
    facebook?: string
    instagram?: string
  }
}

const leaderBiographies: LeaderBiography[] = [
  {
    id: "president",
    fullName: "Bola Ahmed Tinubu",
    position: "President of Nigeria",
    category: "Executive",
    biography:
      "Bola Ahmed Tinubu is the 16th President of Nigeria, having assumed office on May 29, 2023. A former Governor of Lagos State (1999-2007), he is known for his political acumen and economic reforms.",
    keyAchievements: [
      "Transformed Lagos State's economy during his tenure as Governor",
      "Increased Lagos State's internally generated revenue significantly",
      "Established the Lagos State Resident Registration Agency (LASRRA)",
      "Pioneered the Bus Rapid Transit (BRT) system in Lagos",
    ],
    currentFocus: [
      "Economic recovery and growth",
      "Infrastructure development",
      "Security improvements",
      "Youth empowerment programs",
    ],
    yearsInOffice: "2023-Present",
    education: "Chicago State University, USA",
    previousRoles: ["Governor of Lagos State", "Senator for Lagos West"],
  },
  {
    id: "vp",
    fullName: "Kashim Shettima",
    position: "Vice President of Nigeria",
    category: "Executive",
    biography:
      "Kashim Shettima is the Vice President of Nigeria and former Governor of Borno State. He has extensive experience in banking and public administration.",
    keyAchievements: [
      "Successfully governed Borno State during challenging security situations",
      "Implemented education reforms in Borno State",
      "Former banker with extensive financial sector experience",
      "Advocate for Northern Nigeria development",
    ],
    currentFocus: [
      "Supporting presidential initiatives",
      "Northern Nigeria development",
      "Security coordination",
      "Economic policy implementation",
    ],
    yearsInOffice: "2023-Present",
    education: "University of Maiduguri",
    previousRoles: ["Governor of Borno State", "Commissioner for Local Government and Chieftaincy Affairs"],
  },
  {
    id: "finance",
    fullName: "Wale Edun",
    position: "Minister of Finance & Coordinating Minister of the Economy",
    category: "Economic Team",
    biography:
      "Wale Edun is an experienced economist and former Commissioner for Finance in Lagos State. He has extensive experience in economic policy and financial management.",
    keyAchievements: [
      "Former Commissioner for Finance, Lagos State",
      "Instrumental in Lagos State's economic transformation",
      "Extensive experience in economic policy formulation",
      "Former investment banker",
    ],
    currentFocus: ["Economic stabilization", "Fiscal policy reforms", "Revenue generation", "Investment promotion"],
    yearsInOffice: "2023-Present",
    education: "Harvard Business School, University of Cambridge",
    previousRoles: ["Commissioner for Finance, Lagos State", "Investment Banker"],
  },
  {
    id: "marine",
    fullName: "Gboyega Oyetola",
    position: "Minister of Marine and Blue Economy",
    category: "Infrastructure",
    biography: "Gboyega Oyetola is a Nigerian politician and former Governor of Osun State (2018–2022). He currently serves as the Minister of Marine and Blue Economy, a position he assumed in August 2023.",
    keyAchievements: [
      "Served as Governor of Osun State from 2018 to 2022",
      "Established the Ministry of Marine and Blue Economy in Nigeria",
      "Promoted maritime infrastructure development"
    ],
    currentFocus: [
      "Enhancing Nigeria's maritime economy",
      "Developing blue economy policies",
      "Improving port efficiency and security"
    ],
    yearsInOffice: "2023–Present",
    education: "University of Lagos",
    previousRoles: ["Governor of Osun State", "Chief of Staff to the Governor of Osun State"],
    socialMedia: {
      twitter: "https://twitter.com/GboyegaOyetola"
    }
  },
  {
    id: "education",
    fullName: "Tunji Alausa",
    position: "Minister of Education",
    category: "Education",
    biography: "Dr. Tunji Alausa is a Nigerian medical doctor specializing in nephrology. He was appointed as the Minister of Education in October 2024, having previously served as Minister of State for Health and Social Welfare.",
    keyAchievements: [
      "Served as Minister of State for Health and Social Welfare",
      "Appointed as Minister of Education in 2024",
      "Advocated for educational reforms and improved healthcare"
    ],
    currentFocus: [
      "Enhancing Nigeria's educational system",
      "Promoting STEM education",
      "Improving access to quality education"
    ],
    yearsInOffice: "2024–Present",
    education: "University of Lagos",
    previousRoles: ["Minister of State for Health and Social Welfare", "Medical Practitioner"],
    socialMedia: {}
  },

  {
    id: "health",
    fullName: "Ali Pate",
    position: "Minister of Health and Social Welfare",
    category: "Health",
    biography:
      "Ali Pate is a renowned health expert and former CEO of the National Primary Health Care Development Agency. He has extensive experience in public health and healthcare policy.",
    keyAchievements: [
      "Former CEO of the National Primary Health Care Development Agency",
      "Led Nigeria's polio eradication efforts",
      "Expert in global health policy and management",
      "Advocate for universal health coverage",
    ],
    currentFocus: [
      "Strengthening primary healthcare systems",
      "Improving maternal and child health",
      "Healthcare financing reforms",
      "Disease prevention and control",
    ],
    yearsInOffice: "2023-Present",
    education: "Harvard University, University of Maiduguri",
    previousRoles: ["CEO, National Primary Health Care Development Agency", "Professor of Global Health"],
  },
  {
    id: "agriculture",
    fullName: "Abubakar Kyari",
    position: "Minister of Agriculture and Food Security",
    category: "Agriculture",
    biography: "Abubakar Kyari is a Nigerian politician and former senator. He was appointed as the Minister of Agriculture and Food Security in August 2023.",
    keyAchievements: [
      "Served as Senator representing Borno North",
      "Advocated for agricultural development policies",
      "Promoted food security initiatives"
    ],
    currentFocus: [
      "Enhancing Nigeria's agricultural productivity",
      "Promoting sustainable farming practices",
      "Improving food distribution networks"
    ],
    yearsInOffice: "2023–Present",
    education: "University of Tennessee, USA",
    previousRoles: ["Senator, Borno North", "Businessman"],
    socialMedia: {}
  },

  {
    id: "power",
    fullName: "Adebayo Adelabu",
    position: "Minister of Power",
    category: "Energy",
    biography: "Adebayo Adelabu is a Nigerian banker and politician. He was appointed as the Minister of Power in August 2023.",
    keyAchievements: [
      "Former Deputy Governor of the Central Bank of Nigeria",
      "Advocated for power sector reforms",
      "Promoted renewable energy initiatives"
    ],
    currentFocus: [
      "Improving electricity generation and distribution",
      "Enhancing renewable energy adoption",
      "Strengthening power infrastructure"
    ],
    yearsInOffice: "2023–Present",
    education: "University of Ibadan (B.Sc.), University of Lagos (MBA)",
    previousRoles: ["Deputy Governor, Central Bank of Nigeria", "Banking Executive"],
    socialMedia: {}
  },
  {
    id: "transport",
    fullName: "David Umahi",
    position: "Minister of Works and Housing",
    category: "Infrastructure",
    biography: "David Umahi is a Nigerian politician and former Governor of Ebonyi State. He was appointed as the Minister of Transportation in August 2023.",
    keyAchievements: [
      "Served as Governor of Ebonyi State from 2015 to 2023",
      "Promoted infrastructure development in Ebonyi State",
      "Advocated for transportation sector reforms"
    ],
    currentFocus: [
      "Enhancing Nigeria's transportation infrastructure",
      "Improving rail and road networks",
      "Promoting multimodal transport systems"
    ],
    yearsInOffice: "2023–Present",
    education: "University of Nigeria, Nsukka (B.Sc. Civil Engineering)",
    previousRoles: ["Governor of Ebonyi State", "Businessman"],
    socialMedia: {}
  },

  
  {
    id: "justice",
    fullName: "Lateef Fagbemi",
    position: "Minister of Justice and Attorney General of the Federation",
    category: "Legal",
    biography: "Lateef Fagbemi is a Senior Advocate of Nigeria (SAN) and seasoned legal practitioner. He was appointed as the Minister of Justice and Attorney General of the Federation in August 2023.",
    keyAchievements: [
      "Conferred with the rank of Senior Advocate of Nigeria in 1998",
      "Appointed as Minister of Justice in 2023",
      "Advocated for judicial reforms and rule of law"
    ],
    currentFocus: [
      "Strengthening Nigeria's legal framework",
      "Promoting judicial independence",
      "Enhancing access to justice"
    ],
    yearsInOffice: "2023–Present",
    education: "University of Jos (LL.B.), Obafemi Awolowo University (LL.M.)",
    previousRoles: ["Legal Practitioner", "Senior Advocate of Nigeria"],
    socialMedia: {}
  },
  {
  id: "aviation",
  fullName: "Festus Keyamo",
  position: "Minister of Aviation and Aerospace Development",
  category: "Transportation",
  biography: "Festus Keyamo is a Nigerian lawyer and human rights activist. He was appointed as the Minister of Aviation and Aerospace Development in August 2023.",
  keyAchievements: [
    "Served as Minister of State for Labour and Employment",
    "Advocated for aviation sector reforms",
    "Promoted safety and efficiency in air travel"
  ],
  currentFocus: [
    "Modernizing Nigeria's aviation infrastructure",
    "Enhancing air safety regulations",
    "Attracting investment in aerospace development"
  ],
  yearsInOffice: "2023–Present",
  education: "Ambrose Alli University",
  previousRoles: ["Minister of State for Labour and Employment", "Legal Practitioner"],
  socialMedia: {
    twitter: "https://twitter.com/fkeyamo"
  }
},







]

export function getLeaderBiography(id: string): LeaderBiography | undefined {
  return leaderBiographies.find((bio) => bio.id === id)
}

export function getAllLeaderBiographies(): LeaderBiography[] {
  return leaderBiographies
}
