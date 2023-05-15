import { globSync } from 'glob';

export const paths = [
  'Z:/data/A000/',
  ...globSync('Z:/bin/option/*'),
]
