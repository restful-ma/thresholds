const fs = require("fs");
const exec = require("child_process").execSync;
const path = require("path");
const { ensureDirExists, logTime } = require("./utils");

const start = process.hrtime();

const SWAGGER_YAML = "swagger.yaml";
const OPENAPI_YAML = "openapi.yaml";
const outDirectory = "./oa3/";

// Program entrance ------------------------------------
main();

function main() {
    // find all files inside this directory that are named as 'swagger.yaml' or 'openapi.yaml'
    const fileList = recFindByExt("./openapi-directory/APIs");

    console.log("OK!");
    console.log("Total file founds: " + fileList.length);
    console.log("Start of conversion -------------------------");

    // ensure output dir exists
    ensureDirExists(outDirectory);

    for (let i = 0; i < fileList.length; i++) {
        try {
            convertFile(fileList[i]);
            logTime(start);
        } catch (e) {
            console.log("SKIPPED " + fileList[i]);
            console.log(
                "LOG ERROR to ConversionFailure.txt --------------------------------------------------"
            );
            console.log(e);
            fs.appendFileSync("conversion-failure.log", fileList[i] + "\n");
        }
    }
}

function convertFile(name) {
    const inputFileName = name;
    let outFileName = name.replace(/\\/g, "-");
    outFileName = outFileName.replace("openapi-directory-APIs-", "");
    console.log(outFileName);

    exec(
        "npx swagger2openapi -r --yaml -o " +
        outDirectory +
        outFileName +
        " " +
        inputFileName,
        async (err, stdout, stderr) => {
            if (err) {
                // node couldn't execute the command
                console.log(" node couldn't execute the command");
                console.log(`stderr: ${stderr}`);
                return;
            }
        }
    );
}

/*
    goes recursively through all folders and searches for files with specified names.
*/
function recFindByExt(base, files, result) {
    files = files || fs.readdirSync(base);
    result = result || [];

    files.forEach(function (file) {
        const newbase = path.join(base, file);
        if (fs.statSync(newbase).isDirectory()) {
            result = recFindByExt(newbase, fs.readdirSync(newbase), result);
        } else {
            if (file == SWAGGER_YAML || file == OPENAPI_YAML) {
                result.push(newbase);
                console.log(newbase);
            }
        }
    });
    return result;
}
