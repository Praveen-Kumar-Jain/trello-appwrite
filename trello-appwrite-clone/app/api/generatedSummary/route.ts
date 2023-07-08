import openai from "@/openai";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  console.log(req);
  const { todos } = await req.json();
  console.log(todos);

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    temperature: 0.8,
    n: 1,
    stream: false,
    messages: [
      {
        role: "system",
        content: `when responding, welcome the user always as Mr. 
        Sexy and say welcome to coding world! Limit the response to 200 chracters`,
      },
      {
        role: "system",
        content: `Hi there, provide a summary of the following todos. 
        Count how many todos are in each category such as to do, inprogress and done, 
        then tell the user to have a productive day! Here's the data: ${JSON.stringify(
          todos
        )}`,
      },
    ],
  });
  const { data } = response;
  console.log("Data", data);
  return NextResponse.json(data.choices[0].message);
};
