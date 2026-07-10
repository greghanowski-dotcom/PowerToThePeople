import mammoth from "mammoth";
import fs from "fs";
import path from "path";
import chokidar from "chokidar";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This resolves to: C:\Users\Greg\Documents\Projects\PowerToThePeopleReact\public\...
const projectRoot = path.join(__dirname, '..', '..', '..');
const watchFolder = path.join(projectRoot, "public", "docx-docs");
const outputFolder = path.join(projectRoot, "public", "html-docs");
const manifestPath = path.join(outputFolder, "manifest.json");

// Ensure output folder exists
if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
}

function updateManifest() {
    try {
        const files = fs.readdirSync(outputFolder)
            .filter(file => file.endsWith('.html'))
            .map(file => ({
                id: path.basename(file, '.html'),
                title: path.basename(file, '.html').replace(/-/g, ' '),
                url: `/html-docs/${file}`
            }));
        
        fs.writeFileSync(manifestPath, JSON.stringify(files, null, 2));
        console.log("Manifest successfully written to:", manifestPath);
    } catch (err) {
        console.error("CRITICAL ERROR writing manifest:", err);
    }
}

console.log(`Watching for changes in: ${watchFolder}`);

const watcher = chokidar.watch(watchFolder, { 
    // Ignore all hidden files, Word temp files, and anything starting with ~$
    ignored: /(^|[\/\\])\..|~\$|.*\.tmp$/, 
    persistent: true,
    awaitWriteFinish: {
        stabilityThreshold: 1000, // Wait for the file to stop changing for 1 second
        pollInterval: 100
    }
});

watcher.on('change', async (filePath) => {
    if (path.extname(filePath) === '.docx') {
        console.log(`File changed: ${path.basename(filePath)}. Converting...`);
        try {
            const result = await mammoth.convertToHtml({ path: filePath });
            const outputFilename = path.basename(filePath, ".docx") + ".html";
            fs.writeFileSync(path.join(outputFolder, outputFilename), result.value);
            updateManifest();
            console.log(`Updated: ${outputFilename}`);
        } catch (err) {
            console.error("Conversion error:", err);
        }
    }
});

// Run once on startup
updateManifest();