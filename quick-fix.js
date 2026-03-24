const fs = require('fs');

let content = fs.readFileSync('src/App.js', 'utf8');

// 1. Replace the video state to remove old text fields
content = content.replace(
  /box1: \{ content: "", mediaUrls: \[\], videoUrl: null \},\s*box2: \{ content: "", mediaUrls: \[\], videoUrl: null \},\s*box3: \{ content: "", mediaUrls: \[\], videoUrl: null \},\s*box4: \{ content: "", mediaUrls: \[\], videoUrl: null \}/,
  `box1: { videoUrl: null, isLocked: false },
    box2: { videoUrl: null, isLocked: false },
    box3: { videoUrl: null, isLocked: false },
    box4: { videoUrl: null, isLocked: false }`
);

// 2. Remove unused socialLinks state
content = content.replace(
  /\n  const \[socialLinks, setSocialLinks\] = useState\(\{[\s\S]*?\}\);/,
  ''
);

// 3. Add profile picture state and ref
content = content.replace(
  /const \[editingBox, setEditingBox\] = useState\(null\);/,
  `const [editingBox, setEditingBox] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const fileInputRef = React.useRef(null);`
);

// 4. Replace old boxes array with prompts
content = content.replace(
  /const boxes = \[\s*\{ key: "box1", label: "Introduce yourself".*?\{ key: "box4".*?\}\s*\];/s,
  `const prompts = [
    { key: "box1", label: "Introduce yourself", icon: "👤" },
    { key: "box2", label: "Tell us what you do", icon: "💼" },
    { key: "box3", label: "What are your thoughts on what makes someone beautiful?", icon: "✨" },
    { key: "box4", label: "Ideas about anything else", icon: "💭" }
  ];`
);

// 5. Comment out handleBoxChange and handleSocialChange
content = content.replace(
  /const handleBoxChange = \(boxKey, content\) => \{[\s\S]*?\}\);/,
  `// const handleBoxChange = (boxKey, content) => { ... }; // Removed for video-first`
);

content = content.replace(
  /const handleSocialChange = \(provider, value\) => \{[\s\S]*?\}\);/,
  `// const handleSocialChange = (provider, value) => { ... }; // Removed for video-first`
);

// 6. Update video upload constraints
content = content.replace(
  /if \(file\.size > 52428800\) \{[\s\S]*?alert\('Video must be under 50MB'\);/,
  `if (file.size > 104857600) {
        alert('Video must be under 100MB');`
);

// 7. Change video accept type
content = content.replace(
  /accept="video\/\*"/g,
  `accept="video/mp4,video/quicktime"`
);

// 8. Fix emoji display issues by replacing broken characters (just basic ones visible in output)
content = content.replace(/â€"/g, "'");
content = content.replace(/â€™/g, "'");

// 9. Update the handleSaveProfile to not include socialLinks
content = content.replace(
  /body: JSON\.stringify\(\{ perspective, socialLinks \}\)/,
  `body: JSON.stringify({ perspective })`
);

// 10. Add boxes = prompts after pointsToNextRank
if (!content.includes('const boxes = prompts;')) {
  content = content.replace(
    /const nextRankTitle = getNextRankTitle\(rankTitle/,
    `const boxes = prompts;\n\n  const nextRankTitle = getNextRankTitle(rankTitle`
  );
}

fs.writeFileSync('src/App.js', content, 'utf8');
console.log('✓ App.js updated with basic video-first changes');
