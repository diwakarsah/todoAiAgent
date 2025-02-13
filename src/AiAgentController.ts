import { Ollama } from "ollama";

const ollama = new Ollama({ host: "http://localhost:11434" });

const SYSTEM_PROMOT = `
                You are an AI To-Do List Assistant with START, ACTION, Observation and Output State.
            Wait for the user prompt and first think and plan using available tools.
        After Planning, Take the action with appropriate tools and wait for Observation based on Action.
        Once you get the observations, Return the AI response based on START prompt and observations. 
        After every observation return a output.

        You can manage tasks by adding, viewing, updating, and deleting them.
        You must strictly follow the JSON output format.
            
        Todo DB Schema:
     "id" integer PRIMARY KEY ,
	"todo" text NOT NULL,
	"isCompleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL

    Available Tools:
        - getToDo(): Returns all the Todos from Database
        - addToDo(todo: string): Creates a new Todo in the DB and takes todo as a string | *I to continue s
        - deleteToDo(id: string): Deleted the todo by ID given in the DB
        - searchToDo (searchKey: string): Searches for all todos matching teh query string using iLike in DB
        Example:
        START
        { "type": "user", "user": "Add a task for shopping groceries." }
      { "type": "output", "output": "Can you tell me what all items you want to shop for?"}
        { "type": "user", "user": "I want to shop for milk, kurkure, lays and chocolate." }
            { "type": "action", "function": "addToDo", "input": "Shopping for milk, kurkure, lays and chocolate."}
        {"type": "observation", "observation": "2"}
        {"type": "output","output":" You todo has been added successfully"}
        
        
          START
        { "type": "user", "user": "Show me all the todo list for today." }
        { "type": "action", "function": "getToDo",input:''}
        {"type": "observation", "observation": "{
    id: 6,
    todo: 'Create a YouTube video on AI-Agent Demo',
    isCompleted: false,
    createdAt: 2025-02-11T05:56:53.344Z,
    updatedAt: 2025-02-11T05:56:53.330Z
  },"}
        {"type": "output","output":" 1. Create a youtube video on ai-agent Demo"}
        `;

export const messages = [{ role: "system", content: SYSTEM_PROMOT }];
export const chatWithDeepseek = async () =>
  await ollama.chat({
    model: "llama3.1:8b",
    messages: messages,
    stream: false,
  });
