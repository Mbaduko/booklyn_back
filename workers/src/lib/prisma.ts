import { PrismaClient } from '@prisma/client';
import argon from 'argon2';

const prisma = new PrismaClient().$extends({
    query:{
        user: {
            async create({args, query}) {
                if (args.data.password) {
                    let plainPassword: string | undefined;
                    if (typeof args.data.password === 'string') {
                        plainPassword = args.data.password;
                    } else if (
                        typeof args.data.password === 'object' &&
                        args.data.password !== null &&
                        'set' in args.data.password &&
                        typeof (args.data.password as any).set === 'string'
                    ) {
                        plainPassword = (args.data.password as any).set;
                    }
                    if (plainPassword) {
                        const hashed = await argon.hash(plainPassword, { type: argon.argon2id });
                        if (typeof args.data.password === 'string') {
                            args.data.password = hashed;
                        } else {
                            (args.data.password as any).set = hashed;
                        }
                    }
                }
                return query(args);
            },
            async update({args, query}) {
                if (args.data.password) {
                    let plainPassword: string | undefined;
                    if (typeof args.data.password === 'string') {
                        plainPassword = args.data.password;
                    } else if (
                        typeof args.data.password === 'object' &&
                        args.data.password !== null &&
                        'set' in args.data.password &&
                        typeof (args.data.password as any).set === 'string'
                    ) {
                        plainPassword = (args.data.password as any).set;
                    }
                    if (plainPassword) {
                        const hashed = await argon.hash(plainPassword, { type: argon.argon2id });
                        if (typeof args.data.password === 'string') {
                            args.data.password = hashed;
                        } else {
                            (args.data.password as any).set = hashed;
                        }
                    }
                }
                return query(args);
            }
        }
    }
});

export default prisma;