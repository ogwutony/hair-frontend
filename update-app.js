const fs = require('fs');
const path = require('path');

// Read the original file
let content = fs.readFileSync('src/App.js', 'utf8');

// ==========================================
// STEP 1: Update ProfilePage state and handlers
// ==========================================

// Replace the perspective state to remove text content and add isLocked
content = content.replace(
  /const \[perspective, setPerspective\] = useState\(\{\s*box1: \{ content: "".*?box4: \{ content: "".*?\}\s*\}\);/s,
  `const [perspective, setPerspective] = useState({
    box1: { videoUrl: null, isLocked: false },
    box2: { videoUrl: null, isLocked: false },
    box3: { videoUrl: null, isLocked: false },
    box4: { videoUrl: null, isLocked: false }
  });`
);

// Add profile picture state after perspective state
content = content.replace(
  /const \[perspective, setPerspective\].*?\}\);/s,
  match => match + `
  const [profilePicture, setProfilePicture] = useState(null);`
);

// Add fileInputRef after profilePicture
content = content.replace(
  /const \[profilePicture, setProfilePicture\] = useState\(null\);/,
  `const [profilePicture, setProfilePicture] = useState(null);
  const fileInputRef = React.useRef(null);`
);

// ==========================================
// STEP 2: Replace boxes array with prompts
// ==========================================

// Replace the boxes array definition
content = content.replace(/const boxes = \[\s*\{ key: "box1".*?\]\s*;/s,
  `const prompts = [
    { key: "box1", label: "Introduce yourself", icon: "👤" },
    { key: "box2", label: "Tell us what you do", icon: "💼" },
    { key: "box3", label: "What are your thoughts on what makes someone beautiful?", icon: "✨" },
    { key: "box4", label: "Ideas about anything else", icon: "💭" }
  ];`
);

// ==========================================
// STEP 3: Remove unused handlers
// ==========================================

// Remove handleBoxChange
content = content.replace(
  /\n\s*const handleBoxChange = \(boxKey, content\) => \{[^}]*\};/s,
  ''
);

// Remove handleSocialChange
content = content.replace(
  /\n\s*const handleSocialChange = \(provider, value\) => \{[^}]*\};/s,
  ''
);

// ==========================================
// STEP 4: Add new handlers before handleVideoUpload
// ==========================================

const newHandlers = `
  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }
    
    if (file.size > 5242880) { // 5MB limit
      alert('Image must be under 5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      setProfilePicture(dataUrl);
      
      // Upload to /api/user/upload-avatar
      const formData = new FormData();
      formData.append('avatar', file);
      
      try {
        const response = await fetch(\`\${BACKEND_URL}/api/user/upload-avatar\`, {
          method: 'POST',
          headers: { Authorization: \`Bearer \${authToken}\` },
          body: formData
        });
        if (response.ok) {
          setSaveStatus('Profile picture uploaded successfully!');
          setTimeout(() => setSaveStatus(''), 3000);
        }
      } catch (err) {
        console.error('Avatar upload failed:', err);
      }
    };
    reader.readAsDataURL(file);
  };`;

// Insert new handlers before handleVideoUpload
content = content.replace(
  /(\n\s*)const handleVideoUpload = /,
  newHandlers + '\n\n  const handleVideoUpload = '
);

// ==========================================
// STEP 5: Update handleVideoUpload constraints
// ==========================================

