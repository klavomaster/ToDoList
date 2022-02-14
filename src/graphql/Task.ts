import { ToDoList } from "@prisma/client";
import { extendType, intArg, nonNull, objectType, stringArg } from "nexus";
import { getUserId } from "../utils/auth";

export enum TaskStatus {
    New = 0,
    InProgress = 1,
    Done = 2,
    Cancelled = 3,
}

export const Task = objectType({
    name: 'Task',
    definition(t) {
        t.nonNull.int('id');
        t.nonNull.string('name');
        t.nonNull.string('description');
        t.nonNull.int('order');
        t.nonNull.int('status');
        t.dateTime('notifyAt');
        t.nonNull.field('toDoList', {
            type: 'ToDoList',
            async resolve (parent, args, context) {
                return await context.prisma.task
                    .findUnique( {where: { id: parent.id } })
                    .toDoList() as ToDoList;
            }
        });
    }
});

export const TaskMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.nonNull.field('createTask', {
            type: 'Task',
            args: {
                listId: nonNull(intArg()),
                name: nonNull(stringArg()),
                description: nonNull(stringArg()),
            },
            async resolve (parent, args, context) {
                const userId = getUserId(context);
                const list = await context.prisma.toDoList.findUnique({ where: { id: args.listId } });
                if (!list || list.userId !== userId){
                    throw new Error ('Wrong listId.');
                }
                const maxOrderAggregation = await context.prisma.task
                    .aggregate({
                        _max: {
                            order: true
                        },
                        where: { 
                            toDoListId: args.listId
                        },
                    });
                const maxOrder = maxOrderAggregation._max.order ?? 0;

                return context.prisma.task.create({
                    data: {
                        name: args.name,
                        description: args.description,
                        order: maxOrder + 1,
                        status: TaskStatus.New,
                        toDoListId: args.listId
                    }
                });
            },
        });
        t.nonNull.field('deleteTask', {
            type: 'Boolean',
            args: {
                id: nonNull(intArg())
            },
            async resolve (parent, args, context) {
                const userId = getUserId(context);
                // TODO: check if the task belongs to the user.
                await context.prisma.task.delete({
                    where: { id: args.id },
                });
                return true;
            },
        });
    },
});
