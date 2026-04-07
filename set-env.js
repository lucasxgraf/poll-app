const fs = require('fs');
const path = require('path');
const dir = './src/environments';
if (!fs.existsSync(dir)) { fs.mkdirSync(dir, { recursive: true }); }
const targetPath = path.join(dir, 'environment.ts');

const envConfigFile = `
export const environment = {
  production: true,
  supabaseUrl: '${process.env.SUPABASE_URL || ""}',
  supabaseKey: '${process.env.SUPABASE_KEY || ""}'
};
`;
fs.writeFileSync(targetPath, envConfigFile);
console.log(`✅ Environment file generated at ${targetPath}`);