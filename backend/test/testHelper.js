const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

mongoose.set('strictQuery', true);

let mongoServer;
let activeSuites = 0;

const setupTestDB = async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_kadidjiny_library_2026';
  activeSuites += 1;
  if (mongoose.connection.readyState === 0) {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  }
};

const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
};

const teardownTestDB = async () => {
  activeSuites = Math.max(0, activeSuites - 1);
  if (activeSuites === 0 && mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
      mongoServer = null;
    }
  }
};

module.exports = { setupTestDB, clearTestDB, teardownTestDB };
