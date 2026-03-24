const fs = require('fs');
const content = fs.readFileSync('src/App.js', 'utf8');

// Replace the malformed unicode boxes array with prompts
const lines = content.split('\n');
const newLines = [];
let skipUntilPrompts = false;
let foundPrompts = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Skip the old boxes array
  if (line.includes('const boxes = [') && line.includes('box1')) {
    skipUntilPrompts = true;
    continue;
  }
  
  // End skip at closing bracket
  if (skipUntilPrompts && line.includes('];') && !line.includes('prompts')) {
    skipUntilPrompts = false;
    continue;
  }
  
  // Skip handleBoxChange
  if (line.includes('const handleBoxChange')) {
    skipUntilPrompts = true;
    continue;
  }
  
  // Skip handleSocialChange
  if (line.includes('const handleSocialChange')) {
    skipUntilPrompts = true;
    continue;
  }
  
  if (!skipUntilPrompts) {
    newLines.push(line);
  }
}

let modified = newLines.join('\n');

// Ensure prompts is defined correctly
if (!modified.includes('const prompts = [')) {
  // Add prompts definition if missing
  const insertPoint = modified.indexOf('const handleVideoUpload');
  if (insertPoint !== -1) {
    const promptsDef = `  const prompts = [
    { key: "box1", label: "Introduce yourself", icon: "👤" },
    { key: "box2", label: "Tell us what you do", icon: "💼" },
    { key: "box3", label: "What are your thoughts on what makes someone beautiful?", icon: "✨" },
    { key: "box4", label: "Ideas about anything else", icon: "💭" }
  ];\n\n  `;
    modified = modified.substring(0, insertPoint) + promptsDef + modified.substring(insertPoint);
  }
}

fs.writeFileSync('src/App.js', modified, 'utf8');
console.log('File cleaned successfully');
