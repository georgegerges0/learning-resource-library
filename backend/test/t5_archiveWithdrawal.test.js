const { expect } = require('chai');
const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Resource = require('../models/Resource');
const Bookmark = require('../models/Bookmark');
const { setupTestDB, clearTestDB, teardownTestDB } = require('./testHelper');

describe('T5 · S3 Resource Withdrawal Across All Three Student Access Paths (LRL-25)', function () {
  this.timeout(30000);

  let adminToken;
  let studentToken;
  let resourceId;

  before(async () => {
    await setupTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
    await Bookmark.syncIndexes();

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
    adminToken = adminLogin.body.token;

    const studentReg = await request(app).post('/api/auth/register').send({
      name: 'Sam Student',
      email: 'sam@qut.edu.au',
      password: 'StudentPassword123!',
    });
    studentToken = studentReg.body.token;

    // Publish resource and save to Student's My Library
    const pubRes = await request(app)
      .post('/api/resources')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Timber connections under load (2020 Edition)',
        provider: 'QUT Civil Structures Lab',
        studyArea: 'Engineering',
        format: 'Video',
        description: 'Laboratory demonstration of bolted timber connection shear capacity.',
        accessUrl: 'https://example.edu/timber-connections-2020',
        status: 'Published',
      });
    resourceId = pubRes.body._id;

    const saveRes = await request(app)
      .post('/api/bookmarks')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ resourceId });
    expect(saveRes.status).to.equal(200);
  });

  after(async () => {
    await teardownTestDB();
  });

  it('retains Resource and Bookmark records (DC2) while withdrawing item from Student search, My Library and direct detail link (R2, T5)', async () => {
    // Archive as Administrator
    const archiveRes = await request(app)
      .patch(`/api/resources/${resourceId}/archive`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(archiveRes.status).to.equal(200);
    expect(archiveRes.body.status).to.equal('Archived');
    expect(archiveRes.body.archivedAt).to.not.equal(null);

    // DC2: Both Resource and Bookmark documents remain stored in MongoDB
    const dbResource = await Resource.findById(resourceId);
    expect(dbResource).to.not.equal(null);
    expect(dbResource.status).to.equal('Archived');
    expect(await Bookmark.countDocuments({ resourceId })).to.equal(1);

    // Path 1: Disappears from Student catalogue search
    const searchRes = await request(app)
      .get('/api/resources')
      .query({ studyArea: 'Engineering', format: 'Video' })
      .set('Authorization', `Bearer ${studentToken}`);
    expect(searchRes.status).to.equal(200);
    expect(searchRes.body).to.have.lengthOf(0);

    // Path 2: Disappears from Student My Library saved list
    const myLibraryRes = await request(app)
      .get('/api/bookmarks')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(myLibraryRes.status).to.equal(200);
    expect(myLibraryRes.body).to.have.lengthOf(0);

    // Path 3: Direct Student detail link returns 404
    const detailRes = await request(app)
      .get(`/api/resources/${resourceId}`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(detailRes.status).to.equal(404);

    // Administrator management view still retains the Archived record
    const manageRes = await request(app)
      .get('/api/resources/manage')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(manageRes.status).to.equal(200);
    expect(manageRes.body).to.have.lengthOf(1);
    expect(manageRes.body[0].status).to.equal('Archived');
  });
});
