const fs = require("fs");
const util = require("util");
const argv = require("yargs").argv;
const exec = util.promisify(require("child_process").exec);
const { ensureDirExists, logTime } = require("./utils");

const REPOSITORY_DIR = "./benchmark-repository/";
const RESULT_DIR = "./results/";
const ALLOWED_API_FORMATS = ["openapi", "raml", "wadl"];

// path to the RAMA CLI JAR file
const RAMA_CLI_PATH = argv.cliPath || "../rama-cli/target/rama-cli-0.1.2.jar";

// Starting time
const start = process.hrtime();

main();

// Program entrance ------------------------------------
function main() {
    const apiFormat = argv.format ? argv.format.toLowerCase() : "MISSING_FORMAT";
    if (ALLOWED_API_FORMATS.includes(apiFormat)) {

        const inputFolder = REPOSITORY_DIR + apiFormat + "/";
        const outputFolder = RESULT_DIR + apiFormat + "/";
        ensureDirExists(outputFolder);

        // get list of files from directory; for RAML, folder structure may be nested (--> special function)
        const fileList = apiFormat === "raml" ? getRamlFile(inputFolder) : fs.readdirSync(inputFolder);
        executeJar(fileList, inputFolder, outputFolder, apiFormat);

    } else {
        console.log(
            "Required argument --format is missing! Please use it with `openapi`, `raml`, or `wadl`!"
        );
    }
}

async function executeJar(files, inputFolder, outputFolder, format) {
    console.log("Starting RAMA CLI...");
    for (let x = 0; x < files.length; x++) {
        try {
            console.log(files[x]);

            await getJsonMetrics(files[x], inputFolder, outputFolder, format).catch(
                err => {
                    // failure because the cli console output (exceeds buffer), but execution was still valid
                    if (err.code === "ERR_CHILD_PROCESS_STDIO_MAXBUFFER") {
                        console.log(
                            "CLI output exceeds buffer, but analysis was successul. Logged to console-overflow.log..."
                        );
                        fs.appendFileSync(
                            "console-overflow.log",
                            files[x] + "\n"
                        );
                    } else {
                        console.log("SKIPPED " + files[x]);
                        console.log(
                            "LOG ERROR to error.log----------------------------------------------------"
                        );
                        console.log(err);
                        fs.appendFileSync("error.log", files[x] + "\n");
                    }
                }
            );
            logTime(start);
        } catch (e) {
            console.log(e);
            continue;
        }
    }
}

async function getJsonMetrics(fileName, inFolder, outFolder, format) {
    // replace `/` with `-` in the result file name
    const outName = fileName.replace(/\//g, "-");
    await exec(`java -jar ${RAMA_CLI_PATH} -file ${inFolder + fileName} -format ${format} -json ${outFolder + outName}.json`);
    console.log(`${fileName} parsed successfully!`);
}

function getRamlFile(inFolder) {
    const ramlFoldersArray = fs.readdirSync(inFolder);
    const ramlMainFiles = [];
    console.log(`Detected a total of ${ramlFoldersArray.length} raml files...`);
    for (let i = 0; i < ramlFoldersArray.length; i++) {
        const ramlSubFiles = fs.readdirSync(inFolder + ramlFoldersArray[i]);
        for (let j = 0; j < ramlSubFiles.length; j++) {
            if (ramlSubFiles[j].endsWith("api.raml")) {
                // CAVEAT: file names with spaces may cause issues
                const fileName = ramlFoldersArray[i] + "/" + ramlSubFiles[j];
                ramlMainFiles.push(fileName);
            }
        }
    }
    return ramlMainFiles;
}
