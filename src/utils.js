const fs = require("fs");

exports.ensureDirExists = (dirName) => {
    try {
        fs.mkdirSync(dirName, { recursive: true });
    } catch (err) {
        if (err.code !== "EEXIST") throw err;
    }
};

exports.logTime = (start) => {
    const elapsed = (process.hrtime(start)[1] / 1000000).toFixed(2);
    console.log(
        `Total time in seconds: ${
        process.hrtime(start)[0]
        }s, time for last file: ${elapsed}ms`
    );
};
