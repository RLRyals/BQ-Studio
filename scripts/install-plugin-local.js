/**
 * Local Plugin Installation Script
 *
 * Installs BQ-Studio plugin to local FictionLab plugins directory for testing
 */

const fs = require('fs-extra');
const path = require('path');
const os = require('os');

const ROOT_DIR = path.join(__dirname, '..');
const PLUGIN_PACKAGE_DIR = path.join(ROOT_DIR, 'plugin-package');

function getFictionLabPluginsDir() {
  const platform = os.platform();

  switch (platform) {
    case 'win32':
      return path.join(process.env.APPDATA || '', 'fictionlab', 'plugins');
    case 'darwin':
      return path.join(os.homedir(), 'Library', 'Application Support', 'fictionlab', 'plugins');
    case 'linux':
      return path.join(os.homedir(), '.config', 'fictionlab', 'plugins');
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

async function installPlugin() {
  console.log('🔧 Installing BQ-Studio plugin locally for testing...\n');

  try {
    // Check if plugin package exists
    if (!(await fs.pathExists(PLUGIN_PACKAGE_DIR))) {
      throw new Error(
        'Plugin package not found. Run `npm run build:plugin` first.'
      );
    }

    // Get FictionLab plugins directory
    const pluginsDir = getFictionLabPluginsDir();
    console.log(`📂 FictionLab plugins directory: ${pluginsDir}`);

    // Ensure plugins directory exists
    await fs.ensureDir(pluginsDir);

    // Plugin installation directory
    const pluginInstallDir = path.join(pluginsDir, 'bq-studio');

    // Remove existing installation
    if (await fs.pathExists(pluginInstallDir)) {
      console.log('🗑️  Removing existing installation...');
      await fs.remove(pluginInstallDir);
    }

    // Copy plugin package to plugins directory
    console.log('📋 Copying plugin files...');
    await fs.copy(PLUGIN_PACKAGE_DIR, pluginInstallDir);

    console.log('\n✅ Plugin installed successfully!');
    console.log(`📍 Installation path: ${pluginInstallDir}`);
    console.log('\n📋 Next steps:');
    console.log('   1. Restart FictionLab');
    console.log('   2. Check Plugins menu for "BQ Studio"');
    console.log('   3. View plugin logs in FictionLab console\n');

  } catch (error) {
    console.error('\n❌ Plugin installation failed:', error.message);
    process.exit(1);
  }
}

installPlugin();
