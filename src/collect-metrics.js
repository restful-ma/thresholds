const fs = require("fs");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const { ensureDirExists } = require("./utils");

const oa3InFolder = "./benchmark-repository/openapi/";
const oA3OutFolder = "./results/openapi/";
const oa3Format = "openapi";

const wadlInFolder = "./benchmark-repository/wadl/";
const wadlOutFolder = "./results/wadl/";
const wadlFormat = "wadl";

const ramlInFolder = "./benchmark-repository/raml/";
const ramlOutFolder = "./results/raml/";
const ramlFormat = "raml";

// path to the RAMA CLI JAR file
const RAMA_CLI_PATH = "../rama-cli/target/rama-cli-0.1.1.jar";

// Starting time
const start = process.hrtime();

main();

// Program entrance ------------------------------------
function main() {
    const inputArg =
        typeof process.argv[2] === "undefined"
            ? "NO_ARGUMENTS_PASSED"
            : process.argv[2].toLowerCase();
    switch (inputArg) {
        case "openapi": {
            ensureDirExists(oA3OutFolder);
            const oa3Files = fs.readdirSync(oa3InFolder);
            executeJar(oa3Files, oa3InFolder, oA3OutFolder, oa3Format);
            break;
        }
        case "raml": {
            ensureDirExists(ramlOutFolder);
            const ramlFiles = getRamlFile(ramlInFolder);
            executeJar(ramlFiles, ramlInFolder, ramlOutFolder, ramlFormat);
            break;
        }
        case "wadl": {
            ensureDirExists(wadlOutFolder);
            const wadlFiles = fs.readdirSync(wadlInFolder);
            executeJar(wadlFiles, wadlInFolder, wadlOutFolder, wadlFormat);
            break;
        }
        default: {
            console.log(
                "Invalid argument! Please use openapi, raml, or wadl as argument"
            );
            return;
        }
    }
}

async function executeJar(files, inFolder, outFolder, format) {
    console.log("Starting RAMA CLI...");
    for (let i = 0; i < files.length; i++) {
        try {
            console.log(files[i]);

            await getJsonMetrics(files[i], inFolder, outFolder, format).catch(
                err => {
                    // failure because the cli console output (exceeds buffer), but execution was still valid
                    if (err.code === "ERR_CHILD_PROCESS_STDIO_MAXBUFFER") {
                        console.log(
                            "CLI output exceeds buffer, but still valid. Just in case this is logged to MetricOutputTooBig.txt"
                        );
                        fs.appendFileSync(
                            "MetricOutputTooBig.txt",
                            files[i] + "\n"
                        );
                    } else {
                        console.log("SKIPPED " + files[i]);
                        console.log(
                            "LOG ERROR to error.log----------------------------------------------------"
                        );
                        console.log(err);
                        fs.appendFileSync("error.log", files[i] + "\n");
                    }
                }
            );
            elapsedTime();
        } catch (e) {
            console.log(e);
            continue;
        }
    }
}

async function getJsonMetrics(fileName, inFolder, outFolder, format) {
    // replace `/` with `-` in the result file name
    const outName = fileName.replace(/\//g, "-");
    await exec(
        `java -jar ${RAMA_CLI_PATH} -file ${inFolder +
            fileName} -format ${format} -json ${outFolder + outName}.json`
    );
    console.log(`${fileName} parsed successfully!`);
}

function elapsedTime() {
    const elapsed = (process.hrtime(start)[1] / 1000000).toFixed(2);
    console.log(
        `Total time in seconds: ${
            process.hrtime(start)[0]
        }s, time for last file: ${elapsed}ms`
    );
}

function getRamlFile(inFolder) {
    const ramlFoldersArray = fs.readdirSync(inFolder);
    const ramlMainFiles = [];
    console.log(`Detected a total of ${ramlFoldersArray.length} raml files...`);
    for (let i = 0; i < ramlFoldersArray.length; i++) {
        const ramlSubFiles = fs.readdirSync(inFolder + ramlFoldersArray[i]);
        for (let j = 0; j < ramlSubFiles.length; j++) {
            if (ramlSubFiles[j].endsWith("api.raml")) {
                const fileName = ramlFoldersArray[i] + "/" + ramlSubFiles[j];
                ramlMainFiles.push(fileName);
            }
        }
    }
    return ramlMainFiles;
}
