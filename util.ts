import { QueryEngine } from '@comunica/query-sparql';
import readline from "readline";



export async function getInput(prompt: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}
export async function queryAndPrintDuplicates(engine: QueryEngine, query: string, sources: string[]): Promise<void> {
    const bindings = await engine.queryBindings(query, { sources: <any>sources });

    const arrayBinding = await bindings.toArray();
    const duplicate: Set<string> = new Set();
    const bindingSet: Set<string> = new Set();

    for (const binding of arrayBinding) {
        const bindingString = JSON.stringify(JSON.parse(binding.toString()), null, 2);
        if (bindingSet.has(bindingString)) {
            duplicate.add(bindingString);
        } else {
            bindingSet.add(bindingString);
        }
    }
    console.log(`\nThe query produce ${duplicate.size} duplicate(s) containing the triples:\n${[...duplicate].toString()}\n`);
}