// @ts-nocheck
const { exec } = require('child_process');
const fs = require('fs');
const { minify: minifyHtml } = require('html-minifier');
const UglifyJS = require('uglify-js');
const { minify: SWCMinify } = require('@swc/core');
const path = require('path');
const ect = require('ect-bin');
const advzip = require('advzip-bin');
const Terser = require('terser');
const { execFileSync } = require('child_process');
// const ClosureCompiler = require('google-closure-compiler').compiler;

const USE_ROAD_ROLLER = true;
const USE_RR_CONFIG = true;
const USE_DISABLE_THROW = true;

// swap em out until you get the smallest size
const MINIFIER = 'terser';

// Unquoted CSS / SVG / HTML keys passed to setProperty / setAttribute.
// Terser already skips DOM builtins when properties.builtins is false.
const MANGLE_PROPS_RESERVED = [
  'background',
  'border',
  'bottom',
  'color',
  'cursor',
  'display',
  'gap',
  'height',
  'innerHTML',
  'inset',
  'left',
  'margin',
  'overflow',
  'padding',
  'position',
  'right',
  'stroke',
  'top',
  'transform',
  'transform-origin',
  'type',
  'viewBox',
  'width',
  'x1',
  'x2',
  'y1',
  'y2',
];

const execAsync = async command => {
  return new Promise((resolve, reject) => {
    console.log(command);
    exec(command, (err, stdout, stderr) => {
      if (err) {
        reject(err + ',' + stderr);
        return;
      }
      resolve(stdout);
    });
  });
};

async function applyRoadRoller(minifiedHtml, minifiedSrc) {
  return embedJs(minifiedHtml, {
    code: minifiedSrc,
    fileName: 'index.js',
  });
}

async function embedJs(html, chunk) {
  const scriptTagRemoved = html.replace(
    new RegExp(`<script[^>]*?src=[./]*${chunk.fileName}[^>]*?></script>`),
    ''
  );
  const htmlInJs = `document.write('${scriptTagRemoved}');` + chunk.code.trim();

  const inputs = [
    {
      data: htmlInJs,
      type: 'js',
      action: 'eval',
    },
  ];

  let options;
  if (USE_RR_CONFIG) {
    try {
      // throw new Error();
      console.log(' use precalculated config');
      options = JSON.parse(
        fs.readFileSync(`${__dirname}/roadroller-config.json`, 'utf-8')
      );
    } catch (error) {
      throw new Error(
        'Roadroller config not found. Generate one or use the regular build option'
      );
    }
  } else {
    options = { allowFreeVars: true };
  }
  // return `<script>\n${htmlInJs}\n</script>`;

  // Dynamic import avoids roadroller's CJS shim (broken `esm` on Node 21+)
  const { Packer } = await import('roadroller');
  const packer = new Packer(inputs, options);
  fs.writeFileSync(`${path.join(__dirname, '../')}/output.js`, htmlInJs);
  if (!USE_RR_CONFIG) {
    // No precalculated config: let roadroller search for good params itself.
    // (Bug fixed: this used to run unconditionally, silently overwriting
    // numAbbreviations/sparseSelectors from roadroller-config.json every
    // build via its internal re-search, regardless of USE_RR_CONFIG.)
    await packer.optimize(2);
  }
  const { firstLine, secondLine } = packer.makeDecoder();
  return `<script>\n${firstLine}\n${secondLine}\n</script>`;

  return '';
}

/**
 * The bundle is a plain concatenation with imports stripped, so `class A
 * extends B` runs before B exists unless B's file was emitted first. Walk the
 * relative imports and emit each file after everything it depends on.
 */
function sortByImports(filePaths) {
  const key = p => path.resolve(p);
  const known = new Map(filePaths.map(p => [key(p), p]));
  const deps = new Map();

  for (const p of filePaths) {
    const src = fs.readFileSync(p, 'utf8');
    const found = [];
    const re = /from\s*['"](\.[^'"]+)['"]/g;
    let m;
    while ((m = re.exec(src))) {
      const base = path.resolve(path.dirname(p), m[1]);
      for (const cand of [base, base + '.js', base + '/index.js']) {
        if (known.has(key(cand))) {
          found.push(known.get(key(cand)));
          break;
        }
      }
    }
    deps.set(p, found);
  }

  const out = [];
  const mark = new Map();
  const visit = p => {
    // 1 = in progress. Re-entering means an import cycle; the emitted JS only
    // cycles on things used lazily inside functions, so ordering is moot there.
    if (mark.get(p)) {
      return;
    }
    mark.set(p, 1);
    for (const d of deps.get(p) || []) {
      visit(d);
    }
    mark.set(p, 2);
    out.push(p);
  };
  for (const p of filePaths) {
    visit(p);
  }
  return out;
}

