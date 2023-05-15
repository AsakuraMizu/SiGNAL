export function calculateRating(levelBase: number, score: number) {
  let result = 0;
  if (score >= 1009000) result = levelBase + 215; //SSS+
  else if (score >= 1007500) result = levelBase + 200 + (score - 1007500) / 100; //SSS
  else if (score >= 1005000) result = levelBase + 150 + (score - 1005000) / 50; //SS+
  else if (score >= 1000000) result = levelBase + 100 + (score - 1000000) / 100; //SS
  else if (score >= 975000) result = levelBase + (score - 975000) / 250; //S+, S
  else if (score >= 925000) result = levelBase - 300 + ((score - 925000) * 3) / 500; //AA
  else if (score >= 900000) result = levelBase - 500 + ((score - 900000) * 4) / 500; //A
  else if (score >= 800000) result = (levelBase - 500) / 2 + ((score - 800000) * ((levelBase - 500) / 2)) / 100000; //BBB
  return Math.floor(result); //C
}

export function getRank(score: number) {
  if (score >= 1009000) return 'SSS+';
  if (score >= 1007500) return 'SSS';
  if (score >= 1005000) return 'SS+';
  if (score >= 1000000) return 'SS';
  if (score >= 990000) return 'S+';
  if (score >= 975000) return 'S';
  if (score >= 950000) return 'AAA';
  if (score >= 925000) return 'AA';
  if (score >= 900000) return 'A';
  if (score >= 800000) return 'BBB';
  if (score >= 700000) return 'BB';
  if (score >= 600000) return 'B';
  if (score >= 500000) return 'C';
  return 'D';
}

export const levelNames = ['BASIC', 'ADVANCED', 'EXPERT', 'MASTER', 'ULTIMA', "WORLD'S END"];
export const levelNamesShort = ['BAS', 'ADV', 'EXP', 'MAS', 'ULT', "WE"];
