import { CsvRespondentLoader } from "../respondents/loader";
import { Project, Respondent } from "../types";
import { calculateMatchResult, DistanceInfo, Matcher, calculateDistance } from "./matcher";

const morgantown = {
  city: "Morgantown",
  state: "WV",
  country: "USA",
  formattedAddress: "Morgantown, WV USA",
  location: {
    latitude: 39.629524,
    longitude: -79.955894,
  },
};

const cheatLake = {
  city: "Cheat Lake",
  state: "WV",
  country: "USA",
  formattedAddress: "Cheat Lake, WV USA",
  location: {
    latitude: 39.673818,
    longitude: -79.853746,
  },
};

const pittsburgh = {
  city: "Pittsburgh",
  state: "PA",
  country: "USA",
  formattedAddress: "Pittsburgh, PA USA",
  location: {
    latitude: 40.441520,
    longitude: -80.002600,
  },
};

describe("matcher.ts", () => {
  let project: Project;

  beforeEach(() => {
    project = require("../sample-project.json");
  });

  describe("Matcher.findCandidates", () => {
    let matcher: Matcher;
    let loader: CsvRespondentLoader;

    beforeAll(async () => {
      loader = new CsvRespondentLoader();
      await loader.load();
    });

    beforeEach(async () => {
      matcher = new Matcher(loader);
      await matcher.initialize();
    });

    it("can find candidate matches", async () => {
      const maxDistance = 1000;
      const results = matcher.findCandidates(project, maxDistance);
      expect(results.length).toEqual(project.numberOfParticipants);

      const projectCityAddrs = project.cities.map((c) => c.location.formattedAddress);
      expect(results.every((r) => projectCityAddrs.includes(r.distance.closestCity.location.formattedAddress)));
      expect(results.every((r) => r.distance.value < maxDistance));
    });


    it("returns empty if nothing matches project", async () => {
      const maxDistance = 10;
      project = {
        ...project,
        cities: [{
          location: morgantown,
        }]
      };
      const results = matcher.findCandidates(project, maxDistance);
      expect(results.length).toEqual(0);
    });


    it("returns matches if they are within max distance", async () => {
      const maxDistance = 500 * 1000;
      project = {
        ...project,
        cities: [{
          location: morgantown,
        }]
      };
      const results = matcher.findCandidates(project, maxDistance);
      expect(results.length).toEqual(project.numberOfParticipants);
      expect(results.every((r) => r.distance.value > 0 && r.distance.value < maxDistance));
      expect(results.every((r) => r.distance.closestCity.location.city === morgantown.city));
    });
  });

  describe("calculateMatchResult", () => {
    it("returns 3 for a perfect match", () => {
      const perfectCandidate: Respondent = {
        firstName: "Perfecto",
        industries: project.professionalIndustry,
        jobTitle: project.professionalJobTitles[0],
      } as any;
      const perfectDistance: DistanceInfo = {
        closestCity: project.cities[0],
        value: 0,
      };
      const result = calculateMatchResult(project, perfectCandidate, perfectDistance, 10);
      expect(result.score).toEqual(3);
      expect(result.respondent).toEqual(perfectCandidate);
      expect(result.distance).toEqual(perfectDistance);
    });

    it("returns 0 for a perfect miss", () => {
      const poorCandidate: Respondent = {
        firstName: "Nope",
        industries: "Not a valid industry",
        jobTitle: "Some fake title",
      } as any;
      const poorDistance: DistanceInfo = {
        closestCity: project.cities[0],
        value: 10000,
      };
      const result = calculateMatchResult(project, poorCandidate, poorDistance, 10);
      expect(result.score).toEqual(0);
      expect(result.respondent).toEqual(poorCandidate);
      expect(result.distance).toEqual(poorDistance);
    });
  });

  describe("calculateDistance", () => {

    it("returns undefined when there is no locations", () => {
      project.cities = [];
      const distance = calculateDistance(project, {
        ...morgantown.location,
      } as any);
      expect(distance).toBeUndefined();
    });

    it("returns 0 when locations are the same", () => {
      project.cities = [{
        location: morgantown
      }];
      const distance = calculateDistance(project, {
        ...morgantown.location,
      } as any);
      expect(distance).toBeDefined();
      expect(distance!.closestCity.location).toEqual(morgantown);
      expect(distance!.value).toEqual(0);
    });

    it("returns 0 when locations are the same", () => {
      project.cities = [{
        location: morgantown
      }];
      const distance = calculateDistance(project, {
        ...morgantown.location,
      } as any);
      expect(distance).toBeDefined();
      expect(distance!.closestCity.location).toMatchObject(morgantown);
      expect(distance!.value).toEqual(0);
    });

    it("returns accurately for small distances", () => {
      project.cities = [
        {
          location: pittsburgh,
        },
        {
          location: cheatLake,
        },
      ];
      const distance = calculateDistance(project, {
        ...morgantown.location,
      } as any);
      expect(distance).toBeDefined();
      expect(distance!.closestCity.location).toMatchObject(cheatLake);
      expect(distance!.value).toEqual(10048);
    });

    it("returns accurately for larger distances", () => {
      project.cities = [
        {
          location: pittsburgh,
        },
      ];
      const distance = calculateDistance(project, {
        ...morgantown.location,
      } as any);
      expect(distance).toBeDefined();
      expect(distance!.closestCity.location).toMatchObject(pittsburgh);
      expect(distance!.value).toEqual(90479);
    });
  });
});
