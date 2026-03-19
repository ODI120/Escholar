const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'src', 'views');
const targetDir = path.join(__dirname, 'src', 'modules', 'admin', 'views');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const viewsToMove = [
  'AdminProfile.vue',
  'Admins.vue',
  'Dashboard.vue',
  'Graduates.vue',
  'Settings.vue',
  'StudentDetail.vue',
  'Students.vue'
];

viewsToMove.forEach(file => {
  const oldPath = path.join(viewsDir, file);
  const newPath = path.join(targetDir, file);

  if (fs.existsSync(oldPath)) {
    let content = fs.readFileSync(oldPath, 'utf-8');
    
    // Replace relative imports jumping up one directory
    // from '../composables... to from '../../../composables...
    content = content.replace(/from\s+['"]\.\.\/([^'"]+)['"]/g, "from '../../../$1'");
    
    // Also catch components import if they exist
    // e.g. import FilterComponent from '../components/Filter.vue' -> import ... from '../../../components/Filter.vue'

    // Replace CSS url imports: url('../assets/...) -> url('../../../assets/...)
    content = content.replace(/url\(['"]?\.\.\/(assets\/[^'")]*)['"]?\)/g, "url('../../../$1')");

    fs.writeFileSync(newPath, content);
    console.log(`Moved & updated ${file}`);
    
    // Optionally delete original, or leave it for manually deleting after verifying
    fs.unlinkSync(oldPath);
  }
});
