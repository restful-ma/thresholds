#######################################################################
# wrapper script to execute the complete benchmark in one go
#######################################################################

# delete results folder if it already exists
rm -rf ./results

# delete potentially existing log files
rm -f error.log console-overflow.log conversion-failure.log csv-parse-errors.log

# install dependencies
npm install                         # nodejs
pip install -r requirements.txt     # python

# collect metrics for all API types via RAMA CLI (list of JSON files in ./results/<api-format>)
node src/01-collect-metrics.js --format=raml
node src/01-collect-metrics.js --format=wadl
node src/01-collect-metrics.js --format=openapi

# convert JSON output files into one holistic CSV file (./result/metrics.csv)
node src/02-generate-csv.js --format=raml
node src/02-generate-csv.js --format=wadl
node src/02-generate-csv.js --format=openapi

# produce aggregated JSON results file (./results/aggregated-metrics.json) as well as diagrams
python src/03-aggregate-metrics.py

# produce LaTex tables with statistic results (./results/latex-tables.tex); only works if all three formats have been generated
node src/04-generate-latex.js
