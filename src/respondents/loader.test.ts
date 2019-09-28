import { CsvRespondentLoader } from "./loader";
import { Readable } from "stream";
import { Respondent, Genders } from "../types";

describe("csv data loader", () => {
  /**
   * Consider moving this to an integration test at some point since it's touching the disk
   */
  it("can load data using defaults", async () => {
    const loader = new CsvRespondentLoader();

    const data = await loader.load();

    expect(data.length).toEqual(500);
  });

  it("can load data using defaults", async () => {
    const testStream = new Readable();
    testStream.push("firstName,gender,jobTitle,industry,city,latitude,longitude\n");
    testStream.push(
      'Emma,female,Analyst,Computer Software,"New York, NY, USA",40.7127753,-74.0059728\n'
    );
    testStream.push(
      'Orson,male,Analyst,"Education Management,Government Administration,E-Learning,Computer Software","Brooklyn, NY, USA",40.6781784,-73.9441579'
    );
    testStream.push(null);

    const loader = new CsvRespondentLoader(testStream);

    const data = await loader.load();
    expect(data.length).toEqual(2);

    const respondent1: Respondent = {
      firstName: "Emma",
      gender: Genders.female,
      jobTitle: "Analyst",
      industries: ["Computer Software"],
      city: "New York, NY, USA",
      latitude: 40.7127753,
      longitude: -74.0059728,
    };
    expect(data[0]).toMatchObject(respondent1);

    const respondent2: Respondent = {
      firstName: "Orson",
      gender: Genders.male,
      jobTitle: "Analyst",
      industries: ["Education Management","Government Administration","E-Learning","Computer Software"],
      city: "Brooklyn, NY, USA",
      latitude: 40.6781784,
      longitude: -73.9441579,
    };
    expect(data[1]).toMatchObject(respondent2);
  });
});
