const path = require('path');
const fs = require('fs');
const multer = require('multer');
const juice = require('juice');



// Serve static files from the public directory

const uploadDirectory = path.join( 'public/files');
// Ensure the directory exists or create it
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const upload = multer({
    dest: uploadDirectory
  });

function uploadFile(file,docUnique,ref_num){
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
        return true; // File exists
    });
}

function generateHtmlContent(exceptionalUsers) {
  let html = `
      <h1>עדכון עבור תעודה זהות שחרגה</h1>
      <div class="table-container">
          <table>
              <thead>
                  <tr>
                      <th>תעודה זהות</th>
                      <th>כמות עסקאות</th>
                      <th>סכום עסקאות</th>
                  </tr>
              </thead>
          </table>
          <table id="content-table">
              <tbody>
                  ${exceptionalUsers.map(user => `
                          <tr>
                              <td>${user.user_id}</td>
                              <td>${user.deals_num}</td>
                              <td>${formatToIsraeliShekels(user.deals_sum)}</td>
                          </tr>
                      `).join('')
      }
              </tbody>
          </table>
      </div>
  `;

  // Read the content of your CSS file
  const css = fs.readFileSync('./email.css', 'utf8');

  // Use Juice to apply the CSS to your HTML and inline it
  const htmlWithStylesInlined = juice.inlineContent(html, css);
  return htmlWithStylesInlined;
}

function formatToIsraeliShekels(amount) {
  // Create a formatter for Israeli Shekels and Hebrew/Israel locale
  const formatter = new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 2, // Ensures two decimal places
      maximumFractionDigits: 2,
  });

  // Format the number
  return formatter.format(amount);
}


module.exports = {
    uploadFile,
    upload,
    uploadDirectory,
    checkFileExists,
    generateHtmlContent
}