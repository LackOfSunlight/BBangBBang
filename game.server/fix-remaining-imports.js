import fs from 'fs';
import path from 'path';

// 남은 경로 매핑 규칙
const pathMappings = [
  // auth services
  { from: /from ['"]\.\.\/\.\.\/\.\.\/generated\/packet\/auth['"]/g, to: "from '@core/generated/packet/auth'" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/utils\/db['"]/g, to: "from '@common/utils/db'" },
  
  // weapons
  { from: /from ['"]\.\.\/\.\.\/\.\.\/generated\/common\/enums['"]/g, to: "from '@core/generated/common/enums'" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/models\/room\.model['"]/g, to: "from '@game/models/room.model'" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/models\/user\.model['"]/g, to: "from '@game/models/user.model'" },
  
  // init files
  { from: /from ['"]@game\/init\//g, to: "from '@game/init/" },
  { from: /from ['"]\.\.\/generated\/common\/enums['"]/g, to: "from '@core/generated/common/enums'" },
  { from: /from ['"]\.\.\/generated\/common\/types['"]/g, to: "from '@core/generated/common/types'" },
  
  // tests
  { from: /from ['"]\.\.\/\.\.\/generated\/common\/enums['"]/g, to: "from '@core/generated/common/enums'" },
  { from: /from ['"]\.\.\/\.\.\/generated\/common\/types['"]/g, to: "from '@core/generated/common/types'" },
  { from: /from ['"]\.\.\/\.\.\/models\/room\.model['"]/g, to: "from '@game/models/room.model'" },
  { from: /from ['"]\.\.\/\.\.\/models\/user\.model['"]/g, to: "from '@game/models/user.model'" },
  { from: /from ['"]\.\.\/\.\.\/models\/character\.model['"]/g, to: "from '@game/models/character.model'" },
  { from: /from ['"]\.\.\/\.\.\/domains\/game\/cards\/CardFactory['"]/g, to: "from '@game/cards/CardFactory'" },
  { from: /from ['"]\.\.\/\.\.\/domains\/game\/cards\/weapons\/HandGunCard['"]/g, to: "from '@game/cards/weapons/HandGunCard'" },
  { from: /from ['"]\.\.\/\.\.\/services\/character\.damage\.service['"]/g, to: "from '@game/services/character.damage.service'" },
  { from: /from ['"]\.\.\/\.\.\/services\/take\.damage\.service['"]/g, to: "from '@game/services/take.damage.service'" },
  { from: /from ['"]\.\.\/\.\.\/handlers\/play\.animation\.handler['"]/g, to: "from '@game/handlers/play.animation.handler'" },
  { from: /from ['"]\.\.\/\.\.\/domains\/game\/rooms\/Room['"]/g, to: "from '@game/models/room.model'" },
  { from: /from ['"]\.\.\/\.\.\/domains\/game\/rooms\/services\/RoomService['"]/g, to: "from '@game/services/room.service'" },
  { from: /from ['"]\.\.\/\.\.\/domains\/game\/rooms\/repositories\/MemoryRoomRepository['"]/g, to: "from '@game/repositories/memory.room.repository'" },
  { from: /from ['"]\.\.\/\.\.\/domains\/game\/rooms\/RoomFactory['"]/g, to: "from '@game/factories/room.factory'" },
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
console.log('Remaining import path fix completed!');
