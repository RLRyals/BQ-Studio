/**
 * Plugin Packaging Script
 *
 * Packages BQ-Studio as a FictionLab plugin
 */

const fs = require('fs-extra');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const DIST_PLUGIN_DIR = path.join(ROOT_DIR, 'dist-plugin');
const PLUGIN_PACKAGE_DIR = path.join(ROOT_DIR, 'plugin-package');

async function packagePlugin() {
  console.log('📦 Packaging BQ-Studio plugin...\n');

  try {
    // Clean plugin package directory
    console.log('🧹 Cleaning plugin package directory...');
    await fs.remove(PLUGIN_PACKAGE_DIR);
    await fs.ensureDir(PLUGIN_PACKAGE_DIR);

    // Create dist directory in package
    const distDir = path.join(PLUGIN_PACKAGE_DIR, 'dist');
    await fs.ensureDir(distDir);

    // Copy plugin entry point
    console.log('📋 Copying plugin entry point...');
    await fs.copy(
      path.join(DIST_PLUGIN_DIR, 'plugin-entry.js'),
      path.join(distDir, 'plugin-entry.js')
    );

    // Copy core services (compiled TypeScript)
    console.log('📋 Copying core services...');
    const coreSourceDir = path.join(ROOT_DIR, 'dist/main/src/core');
    const coreDestDir = path.join(distDir, 'core');

    if (await fs.pathExists(coreSourceDir)) {
      await fs.copy(coreSourceDir, coreDestDir);
    } else {
      console.warn('⚠️  Warning: Core services not built. Run npm run build:main first.');
    }

    // Copy renderer (if built)
    console.log('📋 Copying renderer...');
    const rendererSourceDir = path.join(ROOT_DIR, 'dist/renderer');
    const rendererDestDir = path.join(PLUGIN_PACKAGE_DIR, 'dist/renderer');

    if (await fs.pathExists(rendererSourceDir)) {
      await fs.copy(rendererSourceDir, rendererDestDir);
    } else {
      console.warn('⚠️  Warning: Renderer not built. Run npm run build:renderer first.');
    }

    // Copy plugin.json manifest
    console.log('📋 Copying plugin manifest...');
    await fs.copy(
      path.join(ROOT_DIR, 'plugin.json'),
      path.join(PLUGIN_PACKAGE_DIR, 'plugin.json')
    );

    // Create minimal package.json for plugin
    console.log('📋 Creating plugin package.json...');
    const mainPackageJson = await fs.readJson(path.join(ROOT_DIR, 'package.json'));

    const pluginPackageJson = {
      name: 'bq-studio-plugin',
      version: mainPackageJson.version,
      description: mainPackageJson.description,
      author: mainPackageJson.author,
      license: mainPackageJson.license,
      main: 'dist/plugin-entry.js',
      dependencies: {
        // Include only runtime dependencies needed by plugin
        'electron-store': mainPackageJson.dependencies['electron-store'],
        'pg': mainPackageJson.dependencies['pg'],
        'simple-git': mainPackageJson.dependencies['simple-git'],
      },
    };

    await fs.writeJson(
      path.join(PLUGIN_PACKAGE_DIR, 'package.json'),
      pluginPackageJson,
      { spaces: 2 }
    );

    // Copy node_modules (only production dependencies)
    console.log('📋 Copying production dependencies...');
    const nodeModulesSource = path.join(ROOT_DIR, 'node_modules');
    const nodeModulesDest = path.join(PLUGIN_PACKAGE_DIR, 'node_modules');

    // Copy only the dependencies listed in plugin package.json
    for (const dep of Object.keys(pluginPackageJson.dependencies)) {
      const depPath = path.join(nodeModulesSource, dep);
      if (await fs.pathExists(depPath)) {
        await fs.copy(depPath, path.join(nodeModulesDest, dep));
      }
    }

    // Copy README
    console.log('📋 Copying README...');
    const readmePath = path.join(ROOT_DIR, 'README.md');
    if (await fs.pathExists(readmePath)) {
      await fs.copy(readmePath, path.join(PLUGIN_PACKAGE_DIR, 'README.md'));
    }

    // Create plugin info file
    const pluginInfo = {
      name: 'BQ Studio',
      version: mainPackageJson.version,
      packagedAt: new Date().toISOString(),
      builtFor: 'FictionLab >= 0.1.0',
    };

    await fs.writeJson(
      path.join(PLUGIN_PACKAGE_DIR, 'plugin-info.json'),
      pluginInfo,
      { spaces: 2 }
    );

    // Calculate package size
    const getDirectorySize = async (dir) => {
      const files = await fs.readdir(dir, { withFileTypes: true });
      let size = 0;

      for (const file of files) {
        const filePath = path.join(dir, file.name);
        if (file.isDirectory()) {
          size += await getDirectorySize(filePath);
        } else {
          const stats = await fs.stat(filePath);
          size += stats.size;
        }
      }

      return size;
    };

    const packageSize = await getDirectorySize(PLUGIN_PACKAGE_DIR);
    const packageSizeMB = (packageSize / (1024 * 1024)).toFixed(2);

    console.log('\n✅ Plugin packaged successfully!');
    console.log(`📦 Package location: ${PLUGIN_PACKAGE_DIR}`);
    console.log(`📊 Package size: ${packageSizeMB} MB`);
    console.log('\n📋 Next steps:');
    console.log('   1. Test: npm run install:plugin:local');
    console.log('   2. Zip: Compress plugin-package/ for distribution');
    console.log('   3. Install: Extract to FictionLab plugins directory\n');

  } catch (error) {
    console.error('\n❌ Plugin packaging failed:', error.message);
    process.exit(1);
  }
}

packagePlugin();
