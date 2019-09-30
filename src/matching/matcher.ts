import { injectable, inject } from "tsyringe";
import { CsvRespondentLoader, RespondentLoader } from "../respondents/loader";
import { CityInfo, Project, Respondent } from "../types";
import { getDistance } from "geolib";

export interface DistanceInfo {
  closestCity: CityInfo;
  value: number;
}

export interface MatchResult {
  score: number;
  distance: DistanceInfo;
  respondent: Respondent;
}

@injectable()
export class Matcher {
  private allRespondents: Respondent[] = [];

  constructor(@inject(CsvRespondentLoader) private respondentLoader: RespondentLoader) {}

  public async initialize(): Promise<void> {
    this.allRespondents = await this.respondentLoader.load();
  }

  public findCandidates(project: Project, maxDistanceInMeters: number): MatchResult[] {
    return this.allRespondents
      .map(r => [r, calculateDistance(project, r)] as [Respondent, DistanceInfo])
      .filter(([_, d]) => d.value < maxDistanceInMeters)
      .map(([r, d]) => calculateMatchResult(project, r, d, maxDistanceInMeters))
      .sort((m1, m2) => m2.score - m1.score)
      .filter((_, i) => i < project.numberOfParticipants);
  }
}

export function calculateDistance(
  project: Project,
  candidate: Respondent
): DistanceInfo | undefined {
  const result = project.cities
    .map(c => [c, getDistance(c.location.location, candidate)] as [CityInfo, number])
    .sort(([_1, d1], [_2, d2]) => d1 - d2)
    .find(() => true);

  if (!result) {
    return;
  }

  return {
    closestCity: result[0],
    value: result[1],
  };
}

/**
 * Calculates score of 0-3 based distance, matching title, and percentage of the 
 * project industries that align with the respondent
 */
function calculateScore(
  project: Project,
  respondent: Respondent,
  distance: DistanceInfo,
  maxDistance: number
): number {
  let score = 0;
  if (project.professionalJobTitles.includes(respondent.jobTitle)) {
    // Consider expanding this to include partial matches?
    score += 1;
  }

  const matchingIndustries = project.professionalIndustry.filter(i =>
    respondent.industries.includes(i)
  );
  score += matchingIndustries.length / project.professionalIndustry.length;

  score += (maxDistance - Math.min(distance.value, maxDistance)) / maxDistance;

  return score;
}

export function calculateMatchResult(
  project: Project,
  respondent: Respondent,
  distance: DistanceInfo,
  maxDistance: number
): MatchResult {
  return {
    score: calculateScore(project, respondent, distance, maxDistance),
    distance,
    respondent,
  };
}
