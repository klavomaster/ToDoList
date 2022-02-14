import { extendType, objectType } from "nexus";

export const User = objectType({
    name: 'User',
    definition(t) {
        t.nonNull.int('id');
        t.nonNull.string('name');
        t.nonNull.string('email');
    },
});

export const UserQuery = extendType({
    type: 'Query',
    definition(t) {
        t.nonNull.list.field('users', {
            type: 'User',
            resolve(parent, args, context) {
                return context.prisma.user.findMany();
            },
        })
    }
})