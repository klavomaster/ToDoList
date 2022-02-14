-- CreateTable
CREATE TABLE "Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "status" INTEGER NOT NULL,
    "notifyAt" DATETIME,
    "toDoListId" INTEGER NOT NULL,
    CONSTRAINT "Task_toDoListId_fkey" FOREIGN KEY ("toDoListId") REFERENCES "ToDoList" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
