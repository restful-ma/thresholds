# RAMA CLI Threshold Benchmark
> A repeatable metric threshold derivation study with the [RAMA CLI](https://github.com/restful-ma/rama-cli)

## Prerequisites
- Install Node.js (>= v12.10.0)
- Install Python (>= v3.4.0)
- Install a JDK v8
- Install Maven
- Download and compile the [RAMA CLI](https://github.com/restful-ma/rama-cli)
  - This benchmark expects the JAR file to be at the following relative location: `../rama-cli/target/rama-cli-0.1.2.jar`
  - You can use the following helper script to automatically do this for you (requires Git): `download-and-build-rama-cli.sh`

## Purpose
This benchmark uses a large collection of publicly available API descriptions (OpenAPI, RAML, WADL) to calculate metric thresholds for all metrics of the [RAMA CLI](https://github.com/restful-ma/rama-cli). The API files are located in the respective subfolders of `./benchmark-repository`.
