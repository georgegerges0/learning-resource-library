const { expect } = require('chai');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Bookmark = require('../models/Bookmark');
const { setupTestDB, clearTestDB, teardownTestDB } = require('./testHelper');

describe('T6 · Operational Persistence Across Database Reconnect / Restart (LRL-30)', function () {
  this.timeout(30000);

  before(async () => {
    await setupTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
    await Bookmark.syncIndexes();
  });

  after(async () => {
    await teardownTestDB();
  });

  it('retains published catalogue records and Student bookmarks after closing and reconnecting Mongoose (R2, R3, T6)', async () => {
    const currentUri = mongoose.connection.client.s.url;

    await User.create({
      name: 'Ada Librarian',
      email: 'ada@qut.edu.au',
      password: 'AdminPassword123!',
      role: 'admin',
    });
    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'ada@qut.edu.au',
      password: 'AdminPassword123!',
    });

    const studentReg = await request(app).post('/api/auth/register').send({
      name: 'Sam Student',
      email: 'sam@qut.edu.au',
      password: 'StudentPassword123!',
    });

    const pubRes = await request(app)
      .post('/api/resources')
      .set('Authorization', `Bearer ${adminLogin.body.token}`)
      .send({
        title: 'Persistent Structural Mechanics Video',
        provider: 'QUT Engineering Media',
        studyArea: 'Engineering',
        format: 'Video',
        description: 'Remains persisted across service restarts.',
        accessUrl: 'https://example.edu/persistent-mechanics',
        status: 'Published',
      });
    expect(pubRes.status).to.equal(201);

    const saveRes = await request(app)
      .post('/api/bookmarks')
      .set('Authorization', `Bearer ${studentReg.body.token}`)
      .send({ resourceId: pubRes.body._id });
    expect(saveRes.status).to.equal(200);

    // Simulate API restart by closing Mongoose connection and reconnecting to the same MongoDB instance
    await mongoose.connection.close();
    expect(mongoose.connection.readyState).to.equal(0);
    await mongoose.connect(currentUri);
    expect(mongoose.connection.readyState).to.equal(1);

    // Verify published resource and Student bookmark remain intact after reconnect
    const catAfter = await request(app)
      .get('/api/resources')
      .set('Authorization', `Bearer ${studentReg.body.token}`);
    expect(catAfter.status).to.equal(200);
    expect(catAfter.body).to.have.lengthOf(1);
    expect(catAfter.body[0].title).to.equal('Persistent Structural Mechanics Video');

    const libAfter = await request(app)
      .get('/api/bookmarks')
      .set('Authorization', `Bearer ${studentReg.body.token}`);
    expect(libAfter.status).to.equal(200);
    expect(libAfter.body).to.have.lengthOf(1);
    expect(libAfter.body[0].resource._id).to.equal(pubRes.body._id);
  });
});
