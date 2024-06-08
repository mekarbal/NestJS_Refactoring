import pg from 'pg';
import {drizzle} from 'drizzle-orm/node-postgres';
import {afterEach} from 'vitest';
import {sql, getTableName} from 'drizzle-orm';
import * as schema from '@/db/schema.js';
import {CONFIG} from '@/configuration/index.js';

const databaseConfig = CONFIG.get('db');

afterEach(async () => {
	const client = new pg.Client({
		connectionString: databaseConfig.url,
	});
	await client.connect();
	const database = drizzle(client, {
		schema,
		logger: true,
	});
	console.log('🗑️ Emptying the entire database');

	const tables = [schema.ordersToProducts, schema.orders, schema.products];

	console.log();

	const queries = tables.map(table => getTableName(table)).map(tableName => {
		console.log(`🧨 Preparing delete query for table: ${tableName}`);
		return sql.raw(`DELETE FROM ${tableName};`);
	});

	console.log('🛜 Sending delete queries');

	await database.transaction(async trx => {
		await Promise.all(
			queries.map(async query => {
				if (query) {
					await trx.execute(query);
				}
			}),
		);
	});

	console.log('✅ Database emptied');
});