// Replace video file validation and size limits
content = content.replace(
  /handleVideoUpload = \(boxKey, event\) => \{[\s\S]*?if \(file\.size > 52428800\)/,
  `handleVideoUpload = async (boxKey, event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validation: video/mp4 or video/quicktime
    const validTypes = ['video/mp4', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid MP4 or MOV video file');
      return;
    }
    
    // Max 100MB
    if (file.size > 104857600)`
);

// Replace the size error message
content = content.replace(
  /alert\('Video must be under 50MB'\);/g,
  `alert('Video must be under 100MB');`
);

// Update video type check
content = content.replace(
  /if \(file\.type\.startsWith\('video\/'\)\) \{/,
  `// Duration and type already validated
    const reader = new FileReader();`
);

// Remove the nested reader that was previously there
content = content.replace(
  /\/\/ Duration and type already validated[\s\S]*?const reader = new FileReader\(\);[\s\S]*?reader\.onload = \(e\) => \{/,
  `// Duration and type already validated
    const reader = new FileReader();
    reader.onload = async (e) => {`
);

// Update the response handler in handleVideoUpload
content = content.replace(
  /\[boxKey\]: \{ \.\.\.prev\[boxKey\], videoUrl: e\.target\.result \}/,
  `[boxKey]: { ...prev[boxKey], videoUrl: e.target.result }`
);

// Add lock logic after successful upload to handleVideoUpload
content = content.replace(
  /setSaveStatus\("â Profile saved successfully!"\);/,
  `// Lock this prompt after successful upload
      setPerspective(prev => ({
        ...prev,
        [boxKey]: { ...prev[boxKey], isLocked: true }
      }));
      setSaveStatus(\`Perspective \${boxKey.replace('box', '')} submitted and locked!\`);`
);

// ==========================================
// STEP 6: Update boxes variable assignment
// ==========================================

// Add boxes = prompts assignment
content = content.replace(
  /const nextRankTitle = getNextRankTitle\(rankTitle/,
  `const boxes = prompts;\n\n  const nextRankTitle = getNextRankTitle(rankTitle`
);

// ==========================================
// STEP 7: Remove old "socialLinks" state usage from saveProfile
// ==========================================

content = content.replace(
  /body: JSON\.stringify\(\{ perspective, socialLinks \}\)/,
  `body: JSON.stringify({ perspective })`
);

// ==========================================
// STEP 8: Update profile section with avatar
// ==========================================

// Add avatar click handler and display
const avatarSection = `<div style={{ marginBottom: '50px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
          <div
            onClick={handleProfilePictureClick}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '40px',
              border: '2px solid #eee',
              overflow: 'hidden'
            }}
          >
            {profilePicture ? (
              <img src={profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              '📷'
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleProfilePictureUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <div>
            <h1 style={{ fontSize: '32px', marginBottom: '8px', fontWeight: '700' }}>Welcome</h1>
            <p style={{ fontSize: '13px', color: '#999' }}>Click avatar to update profile picture</p>
          </div>
        </div>`;

content = content.replace(
  /<div style=\{\{ marginBottom: '50px' \}\}>\s*<h1 style=\{\{ fontSize: '32px', marginBottom: '8px', fontWeight: '700' \}\}>Welcome<\/h1>/,
  avatarSection
);

// ==========================================
// STEP 9: Update Perspectives boxes to video-only
// ==========================================

// Replace the perspectives editing UI
const perspectivesUI = `{boxes.map(box => (
            <div key={box.key} style={{
              ...styles.perspectiveBox,
              border: perspective[box.key].isLocked ? '2px solid #27ae60' : '1px solid #eee',
              opacity: perspective[box.key].isLocked ? 0.7 : 1,
              pointerEvents: perspective[box.key].isLocked ? 'none' : 'auto'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '24px' }}>{box.icon}</span>
                {perspective[box.key].isLocked ? (
                  <span style={{ fontSize: '12px', color: '#27ae60', fontWeight: '600' }}>✓ Submitted</span>
                ) : (
                  <span style={{ fontSize: '12px', color: '#999', fontWeight: '600' }}>Upload video</span>
                )}
              </div>
              <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: '#222' }}>{box.label}</h4>
              {!perspective[box.key].isLocked ? (
                <div style={{ marginTop: '10px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#222', display: 'block', marginBottom: '6px' }}>Upload Video (MP4/MOV, max 60s, 100MB)</label>
                  <input
                    type="file"
                    accept="video/mp4,video/quicktime"
                    onChange={(e) => handleVideoUpload(box.key, e)}
                    disabled={perspective[box.key].isLocked}
                    style={{ ...styles.input, padding: '8px', margin: 0 }} />
                  {perspective[box.key].videoUrl && (
                    <div style={{ marginTop: '10px', position: 'relative' }}>
                      <video
                        src={perspective[box.key].videoUrl}
                        controls
                        style={{ width: '100%', maxHeight: '150px', borderRadius: '4px', marginBottom: '8px' }} />
                      {!perspective[box.key].isLocked && (
                        <button
                          onClick={() => setPerspective(prev => ({ ...prev, [box.key]: { ...prev[box.key], videoUrl: null } }))}
                          style={{ fontSize: '12px', padding: '4px 8px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                          Remove Video
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ color: '#999', fontSize: '12px', padding: '12px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                  <p style={{ margin: 0 }}>This perspective has been locked after submission. No further edits allowed.</p>
                  {perspective[box.key].videoUrl && (
                    <video
                      src={perspective[box.key].videoUrl}
                      controls
                      style={{ width: '100%', maxHeight: '150px', borderRadius: '4px', marginTop: '8px' }} />
                  )}
                </div>
              )}
            </div>
          ))}`;

// Replace the boxes.map section
content = content.replace(
  /\{boxes\.map\(box => \([\s\S]*?<\/div>\s*\))\)}/,
  perspectivesUI
);

// Remove the old edit buttons and save button for perspectives
content = content.replace(
  /\{editingBox && \([\s\S]*?Save All Changes[\s\S]*?\)\s*\)\s*\}<\/section>/,
  `</section>`
);

// ==========================================
// STEP 10: Comment out social links section
// ==========================================

content = content.replace(
  /\{\s*\/\* SOCIAL LINKS SECTION \*\/[\s\S]*?\{\/\* SAVED FORMULAS SECTION/,
  `{/* SOCIAL LINKS SECTION - DISABLED FOR VIDEO-FIRST PIVOT */}
      {/* 
      <section style={{ marginBottom: '50px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '24px', fontWeight: '600' }}>Connect Your Social Profiles</h2>
        ...
      </section>
      */}

      {/* SAVED FORMULAS SECTION`
);

fs.writeFileSync('src/App.js', content, 'utf8');
console.log('App.js updated successfully with video-first implementation');
