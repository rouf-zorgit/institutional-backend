const fs = require('fs');
const path = require('path');

const srcDir = path.resolve('backend/src');

function getAllFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAllFiles(filePath, fileList);
        } else if (filePath.endsWith('.ts')) {
            fileList.push(filePath);
        }
    });
    return fileList;
}

const files = getAllFiles(srcDir);
console.log(`Found ${files.length} files to process.`);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const relativePathFromSrc = path.dirname(path.relative(srcDir, file));
    const relativeDepth = relativePathFromSrc === '.' ? 0 : relativePathFromSrc.split(path.sep).filter(p => p && p !== '.').length;
    const backPrefix = relativeDepth === 0 ? './' : '../'.repeat(relativeDepth);

    const newContent = content
        .replace(/from '@\//g, `from '${backPrefix}`)
        .replace(/from "@\//g, `from "${backPrefix}`)
        .replace(/from '@modules\//g, `from '${backPrefix}modules/`)
        .replace(/from "@modules\//g, `from "${backPrefix}modules/`)
        .replace(/from '@common\//g, `from '${backPrefix}common/`)
        .replace(/from "@common\//g, `from "${backPrefix}common/`);

    if (content !== newContent) {
        fs.writeFileSync(file, newContent);
        console.log(`Updated: ${file} (depth: ${relativeDepth}, prefix: ${backPrefix})`);
    }
});
