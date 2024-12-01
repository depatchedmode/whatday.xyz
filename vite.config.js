import { defineConfig } from 'vite';
import fs from 'fs';

// Ensure CNAME file is copied to dist during build
const copyCNAMEPlugin = () => {
  return {
    name: 'copy-cname',
    writeBundle() {
      fs.writeFileSync('./dist/CNAME', 'whatday.xyz');
    }
  };
};

export default defineConfig({
  base: '/',
  server: {
    port: 3000
  },
  plugins: [copyCNAMEPlugin()]
}); 