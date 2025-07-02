#!/usr/bin/env node

/**
 * Migration script to replace useAuth with useFirebaseAuth across the project
 * Run this once to update all authentication imports
 */

import fs from "fs";
import path from "path";

const projectRoot = "e:\\Web Project\\eco-cycle-hub";

const filesToUpdate = [
  "components\\Admin\\Adminsidebar.tsx",
  "components\\Collector\\Collectorsidebar.tsx",
  "components\\Industry\\Industrysidebar.tsx",
  "components\\Shop\\Shopsidebar.tsx",
  "app\\(shop)\\customer-profile\\page.tsx",
  "app\\(shop)\\products\\page.tsx",
  "app\\(collector)\\layout.tsx",
  "app\\(industry)\\layout.tsx",
  "app\\(admin)\\layout.tsx",
  "app\\(auth)\\login\\page.tsx",
  "app\\(auth)\\register\\page.tsx",
];

function updateAuthImports(filePath) {
  const fullPath = path.join(projectRoot, filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⏭️  Skipping ${filePath} (file not found)`);
    return;
  }

  try {
    let content = fs.readFileSync(fullPath, "utf8");
    let updated = false;

    // Replace import statement
    if (content.includes('import { useAuth } from "@/hooks/useAuth"')) {
      content = content.replace(
        'import { useAuth } from "@/hooks/useAuth"',
        'import { useFirebaseAuth } from "@/hooks/useFirebaseAuth"'
      );
      updated = true;
    }

    // Replace hook usage
    if (content.includes("useAuth()")) {
      content = content.replace(/useAuth\(\)/g, "useFirebaseAuth()");
      updated = true;
    }

    if (updated) {
      fs.writeFileSync(fullPath, content);
      console.log(`✅ Updated ${filePath}`);
    } else {
      console.log(`⏭️  No changes needed for ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

console.log("🔄 Starting Firebase Auth migration...\n");

filesToUpdate.forEach(updateAuthImports);

console.log(
  "\n✨ Migration complete! Your project now uses Firebase Authentication."
);
console.log("\n📝 Next steps:");
console.log(
  "1. Verify your Firebase project is set up in the Firebase Console"
);
console.log("2. Enable Authentication methods (Email/Password)");
console.log("3. Set up Firestore rules");
console.log("4. Test the authentication flow");
