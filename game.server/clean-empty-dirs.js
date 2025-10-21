const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, 'src');

function isDirEmpty(dir) {
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	// empty if no files and no non-empty subdirs
	for (const e of entries) {
		if (e.isFile()) return false;
		if (e.isDirectory()) {
			if (!isDirEmpty(path.join(dir, e.name))) return false;
		}
	}
	return entries.length === 0 || entries.every((e) => e.isDirectory());
}

function collectEmptyDirs(dir, acc) {
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	for (const e of entries) {
		if (e.isDirectory()) {
			const sub = path.join(dir, e.name);
			collectEmptyDirs(sub, acc);
		}
	}
	if (isDirEmpty(dir)) acc.push(dir);
}

const emptyDirs = [];
collectEmptyDirs(ROOT, emptyDirs);

console.log('Empty directories under src:');
for (const d of emptyDirs) console.log(' -', path.relative(ROOT, d));

if (process.argv.includes('--delete')) {
	for (const d of emptyDirs.sort((a, b) => b.length - a.length)) {
		try {
			fs.rmdirSync(d, { recursive: true });
			console.log('Deleted:', path.relative(ROOT, d));
		} catch (e) {
			console.error('Failed to delete', d, e.message);
		}
	}
}
