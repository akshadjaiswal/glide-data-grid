export type PerformanceSeries = {
  values: number[]
  color: string
}

export type EmployeeRow = {
  id: number
  email: string
  firstName: string
  lastName: string
  optIn: boolean
  title: string
  website: string
  performance: PerformanceSeries
  manager: {
    name: string
    avatar: string
  }
  hiredAt: Date
}

const firstNames = [
  'Sydney',
  'Lisa',
  'Kassandra',
  'Jerald',
  'Kylee',
  'Myrtis',
  'Dayna',
  'Paul',
  'Ilene',
  'Eliza',
  'Edwin',
  'Major',
  'Kyle',
  'Nora',
  'Cydney',
  'Isaiah',
  'Bettye',
  'Albin',
  'Ali',
  'Delores',
  'Travis',
  'Theodore',
  'Jayden',
  'Oswald',
  'Curtis',
  'Constance',
  'Hilma',
  'Stefanie',
  'Chadrick',
  'Niko',
]

const lastNames = [
  'Pfeffer',
  'Faraney',
  'Wolf',
  'Smitham',
  'White',
  'Walsh',
  'Padberg',
  'Koelpin',
  'Kassulke',
  'Pollich',
  'Hauck',
  'Bauch',
  'Schaefer',
  'Nolan',
  'Green',
  'Mayer',
  'Feeney',
  'Friesen',
  'Stamm',
  'Considine',
  'Fritsch',
  'Hintz',
  'Roob',
  'Runte',
  'Schaefer',
  'Daugherty',
  'Schowalter',
  'Balistreri',
  'Rowe',
  'Grady',
]

const titles = [
  'Global Integration Manager',
  'Senior Implementation Assistant',
  'Legacy Creative Agent',
  'Global Security Designer',
  'Chief Directives Specialist',
  'Senior Solutions Liaison',
  'Lead Mobility Strategist',
  'District Functionality Coordinator',
  'Regional Infrastructure Developer',
  'Legacy Creative Associate',
  'District Applications Architect',
  'Human Quality Associate',
  'Customer Division Administrator',
  'Lead Infrastructure Agent',
  'Principal Data Developer',
  'Dynamic Research Manager',
  'Chief Accountability Architect',
  'Product Infrastructure Director',
  'Customer Experience Consultant',
  'Lead Assurance Strategist',
  'Product Metrics Coordinator',
  'Marketing Functionality Engineer',
  'Senior Markets Director',
  'Lead Assurance Analyst',
  'Principal Implementation Analyst',
  'Customer Operations Planner',
  'Strategic Infrastructure Partner',
]

const domains = ['hotmail.com', 'gmail.com', 'outlook.com', 'proton.me', 'example.com']
const sites = ['tight-white.biz', 'calm-den.name', 'lavish-supernatural.biz', 'noxious-concept.net', 'jittery-mascara.info', 'ugly-quartet.info']

const managerPool = [
  { name: 'Clementine Gerlach', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1' },
  { name: 'Shanelle Goyette', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce' },
  { name: 'Zetta Stokes', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb' },
  { name: 'Cornelius Tremblay', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e' },
  { name: 'Christina Stamm', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1' },
  { name: 'Akeem Considine', avatar: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab' },
  { name: 'Travis Fritsch', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e' },
  { name: 'Mattie Hintz', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1' },
  { name: 'Zoe Roob', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce' },
  { name: 'Norbert Runte', avatar: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab' },
  { name: 'Victoria Schaefer', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330' },
  { name: 'Mac Daugherty', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e' },
]

const performancePalettes = ['#61b2c7', '#d7825f', '#7db05a', '#5b7fd1', '#d1668f']

const makeSeeded = (seed: number) => {
  let value = seed % 2147483647
  if (value <= 0) value += 2147483646
  return () => {
    value = (value * 16807) % 2147483647
    return (value - 1) / 2147483646
  }
}

const generatePerformance = (seed: number, points = 26): PerformanceSeries => {
  const rand = makeSeeded(seed + 11)
  let trend = rand() * 0.6 + 0.2
  const values: number[] = []

  for (let i = 0; i < points; i += 1) {
    const noise = (rand() - 0.5) * 0.35
    trend += noise
    values.push(trend)
  }

  const color = performancePalettes[seed % performancePalettes.length]
  return { values, color }
}

export const buildEmployees = (count = 50, seedOffset = 0): EmployeeRow[] =>
  Array.from({ length: count }, (_, index) => {
    const rowSeed = index + seedOffset
    const firstName = firstNames[(index + seedOffset) % firstNames.length] ?? `User${index + 1}`
    const lastName = lastNames[(index * 3 + seedOffset) % lastNames.length] ?? `Example${index + 1}`
    const emailDomain = domains[(index + seedOffset) % domains.length]
    const email = `${firstName}.${lastName}${index + 1}@${emailDomain}`.toLowerCase()
    const title = titles[(index * 2 + 3 + seedOffset) % titles.length]
    const manager = managerPool[(index + seedOffset) % managerPool.length]
    const optIn = (index + 2 + seedOffset) % 3 !== 0
    const website = `https://${sites[(index + seedOffset) % sites.length]}`
    const performance = generatePerformance(rowSeed + 5)
    const hiredAt = new Date(2024, 0, 12 + index * 7 + (seedOffset % 5))

    return {
      id: index + 1,
      email,
      firstName,
      lastName,
      optIn,
      title,
      website,
      performance,
      manager,
      hiredAt,
    }
  })

export const employees = buildEmployees(50)
