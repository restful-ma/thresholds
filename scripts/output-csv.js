
const fs = require("fs");
const { ensureDirExists } = require("./utils");

const fileDirOA3 = "./results/openapi";
const formatOA3 = "openapi";

const fileDirWadl = "./results/wadl";
const formatWadl = "wadl";

const fileDirRaml = "./results/raml";
const formatRaml = "raml";

const RESULT_CSV_FILE_NAME = "./results/results.csv";

// Program entrance ------------------------------------
main();

function main() {
    const inputArg = (typeof process.argv[2] === "undefined") ? "NO_ARGUMENTS_PASSED" : process.argv[2].toLowerCase();
    console.log(inputArg);
    console.log("CSV will be generated from all repositories");
    switch (inputArg) {
        case "openapi":
            generateCsvHeader(fileDirOA3, fs.readdirSync(fileDirOA3));
            generateCsvContent(fileDirOA3, fs.readdirSync(fileDirOA3), formatOA3);
            break;

        case "raml":
            generateCsvHeader(fileDirRaml, fs.readdirSync(fileDirRaml));
            generateCsvContent(fileDirRaml, fs.readdirSync(fileDirRaml), formatRaml);
            break;

        case "wadl":
            generateCsvHeader(fileDirWadl, fs.readdirSync(fileDirWadl));
            generateCsvContent(fileDirWadl, fs.readdirSync(fileDirWadl), formatWadl);
            break;

        default:
            // try to find first file from wadl directory to get metric names for csv header (getting csv headers from other formats is also possible)
            generateCsvHeader(fileDirWadl, fs.readdirSync(fileDirWadl));
            generateCsvContent(fileDirWadl, fs.readdirSync(fileDirWadl), formatWadl);
            generateCsvContent(fileDirRaml, fs.readdirSync(fileDirRaml), formatRaml);
            generateCsvContent(fileDirOA3, fs.readdirSync(fileDirOA3), formatOA3);
            return;
    }
}

/*
 Retrieves first file from specified directory and get all metric names 
 sort metric names and write them into the first line of csv file. 
*/
function generateCsvHeader(fileDir, inputArr) {
    const fileName = inputArr[0];

    const json = JSON.parse(fs.readFileSync(fileDir + "/" + fileName, "utf8"));
    const measure = json.measurement;
    const measureMap = new Map();
    for (let j = 0; j < measure.length; j++) {
        measureMap.set(measure[j].metricName, measure[j].metricValue);
    }
    const sortedMap = new Map([...measureMap].sort());

    // Array with the csv headers
    const lineArray = [];
    // First csv header is file name
    lineArray.push("FILE-NAME");

    // next csv headers are the sorted metrics 
    for (const [key] of sortedMap) {
        lineArray.push(key);
    }

    // last csv header is  specFormat
    lineArray.push("specFormat");

    const csvLine = lineArray.join(",");
    // ensure output dir exists
    ensureDirExists(RESULT_CSV_FILE_NAME);
    fs.writeFileSync(RESULT_CSV_FILE_NAME, csvLine + "\n");
}


function generateCsvContent(fileDir, inputArr, format) {
    for (let i = 0; i < inputArr.length; i++) {
        try {
            const fileName = inputArr[i];
            const json = JSON.parse(fs.readFileSync(fileDir + "/" + fileName, "utf8"));
            const measure = json.measurement;
            const measureMap = new Map();

            for (let j = 0; j < measure.length; j++) {
                measureMap.set(measure[j].metricName, measure[j].metricValue);
            }

            const sortedMap = new Map([...measureMap].sort());

            const lineArray = [];
            // replace all "," of fileNames with "-" else csv is faulty 
            const sanitizedName = fileName.replace(/,/g, "-");
            // First entry  file name
            lineArray.push(sanitizedName);

            for (const [value] of sortedMap) {
                lineArray.push(value);
            }

            // last entry is format
            lineArray.push(format);
            const csvLine = lineArray.join(",");
            fs.appendFileSync(RESULT_CSV_FILE_NAME, csvLine + "\n");
        } catch (e) {
            fs.appendFileSync("csvParseErrors.txt", inputArr[i] + "\n");
            continue;
        }
    }
}
