import { create } from "zustand";
import { getTodosColumnsGroupedByColumn } from "@/lib/getTodosGroupedByColumn";
import { ID, databases, storage } from "@/appwrite";
import uploadImage from "@/lib/uploadImage";

interface BoardState {
  board: Board;
  getBoard: () => Promise<void>;
  setBoard: (board: Board) => void;
  updateTodoInDB: (todo: Todo, columnId: TypedColumn) => Promise<void>;
  newTaskInput: string;
  setNewTaskInput: (searchedString: string) => void;
  newTaskType: TypedColumn;
  setNewTaskType: (columnId: TypedColumn) => void;
  image: File | null;
  setImage: (image: File | null) => void;
  searchedString: string;
  setSearchedString: (searchedString: string) => void;
  addTask: (
    todo: string,
    columnId: TypedColumn,
    image?: File | null
  ) => Promise<void>;
  deleteTask: (
    taskIndex: number,
    todoId: Todo,
    id: TypedColumn
  ) => Promise<void>;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  board: {
    coloumns: new Map<TypedColumn, Column>(),
  },
  getBoard: async () => {
    const board = await getTodosColumnsGroupedByColumn();

    set({ board: board });
  },
  setBoard: (board) =>
    set({
      board,
    }),
  newTaskInput: "",
  setNewTaskInput: (input: string) => set({ newTaskInput: input }),
  newTaskType: "todo",
  setNewTaskType: (columnId) => set({ newTaskType: columnId }),
  image: null,
  setImage: (image: File | null) => set({ image: image }),
  searchedString: "",
  setSearchedString: (searchString) => set({ searchedString: searchString }),
  addTask: async (todo, columnId, image) => {
    let file: Image | undefined;
    if (image) {
      const fileUploaded = await uploadImage(image);
      if (fileUploaded) {
        file = {
          bucketId: fileUploaded.bucketId,
          fileId: fileUploaded.$id,
        };
        console.log(file);
      }
    }
    const { $id } = await databases.createDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
      ID.unique(),
      {
        title: todo,
        status: columnId,
        ...(file && { image: JSON.stringify(file) }),
      }
    );
    set({ newTaskInput: "" });
    set((state) => {
      const newColumns = new Map(state.board.coloumns);
      const newTodo: Todo = {
        $id,
        $createdAt: new Date().toISOString(),
        title: todo,
        status: columnId,
        ...(file && { image: file }),
      };
      const column = newColumns.get(columnId);
      if (!column) {
        newColumns.set(columnId, {
          id: columnId,
          todos: [newTodo],
        });
      } else {
        newColumns.get(columnId)?.todos.push(newTodo);
      }
      return {
        board: {
          coloumns: newColumns,
        },
      };
    });
  },
  deleteTask: async (taskIndex, todo, id) => {
    const newColumns = new Map(get().board.coloumns);
    newColumns.get(id)?.todos.splice(taskIndex, 1);
    set({ board: { coloumns: newColumns } });

    if (todo.image) {
      await storage.deleteFile(todo.image.bucketId, todo.image.fileId);
    }

    await databases.deleteDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
      todo.$id
    );
  },
  updateTodoInDB: async (todo, columnId) => {
    await databases.updateDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
      todo.$id,
      {
        title: todo.title,
        status: columnId,
      }
    );
  },
}));
