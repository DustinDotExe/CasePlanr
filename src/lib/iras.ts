export const IRAS_DOMAINS = [
  'Criminal History',
  'Education, Employment, and Financial',
  'Family and Social Support',
  'Substance Use',
  'Peer Associations',
  'Criminal Attitudes and Behaviors',
] as const;

export type IrasDomain = (typeof IRAS_DOMAINS)[number];
