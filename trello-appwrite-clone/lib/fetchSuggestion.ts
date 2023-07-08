import { formatTodosForAI } from "./formatTodosForAI";

const fetchSuggestion = async (board: Board) => {
  const todos = formatTodosForAI(board);
  console.log("formatted", todos);
  const res = await fetch("/api/generatedSummary", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ todos }),
  });

  const GPIdata = await res.json();
  const { content } = GPIdata;
  return content;
};
export default fetchSuggestion;
