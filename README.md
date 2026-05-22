# demo-federated-query-semantic

This repository demonstrates how the semantics of federated SPARQL queries—specifically the distinction between bag and set semantics—depends on how the federation is carried out: through explicit `SERVICE` clauses or through Automatic Source Assignment, in particular Exhaustive Source Assignment (ESA). It uses [Comunica](https://comunica.dev/) as the federated query engine.

A conjunctive query without projection is expected to behave under set semantics when it is evaluated against set-semantic knowledge graphs. This demo shows that this expectation does not always hold: with ESA, duplicates can appear when the federation members hold overlapping data, whereas `SERVICE` clauses keep the result a set.

## Output of the demo

The demo runs against three SPARQL endpoints, one per data file, that hold overlapping data:

`files/id.ttl`
```ttl
@prefix ex: <http://example.org/> .

ex:jan ex:id 1.
ex:josette ex:id 2.
```

`files/job.ttl`
```ttl
@prefix ex: <http://example.org/> .

ex:jan a ex:student ;
    ex:age 16 ;
    ex:job "Cashier" ;
    ex:baan "Cashier";
    ex:employer "Carrefour" .

ex:josette a ex:student ;
    ex:age 25 ;
    ex:job "Cook" ;
    ex:job "Painter" ;
    ex:baan "Cook";
    ex:baan "Painter";
    ex:employer "self" ;
    ex:employer "De Stokerij" .

ex:jos a ex:worker ;
    ex:age 30;
    ex:job "Engineer";
    ex:baan "Engineer";
    ex:employer "Business and Engineering Solutions".
```

`files/social.ttl`
```ttl
@prefix ex: <http://example.org/> .

ex:jan a ex:user, ex:student ;
    ex:age 16 ;
    ex:email "jan@janmail.com";
    ex:email "jan@solidmail.com";
    ex:job "Cashier" .

ex:josette a ex:user, ex:student ;
    ex:age 25 ;
    ex:email "josette@personalMail.com";
    ex:job "Painter" .

ex:jos a ex:user, ex:student ;
    ex:age 30;
    ex:hobby "Biking".
```

Note that several triples are shared between the endpoints—for example `ex:jan ex:age 16` and `ex:jan ex:job "Cashier"` appear in both `job.ttl` and `social.ttl`. This overlap is what makes the difference between ESA and `SERVICE` clauses observable.

The demo runs four queries, as two pairs that contrast ESA with `SERVICE` clauses.

```sh
The SPARQL query language has bag semantics, while knowledge graphs have set semantics.
Let's explore the semantics of federated queries, with SERVICE clauses and with Automatic Source Assignment, particularly Exhaustive Source Assignment (ESA).
Let's consider SPARQL endpoints over the files id.ttl, job.ttl and social.ttl, which contain duplicates across those federation members.
Let's query all the triples of those endpoints with ESA.

SELECT * WHERE  {
  ?s ?p ?o .
}
Press any key ...

The query produce 7 duplicate(s) containing the triples:
{
  "s": "http://example.org/jan",
  "p": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
  "o": "http://example.org/student"
},{
  "s": "http://example.org/jan",
  "p": "http://example.org/age",
  "o": "\"16\"^^http://www.w3.org/2001/XMLSchema#integer"
},{
  "s": "http://example.org/jan",
  "p": "http://example.org/job",
  "o": "\"Cashier\""
},{
  "s": "http://example.org/josette",
  "p": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
  "o": "http://example.org/student"
},{
  "s": "http://example.org/josette",
  "p": "http://example.org/age",
  "o": "\"25\"^^http://www.w3.org/2001/XMLSchema#integer"
},{
  "s": "http://example.org/josette",
  "p": "http://example.org/job",
  "o": "\"Painter\""
},{
  "s": "http://example.org/jos",
  "p": "http://example.org/age",
  "o": "\"30\"^^http://www.w3.org/2001/XMLSchema#integer"
}

With ESA, conjunctive queries with no projection produce a bag of results.

Press any key ...
Let's do the same with SERVICE clauses.


SELECT * WHERE  {
  SERVICE <http://localhost:3000/sparql> {
    ?s ?p ?o
  }

  SERVICE <http://localhost:3001/sparql> {
    ?s ?p ?o
  }

  SERVICE <http://localhost:3002/sparql> {
    ?s ?p ?o
  }
}

Press any key ...

The query produce 0 duplicate(s) containing the triples:


With SERVICE clauses, conjunctive queries with no projection produce a set of results.

Press any key ...
Let's present a realistic example.

Let's query the jobs, the age and the emails of the people in the database.
Press any key ...
With ESA
PREFIX ex: <http://example.org/>

SELECT * WHERE  {
  ?s ex:job ?job ;
     ex:age ?age ;
     ex:email ?email;
     ex:id ?id.
}
Press any key ...

The query produce 4 duplicate(s) containing the triples:
{
  "s": "http://example.org/jan",
  "id": "\"1\"^^http://www.w3.org/2001/XMLSchema#integer",
  "email": "\"jan@janmail.com\"",
  "job": "\"Cashier\"",
  "age": "\"16\"^^http://www.w3.org/2001/XMLSchema#integer"
},{
  "s": "http://example.org/jan",
  "id": "\"1\"^^http://www.w3.org/2001/XMLSchema#integer",
  "email": "\"jan@solidmail.com\"",
  "job": "\"Cashier\"",
  "age": "\"16\"^^http://www.w3.org/2001/XMLSchema#integer"
},{
  "s": "http://example.org/josette",
  "id": "\"2\"^^http://www.w3.org/2001/XMLSchema#integer",
  "email": "\"josette@personalMail.com\"",
  "job": "\"Painter\"",
  "age": "\"25\"^^http://www.w3.org/2001/XMLSchema#integer"
},{
  "s": "http://example.org/josette",
  "id": "\"2\"^^http://www.w3.org/2001/XMLSchema#integer",
  "email": "\"josette@personalMail.com\"",
  "job": "\"Cook\"",
  "age": "\"25\"^^http://www.w3.org/2001/XMLSchema#integer"
}

With SERVICE clauses
PREFIX ex: <http://example.org/>

SELECT * WHERE  {
  SERVICE <http://localhost:3001/sparql> {
    ?s ex:job ?job.
  }

  SERVICE <http://localhost:3000/sparql> {
    ?s ex:job ?job;
      ex:age ?age ;
      ex:email ?email.
  }

  ?s ex:id ?id.
}
Press any key ...

The query produce 0 duplicate(s) containing the triples:


Press any key ...

CONCLUSION

Bag results of conjunctive queries without projection can arise in the context of federated queries with ESA if there are duplicates in the data across federation members, but not with SERVICE clauses.
Thus, even if the knowledge graphs are set semantic, they still behave like bag semantic in some automatic source selection contexts like ESA.
```

## Dependencies

Ensure the following dependencies are installed before running the demo:

### General Dependencies
- [Bun v1.2.5+](https://bun.sh)

The query engine (`@comunica/query-sparql`) and the file-backed endpoint server (`comunica-sparql-file-http`) are resolved automatically through `bun install` and `bunx`. The `close-ports` script relies on `fuser` (part of `psmisc`), which is available by default on most Linux distributions.

## Running the Demo

Once the dependencies are installed, install the project packages:

```sh
bun install
```

Then run the demo:

```sh
bun run demo
```

This script starts the three SPARQL endpoints (`social` on port 3000, `job` on port 3001, `id` on port 3002), waits for them to come up, runs the demo, and frees the ports when it finishes. The demo pauses with `Press any key ...` between steps—press Enter to advance.

Alternatively, run the endpoints and the demo separately:

```sh
bun run start-all-endpoints   # in one terminal
bun run index.ts              # in another terminal, once the endpoints are up
```

## License
The code is licensed under the GPL-3.0 License. See the [LICENSE](LICENSE) file for details.

## Contact

For any questions regarding the repository, please [open an issue](https://github.com/constraintAutomaton/demo-federated-query-semantic/issues).
