import { injectable } from "tsyringe";
import { CsvRespondentLoader } from "../respondents/loader";
import { CityInfo, Project, Respondent } from "../types";
import { getDistance } from "geolib";

interface DistanceInfo {
  closestCity: CityInfo;
  value: number;
}

interface MatchResult {
  score: number;
  distance: DistanceInfo;
  respondent: Respondent;
}

@injectable()
export class Matcher {
  private allRespondents: Respondent[] = [];

  constructor(private respondentLoader: CsvRespondentLoader) {}

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

export function calculateMatchResult(
  project: Project,
  respondent: Respondent,
  distance: DistanceInfo,
  maxDistance: number
): MatchResult {
  let score = 0;
  if (project.professionalJobTitles.includes(respondent.jobTitle)) {
    // Consider expanding this to include partial matches
    score += 1;
  }

  const matchingIndustries = project.professionalIndustry.filter(i =>
    respondent.industries.includes(i)
  );
  score += matchingIndustries.length / project.professionalIndustry.length;

  score += (maxDistance - distance.value) / maxDistance;

  return {
    score,
    distance,
    respondent,
  };
}
