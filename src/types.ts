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
  industry: string;
  city: string;
  latitude: number;
  longitude: number;
}
