import { extendType, nonNull, objectType, stringArg } from 'nexus';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const SALT = 10;

export interface AuthTokenPayload {
    userId: number;
}

export function decodeAuthHeader(authHeader: string): AuthTokenPayload {
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
        throw new Error("No token found.");
    }
    return jwt.verify(token, process.env.APP_SECRET as string) as AuthTokenPayload;
}

export const AuthPayload = objectType({
    name: 'AuthPayload',
    definition(t) {
        t.nonNull.string('token');
        t.nonNull.field('user', {
            type: 'User'
        });
    }
});

export const AuthMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.nonNull.field('signup', {
            type: 'AuthPayload',
            args: {
                name: nonNull(stringArg()),
                email: nonNull(stringArg()),
                password: nonNull(stringArg()),
            },
            async resolve(_, args, context) {
                const password = await bcrypt.hash(args.password, SALT);
                const user = await context.prisma.user.create({
                    data: { name: args.name, email: args.email, password: password },
                });
                const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET as string);
                return {
                    token,
                    user
                };
            }
        });

        t.nonNull.field('login', {
            type: 'AuthPayload',
            args: {
                email: nonNull(stringArg()),
                password: nonNull(stringArg()),
            },
            async resolve(parent, args, context) {
                const user = await context.prisma.user.findUnique({
                    where: { email: args.email }
                });
                const valid = await bcrypt.compare(args.password, user?.password ?? '');
                if (!user || !valid) {
                    throw new Error('Invalid email or password.');
                }
                const token = jwt.sign({ userId: user?.id },process.env.APP_SECRET as string);
                return {
                    token,
                    user,
                };
            }
        });
    },
});