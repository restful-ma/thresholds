const fs = require("fs");
const argv = require("yargs").argv;
const { ensureDirExists } = require("./utils");

const ALLOWED_API_FORMATS = ["openapi", "raml", "wadl"];
const RESULT_DIR = "./results/";
const RESULT_FILE_NAME = "metrics.csv";

// Program entrance ------------------------------------
main();

function main() {
    const apiFormat = argv.format ? argv.format.toLowerCase() : "MISSING_FORMAT";
    if (ALLOWED_API_FORMATS.includes(apiFormat)) {
        console.log("Starting CSV generation...");
        const JSON_FILE_DIR = `./results/${apiFormat}`;
        const fileList = fs.readdirSync(JSON_FILE_DIR);

        if (fileList.length === 0) {
            console.log("No JSON files identified in input directory! Aborting...");
            return;
        }

        // if no CSV file exists, create one with a header
        if (!fs.existsSync(RESULT_DIR + RESULT_FILE_NAME)) {
            generateCsvFileWithHeader(RESULT_DIR, RESULT_FILE_NAME, JSON_FILE_DIR, fileList);
        }

        // append the non-header lines to the existing CSV file
        generateCsvContent(JSON_FILE_DIR, fileList, apiFormat);
        console.log("CSV generation done!");
    } else {
        console.log(
            "Required argument --format is missing! Please use it with `openapi`, `raml`, or `wadl`!"
        );
    }
}

/*
 Retrieves first file from specified directory and get all metric names 
 sort metric names and write them into the first line of csv file. 
*/
function generateCsvFileWithHeader(outputDir, outputFileName, inputFileDir, inputFileList) {
    // read metrics from first file from input dir
    const measurementList = JSON.parse(fs.readFileSync(inputFileDir + "/" + inputFileList[0], "utf8")).measurement;
    const measureMap = new Map();
    for (let x = 0; x < measurementList.length; x++) {
        measureMap.set(measurementList[x].metricName, measurementList[x].metricValue);
    }
    const sortedMap = new Map([...measureMap].sort());

    // array with the csv headers, first attribute is `FileName`
    const lineArray = ["FileName"];
    // dynamically add sorted metric names as header attributes
    for (const [key] of sortedMap) {
        lineArray.push(key);
    }
    // last csv header attribute is `ApiFormat`
    lineArray.push("ApiFormat");

    const csvLine = lineArray.join(",");
    // ensure output dir exists
    ensureDirExists(outputDir);
    fs.writeFileSync(outputDir + outputFileName, csvLine + "\n");
}

function generateCsvContent(inputFileDir, inputFileList, format) {
    for (let x = 0; x < inputFileList.length; x++) {
        try {
            // read metric values from JSON file
            let measurementList = JSON.parse(fs.readFileSync(inputFileDir + "/" + inputFileList[x], "utf8")).measurement;
            // sort measurement list alphabeticall by metricName
            measurementList = measurementList.sort((m1, m2) => {
                return m1.metricName > m2.metricName ? 1 : -1;
            });

            // CSV entry array with fileName as first element; replace all "," in fileNames with "-", otherwise CSV is faulty
            let csvArray = [inputFileList[x].replace(/,/g, "-")];
            // dynamically add metric values
            csvArray = csvArray.concat(measurementList.map(metric => metric.metricValue));
            // last entry is format
            csvArray.push(format);

            // append to CSV file
            fs.appendFileSync(RESULT_DIR + RESULT_FILE_NAME, csvArray.join(",") + "\n");
        } catch (e) {
            fs.appendFileSync("csv-parse-errors.log", inputFileList[x] + "\n");
            continue;
        }
    }
}
