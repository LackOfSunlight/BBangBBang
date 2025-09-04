import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

// ES module equivalent of __dirname
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generatedDir = path.join(__dirname, '..', 'game.server', 'dist', 'generated');

globSync(path.join(generatedDir, '**', '*.js')).forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    // Regex to find import/export statements with relative paths that don't have an extension
    // Example: import { Some } from "./path/to/module";
    // Example: export * from "../another/module";
    content = content.replace(/(from|import)\s+(['"])((\.\.?\/.*?)(?<!\.(js|cjs|mjs|ts|tsx|jsx|json|node)))['"]/g, (match, p1, p2, p3, p4) => {
        // Check if the path already ends with a known extension
        if (/\.(js|cjs|mjs|ts|tsx|jsx|json|node)$/.test(p4)) {
            return match; // Already has an extension, do not modify
        }
        modified = true;
        return `${p1} ${p2}${p4}.js${p2}`;
    });

    if (modified) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Modified: ${file}`);
    }
});

console.log('Finished adding .js extensions to generated imports.');
