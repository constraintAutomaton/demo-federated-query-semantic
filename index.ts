import { readFile } from "node:fs/promises";
import { QueryEngine } from "@comunica/query-sparql";
import { getInput, queryAndPrintDuplicates } from "./util";

const socialSource = "http://localhost:3000/sparql";
const jobSource = "http://localhost:3001/sparql";
const idSource = "http://localhost:3002/sparql";

const allTripleQuery = (
  await readFile("./queries/query_all_triples.rq")
).toString();
const allTripleQueryService = (
  await readFile("./queries/query_all_triples_service.rq")
).toString();

const jobAgeEmailQuery = (
  await readFile("./queries/query_job_age_and_email.rq")
).toString();
const jobAgeEmailServiceQuery = (
  await readFile("./queries/query_job_age_and_email_service.rq")
).toString();
const engine = new QueryEngine();

console.warn(
  "Make sure the social, job and id SPARQL endpoints are up. Look at the readme for more information.\n\n",
);
console.log(
  "The SPARQL query language has bag semantics, while knowledge graphs have set semantics.",
);
console.log(
  "Let's explore the semantics of federated queries, with SERVICE clauses and with Automatic Source Assignment, particularly Exhaustive Source Assignment (ESA).",
);
console.log(
  "Let's consider SPARQL endpoints over the files id.ttl, job.ttl and social.ttl, which contain duplicates across those federation members.",
);

console.log("Let's query all the triples of those endpoints with ESA.\n");
console.log(allTripleQuery);
await getInput("Press any key ...");

await queryAndPrintDuplicates(engine, allTripleQuery, [
  socialSource,
  jobSource,
  idSource,
]);

console.log(
  "With ESA, conjunctive queries with no projection produce a bag of results.\n",
);

await getInput("Press any key ...");

console.log(
  "With SERVICE clauses it is not possible to express with a conjunctive query this statement.\n",
);

await getInput("Press any key ...");

console.log("Let's present a realistic example.\n");
console.log(
  "Let's query the jobs, the age and the emails of the people in the database.",
);

await getInput("Press any key ...");

console.log("With ESA");
console.log(jobAgeEmailQuery);
await getInput("Press any key ...");
await queryAndPrintDuplicates(engine, jobAgeEmailQuery, [
  socialSource,
  jobSource,
  idSource,
]);

console.log("With SERVICE clauses");
console.log(jobAgeEmailServiceQuery);

await getInput("Press any key ...");
await queryAndPrintDuplicates(engine, jobAgeEmailServiceQuery, [idSource]);

await getInput("Press any key ...");

console.log(`\nCONCLUSION

Bag results of conjunctive queries without projection can arise in the context of federated queries with ESA if there are duplicates in the data across federation members, but not with SERVICE clauses.
Thus, even if the knowledge graphs are set semantic, they still behave like bag semantic in some automatic source selection contexts like ESA.
`);
