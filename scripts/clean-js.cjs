const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

const cleanJs = dir => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      cleanJs(filePath);
    } else if (/\.js(\.map)?$/.test(file)) {
      fs.unlinkSync(filePath);
    }
  }
};

cleanJs(srcDir);
