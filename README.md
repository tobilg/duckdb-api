# duckdb-api
Running [DuckDB](https://duckdb.org/) behind a [Hono.js](https://hono.dev/) API in a Docker container.

## Building the Docker image

```bash
docker build -t duckdb-api .
```

## Usage
To build and run the Docker container, use the following commands:

```bash
docker run -p 3000:3000 tobilg/duckdb-api:0.2.0
```

### Environment Variables
You can set the port:
- `PORT`: The port to run the API on. Defaults to `3000`. (optional)

If you want to use Bearer Auth, set the following:
- `API_TOKEN`: The API Token to be used for bearer auth. (optional)

If you want to activate basic auth for the API, set both the `USERNAME` and the `PASSWORD` environment variables:
- `USERNAME`: The username to be used for basic auth. (optional)
- `PASSWORD`: The password to be used for basic auth. (optional)

In case you want to use AWS S3, set the `AWS_REGION`, `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables with the appropriate values (you need to have set up the appropriate credentials beforehand in your AWS account):
- `AWS_REGION`: The AWS region to be used for S3 access (optional)
- `AWS_ACCESS_KEY_ID`: The AWS access key ID to be used for S3 access (optional)
- `AWS_SECRET_ACCESS_KEY`: The AWS secret access key to be used for S3 access (optional)

When you want to use the [R2 Data Catalog](https://developers.cloudflare.com/r2/data-catalog/get-started/) (i.e. your data resides in R2) for Apache Iceberg tables, you need to add the following environment variables:
- `R2_CATALOG`: The catalog name
- `R2_ENDPOINT`: The catalog endpoint URI
- `R2_TOKEN`: The Cloudflare API Token for R2 (see [docs](https://developers.cloudflare.com/r2/data-catalog/get-started/#3-create-an-api-token))

### API Documentation
There are two endpoints available:

- `POST /query`: Executes a SQL query and returns the result as a JSON object.
- `POST /streaming-query`: Executes a SQL query and streams the Arrow data to the client.

The request body of both endpoints is a JSON object with a `query` property, which contains the SQL query to execute.

### Examples

Simple query to the JSON endpoint
```bash
curl -X POST http://localhost:3000/query -H "Content-Type: application/json" -d '{"query": "SELECT 1;"}'
```
Streaming query from a remote Parquet file
```bash
curl --location 'localhost:3000/streaming-query' \
  --header 'Content-Type: application/json' \
  --data '{
    "query": "SELECT * FROM '\''https://shell.duckdb.org/data/tpch/0_01/parquet/orders.parquet'\'' LIMIT 100"
  }' \
  --output /tmp/result.arrow
```
