import fs from 'fs';
import path from 'path';

// 경로 매핑 규칙
const pathMappings = [
  // 상대 경로를 절대 경로로 변환
  { from: /from ['"]\.\.\/enums\//g, to: "from '@game/enums/" },
  { from: /from ['"]\.\.\/generated\//g, to: "from '@core/generated/" },
  { from: /from ['"]\.\.\/models\//g, to: "from '@game/models/" },
  { from: /from ['"]\.\.\/services\//g, to: "from '@game/services/" },
  { from: /from ['"]\.\.\/type\//g, to: "from '@common/types/" },
  { from: /from ['"]\.\.\/utils\//g, to: "from '@common/utils/" },
  { from: /from ['"]\.\.\/error\//g, to: "from '@common/errors/" },
  { from: /from ['"]\.\.\/converter\//g, to: "from '@common/converters/" },
  { from: /from ['"]\.\.\/dispatcher\//g, to: "from '@core/network/dispatcher/" },
  { from: /from ['"]\.\.\/sockets\//g, to: "from '@core/network/sockets/" },
  { from: /from ['"]\.\.\/managers\//g, to: "from '@game/managers/" },
  { from: /from ['"]\.\.\/useCase\//g, to: "from '@game/usecases/" },
  { from: /from ['"]\.\.\/handlers\//g, to: "from '@game/handlers/" },
  { from: /from ['"]\.\.\/card\//g, to: "from '@game/cards/" },
  { from: /from ['"]\.\.\/domains\/auth\//g, to: "from '@auth/" },
  { from: /from ['"]\.\.\/domains\/game\//g, to: "from '@game/" },
  
  // 더 깊은 상대 경로들
  { from: /from ['"]\.\.\/\.\.\/enums\//g, to: "from '@game/enums/" },
  { from: /from ['"]\.\.\/\.\.\/generated\//g, to: "from '@core/generated/" },
  { from: /from ['"]\.\.\/\.\.\/models\//g, to: "from '@game/models/" },
  { from: /from ['"]\.\.\/\.\.\/services\//g, to: "from '@game/services/" },
  { from: /from ['"]\.\.\/\.\.\/type\//g, to: "from '@common/types/" },
  { from: /from ['"]\.\.\/\.\.\/utils\//g, to: "from '@common/utils/" },
  { from: /from ['"]\.\.\/\.\.\/error\//g, to: "from '@common/errors/" },
  { from: /from ['"]\.\.\/\.\.\/converter\//g, to: "from '@common/converters/" },
  { from: /from ['"]\.\.\/\.\.\/dispatcher\//g, to: "from '@core/network/dispatcher/" },
  { from: /from ['"]\.\.\/\.\.\/sockets\//g, to: "from '@core/network/sockets/" },
  { from: /from ['"]\.\.\/\.\.\/managers\//g, to: "from '@game/managers/" },
  { from: /from ['"]\.\.\/\.\.\/useCase\//g, to: "from '@game/usecases/" },
  { from: /from ['"]\.\.\/\.\.\/handlers\//g, to: "from '@game/handlers/" },
  { from: /from ['"]\.\.\/\.\.\/card\//g, to: "from '@game/cards/" },
  { from: /from ['"]\.\.\/\.\.\/domains\/auth\//g, to: "from '@auth/" },
  { from: /from ['"]\.\.\/\.\.\/domains\/game\//g, to: "from '@game/" },
];

function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    pathMappings.forEach(mapping => {
      if (mapping.from.test(content)) {
        content = content.replace(mapping.from, mapping.to);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDirectory(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.js')) {
      updateFile(filePath);
    }
  });
}

// src 디렉터리부터 시작
walkDirectory('./src');
console.log('Import path update completed!');