function getAllFilePaths(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  let arr = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arr = arr.concat(getAllFilePaths(dirPath + '/' + file, arrayOfFiles));
    } else {
      arr.push(path.join(dirPath, '/', file));
    }
  });

  return arr.filter(path => path.match(/\.js$/));
}

async function minifyFiles(filePaths) {
  console.log('minifyfiles', filePaths);

  let minFunc;
  if (MINIFIER === 'terser') {
    minFunc = async (code, filePath) => {
      return (
        await Terser.minify(code, {
          module: true,
          compress: {
            passes: 5,
            pure_getters: true,
            unsafe: true,
            unsafe_math: true,
            hoist_funs: true,
            toplevel: true,
            ecma: 9,
            drop_console: true,
          },
          mangle: {
            toplevel: true,
            properties: {
              builtins: false,
              keep_quoted: 'strict',
              reserved: MANGLE_PROPS_RESERVED,
            },
          },
        })
      ).code;
    };
  }
  if (MINIFIER === 'uglifyjs') {
    minFunc = async (code, filePath) => {
      const obj = await UglifyJS.minify(code, {
        // sourceMap: {
        //   filename: 'index.js',
        //   url: 'index.js.map',
        // },
        sourceMap: false,
        toplevel: true,
        compress: {
          passes: 5,
          sequences: true,
          dead_code: true,
          conditionals: true,
          booleans: true,
          unused: true,
          if_return: true,
          join_vars: true,
          drop_console: true,
        },
        mangle: {
          toplevel: true,
          properties: {
            builtins: false,
            keep_quoted: true,
            reserved: MANGLE_PROPS_RESERVED,
          },
        },
      });
      if (obj.map) {
        fs.writeFileSync(
          path.resolve(__dirname, '../dist/index.js.map'),
          obj.map
        );
      }
      return obj.code;
    };
  }
  if (MINIFIER === 'swc') {
    minFunc = async (code, filePath) => {
      return (
        await SWCMinify(code, {
          mangle: {
            // properties: {
            //   reserved: [],
            //   undeclared: false,
            // },
            // except: ['exampleMap']
          },
          compress: {
            passes: 5,
            pure_getters: true,
            unsafe: true,
            unsafe_math: true,
            hoist_funs: true,
            toplevel: true,
            drop_console: false,
          },
          module: true,
          sourceMap: false,
          toplevel: true,
        })
      ).code;
    };
  }
  if (MINIFIER === 'closure') {
    throw new Error('Closure compiler not supported');
    // minFunc = async (code) => {
    //   const tempJs = path.resolve(__dirname + '/temp.js');
    //   fs.writeFileSync(tempJs, code);
    //   const closureCompiler = new ClosureCompiler({
    //     js: tempJs,
    //     externs: __dirname + '/externs.js',
    //     compilation_level: 'ADVANCED',
    //     language_in: 'UNSTABLE',
    //     language_out: 'ECMASCRIPT_2020',
    //   });
    //   let minError = '';
    //   const minifiedCode = await new Promise((resolve, reject) => {
    //     closureCompiler.run(
    //       (exitCode, stdOut, stdErr) => {
    //         if (stdOut !== '') {
    //           resolve(stdOut);
    //         } else if (stdErr !== '') {
    //           minError = stdErr;
    //           resolve('');
    //           return;
    //         }
    //         if (stdErr) {
    //           console.warn(stdErr);
    //         }
    //       }
    //     );
    //   });
    //   await execAsync('rm ' + tempJs);
    //   if (!minifiedCode) {
    //     console.error('Error minifying', minError);
    //     throw new Error('Failed to minify');
    //   }
    //   // console.log('MINIFIED CODE?', minifiedCode);
    //   return minifiedCode;
    // };
  }
  if (MINIFIER === 'none') {
    minFunc = async (code, filePath) => {
      return code;
    };
  }

  return await Promise.all(
    filePaths.map(async filePath => {
      try {
        const unMinCode = fs.readFileSync(filePath, 'utf8').toString();
        const src = await minFunc(unMinCode, filePath);
        fs.writeFileSync(filePath, src);
        return src;
      } catch (e) {
        console.error('Error minifying', filePath, e);
        return e;
      }
    })
  );
}

