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
    fullName: "Dr. Maruf Tunji Alausa",
    position: "Minister of Education",
    category: "Education",
    biography: "Dr. Maruf Tunji Alausa is a distinguished nephrologist and politician. Appointed as Minister of Education in October 2024, he previously served as the Minister of State for Health and Social Welfare.",
    keyAchievements: [
      "Conferred with the National Honour of Commander of the Order of the Niger (CON)",
      "Successfully served as Minister of State for Health and Social Welfare",
      "Renowned medical expert specializing in Nephrology and Internal Medicine"
    ],
    currentFocus: [
      "Abolishing the 18-year age limit for university admission",
      "Integrating AI and digital learning into the national curriculum",
      "Strengthening existing tertiary institutions and vocational training"
    ],
    yearsInOffice: "2024–Present",
    education: "University of Lagos (MBBS), Cook County Hospital (Residency)",
    previousRoles: ["Minister of State for Health", "Medical Director"],
    socialMedia: {}
  },

  {
    id: "fct",
    fullName: "Nyesom Wike",
    position: "Minister of Federal Capital Territory",
    category: "Executive",
    biography: "Nyesom Wike is a prominent Nigerian politician and the current Minister of the Federal Capital Territory. A two-term former Governor of Rivers State (2015–2023), he is known for his aggressive infrastructure development and vocal political presence.",
    keyAchievements: [
      "Transformed Rivers State's infrastructure during his tenure as Governor",
      "Pioneered massive urban renewal projects in Port Harcourt",
      "Served as Minister of State for Education under the Jonathan administration"
    ],
    currentFocus: [
      "Modernizing FCT infrastructure",
      "Improving security in the capital",
      "Restoring the Abuja Master Plan"
    ],
    yearsInOffice: "2023–Present",
    education: "Rivers State University of Science and Technology",
    previousRoles: ["Governor of Rivers State", "Minister of State for Education"],
  },
  {
    id: "budget",
    fullName: "Atiku Bagudu",
    position: "Minister of Budget and Economic Planning",
    category: "Economic Team",
    biography: "Atiku Bagudu is a seasoned economist and politician. He served as the Governor of Kebbi State from 2015 to 2023 and currently coordinates Nigeria's national budget and economic strategies.",
    keyAchievements: [
      "Pioneered the Lake Rice project as Governor of Kebbi State",
      "Served as Chairman of the Presidential Steering Committee on the National Development Plan",
      "Extensive legislative experience in the Nigerian Senate"
    ],
    currentFocus: [
      "Optimizing the national budget process",
      "Driving the National Development Plan 2021-2025",
      "Fiscal policy alignment"
    ],
    yearsInOffice: "2023–Present",
    education: "University of Jos, Columbia University",
    previousRoles: ["Governor of Kebbi State", "Senator for Kebbi Central"],
  },
  {
    id: "industry",
    fullName: "Dr. Jumoke Oduwole",
    position: "Minister of Industry, Trade and Investment",
    category: "Economic Team",
    biography: "Dr. Jumoke Oduwole is a distinguished jurist and policy expert. Previously serving as the Special Adviser to the President on Ease of Doing Business, she has been instrumental in reforming Nigeria's business climate.",
    keyAchievements: [
      "Implemented over 200 reforms as Executive Secretary of PEBEC",
      "Significantly improved Nigeria's ranking in the World Bank Doing Business report",
      "Instrumental in establishing the Nigerian Office for Trade Negotiations (NOTN)"
    ],
    currentFocus: [
      "Expanding industrial capacity",
      "Boosting non-oil exports",
      "Attracting foreign direct investment"
    ],
    yearsInOffice: "2024–Present",
    education: "University of Lagos, Cambridge University, Stanford University",
    previousRoles: ["Special Adviser on Ease of Doing Business (PEBEC)", "University Lecturer"],
  },
  {
    id: "petroleum",
    fullName: "Heineken Lokpobiri",
    position: "Minister of State for Petroleum Resources (Oil)",
    category: "Economic Team",
    biography: "Heineken Lokpobiri is a politician and former senator representing Bayelsa State. He brings extensive experience in petroleum resource management and agricultural policy.",
    keyAchievements: [
      "Served as Minister of State for Agriculture and Rural Development",
      "Legislative leader in the Bayelsa State House of Assembly and the Senate",
      "Driving initiatives to curb oil theft and increase national production"
    ],
    currentFocus: [
      "Increasing crude oil production",
      "Securing petroleum infrastructure",
      "Attracting investment in the upstream sector"
    ],
    yearsInOffice: "2023–Present",
    education: "Rivers State University of Science and Technology",
    previousRoles: ["Minister of State for Agriculture", "Senator for Bayelsa West"],
  },
  {
    id: "petroleum_gas",
    fullName: "Ekperikpe Ekpo",
    position: "Minister of State for Petroleum Resources (Gas)",
    category: "Economic Team",
    biography: "Ekperikpe Ekpo is a politician and former member of the House of Representatives. He oversees the strategic development of Nigeria's vast gas reserves.",
    keyAchievements: [
      "Promoting Nigeria's 'Decade of Gas' initiative",
      "Advocating for gas-to-power infrastructure development",
      "Successful legislative career in the House of Representatives"
    ],
    currentFocus: [
      "Exploiting natural gas for industrial growth",
      "Promoting LPG and CNG adoption",
      "Improving gas pipelines and processing plants"
    ],
    yearsInOffice: "2023–Present",
    education: "University of Uyo",
    previousRoles: ["Member, House of Representatives", "Local Government Chairman"],
  },
  {
    id: "solid_minerals",
    fullName: "Dele Alake",
    position: "Minister of Solid Minerals Development",
    category: "Economic Team",
    biography: "Dele Alake is an experienced journalist and communication strategist. He previously served as the Commissioner for Information and Strategy in Lagos State and special adviser to the President.",
    keyAchievements: [
      "Spearheading the 7-Point Agenda for Solid Minerals Development",
      "Established the Nigerian Mining Corporation",
      "Instrumental in Lagos State's strategic communication during the Tinubu governorship"
    ],
    currentFocus: [
      "Formalizing the mining sector",
      "Attracting diverse investments in minerals",
      "Combating illegal mining activities"
    ],
    yearsInOffice: "2023–Present",
    education: "University of Lagos",
    previousRoles: ["Commissioner for Information, Lagos State", "Special Adviser on Strategy"],
  },
  {
    id: "marine_economy",
    fullName: "Adegboyega Oyetola",
    position: "Minister of Marine and Blue Economy",
    category: "Economic Team",
    biography: "Adegboyega Oyetola is the pioneer Minister of the Ministry of Marine and Blue Economy. A former Governor of Osun State, he possesses deep expertise in finance and public administration.",
    keyAchievements: [
      "Served as Governor of Osun State (2018-2022)",
      "Implemented significant infrastructure and health reforms in Osun",
      "Leading the national transition to a blue-economy-driven wealth-creation model"
    ],
    currentFocus: [
      "Harnessing maritime resources for revenue",
      "Modernizing Nigerian ports",
      "Promoting sustainable fishing and shipping"
    ],
    yearsInOffice: "2023–Present",
    education: "University of Lagos",
    previousRoles: ["Governor of Osun State", "Chief of Staff to the Governor of Osun State"],
  },
  {
    id: "humanitarian",
    fullName: "Dr. Nentawe Yilwatda",
    position: "Minister of Humanitarian Affairs & Poverty Reduction",
    category: "Social Services",
    biography: "Dr. Nentawe Yilwatda is an academic and engineer with a strong background in ICT and digital systems. He is tasked with reforming Nigeria's humanitarian and social welfare systems.",
    keyAchievements: [
      "Resident Electoral Commissioner (REC) at INEC with focuses on technology integration",
      "Successfully led digital transformation initiatives in the academic sector",
      "Expert in digital systems and e-governance structures"
    ],
    currentFocus: [
      "Rebuilding trust in humanitarian programs",
      "Scaling poverty reduction initiatives",
      "Integrating technology into social welfare distribution"
    ],
    yearsInOffice: "2024–Present",
    education: "University of Nigeria Nsukka (PhD)",
    previousRoles: ["INEC Resident Electoral Commissioner", "University Lecturer"],
  },
  {
    id: "youth",
    fullName: "Dr. Jamila Bio Ibrahim",
    position: "Minister of Youth Development",
    category: "Social Services",
    biography: "Dr. Jamila Bio Ibrahim is a medical doctor and youth activist who previously served as the Senior Special Assistant to the Kwara State Governor on Sustainable Development Goals (SDGs).",
    keyAchievements: [
      "Past President of the Progressive Young Women Forum (PYWF)",
      "Championed youth and gender-focused developmental initiatives in Kwara State",
      "Represented Nigeria at various international youth and climate forums"
    ],
    currentFocus: [
      "Youth empowerment and job creation",
      "Enhancing the NYSC scheme",
      "Inclusion of youth in national governance"
    ],
    yearsInOffice: "2023–Present",
    education: "University of Ilorin (MBBS)",
    previousRoles: ["SSA to Kwara Governor on SDGs", "Medical Practitioner"],
  },
  {
    id: "works",
    fullName: "Dave Umahi",
    position: "Minister of Works",
    category: "Infrastructure",
    biography: "Dave Umahi is a civil engineer and politician who served as the Governor of Ebonyi State for two terms. He is known for pioneering concrete road technology in Nigeria.",
    keyAchievements: [
      "Transformed Ebonyi State through massive flyover and road constructions",
      "Successful transition from Governor to Senator and then to Federal Minister",
      "Pioneering the use of cement/concrete road construction on federal highways"
    ],
    currentFocus: [
      "Expediting the completion of major federal highways",
      "Advocating for concrete-based road durability",
      "Reviving neglected bridge and road infrastructure"
    ],
    yearsInOffice: "2023–Present",
    education: "Enugu State University of Science and Technology",
    previousRoles: ["Governor of Ebonyi State", "Senator for Ebonyi South"],
  },
  {
    id: "housing",
    fullName: "Ahmed Musa Dangiwa",
    position: "Minister of Housing & Urban Development",
    category: "Infrastructure",
    biography: "Ahmed Musa Dangiwa is an architect and the former Managing Director of the Federal Mortgage Bank of Nigeria (FMBN). He brings a wealth of experience in the housing and mortgage sector.",
    keyAchievements: [
      "Led reforms at FMBN that increased the capital base and national housing fund contributions",
      "Professional architect with decades of project management experience",
      "Advocate for affordable and accessible housing for all Nigerians"
    ],
    currentFocus: [
      "Closing the national housing deficit gap",
      "Driving the 'Renewed Hope Cities' project",
      "Reforming mortgage and land administration systems"
    ],
    yearsInOffice: "2023–Present",
    education: "Ahmadu Bello University",
    previousRoles: ["MD, Federal Mortgage Bank of Nigeria", "Professional Architect"],
  },
  {
    id: "transport",
    fullName: "Said Alkali",
    position: "Minister of Transportation",
    category: "Infrastructure",
    biography: "Said Alkali is a seasoned politician and former three-term senator representing Gombe North. He oversees the development of Nigeria's rail and terminal infrastructure.",
    keyAchievements: [
      "Served as Chairman of the Senate Committee on Marine Transport",
      "Extensive legislative experience in transportation-related laws",
      "Pushing for the completion of major rail routes (Kano-Maradi, etc.)"
    ],
    currentFocus: [
      "Accelerating the modernization of the rail system",
      "Strengthening inland waterway transportation",
      "Improving logistical efficiency across the nation"
    ],
    yearsInOffice: "2023–Present",
    education: "University of Abuja",
    previousRoles: ["Senator for Gombe North", "Commissioner in Gombe State"],
  },
  {
    id: "communications",
    fullName: "Dr. Bosun Tijani",
    position: "Minister of Communications, Innovation & Digital Economy",
    category: "Infrastructure",
    biography: "Dr. Bosun Tijani is a technology entrepreneur and co-founder of CcHUB, one of Africa's leading tech hubs. He is a key driver of Nigeria's digital transformation agenda.",
    keyAchievements: [
      "Co-founded CcHUB and helped nurture the Nigerian tech ecosystem",
      "PhD in Innovation and Economic Development",
      "Driving the 3MTT program to train 3 million technical talents"
    ],
    currentFocus: [
      "Expanding broadband penetration",
      "Scaling the digital economy and tech exports",
      "Positioning Nigeria as a global hub for AI and technology"
    ],
    yearsInOffice: "2023–Present",
    education: "University of Jos, University of Leicester (PhD)",
    previousRoles: ["Co-founder of CcHUB", "Tech Entrepreneur"],
  },
  {
    id: "regional_development",
    fullName: "Abubakar Momoh",
    position: "Minister of Regional Development",
    category: "Infrastructure",
    biography: "Abubakar Momoh is a seasoned politician and engineer. He previously served as the Minister of Niger Delta Development before the ministry was expanded to cover Regional Development.",
    keyAchievements: [
      "Two-term member of the House of Representatives",
      "Overseeing regional commissions to ensure balanced national growth",
      "Professional engineer with experience in infrastructure planning"
    ],
    currentFocus: [
      "Harmonizing regional development commissions (Niger Delta, North East, etc.)",
      "Addressing regional infrastructure and security needs",
      "Coordinating sustainable development projects across zones"
    ],
    yearsInOffice: "2023–Present",
    education: "University of Benin",
    previousRoles: ["Minister of Niger Delta Development", "Member, House of Representatives"],
  },
  {
    id: "interior",
    fullName: "Olubunmi Tunji-Ojo",
    position: "Minister of Interior",
    category: "Security",
    biography: "Olubunmi Tunji-Ojo is an energetic politician and former member of the House of Representatives. He is known for rapidly reforming passport issuance and internal security protocols.",
    keyAchievements: [
      "Digitized the Nigerian passport application process",
      "Cleared backlogs of over 200,000 passports in weeks",
      "Former Chairman of the House Committee on Niger Delta Development Commission (NDDC)"
    ],
    currentFocus: [
      "Enhancing border security with advanced technology",
      "Reforming the correctional service and civil defense",
      "Promoting seamless internal identity management"
    ],
    yearsInOffice: "2023–Present",
    education: "London Metropolitan University",
    previousRoles: ["Member, House of Representatives", "IT and Business Consultant"],
  },
  {
    id: "defense",
    fullName: "Mohammed Badaru Abubakar",
    position: "Minister of Defense",
    category: "Security",
    biography: "Mohammed Badaru Abubakar is the former Governor of Jigawa State (2015–2023). A successful businessman and diplomat, he is tasked with the strategic coordination of Nigeria's military.",
    keyAchievements: [
      "Awarded for exceptional fiscal transparency as Governor of Jigawa",
      "Extensive experience in international trade and diplomacy",
      "Former President of the Nigerian Association of Chambers of Commerce, Industry, Mines and Agriculture (NACCIMA)"
    ],
    currentFocus: [
      "Enhancing military hardware procurement",
      "Strengthening intelligence coordination",
      "Scaling up the fight against insurgency and banditry"
    ],
    yearsInOffice: "2023–Present",
    education: "Ahmadu Bello University",
    previousRoles: ["Governor of Jigawa State", "Business Leader"],
  },
  {
    id: "foreign_affairs",
    fullName: "Yusuf Tuggar",
    position: "Minister of Foreign Affairs",
    category: "Security",
    biography: "Yusuf Tuggar is a diplomat and former Ambassador of Nigeria to Germany. He is the driver of the '4D' foreign policy doctrine: Development, Democracy, Demography, and Diaspora.",
    keyAchievements: [
      "Successfully facilitated the return of several Benin Bronzes from Germany",
      "Former member of the House of Representatives",
      "Strengthened Nigeria-Germany trade and energy relations during his embassy tenure"
    ],
    currentFocus: [
      "Advancing Nigeria's global influence",
      "Strengthening regional security through international alliances",
      "Engaging the Nigerian diaspora for national growth"
    ],
    yearsInOffice: "2023–Present",
    education: "University of Leicester, University of Cambridge",
    previousRoles: ["Ambassador to Germany", "Member, House of Representatives"],
  },
  {
    id: "foreign_affairs_state",
    fullName: "Bianca Odumegwu-Ojukwu",
    position: "Minister of State for Foreign Affairs",
    category: "Security",
    biography: "Bianca Odumegwu-Ojukwu is a diplomat, lawyer, and former beauty queen. She has previously served as Nigeria's Ambassador to Ghana and the Kingdom of Spain.",
    keyAchievements: [
      "Served as Nigeria's Ambassador to Spain and Ghana",
      "Permanent Representative of Nigeria to the United Nations World Tourism Organization (UNWTO)",
      "Vocal advocate for democratic ideals and international diplomacy"
    ],
    currentFocus: [
      "Enhancing Nigeria's diplomatic footprint",
      "Promoting international trade through foreign relations",
      "Consolidating West African diplomatic ties"
    ],
    yearsInOffice: "2024–Present",
    education: "University of Nigeria Nsukka (LL.B)",
    previousRoles: ["Ambassador to Spain", "Ambassador to Ghana"],
  },
  {
    id: "labour",
    fullName: "Muhammadu Maigari Dingyadi",
    position: "Minister of Labour and Employment",
    category: "Social Services",
    biography: "Muhammadu Maigari Dingyadi is a seasoned politician who previously served as the Minister of Police Affairs. He is currently focused on job creation and industrial harmony in Nigeria.",
    keyAchievements: [
      "Launched the Labour Employment and Empowerment Programme (LEEP)",
      "Oversaw the implementation of the National Minimum Wage Act 2024",
      "Successfully served as Minister of Police Affairs (2019-2023)"
    ],
    currentFocus: [
      "Creating 2.5 million jobs annually through LEEP",
      "Eliminating casualization in the workforce",
      "Modernizing national labor laws"
    ],
    yearsInOffice: "2024–Present",
    education: "Ahmadu Bello University",
    previousRoles: ["Minister of Police Affairs", "Secretary to the State Government, Sokoto"],
  },
  {
    id: "livestock",
    fullName: "Idi Mukhtar Maiha",
    position: "Minister of Livestock Development",
    category: "Economic Team",
    biography: "Idi Mukhtar Maiha is the pioneer Minister of Livestock Development. A former Managing Director of KRPC and an integrated farmer, he brings private sector efficiency to the livestock industry.",
    keyAchievements: [
      "Pioneer Minister of the standalone Ministry of Livestock Development",
      "Founded Zaidi Farms, a world-class integrated enterprise",
      "Extensive management experience at NNPC and KRPC"
    ],
    currentFocus: [
      "Reducing Nigeria's dairy import bill",
      "Modernizing animal husbandry and ranching",
      "Empowering smallholder dairy farmers through PPPs"
    ],
    yearsInOffice: "2024–Present",
    education: "University of Maiduguri, University of Ibadan",
    previousRoles: ["Managing Director, KRPC", "Founder, Zaidi Farms"],
  },
  {
    id: "education_state",
    fullName: "Dr. Suwaiba Said Ahmad",
    position: "Minister of State for Education",
    category: "Social Services",
    biography: "Dr. Suwaiba Said Ahmad is an academic and gender equality advocate. A Professor of Science Education, she focuses on curriculum development and girl-child education.",
    keyAchievements: [
      "First woman from Jigawa State to obtain a PhD in Science Education",
      "Former Director of the Centre for Gender Studies at Bayero University Kano",
      "Advanced to the rank of full Professor of Science Education in 2024"
    ],
    currentFocus: [
      "Enhancing girl-child education in Northern Nigeria",
      "Reforming the science and technology curriculum",
      "Providing consultancy for international educational projects (PLANE, etc.)"
    ],
    yearsInOffice: "2024–Present",
    education: "Bayero University Kano, Ahmadu Bello University (PhD)",
    previousRoles: ["Director, Centre for Gender Studies (BUK)", "Provost, Jigawa College of Education"],
  },
  {
    id: "housing_state",
    fullName: "Rt. Hon. Yusuf Abdullahi Ata",
    position: "Minister of State for Housing and Urban Development",
    category: "Infrastructure",
    biography: "Yusuf Abdullahi Ata is an economist and former Speaker of the Kano State House of Assembly. He brings deep legislative and developmental experience to the housing sector.",
    keyAchievements: [
      "Former Speaker of the Kano State House of Assembly",
      "Instrumental in the passage of key state health and housing laws",
      "Extensive experience in urban renewal and public infrastructure planning"
    ],
    currentFocus: [
      "Accelerating 'Renewed Hope Housing' projects",
      "Enhancing urban planning frameworks",
      "Promoting public-private partnerships for affordable housing"
    ],
    yearsInOffice: "2024–Present",
    education: "Bayero University Kano",
    previousRoles: ["Speaker, Kano State House of Assembly", "Majority Leader, Kano State House of Assembly"],
  }
]

export function getLeaderBiography(id: string): LeaderBiography | undefined {
  return leaderBiographies.find((bio) => bio.id === id)
}

export function getAllLeaderBiographies(): LeaderBiography[] {
  return leaderBiographies
}
