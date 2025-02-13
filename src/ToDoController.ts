import { db } from "../db";
import { ToDoTable } from "../db/todo.schema";
import { ilike, eq } from "drizzle-orm";
import * as readlineSync from "readline-sync";
import { chatWithDeepseek, messages } from "./AiAgentController";

export interface ToDo {
  task: string;
  isCompleted: boolean;
}

export const addToDo = async (req: string) => {
  console.log("Tst",req)
  const [dbRes] = await db.insert(ToDoTable).values({ todo: req }).returning({
    id: ToDoTable.id,
  });
  console.log("Added ToDo");
  return dbRes.id;
};

export const getToDo = async () => {
  const todos = await db.select().from(ToDoTable).execute();
  console.log(todos);
  return todos;
};

export const searchToDo = async (searchKey: string) => {
  const todos = await db
    .select()
    .from(ToDoTable)
    .where(ilike(ToDoTable.todo, searchKey))
    .execute();
  console.log(todos);
  return todos;
};

export const deleteToDo = async (id: number) => {
  const deleteQuery = await db.delete(ToDoTable).where(eq(ToDoTable.id, id));
  console.log(deleteQuery);
  return "Successfully deleted";
};

const tools = {
  addToDo: addToDo,
  getToDo: getToDo,
  deleteToDo: deleteToDo,
  searchToDo: searchToDo,
};

export const startChatHandler = async () => {
  while (true) {
    const query = readlineSync.question(">>");
    const userMessage = {
      type: "user",
      user: query,
    };
    messages.push({ role: "user", content: JSON.stringify(userMessage) });
    // console.log("tat", messages);
    while (true) {
      const chat = await chatWithDeepseek();
      const result = chat.message.content;
      console.log("**********************", result);
      const parseResult = parseStringToJson(result);
      messages.push({ role: "system", content: JSON.stringify(parseResult) });

      if (parseResult.type === "output") {
        console.log(`- ${parseResult.output}`);
        break;
      }
      // else if (parseResult.type === 'plan'){
      //   console.log(`- ${parseResult.plan}`)
      //   break;}
      else if (parseResult.type === "action") {
        const fn = tools[parseResult.function];
        if (!fn) throw new Error("Invalid function call");
        const safeFn = fn as (arg: string) => unknown;
        const observation = await safeFn(parseResult.input);
        console.log("observation", observation);
        const observationMes = { type: "observation", observation: observation };
        messages.push({
          role: "developer",
          content: JSON.stringify(observationMes),
        });
         console.log("content", messages);
      }
     
    }
  }
};
// startChatHandler();

// console.log(parseStringToJson("********************** There is no plan to follow the user prompt. The system will create a new Todo in the database with the given text.PLAN We have decided to use the addToDo function, which takes the todo as a string, to add the new task to the database. ACTION Create a new Todo in the database using the addToDo function.{ \"type\": \"action\",\"function\": \"addToDo\",\"input\": \"hi\"}"))

type Message =
  | { type: "user"; user: string }
  | { type: "plan"; plan: string }
  | { type: "developer"; developer: string }
  | { type: "output"; output: string }
  | { type: "action"; function: keyof typeof tools; input: string }
  | { type: "observation"; observation: string };

function parseStringToJson(input: string): Message {
  // console.log("Tst",input)
  try {
    const index = input.indexOf("{");
    if (index === -1)
      return {
        type: "developer",
        developer: "Restart you are going off track.",
      };
    let result = input.substring(index);
    return JSON.parse(result);
  } catch (e) {
    console.log(e);
    return {
      type: "developer",
      developer: "Restart you are going off track.",
    };
  }
}
