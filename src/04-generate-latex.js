const fs = require("fs");
const { ensureDirExists } = require("./utils");

const RESULTS_JSON = "./results/aggregated-metrics.json";
const LATEX_DIR = "./results/";
const LATEX_OUTPUT_FILE = "latex-tables.tex";

// read results JSON file
const json = JSON.parse(fs.readFileSync(RESULTS_JSON, "utf8"));

// ensure output dir exists
ensureDirExists(LATEX_DIR);
// create latex output file
fs.writeFileSync(LATEX_DIR + LATEX_OUTPUT_FILE, "\n\n");

const metrics = json.metrics;
const formats = json.formats;
const metricsNames = [
    "WeightedServiceInterfaceCount",
    "ArgumentsPerOperation",
    "AveragePathLength",
    "BiggestRootCoverage",
    "DataWeight",
    "DistinctMessageRatio",
    "LongestPath",
    "NumberOfRootPaths",
    "ServiceInterfaceDataCohesion",
    "LackOfMessageLevelCohesion"
];

for (let x = 0; x < metricsNames.length; x++) {
    const metricName = metricsNames[x];
    const latexTable =
        metricName +
        "\n\n" +
        "\\begin{center}\n " +
        " \\begin{tabular}{ c|c|c|c|c}\n    \\hline\n  " +
        "   \\label{table:WSIC}\n " +
        "    Value & RAML & WADL & OpenAPI & All \\\\ \\hline\n " +
        // Mean
        "    Mean &" +
        round(metrics[metricName]["raml"]["mean"]) +
        " &" +
        round(metrics[metricName]["wadl"]["mean"]) +
        " &" +
        round(metrics[metricName]["openapi"]["mean"]) +
        " &" +
        round(metrics[metricName]["all"]["mean"]) +
        " \\\\ \\hline\n " +
        // SD
        "    SD &" +
        round(metrics[metricName]["raml"]["std"]) +
        "&" +
        round(metrics[metricName]["wadl"]["std"]) +
        "&" +
        round(metrics[metricName]["openapi"]["std"]) +
        "&" +
        round(metrics[metricName]["all"]["std"]) +
        " \\\\ \\hline\n " +
        // MIN
        "    Min &" +
        round(metrics[metricName]["raml"]["min"]) +
        "&" +
        round(metrics[metricName]["wadl"]["min"]) +
        "&" +
        round(metrics[metricName]["openapi"]["min"]) +
        "&" +
        round(metrics[metricName]["all"]["min"]) +
        " \\\\ \\hline\n " +
        // MAX
        "    Max &" +
        round(metrics[metricName]["raml"]["max"]) +
        "&" +
        round(metrics[metricName]["wadl"]["max"]) +
        "&" +
        round(metrics[metricName]["openapi"]["max"]) +
        "&" +
        round(metrics[metricName]["all"]["max"]) +
        " \\\\ \\hline\n " +
        // 25%
        "    \\rowcolor[HTML]{00FF00} 25\\% &" +
        round(metrics[metricName]["raml"]["25%"]) +
        "&" +
        round(metrics[metricName]["wadl"]["25%"]) +
        "&" +
        round(metrics[metricName]["openapi"]["25%"]) +
        "&" +
        round(metrics[metricName]["all"]["25%"]) +
        " \\\\ \\hline\n " +
        // Q2-Median
        "    \\rowcolor[HTML]{7FFF00} 50\\% &" +
        round(metrics[metricName]["raml"]["50%"]) +
        "&" +
        round(metrics[metricName]["wadl"]["50%"]) +
        "&" +
        round(metrics[metricName]["openapi"]["50%"]) +
        "&" +
        round(metrics[metricName]["all"]["50%"]) +
        " \\\\ \\hline\n " +
        // Q3
        "    \\rowcolor[HTML]{FFFF00} 75\\% &" +
        round(metrics[metricName]["raml"]["75%"]) +
        "&" +
        round(metrics[metricName]["wadl"]["75%"]) +
        "&" +
        round(metrics[metricName]["openapi"]["75%"]) +
        "&" +
        round(metrics[metricName]["all"]["75%"]) +
        " \\\\ \\hline\n " +
        // Number of Files
        "    Total Files &" +
        formats["raml"] +
        "&" +
        formats["wadl"] +
        "&" +
        formats["openapi"] +
        "&" +
        (parseInt(formats["raml"]) +
            parseInt(formats["wadl"]) +
            parseInt(formats["openapi"])) +
        " \\\\ \\hline\n " +
        " \\end{tabular}\n " +
        "\\end{center}";

    fs.appendFileSync(LATEX_DIR + LATEX_OUTPUT_FILE, latexTable + "\n\n");
}

function round(number) {
    return parseFloat(number.toFixed(4));
}
