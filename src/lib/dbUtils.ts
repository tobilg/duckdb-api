import DuckDB from 'duckdb';
import { filterQuery } from './queryFilter';

const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = process.env;

// Instantiate DuckDB
const duckDB = new DuckDB.Database(':memory:', {
	allow_unsigned_extensions: 'true',
});

// Create connection
const connection = duckDB.connect();

// Promisify query method
export const query = (query: string, filteringEnabled = true): Promise<DuckDB.TableData> => {
	return new Promise((resolve, reject) => {
		connection.all(filterQuery(query, filteringEnabled), (err, res) => {
			if (err) reject(err);
			resolve(res);
		});
	});
};

export const streamingQuery = (query: string, filteringEnabled = true): Promise<DuckDB.IpcResultStreamIterator> => {
	return connection.arrowIPCStream(filterQuery(query, filteringEnabled));
};

export const initialize = async () => {
	// Load home directory
	await query(`SET home_directory='/tmp';`, false);

	// Hint: INSTALL httpfs; is needed again, because it's no longer included in the new repo:
	// https://github.com/duckdb/duckdb-node/tree/v1.1.1/src/duckdb/extension
	await query('INSTALL httpfs;', false);
	await query('LOAD httpfs;', false);
	await query('INSTALL json;', false);
	await query('LOAD json;', false);
	await query('INSTALL arrow FROM community;', false);
	await query('LOAD arrow;', false);

	// Whether or not the global http metadata is used to cache HTTP metadata, see https://github.com/duckdb/duckdb/pull/5405
	await query('SET enable_http_metadata_cache=true;', false);

	// Whether or not object cache is used to cache e.g. Parquet metadata
	await query('SET enable_object_cache=true;', false);

	if (AWS_REGION && AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY) {
		// Set AWS credentials
		await query(`SET s3_region='${AWS_REGION}';`, false);
		await query(`SET s3_access_key_id='${AWS_ACCESS_KEY_ID}';`, false);
		await query(`SET s3_secret_access_key='${AWS_SECRET_ACCESS_KEY}';`, false);
	}
};