function processCodeFile(text, filePath) {
  // remove import statements
  const lastLineInd = text.lastIndexOf('} from ');
  let endImportsInd = lastLineInd;

  if (lastLineInd > -1) {
    while (text[endImportsInd] !== '\n') {
      endImportsInd++;
    }
  }
  const textWithoutImports = text.slice(endImportsInd + 1);

  // remove export statements + replace const with let
  let processedText = textWithoutImports
    .replace(/export /g, '')
    .replace(/const /g, 'let ');

  // Replace throw new Error(...) with throw 1 if flag is enabled
  if (USE_DISABLE_THROW) {
    processedText = processedText.replace(
      /throw\s+new\s+Error\([^)]*\)/g,
      'throw 1'
    );
  }

  return processedText;
}

const build = async () => {
  console.log('Create dist...');

  const htmlFile = fs
    .readFileSync(`${__dirname}/../index.html`)
    .toString()
    .replace('src/main.ts', 'index.js')
    .replace('type="module"', '');

  const resDistDir = path.resolve(`${__dirname}/../dist/`);
  const srcDistDir = path.resolve(`${__dirname}/../dist/`);
  fs.mkdirSync(resDistDir, { recursive: true });
  fs.mkdirSync(srcDistDir, { recursive: true });
  // await execAsync(`cp -r ${__dirname}/../public/* ${resDistDir}`);

  console.log('\nMinify code...');
  const filePaths = sortByImports(
    getAllFilePaths(path.resolve(__dirname + '/../src'))
  );
  console.log('files to concat and minify:\n', filePaths.join('\n '));

  let indexFile = '';

  // add all the source files
  indexFile += filePaths.reduce((resultFile, currentFilePath) => {
    const currentFile = fs.readFileSync(currentFilePath).toString();
    resultFile += processCodeFile(currentFile, currentFilePath);
    return resultFile;
  }, '');

  fs.writeFileSync(srcDistDir + '/index.js', indexFile);
  fs.writeFileSync(__dirname + '/../index.concat.js', indexFile);

  let minifiedFiles = [];
  try {
    minifiedFiles = await minifyFiles([srcDistDir + '/index.js']);
  } catch (e) {
    console.error('Error during minify', e);
    return;
  }

  console.log('\nMinify html...');
  const minifiedHtml = minifyHtml(htmlFile, {
    includeAutoGeneratedTags: true,
    removeAttributeQuotes: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    sortClassName: true,
    useShortDoctype: true,
    collapseWhitespace: true,
    collapseInlineTagWhitespace: true,
    removeEmptyAttributes: true,
    removeOptionalTags: true,
    sortAttributes: true,
    minifyCSS: true,
  }).replace('src/index.js', 'index.js');
  fs.writeFileSync(
    path.resolve(__dirname + '/../dist/index.html'),
    minifiedHtml
  );
  console.log('wrote', path.resolve(__dirname + '/../dist/index.html'));

  if (USE_ROAD_ROLLER) {
    console.log('apply road roller...');
    const superMinifiedSrc = await applyRoadRoller(
      minifiedHtml,
      minifiedFiles[0]
    );
    fs.writeFileSync(
      path.resolve(__dirname + '/../dist/index.html'),
      superMinifiedSrc
    );
    await execAsync(`rm -rf ${srcDistDir}/index.js`);
    console.log('wrote', path.resolve(__dirname + '/../dist/index.html'));
  }

  // ECT ZIP
  const assetFiles = [];
  for (const asset of assetFiles) {
    await execAsync(`cp ${asset} ${asset.replace('/public/', '/')}`);
  }

  // assetFiles.push(srcDistDir + '/events.wpe');

  if (!USE_ROAD_ROLLER) {
    assetFiles.push(srcDistDir + '/index.js');
  }
  const args = [
    '-strip',
    '-zip',
    '-10009',
    srcDistDir + '/index.html',
    ...assetFiles,
  ];
  const result = execFileSync(ect, args);
  await execAsync(`rm -rf ${srcDistDir}/public`);
  console.log(
    'advzip',
    advzip,
    ['-z', '-4', srcDistDir + '/index.zip'].join(' ')
  );
  execFileSync(advzip, ['-z', '-4', srcDistDir + '/index.zip']);
  try {
    const result = await execAsync(
      `stat -c '%n %s' ${srcDistDir + '/index.zip'}`
    );
    const bytes = parseInt(result.split(' ')[1]);
    const kb13 = 13312;
    console.log(
      `${bytes}b of ${kb13}b (${((bytes * 100) / kb13).toFixed(2)}%)`
    );
  } catch (e) {
    console.log('Stat not supported on Mac D:');
  }
};

build().catch(e => {
  console.log('Build error', e);
});
