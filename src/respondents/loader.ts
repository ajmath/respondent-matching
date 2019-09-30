import "reflect-metadata";

import parse from "csv-parse";
import fs from "fs";
import { injectable } from "tsyringe";
import { Genders, Respondent } from "../types";
import { Stream } from "stream";

export function parseGender(val: string): Genders {
  if (val === "male" || val === "female") {
    return Genders[val];
  }
  return Genders.other;
}

export interface RespondentLoader {
  load(): Promise<Respondent[]>;
}

export function defaultReadStream() {
  return fs.createReadStream(`${__dirname}/respondents.csv`)
}

@injectable()
export class CsvRespondentLoader implements RespondentLoader {
  private data?: Respondent[]; 
  constructor(private csvStream: Stream = defaultReadStream()) {}

  public async load(): Promise<Respondent[]> {
    if (this.data) {
      return this.data;
    }

    const parser = parse({
      delimiter: ",",
      from_line: 2,
    });
    const stream = this.csvStream.pipe(parser);

    return new Promise<Respondent[]>((resolve, reject) => {
      const respondents: Respondent[] = [];
      stream.on("data", d => {
        respondents.push(this.parseRespondantRow(d));
      });
      stream.on("end", () => resolve(this.data = respondents));
      stream.on("error", reject);
    });
  }

  private parseRespondantRow(row: string[]): Respondent {
    return {
      firstName: row[0],
      gender: parseGender(row[1]),
      jobTitle: row[2],
      industries: row[3].split(","),
      city: row[4],
      latitude: parseFloat(row[5]),
      longitude: parseFloat(row[6]),
    };
  }
}
