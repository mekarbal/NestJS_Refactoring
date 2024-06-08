import {type FastifyPluginAsync} from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import {drizzle} from 'drizzle-orm/node-postgres';
import pg from 'pg';
import {CONFIG} from '../configuration/index.js';
import * as schema from './schema.js';
import {type Database} from './type.js';

declare module 'fastify' {
	interface FastifyInstance { // eslint-disable-line @typescript-eslint/consistent-type-definitions
		database: Database;
	}
}

const databaseConfig = CONFIG.get('db');
const appConfig = CONFIG.get('app');
export const drizzlePlugin: FastifyPluginAsync = fastifyPlugin(
	async server => {
		const pool = new pg.Pool({
			connectionString: databaseConfig.url,
		});
		const database = drizzle(pool, {
			schema,
			...(appConfig.env === 'PROD' ? {} : {logger: true}),
		});

		// Make Prisma Client available through the fastify server instance: server.prisma
		server.decorate('database', database);

		server.addHook('onClose', async () => {
			console.log('Closing database connection pool');
			await pool.end();
			console.log('Closed database connection pool');
		});
	},
);
