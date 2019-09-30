import "reflect-metadata";

import { container } from "tsyringe";
import { Project } from "./types";
import { Matcher } from "./matching/matcher";

async function main() {
  const project: Project = require("./sample-project.json");

  const matcher = container.resolve(Matcher);
  await matcher.initialize();

  const matches = matcher.findCandidates(project, 100000);

  console.log(`results for project: ${project.name}`);
  console.log(`name,distance,city,score`);
  for (const match of matches) {
    console.log(`${match.respondent.firstName},${match.distance.value},${match.distance.closestCity.location.formattedAddress},${match.score}`);
  }
}

main()
  .catch(console.error)
  .then();
