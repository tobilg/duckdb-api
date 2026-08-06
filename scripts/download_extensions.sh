#!/bin/bash

rm -rf $PWD/extensions
mkdir -p $PWD/extensions

DUCKDB_VERSION=v1.5.5

# Download extensions
curl https://extensions.duckdb.org/$DUCKDB_VERSION/linux_amd64/httpfs.duckdb_extension.gz --output $PWD/extensions/httpfs.duckdb_extension.gz
curl https://extensions.duckdb.org/$DUCKDB_VERSION/linux_amd64/iceberg.duckdb_extension.gz --output $PWD/extensions/iceberg.duckdb_extension.gz
curl https://extensions.duckdb.org/$DUCKDB_VERSION/linux_amd64/ducklake.duckdb_extension.gz --output $PWD/extensions/ducklake.duckdb_extension.gz
curl https://community-extensions.duckdb.org/$DUCKDB_VERSION/linux_amd64/nanoarrow.duckdb_extension.gz -o $PWD/extensions/nanoarrow.duckdb_extension.gz

# Unzip 
gunzip $PWD/extensions/httpfs.duckdb_extension.gz
gunzip $PWD/extensions/iceberg.duckdb_extension.gz
gunzip $PWD/extensions/ducklake.duckdb_extension.gz
gunzip $PWD/extensions/nanoarrow.duckdb_extension.gz
