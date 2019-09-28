export enum Genders {
  male = "male",
  female = "female",
  other = "other",
}
export type Gender = keyof typeof Genders;

export interface Respondent {
  firstName: string;
  gender: Gender;
  jobTitle: string;
  industries: string[];
  city: string;
  latitude: number;
  longitude: number;
}

export type GenderOption = "N/A" | Gender;
 // ^ Not sure if this is correct with non-N/A values

export interface Project {
  numberOfParticipants: number;
  timezone: string;
  cities: CityInfo[];
  genders: GenderOption;
  country: string;
  incentive: number;
  name: string;
  professionalJobTitles: string[];
  professionalIndustry: string[];
  eduction: string[];
}

export interface CityInfo {
  location: LocationInfo;
}

export interface LocationInfo {
  id?: string;
  city: string;
  state: string;
  country: string;
  formattedAddress: string;
  location: GeoCoordinate2D;
}

export interface GeoCoordinate2D {
  latitude: number;
  longitude: number;
}
