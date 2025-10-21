import fs from 'fs';
import path from 'path';

// 경로 매핑 규칙 (더 정확한 매핑)
const pathMappings = [
  // auth 관련
  { from: /from ['"]\.\.\/\.\.\/\.\.\/type\/game\.socket['"]/g, to: "from '@common/types/game.socket'" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/generated\/gamePacket['"]/g, to: "from '@core/generated/gamePacket'" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/converter\/type\.form['"]/g, to: "from '@common/converters/type.form'" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/enums\/gamePacketType['"]/g, to: "from '@game/enums/gamePacketType'" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/useCase\/login\/login\.usecase['"]/g, to: "from '@game/usecases/login/login.usecase'" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/useCase\/register\/register\.usecase['"]/g, to: "from '@game/usecases/register/register.usecase'" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/sockets\/send\.data['"]/g, to: "from '@core/network/sockets/send.data'" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/generated\/packet\/auth['"]/g, to: "from '@core/generated/packet/auth'" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/utils\/db['"]/g, to: "from '@common/utils/db'" },
  
  // card 관련
  { from: /from ['"]@game\/cards\/class\//g, to: "from '@game/cards/" },
  { from: /from ['"]\.\.\/\.\.\/generated\/common\/enums['"]/g, to: "from '@core/generated/common/enums'" },
  { from: /from ['"]\.\.\/\.\.\/models\/room\.model['"]/g, to: "from '@game/models/room.model'" },
  { from: /from ['"]\.\.\/\.\.\/models\/user\.model['"]/g, to: "from '@game/models/user.model'" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/generated\/common\/enums['"]/g, to: "from '@core/generated/common/enums'" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/models\/room\.model['"]/g, to: "from '@game/models/room.model'" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/models\/user\.model['"]/g, to: "from '@game/models/user.model'" },
  
  // data 파일들
  { from: /from ['"]\.\.\/data\//g, to: "from '@data/" },
  { from: /from ['"]\.\.\/\.\.\/data\//g, to: "from '@data/" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/data\//g, to: "from '@data/" },
  
  // init 파일들
  { from: /from ['"]\.\.\/init\//g, to: "from '@game/init/" },
  { from: /from ['"]\.\.\/\.\.\/init\//g, to: "from '@game/init/" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/init\//g, to: "from '@game/init/" },
  
  // handlers
  { from: /from ['"]@game\/handlers\/handleError\.js['"]/g, to: "from '@core/network/handlers/handleError.js'" },
  { from: /from ['"]@game\/handlers\/register\.handler['"]/g, to: "from '@core/network/handlers/register.handler'" },
  { from: /from ['"]@game\/handlers\/login\.handler['"]/g, to: "from '@core/network/handlers/login.handler'" },
  
  // 기타
  { from: /from ['"]\.\.\/\.\.\/\.\.\/generated\/packet\/auth['"]/g, to: "from '@core/generated/packet/auth'" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/utils\/db['"]/g, to: "from '@common/utils/db'" },
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
console.log('Import path fix completed!');
