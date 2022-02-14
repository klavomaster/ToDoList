-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "status" INTEGER NOT NULL,
    "notifyAt" DATETIME,
    "toDoListId" INTEGER NOT NULL,
    CONSTRAINT "Task_toDoListId_fkey" FOREIGN KEY ("toDoListId") REFERENCES "ToDoList" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("description", "id", "name", "notifyAt", "order", "status", "toDoListId") SELECT "description", "id", "name", "notifyAt", "order", "status", "toDoListId" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
