const fs = require('fs');
const path = require('path');
const files = [
  'app/(main)/settings/page.tsx',
  'app/(main)/profile/page.tsx',
  'app/(main)/history/page.tsx',
  'app/(main)/feedback/page.tsx',
  'app/(main)/dashboard/page.tsx',
  'components/chat/chat-input.tsx',
  'components/navigation/app-sidebar.tsx'
];

files.forEach(f => {
  const fp = path.join('c:/Users/u9780/Dravya-labs/frontend', f);
  if (fs.existsSync(fp)) {
    let content = fs.readFileSync(fp, 'utf8');
    // Replace primary green
    content = content.replace(/#1A8256/g, '#38b000');
    content = content.replace(/#1a8256/g, '#38b000');
    // Replace hover green (darker)
    content = content.replace(/#146b46/g, '#2d8c00');
    // Replace light mint background/ring
    content = content.replace(/bg-\[#E5F5EC\]/g, 'bg-[#38b000]/10');
    content = content.replace(/ring-\[#E5F5EC\]/g, 'ring-[#38b000]/20');
    // For anything else that might have used it directly (just in case)
    content = content.replace(/#E5F5EC/g, '#38b000');
    fs.writeFileSync(fp, content);
  }
});

console.log('Theme colors updated successfully!');
