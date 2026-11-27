const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const setupTestDB = async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_kadidjiny_library_2026';
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
};

const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
};

const teardownTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
};

module.exports = { setupTestDB, clearTestDB, teardownTestDB };
