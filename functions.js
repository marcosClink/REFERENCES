const path = require('path');
const fs = require('fs');
const multer = require('multer');

const uploadDirectory = path.join('/Users', 'marcospinto', 'projects', 'DOCUMENTS', 'references-documentation', 'version5', 'files');
// Ensure the directory exists or create it
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const upload = multer({
    dest: uploadDirectory
  });

function uploadFile(file,docUnique,ref_num){
console.log('Temporary file path:', file.path);  // For debugging
// Construct the new filename and path with path.join
const fileExt = path.extname(file.originalname);
const newFilename = `R${docUnique}_${ref_num}${fileExt}`;
const newPath = path.join(uploadDirectory, newFilename);

console.log('Renaming file to:', newPath);  // For debugging

// Rename the file to use the new filename
fs.rename(file.path, newPath, (err) => {
  if (err) {
    console.log('Error renaming file:', err);
    return false;
  }
  console.log('File saved as:', newFilename);
});

return true;
}

 function checkFileExists(filePath) {
  
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error('File does not exist or cannot be accessed:', err);
            return false; // File does not exist
        }
        console.log('File exists.');
        return true; // File exists
    });
}

module.exports = {
    uploadFile,
    upload,
    uploadDirectory,
    checkFileExists
}