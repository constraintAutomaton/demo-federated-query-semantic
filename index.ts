import { readFile } from 'node:fs/promises';
import { QueryEngine } from '@comunica/query-sparql';
import { getInput, queryAndPrintDuplicates } from './util';


const socialSource = "http://localhost:3000/sparql";
const jobSource = "http://localhost:3001/sparql";
const idSource = "http://localhost:3002/sparql";

const allTripleQuery = (await readFile("./queries/query_all_triples.rq")).toString();
const jobAgeEmailQuery = (await readFile("./queries/query_job_age_and_email.rq")).toString();
const jobAgeEmailServiceQuery = (await readFile("./queries/query_job_age_and_email_service.rq")).toString();
const jobAgeEmailServiceOtherVocabQuery = (await readFile("./queries/query_job_age_and_email_service_other_vocab.rq")).toString();

const janJobInfoSocialInfoQuery = (await readFile("./queries/query_jan_job_info_and_social_info.rq")).toString();
const engine = new QueryEngine();

console.warn("Make sure the social, job and id SPARQL endpoints are up. Look at the readme for more information.\n\n");
console.log("The query of multiple sources is bag semantic (allow duplicates) in general.\n");
console.log("Let's query all the triples of the id.ttl, job.ttl and social.ttl sources\n");

await getInput("Press any key ...");

await queryAndPrintDuplicates(engine, allTripleQuery, [socialSource, jobSource, idSource]);

await getInput("Press any key ...");

console.log(`Knowledge graphs follow a set-based semantics, meaning duplicates are generally not allowed. The following analysis will be database-independent and we do not consider cases where the endpoint are not known before the query execution.\n`);

console.log("Let's present some examples.\n");
console.log("In the case of Federated Query with exhaustive source assignments meaning that each triple is sent to each data source any query is bag semantic.");
console.log(`Let's query the jobs, the age and the emails of the people in the database.\n\n${jobAgeEmailQuery}\n`);

await getInput("Press any key ...");

await queryAndPrintDuplicates(engine, jobAgeEmailQuery, [socialSource, jobSource, idSource]);

await getInput("Press any key ...");

console.log("In the case of federated queries using SERVICE clauses if we use the same triple pattern in multiple clauses duplicates can be produced.\n");
console.log(`Let's perform the a similar query with SERVICE clauses.\n\n${jobAgeEmailServiceQuery}`);

await getInput("Press any key ...");

await queryAndPrintDuplicates(engine, jobAgeEmailServiceQuery, [idSource]);

await getInput("Press any key ...");

console.log("In the case of federated queries using SERVICE clauses the same data is expressed in a different vocabulary.\n");
console.log(`Let's perform the a similar query but we are querying the jobs in one endpoint with a Dutch vocabulary.\n\n${jobAgeEmailServiceOtherVocabQuery}`);

await getInput("Press any key ...");

await queryAndPrintDuplicates(engine, jobAgeEmailServiceOtherVocabQuery, [idSource]);

await getInput("Press any key ...");

console.log("In the case of federated queries using SERVICE clauses if we use a triple pattern targeting a source that match a subset (or equal to) to the subset of another triple pattern targeting another source we can get duplicate.");
console.log(`Let's query all the job infomation of Jan exclusing RDF types in the job SPARQL endpoints and his social information excluding his job in the social endpoint with it's ID in the id endpoint.\n\n${janJobInfoSocialInfoQuery}\n`);

await getInput("Press any key ...");
await queryAndPrintDuplicates(engine, janJobInfoSocialInfoQuery, [idSource]);

await getInput("Press any key ...");

console.log(`\nCONCLUSION  

Bag semantics can arise for multiple reasons, given that endpoints may have overlapping data:  
    (1) Exhaustive source assignment during querying  
    (2) The same triple pattern assigned to different sources (this can also occur without SERVICE clauses when using automatic source selection algorithms)  
    (3) Triple patterns where one yields a subset (or equal) of the solutions produced by another pattern assigned to a different source  
    (4) The same or similar data expressed in different vocabularies  

For these reasons, without additional information, federated querying must be considered bag semantics.  
However, trusted information about data overlap and vocabulary usage (provided they are enforced in the databases) could allow execution under bag-set semantics, aligning with SPARQL's default bag semantics.  
`);
    