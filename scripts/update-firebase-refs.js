import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filePath = resolve(__dirname, "lib/firebase-services.ts");
let content = readFileSync(filePath, "utf8");

// Replace all instances of collection(db, with collection(getDb(),
content = content.replace(/collection\(db,/g, "collection(getDb(),");

// Replace all instances of doc(db, with doc(getDb(),
content = content.replace(/doc\(db,/g, "doc(getDb(),");

// Write the file back
writeFileSync(filePath, content, "utf8");

console.log("Successfully updated all Firebase references");
