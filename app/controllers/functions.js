'use strict';

var rimraf = require('rimraf'),
    fs=require('fs');

function isset(){var ar=arguments;return !(ar[0] === null || ar[0] === undefined);}

function isString(s){return !!(isset(s) && s.constructor === String);}
function isObject(o){return !!(isset(o) && o.constructor === Object);}
function isArray(a){return !!(isset(a) && a.constructor === Array);}
function isNumber(n){return !!(isset(n) && n.constructor === Number);}
function isBoolean(b){return !!(isset(b) && b.constructor === Boolean);}

module.exports.isString = isString;
module.exports.isObject = isObject;
module.exports.isArray = isArray;
module.exports.isNumber = isNumber;
module.exports.isBoolean = isBoolean;

function isEmptyString(s){return !!(!isString(s) || s == '');}
function isEmptyObject(o){if(isObject(o)){for(k in o){if(o.hasOwnProperty(k)){return false;}}return true;}return true;}
function isEmptyArray(a){return !(isArray(a) && a.length > 0);}

module.exports.isEmptyString = isEmptyString;
module.exports.isEmptyObject = isEmptyObject;
module.exports.isEmptyArray = isEmptyArray;

function exists(p){return !!fs.existsSync(p);}
function status(p){if(exists(p)){return fs.lstatSync(p)}return false;}

module.exports.exists = exists;
module.exports.status=status;

function isDir(p){return !!(exists(p) && fs.lstatSync(p).isDirectory());}
function mkDir(p,m){if(exists(p)){if(!fs.lstatSync(p).isDirectory()){return false}}else{fs.mkdirSync(p,'777')}return true;}
function readDir(p){if(exists(p) && fs.lstatSync(p).isDirectory()){return fs.readdirSync(p);}return [];}
function removeDir(p){if(exists(p)){fs.rmdirSync(p);return true}return false;}
function forceRemoveDir(p, cb){if(exists(p)){rimraf(p, cb)}}

module.exports.isDir = isDir;
module.exports.mkDir = mkDir;
module.exports.readDir = readDir;
module.exports.removeDir = removeDir;
module.exports.forceRemoveDir = forceRemoveDir;

function isFile(p){return !!(exists(p) && fs.lstatSync(p).isFile());}
function mkFile(p,d){if(!isset(d)){d="";}fs.writeFileSync(p,d); return true;}
function readFile(p){if(exists(p) && fs.lstatSync(p).isFile()){return fs.readFileSync(p);}return "";}
function removeFile(p){if(exists(p)){fs.unlinkSync(p);return true}return false;}

module.exports.isFile = isFile;
module.exports.mkFile = mkFile;
module.exports.readFile = readFile;
module.exports.removeFile = removeFile;

function moveFileSync(sourcePath, destPath){
    try{
        var source = readFile(sourcePath);
        if (!source)
            return false;
        mkFile(destPath, source);
        removeFile(sourcePath);
    }catch(e){
        return false;
    }
    return true;
}

function moveFile(sourcePath, destPath, cb){
    copyFile(sourcePath, destPath, cb, true);
}

function copyFile(sourcePath, destPath, cb, moveFlag){
    if (!exists(sourcePath))
        return cb({message: 'file is not exist.'});
    var source = fs.createReadStream(sourcePath);
    var dest = fs.createWriteStream(destPath);
    source.pipe(dest);
    source.on('end', function() {
        if (moveFlag)
            fs.unlink(sourcePath);
        cb();
    });
    source.on('error', function(err) { cb(err)});
}

function isTemp(url){
    if (!url)
        return false;
    return url.indexOf('temp') == 0;
}

function get_file_extension(fileName){
    if (fileName.indexOf('.')>-1){
        var splitlist = fileName.split('.');
        return '.' + splitlist[splitlist.length -1];
    } else
        return '';
}

module.exports.moveFile = moveFile;
module.exports.copyFile = copyFile;
module.exports.isTemp = isTemp;
module.exports.fileExtension = get_file_extension;
module.exports.moveFileSync = moveFileSync;

function generateRandomId(length) {
    var _sym = 'abcdefghijklmnopqrstuvwxyz1234567890';
    var str = '';
    for(var i = 0; i < length; i++) {
        str += _sym[parseInt(Math.random() * (_sym.length))];
    }
    return str;
}

module.exports.randomId = generateRandomId;

