import { User } from "@prisma/client";
import { extendType, intArg, nonNull, objectType, stringArg } from "nexus";
import { getUserId } from "../utils/auth";

export enum ToDoListStatus{
    New = 0,
    InProgress = 1,
    Accomplished = 2,
}

export const ToDoList = objectType({
    name: 'ToDoList',
    definition(t) {
        t.nonNull.int('id');
        t.nonNull.string('name');
        t.nonNull.int('order');
        t.nonNull.int('status');
        t.nonNull.field('user', {
            type: 'User',
            async resolve(parent, args, context) {
                const user = await context.prisma.toDoList
                    .findUnique({ where: { id: parent.id }} )
                    .user();

                return user as User;
            },
        });
        t.nonNull.list.nonNull.field('tasks', { 
            type: 'Task',
            resolve(parent, args, context) {
                return context.prisma.task
                    .findMany({ 
                        where: { toDoListId: parent.id },
                        orderBy: { order: 'asc' },
                    });
            }
        });
    }
});

export const ToDoListQuery = extendType({
    type: 'Query',
    definition(t) {
        t.nonNull.list.nonNull.field('lists', {
            type: 'ToDoList',
            resolve(parent, args, context) {
                const userId = getUserId(context);
                return context.prisma.toDoList.findMany({
                    where: { userId: userId },
                    orderBy: { order: 'asc' },
                });
            }
        });
    },
});

export const ToDoListMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.nonNull.field('createList', {
            type: 'ToDoList',
            args: {
                name: nonNull(stringArg()),
            },
            async resolve(parent, args, context) {
                const userId = getUserId(context);
                const maxOrderAggregation = await context.prisma.toDoList
                    .aggregate({
                        _max: {
                            order: true
                        },
                        where: { 
                            userId: userId 
                        },
                    });
                const maxOrder = maxOrderAggregation._max.order ?? 0;
                return await context.prisma.toDoList.create({
                    data: {
                        name: args.name,
                        status: ToDoListStatus.New,
                        order: maxOrder + 1,
                        userId: userId
                    },
                });
            }
        });
        t.nonNull.field('listSetName', {
            type: 'ToDoList',
            args: {
                id: nonNull(intArg()),
                name: nonNull(stringArg()),
            },
            async resolve(parent, args, context) {
                const userId = getUserId(context);
                const exists = await context.prisma.toDoList.count({
                    where: {
                        AND:[
                            { id: args.id },
                            { userId: userId },
                        ],
                    },
                });
                if (!exists) {
                    throw new Error('Wrong id.');
                }
                return await context.prisma.toDoList.update({
                    where: {
                        id: args.id
                    },
                    data: {
                        name: args.name
                    },
                });
            }
        });
        t.nonNull.field('deleteList', {
            type: 'Boolean',
            args: {
                id: nonNull(intArg()),
            },
            async resolve(parent, args, context) {
                const userId = getUserId(context);
                const exists = await context.prisma.toDoList.count({
                    where: {
                        AND:[
                            { id: args.id },
                            { userId: userId },
                        ],
                    },
                });
                if (!exists){
                    throw new Error('Wrong id.');
                }
                await context.prisma.toDoList.delete({ 
                    where: { id: args.id }
                });
                return true;
            },
        });
    },
});