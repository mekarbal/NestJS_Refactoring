import {type QueryResultHKT, type PgDatabase} from 'drizzle-orm/pg-core';
import type * as schema from './schema.js';

export type Database = PgDatabase<QueryResultHKT, typeof schema>;

export const ProductTypes = {
    NORMAL: 'NORMAL',
    SEASONAL: 'SEASONAL',
    EXPIRABLE: 'EXPIRABLE',
    FLASHSALE: 'FLASHSALE',
};
