export interface LeaderBiography {
  id: string
  name: string
  position: string
  biography: string
  achievements: string[]
  education: string[]
  yearsInOffice: number
  previousRoles: string[]
  currentFocus: string[]
  personalInfo: {
    birthYear: number
    stateOfOrigin: string
    languages: string[]
  }
  socialMedia?: {
    twitter?: string
    facebook?: string
    instagram?: string
  }
}

export const leaderBiographies: Record<string, LeaderBiography> = {
  president: {
    id: "president",
    name: "Bola Ahmed Tinubu",
    position: "President of Nigeria",
    biography:
      "Bola Ahmed Tinubu is the 16th President of Nigeria, having assumed office on May 29, 2023. A former Governor of Lagos State (1999-2007), he is credited with transforming Lagos into Nigeria's commercial hub. Known as a political strategist and kingmaker, Tinubu has been instrumental in Nigerian politics for over two decades.",
    achievements: [
      "Transformed Lagos State's internally generated revenue from ₦600 million to ₦51 billion monthly",
      "Established the Lagos State Resident Registration Agency (LASRRA)",
      "Created the Lagos State Traffic Management Authority (LASTMA)",
      "Founded the Alpha Beta Consulting firm",
      "Instrumental in forming the All Progressives Congress (APC)",
    ],
    education: [
      "Chicago State University - Bachelor's degree in Business Administration",
      "Richard J. Daley College - Associate degree",
    ],
    yearsInOffice: 1,
    previousRoles: [
      "Governor of Lagos State (1999-2007)",
      "Senator representing Lagos West (1993-1999)",
      "Accountant at Arthur Andersen",
      "Executive at Mobil Oil Nigeria",
    ],
    currentFocus: [
      "Economic reforms and diversification",
      "Infrastructure development",
      "Security improvements",
      "Youth empowerment programs",
      "Foreign investment attraction",
    ],
    personalInfo: {
      birthYear: 1952,
      stateOfOrigin: "Lagos",
      languages: ["English", "Yoruba", "Hausa"],
    },
    socialMedia: {
      twitter: "@officialABAT",
      facebook: "Bola Ahmed Tinubu",
      instagram: "@bolaahmedtinubu",
    },
  },
  vp: {
    id: "vp",
    name: "Kashim Shettima",
    position: "Vice President of Nigeria",
    biography:
      "Kashim Shettima is the Vice President of Nigeria, serving alongside President Bola Tinubu since May 29, 2023. A former Governor of Borno State (2011-2019), he led the state during challenging times including the Boko Haram insurgency. He previously served as a Senator representing Borno Central.",
    achievements: [
      "Successfully managed Borno State during Boko Haram crisis",
      "Established the Borno State University",
      "Created over 10,000 jobs through various programs",
      "Improved healthcare delivery in Borno State",
      "Enhanced agricultural productivity in the Northeast",
    ],
    education: [
      "University of Maiduguri - Bachelor's degree in Agricultural Economics",
      "University of Ibadan - Master's degree in Agricultural Economics",
    ],
    yearsInOffice: 1,
    previousRoles: [
      "Governor of Borno State (2011-2019)",
      "Senator representing Borno Central (2019-2023)",
      "Commissioner for Local Government and Chieftaincy Affairs, Borno State",
      "Banking executive at various institutions",
    ],
    currentFocus: [
      "Northeast development and reconstruction",
      "Agricultural transformation",
      "Security coordination",
      "Economic policy implementation",
      "International relations",
    ],
    personalInfo: {
      birthYear: 1966,
      stateOfOrigin: "Borno",
      languages: ["English", "Hausa", "Kanuri", "Arabic"],
    },
    socialMedia: {
      twitter: "@KashimSM",
      facebook: "Kashim Shettima",
    },
  },
  senate_president: {
    id: "senate_president",
    name: "Godswill Akpabio",
    position: "Senate President",
    biography:
      "Godswill Akpabio is the current Senate President of Nigeria, elected in June 2023. A former Governor of Akwa Ibom State (2007-2015) and former Minister of Niger Delta Affairs (2019-2022), he has extensive experience in both executive and legislative governance.",
    achievements: [
      "Transformed Akwa Ibom State infrastructure during governorship",
      "Established the Akwa Ibom State University",
      "Completed numerous road and bridge projects",
      "Enhanced oil and gas sector development as Niger Delta Minister",
      "Promoted peace and development in the Niger Delta region",
    ],
    education: ["University of Calabar - Bachelor of Laws (LL.B)", "Nigerian Law School - Barrister at Law (BL)"],
    yearsInOffice: 1,
    previousRoles: [
      "Governor of Akwa Ibom State (2007-2015)",
      "Minister of Niger Delta Affairs (2019-2022)",
      "Senator representing Akwa Ibom North-West (2015-2019, 2023-present)",
      "Legal practitioner",
    ],
    currentFocus: [
      "Legislative reforms and efficiency",
      "Constitutional review processes",
      "Inter-governmental relations",
      "Niger Delta development",
      "Legal and judicial reforms",
    ],
    personalInfo: {
      birthYear: 1962,
      stateOfOrigin: "Akwa Ibom",
      languages: ["English", "Ibibio", "Efik"],
    },
  },
  house_speaker: {
    id: "house_speaker",
    name: "Tajudeen Abbas",
    position: "Speaker of the House of Representatives",
    biography:
      "Tajudeen Abbas is the Speaker of the House of Representatives, elected in June 2023. Representing Zaria Federal Constituency of Kaduna State, he has been a consistent advocate for legislative excellence and democratic governance. He brings extensive experience in parliamentary procedures and constituency representation.",
    achievements: [
      "Championed numerous legislative bills for constituency development",
      "Promoted educational advancement in Northern Nigeria",
      "Advocated for improved healthcare delivery systems",
      "Enhanced agricultural development programs",
      "Strengthened democratic institutions through legislative oversight",
    ],
    education: [
      "Ahmadu Bello University - Bachelor's degree in Quantity Surveying",
      "Various professional development programs in governance and leadership",
    ],
    yearsInOffice: 1,
    previousRoles: [
      "Member, House of Representatives (2011-present)",
      "Chairman, House Committee on Land Transport",
      "Member, various House committees",
      "Quantity Surveyor in private practice",
    ],
    currentFocus: [
      "Legislative efficiency and productivity",
      "Constitutional amendments",
      "Economic legislation",
      "Infrastructure development laws",
      "Democratic strengthening",
    ],
    personalInfo: {
      birthYear: 1963,
      stateOfOrigin: "Kaduna",
      languages: ["English", "Hausa", "Fulfulde"],
    },
  },
  cjn: {
    id: "cjn",
    name: "Olukayode Ariwoola",
    position: "Chief Justice of Nigeria",
    biography:
      "Justice Olukayode Ariwoola is the Chief Justice of Nigeria, having assumed office in June 2022. With over three decades of judicial experience, he has served in various capacities within the Nigerian judiciary, including as a Justice of the Supreme Court since 2011.",
    achievements: [
      "Over 30 years of distinguished judicial service",
      "Contributed to landmark Supreme Court judgments",
      "Enhanced judicial administration and case management",
      "Promoted judicial independence and integrity",
      "Advanced legal education and judicial training",
    ],
    education: [
      "University of Ife (now Obafemi Awolowo University) - Bachelor of Laws (LL.B)",
      "Nigerian Law School - Barrister at Law (BL)",
      "Various judicial training programs",
    ],
    yearsInOffice: 2,
    previousRoles: [
      "Justice of the Supreme Court (2011-2022)",
      "Justice of the Court of Appeal (2005-2011)",
      "Chief Judge of Oyo State (2010-2011)",
      "High Court Judge in Oyo State",
      "Legal practitioner",
    ],
    currentFocus: [
      "Judicial reforms and modernization",
      "Case backlog reduction",
      "Judicial independence",
      "Legal education enhancement",
      "Access to justice improvement",
    ],
    personalInfo: {
      birthYear: 1958,
      stateOfOrigin: "Oyo",
      languages: ["English", "Yoruba"],
    },
  },
  finance_minister: {
    id: "finance_minister",
    name: "Wale Edun",
    position: "Minister of Finance and Coordinating Minister of the Economy",
    biography:
      "Wale Edun is Nigeria's Minister of Finance and Coordinating Minister of the Economy. An accomplished economist and investment banker with over 30 years of experience in financial markets, he previously served as Commissioner for Finance in Lagos State under Governor Bola Tinubu.",
    achievements: [
      "Instrumental in Lagos State's revenue transformation",
      "Led major financial sector reforms",
      "Managed significant investment portfolios",
      "Promoted financial inclusion initiatives",
      "Enhanced public financial management systems",
    ],
    education: [
      "Harvard University - Master's in Public Administration",
      "University of Cambridge - Bachelor's degree in Economics",
      "Various professional certifications in finance and economics",
    ],
    yearsInOffice: 1,
    previousRoles: [
      "Commissioner for Finance, Lagos State",
      "Investment banker at various international firms",
      "Financial consultant and advisor",
      "Board member of several financial institutions",
    ],
    currentFocus: [
      "Economic stabilization and growth",
      "Fiscal policy reforms",
      "Revenue generation enhancement",
      "Investment promotion",
      "Financial sector development",
    ],
    personalInfo: {
      birthYear: 1960,
      stateOfOrigin: "Lagos",
      languages: ["English", "Yoruba"],
    },
  },
}

export function getLeaderBiography(id: string): LeaderBiography | null {
  return leaderBiographies[id] || null
}

export function getAllLeaderBiographies(): LeaderBiography[] {
  return Object.values(leaderBiographies)
}
