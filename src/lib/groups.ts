export interface Group {
  name: string;
  teams: string[];
}

export const groups: Group[] = [
  {
    name: 'A',
    teams: ['MX', 'ZA', 'KR', 'CZ'],
  },
  {
    name: 'B',
    teams: ['CA', 'BA', 'QA', 'CH'],
  },
  {
    name: 'C',
    teams: ['BR', 'MA', 'HT', 'GB-SCT'],
  },
  {
    name: 'D',
    teams: ['US', 'PY', 'AU', 'TR'],
  },
  {
    name: 'E',
    teams: ['DE', 'CW', 'CI', 'EC'],
  },
  {
    name: 'F',
    teams: ['NL', 'JP', 'SE', 'TN'],
  },
  {
    name: 'G',
    teams: ['BE', 'EG', 'IR', 'NZ'],
  },
  {
    name: 'H',
    teams: ['ES', 'CV', 'SA', 'UY'],
  },
  {
    name: 'I',
    teams: ['FR', 'SN', 'IQ', 'NO'],
  },
  {
    name: 'J',
    teams: ['AR', 'DZ', 'AT', 'JO'],
  },
  {
    name: 'K',
    teams: ['PT', 'CD', 'UZ', 'CO'],
  },
  {
    name: 'L',
    teams: ['GB-ENG', 'HR', 'GH', 'PA'],
  },
];

export function getGroupByName(name: string): Group | undefined {
  return groups.find((group) => group.name === name);
}
