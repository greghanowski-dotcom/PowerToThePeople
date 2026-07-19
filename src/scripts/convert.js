import mammoth from "mammoth";
import fs from "fs";
import path from "path";
import chokidar from "chokidar";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log("Current Script Location (__dirname):", __dirname);

// This resolves to: C:\Users\Greg\Documents\Projects\PowerToThePeopleReact\public\...
const projectRoot = path.join(__dirname, '..', '..');
console.log("Calculated Project Root:", projectRoot);
const watchFolder = path.join(projectRoot, "public", "docx-docs");
const outputFolder = path.join(projectRoot, "public", "html-docs");
const manifestPath = path.join(outputFolder, "manifest.json");

// Ensure output folder exists
if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
}

function updateManifest() {
    try {
        let manifest = [];
        // Get all category folders (e.g., 'Climate-Change', 'Energy')
        const categories = fs.readdirSync(watchFolder).filter(f =>
            fs.statSync(path.join(watchFolder, f)).isDirectory()
        );

        categories.forEach(category => {
            const catPath = path.join(watchFolder, category);
            const files = fs.readdirSync(catPath)
                .filter(file => file.endsWith('.docx'))
                .map(file => ({
                    id: path.basename(file, '.docx'),
                    title: path.basename(file, '.docx').replace(/-/g, ' '),
                    category: category.replace(/-/g, ' '),
                    url: `/html-docs/${category}/${path.basename(file, '.docx')}.html`
                }));
            manifest = manifest.concat(files);
        });

        // Ensure output folder exists before writing
        if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder, { recursive: true });

        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
        console.log("Manifest updated with categories:", manifestPath);
    } catch (err) {
        console.error("CRITICAL ERROR writing manifest:", err);
    }
}

var options = {
    ignoreEmptyParagraphs: false // Preserves blank paragraphs as <p></p>
};

// Watch recursively! 
const watcher = chokidar.watch(watchFolder, {
    // This regex ignores dotfiles and files starting with ~$
    ignored: /(^|[\/\\])\..|~\$|.*\.tmp$/,
    persistent: true,
    depth: 99
});

watcher.on('all', async (event, filePath) => {
    const fileName = path.basename(filePath);

    // 1. Ignore temporary Word lock files (starting with ~$)
    if (fileName.startsWith('~$')) {
        return;
    }

    // 2. Only process if it's a .docx file and is an actual change or new file
    if ((event === 'add' || event === 'change') && path.extname(filePath) === '.docx') {
        try {
            const category = path.basename(path.dirname(filePath));
            const targetDir = path.join(outputFolder, category);

            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }

            const outputFilename = path.basename(filePath, ".docx") + ".html";

            // Mammoth conversion
            const result = await mammoth.convertToHtml({ path: filePath }, options);
            fs.writeFileSync(path.join(targetDir, outputFilename), result.value);

            updateManifest();
            console.log(`Successfully converted: ${fileName} | Category: ${category}`);
        } catch (err) {
            console.error(`Error converting ${fileName}:`, err.message);
        }
    }
});
// Run once on startup
updateManifest();