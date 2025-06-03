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
]

export function getLeaderBiography(id: string): LeaderBiography | undefined {
  return leaderBiographies.find((bio) => bio.id === id)
}

export function getAllLeaderBiographies(): LeaderBiography[] {
  return leaderBiographies
}
