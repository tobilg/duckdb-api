# duckdb-api

Run [DuckDB](https://duckdb.org/) behind a [Hono](https://hono.dev/) HTTP API in a Node.js Docker container.

This project uses [`@duckdb/node-api`](https://www.npmjs.com/package/@duckdb/node-api) and currently targets DuckDB `v1.5.4`.

## Usage

Install dependencies and run the API locally:

```bash
npm install
npm run dev
```

Build and run the Docker image:

```bash
npm run build:docker
npm run dev:docker
```

The API listens on port `3000` by default.

## Docker Extensions

`npm run build:docker` runs `scripts/download_extensions.sh` before building the image. The script downloads Linux AMD64 DuckDB `v1.5.4` extension binaries for:

- `httpfs`
- `iceberg`
- `ducklake`
- `nanoarrow`

The app loads `httpfs`, `iceberg`, and `nanoarrow` during initialization.

## Environment Variables

- `PORT`: Port to run the API on. Defaults to `3000`.
- `API_TOKEN`: Bearer token for `POST /query`.
- `USERNAME`: Username for basic auth. Requires `PASSWORD`.
- `PASSWORD`: Password for basic auth. Requires `USERNAME`.

Basic auth applies to both `POST /query` and `POST /streaming-query` when `USERNAME` and `PASSWORD` are set.

AWS S3 access:

- `AWS_REGION`: AWS region for S3 access.
- `AWS_ACCESS_KEY_ID`: AWS access key ID for S3 access.
- `AWS_SECRET_ACCESS_KEY`: AWS secret access key for S3 access.

Cloudflare R2 Data Catalog / Iceberg access:

- `R2_CATALOG`: Catalog name.
- `R2_ENDPOINT`: Catalog endpoint URI.
- `R2_TOKEN`: Cloudflare API token for R2.

## API

Both query endpoints accept a JSON request body with a `query` property:

```json
{
  "query": "SELECT 1 AS value;"
}
```

User-submitted queries are filtered to block `duckdb_settings`, `INSTALL`, `LOAD`, `SET`, `PRAGMA`, and `SECRET` usage.

### `POST /query`

Executes a SQL query and returns JSON row objects.

Response content type:

```text
application/json
```

Example:

```bash
curl -X POST http://localhost:3000/query \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT 1 AS value;"}'
```

Example response:

```json
[
  {
    "value": 1
  }
]
```

### `POST /streaming-query`

Executes a SQL query with DuckDB's streaming result API and streams newline-delimited JSON rows.

Response content type:

```text
application/x-ndjson
```

Example:

```bash
curl --location http://localhost:3000/streaming-query \
  --header "Content-Type: application/json" \
  --data '{
    "query": "SELECT * FROM '\''https://shell.duckdb.org/data/tpch/0_01/parquet/orders.parquet'\'' LIMIT 100"
  }'
```

Example response:

```jsonl
{"o_orderkey":1,"o_custkey":36901}
{"o_orderkey":2,"o_custkey":78002}
```

`@duckdb/node-api` does not expose the legacy `arrowIPCStream()` API from the old `duckdb` package, so this endpoint streams NDJSON instead of Arrow IPC bytes.
