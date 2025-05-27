import { createAsanaTask } from "@Actions/create-asana-task";

async function run(): Promise<void> {

    //TODO Add checks for action here
 await createAsanaTask();
}

run();

