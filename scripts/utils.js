const fs = require("fs");

exports.ensureDirExists = (dirName) => {
    try {
        fs.mkdirSync(dirName, { recursive: true });
    } catch (err) {
        if (err.code !== "EEXIST") throw err;
    }
};
