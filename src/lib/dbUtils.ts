import DuckDB from 'duckdb';
import { filterQuery } from './queryFilter';

const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, R2_TOKEN, R2_ENDPOINT, R2_CATALOG } = process.env;

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
  await query("SET home_directory='/tmp';", false);
  // Load httpfs
  await query("INSTALL '/app/extensions/httpfs.duckdb_extension';", false);
  await query("LOAD '/app/extensions/httpfs.duckdb_extension';", false);
  // Load iceberg
  await query("INSTALL '/app/extensions/iceberg.duckdb_extension';", false);
  await query("LOAD '/app/extensions/iceberg.duckdb_extension';", false);
  // Load nanoarrow
  await query("INSTALL '/app/extensions/nanoarrow.duckdb_extension';", false);
  await query("LOAD '/app/extensions/nanoarrow.duckdb_extension';", false);

  // Create R2 Data Catalog secret if env vars are set, and attach catalog
  if (R2_TOKEN && R2_ENDPOINT && R2_CATALOG) {
    // Create secrets
    await query(
      `CREATE OR REPLACE SECRET r2_catalog_secret (TYPE ICEBERG, TOKEN '${R2_TOKEN}', ENDPOINT '${R2_ENDPOINT}');`,
      false,
    );
    // Attach catalog
    await query(`ATTACH '${R2_CATALOG}' AS r2lake (TYPE ICEBERG, ENDPOINT '${R2_ENDPOINT}');`, false);
  }

  // Set AWS credentials if env vars are set
  if (AWS_REGION && AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY) {
    await query(`SET s3_region='${AWS_REGION}';`, false);
    await query(`SET s3_access_key_id='${AWS_ACCESS_KEY_ID}';`, false);
    await query(`SET s3_secret_access_key='${AWS_SECRET_ACCESS_KEY}';`, false);
  }

  // Whether or not the global http metadata is used to cache HTTP metadata, see https://github.com/duckdb/duckdb/pull/5405
  await query('SET enable_http_metadata_cache=true;', false);

  // Whether or not object cache is used to cache e.g. Parquet metadata
  await query('SET enable_object_cache=true;', false);

  // Whether or not version guessing is enabled
  await query('SET unsafe_enable_version_guessing=true;', false);

  // Lock the local file system
  await query("SET disabled_filesystems = 'LocalFileSystem';", false);

  // Lock the configuration
  await query('SET lock_configuration=true;', false);
};
