"use client";
import { useBoardStore } from "@/store/BoardStore";
import React from "react";
import { DragDropContext, DropResult, Droppable } from "react-beautiful-dnd";
import Column from "./Column";

function Board() {
  const [board, getBoard,setBoard,updateTodoInDB] = useBoardStore((state) => [
    state.board,
    state.getBoard,
    state.setBoard,
    state.updateTodoInDB
  ]);

  React.useEffect(() => {
    getBoard();
  }, [getBoard]);

  const handleOnDragEnd = (result: DropResult) => {
    const { destination, source, type } = result;
    if(!destination) return;
    if(type === 'coloumn'){
      const entries = Array.from(board.coloumns.entries());
      const [removed] = entries.splice(source.index,1);
      entries.splice(destination.index,0,removed);
      const rearrangedColumns = new Map(entries);
      setBoard({
        ...board,
        coloumns: rearrangedColumns,
      });
    }
    // console.log(source, destination);
    const columns = Array.from(board.coloumns);
    // console.log(board,columns);
    const startColIndex = columns[Number(source.droppableId)];
    const endColIndex = columns[Number(destination.droppableId)];
    // console.log(startColIndex, endColIndex);
    const startCol: Column ={
      id:startColIndex[0],
      todos:startColIndex[1].todos,
    };
    const endCol: Column ={
      id:endColIndex[0],
      todos:endColIndex[1].todos
    }
    // console.log(startCol, endCol);
    if(!startCol || !endCol) return;

    if(source.index === destination.index && startCol === endCol) return;

    const newTodos = startCol.todos;
    const [todoMoved] = newTodos.splice(source.index,1);
    if(startCol.id === endCol.id){
      newTodos.splice(destination.index,0,todoMoved);
      const newCol = {
        id: startCol.id,
        todos: newTodos
      }
      const newColumns = new Map(board.coloumns);
      newColumns.set(startCol.id,newCol);
      setBoard({...board, coloumns:newColumns});
    }
    else{
      const finishedTodos = Array.from(endCol.todos);
      finishedTodos.splice(destination.index,0,todoMoved);
      const newCol = {
        id: startCol.id,
        todos:newTodos,
      }
      const newColumns = new Map(board.coloumns);
      newColumns.set(startCol.id,newCol);
      newColumns.set(endCol.id,{
        id: endCol.id,
        todos:finishedTodos,
      });
      updateTodoInDB(todoMoved,endCol.id);
      setBoard({...board, coloumns:newColumns});
    }
    console.log(board);
  };

  return (
    <div>
      <DragDropContext onDragEnd={(e) => handleOnDragEnd(e)}>
        <Droppable droppableId="board" direction="horizontal" type="coloumn">
          {(provided) => (
            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-7xl mx-auto"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {Array.from(board.coloumns.entries()).map(
                ([id, columnn], index) => {
                  return (
                    <Column
                      key={id}
                      id={id}
                      todos={columnn.todos}
                      index={index}
                    />
                  );
                }
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

export default Board;
