export const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export type Weekday = (typeof WEEKDAYS)[number];

export type HappyHourSpecial = {
  id: string;
  title: string;
  description: string;
  days: Weekday[];
  allDay: boolean;
  startTime: string | null;
  endTime: string | null;
};

export type UserProfile = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
};

export type Restaurant = {
  id: string;
  name: string;
  address: string;
  website: string;
  logoUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  specials: HappyHourSpecial[];
  createdAt: string;
  createdBy: string | null;
  contributor?: UserProfile | null;
  updatedAt: string | null;
  updatedBy: string | null;
  editor?: UserProfile | null;
};
