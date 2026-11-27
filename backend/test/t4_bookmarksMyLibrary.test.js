const { expect } = require('chai');
const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Resource = require('../models/Resource');
const Bookmark = require('../models/Bookmark');
const { setupTestDB, clearTestDB, teardownTestDB } = require('./testHelper');

describe('T4 · S5 Personal Collection, Duplicate-Save Uniqueness & Owner Isolation (LRL-20)', function () {
  this.timeout(30000);

  let adminUser;
  let studentAToken;
  let studentBToken;
  let publishedResource;

  before(async () => {
    await setupTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
    await Bookmark.syncIndexes();

    adminUser = await User.create({
      name: 'Ada Librarian',
      email: 'ada@qut.edu.au',
      password: 'AdminPassword123!',
      role: 'admin',
    });

    const regA = await request(app).post('/api/auth/register').send({
      name: 'Student One',
      email: 'student.one@qut.edu.au',
      password: 'Password123!',
    });
    studentAToken = regA.body.token;

    const regB = await request(app).post('/api/auth/register').send({
      name: 'Student Two',
      email: 'student.two@qut.edu.au',
      password: 'Password123!',
    });
    studentBToken = regB.body.token;

    publishedResource = await Resource.create({
      title: 'Reading research critically',
      provider: 'Kadidjiny Academic Skills',
      studyArea: 'Research methods',
      format: 'Learning material',
      description: 'Guide to evaluating methodology, sample design and validity.',
      accessUrl: 'https://example.edu/reading-research',
      status: 'Published',
      publishedAt: new Date(),
      createdBy: adminUser._id,
    });
  });

  after(async () => {
    await teardownTestDB();
  });

  it('creates a single reading list entry when a Student saves the same item twice rapidly and persists across sign-in (R3, DC3)', async () => {
    const [save1, save2] = await Promise.all([
      request(app)
        .post('/api/bookmarks')
        .set('Authorization', `Bearer ${studentAToken}`)
        .send({ resourceId: publishedResource._id.toString() }),
      request(app)
        .post('/api/bookmarks')
        .set('Authorization', `Bearer ${studentAToken}`)
        .send({ resourceId: publishedResource._id.toString() }),
    ]);

    expect(save1.status).to.equal(200);
    expect(save2.status).to.equal(200);
    expect(await Bookmark.countDocuments()).to.equal(1);

    // Sign in again with a fresh session token and verify bookmark remains
    const relogin = await request(app).post('/api/auth/login').send({
      email: 'student.one@qut.edu.au',
      password: 'Password123!',
    });
    expect(relogin.status).to.equal(200);

    const listRes = await request(app)
      .get('/api/bookmarks')
      .set('Authorization', `Bearer ${relogin.body.token}`);
    expect(listRes.status).to.equal(200);
    expect(listRes.body).to.have.lengthOf(1);
    expect(listRes.body[0].resource.title).to.equal('Reading research critically');
  });

  it('enforces owner isolation so only the owner can view or remove their bookmark while keeping the catalogue item available to others (R3)', async () => {
    await request(app)
      .post('/api/bookmarks')
      .set('Authorization', `Bearer ${studentAToken}`)
      .send({ resourceId: publishedResource._id.toString() });

    // Student B sees an empty reading list and cannot delete Student A's bookmark
    const bList = await request(app)
      .get('/api/bookmarks')
      .set('Authorization', `Bearer ${studentBToken}`);
    expect(bList.status).to.equal(200);
    expect(bList.body).to.have.lengthOf(0);

    const bDeleteAttempt = await request(app)
      .delete(`/api/bookmarks/${publishedResource._id}`)
      .set('Authorization', `Bearer ${studentBToken}`);
    expect(bDeleteAttempt.status).to.equal(404);
    expect(await Bookmark.countDocuments()).to.equal(1);

    // Student A removes their own bookmark
    const aDelete = await request(app)
      .delete(`/api/bookmarks/${publishedResource._id}`)
      .set('Authorization', `Bearer ${studentAToken}`);
    expect(aDelete.status).to.equal(200);

    const aListAfter = await request(app)
      .get('/api/bookmarks')
      .set('Authorization', `Bearer ${studentAToken}`);
    expect(aListAfter.body).to.have.lengthOf(0);

    // Catalogue entry remains published and accessible to Student B
    const bCatalogue = await request(app)
      .get('/api/resources')
      .set('Authorization', `Bearer ${studentBToken}`);
    expect(bCatalogue.status).to.equal(200);
    expect(bCatalogue.body).to.have.lengthOf(1);
    expect(bCatalogue.body[0]._id).to.equal(publishedResource._id.toString());
  });
});
