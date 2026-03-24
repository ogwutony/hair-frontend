const fs = require('fs');

// Read the original file
const originalContent = fs.readFileSync('src/App.js', 'utf8');

// Split into lines for more surgical edits
const lines = originalContent.split('\n');
const modified = [];

let inProfilePage = false;
let skipNextSocialSection = false;
let inOldBoxes = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const nextLine = lines[i + 1] || '';
  
  // 1. Update the perspective state definition
  if (line.includes('const [perspective, setPerspective] = useState({')) {
    modified.push(line);
    // Skip the old state object lines and add new one
    modified.push(`    box1: { videoUrl: null, isLocked: false },`);
    modified.push(`    box2: { videoUrl: null, isLocked: false },`);
    modified.push(`    box3: { videoUrl: null, isLocked: false },`);
    modified.push(`    box4: { videoUrl: null, isLocked: false }`);
    // Skip the old content, finding the closing brace
    while (i < lines.length && !lines[++i].includes(`  }`)) {}
    modified.push(lines[i]);
    continue;
  }
  
  // 2. Add profile picture state after perspective state
 if (line.includes(`  });`) && modified[modified.length - 2].includes('isLocked: false')) {
    modified.push(line);
    modified.push(`  const [profilePicture, setProfilePicture] = useState(null);`);
    modified.push(`  const fileInputRef = React.useRef(null);`);
    continue;
  }
  
  // 3. Remove the socialLinks state
  if (line.includes('const [socialLinks, setSocialLinks] = useState({')) {
    // Skip this and the next lines until closing bracket
    while (i < lines.length && !lines[++i].trim().endsWith('});')) {}
    continue;
  }
  
  // 4. Remove handleBoxChange function
  if (line.includes('const handleBoxChange = (boxKey, content) => {')) {
    // Skip until the function ends
    while (i < lines.length && !lines[++i].includes('});')) {}
    continue;
  }
  
  // 5. Remove handleSocialChange function
  if (line.includes('const handleSocialChange = (provider, value) => {')) {
    // Skip until the function ends
    while (i < lines.length && !lines[++i].includes('});')) {}
    continue;
  }
  
  // 6. Update video upload validation (100MB instead of 50MB)
  if (line.includes('file.size > 52428800')) {
    modified.push(`      if (file.size > 104857600) { // 100MB limit`);
    continue;
  }
  
  if (line.includes(`alert('Video must be under 50MB');`)) {
    modified.push(`        alert('Video must be under 100MB');`);
    continue;
  }
  
  // 7. Update video accept type constraints
  if (line.includes(`accept="video/*"`)) {
    modified.push(line.replace(`accept="video/*"`, `accept="video/mp4,video/quicktime"`));
    continue;
  }
  
  // 8. Update JSON.stringify in handleSaveProfile
  if (line.includes(`body: JSON.stringify({ perspective, socialLinks })`)) {
    modified.push(line.replace(`{perspective, socialLinks}`, `{perspective}`));
    continue;
  }
  
  // 9. Add boxes = prompts before nextRankTitle
  if (line.includes('const nextRankTitle = getNextRankTitle(rankTitle')) {
    modified.push(`  const boxes = prompts;`);
    modified.push('');
    modified.push(line);
    continue;
  }
  
  // 10. Fix broken emoji characters in buttons
  if (line.includes('ð¼ Commerce')) {
    modified.push(line.replace('ð¼ Commerce', '📷 Commerce'));
    continue;
  }
  
  if (line.includes('ð¨ Perspectives')) {
    modified.push(line.replace('ð¨ Perspectives', '🎨 Perspectives'));
    continue;
  }
  
  // 11. Comment out the social links section
  if (line.includes('{/* SOCIAL LINKS SECTION */}')) {
    modified.push(`      {/* SOCIAL LINKS SECTION - DISABLED FOR VIDEO-FIRST PIVOT */}`);
    modified.push(`      {/*`);
    // Skip until the next major section
    while (i < lines.length && !lines[++i].includes('SAVED FORMULAS SECTION')) {}
    modified.push(`      */}`);
    if (i < lines.length) {
      modified.push(lines[i]);
    }
    continue;
  }
  
  // 12. Handle the old boxes array  
  if (line.includes('const boxes = [')) {
    // Skip the old boxes array
    while (i < lines.length && !lines[++i].includes('];')) {}
    // Don't add it to modified - we're removing it
    continue;
  }
  
  // Copy other lines as-is
  modified.push(line);
}

// Write the modified content
fs.writeFileSync('src/App.js', modified.join('\n'), 'utf8');
console.log('✓ App.js transformed successfully');
