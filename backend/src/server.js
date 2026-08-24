const app = require('./app');
const { getDb } = require('./database/db');
const seed = require('./database/seed');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    console.log('⚡ Initializing Database...');
    await getDb();

    // Auto-seed if running dev or DB newly created
    if (process.env.NODE_ENV !== 'test') {
      try {
        await seed();
      } catch (err) {
        console.warn('⚠️ Seeding skipped or already populated:', err.message);
      }
    }

    app.listen(PORT, () => {
      console.log(`🚀 VESA Workflow Backend running on http://localhost:${PORT}`);
      console.log(`📊 Health Check available at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
