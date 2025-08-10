// Script to reset migration flags
console.log('Clearing migration flags...');

if (typeof localStorage !== 'undefined') {
  localStorage.removeItem('firebase-migrated');
  localStorage.removeItem('disable-auto-migration');
  console.log('✅ Migration flags cleared from localStorage');
} else {
  console.log('⚠️ localStorage not available (this is normal for Node.js environment)');
}

console.log('✅ Migration flags reset completed');
console.log('Next steps:');
console.log('1. Open your browser and clear localStorage manually by opening Developer Tools > Application > Local Storage');
console.log('2. Or restart your development server to get a clean state');
