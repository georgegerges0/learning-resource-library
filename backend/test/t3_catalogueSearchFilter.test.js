const { expect } = require('chai');
const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Resource = require('../models/Resource');
const { setupTestDB, clearTestDB, teardownTestDB } = require('./testHelper');

describe('T3 · S4 Catalogue Search, Combined Filters & DC4 Visibility Guard (LRL-16)', function () {
  this.timeout(30000);

  let adminUser;
  let studentToken;
  let fixtures;

  before(async () => {
    await setupTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
    adminUser = await User.create({
      name: 'Ada Librarian',
      email: 'ada@qut.edu.au',
      password: 'AdminPassword123!',
      role: 'admin',
    });

    const studentReg = await request(app).post('/api/auth/register').send({
      name: 'Sam Student',
      email: 'sam@qut.edu.au',
      password: 'StudentPassword123!',
    });
    studentToken = studentReg.body.token;

    fixtures = await Resource.create([
      {
        title: 'Clinical Handover Simulation Walkthrough',
        provider: 'QUT Health Learning Studio',
        studyArea: 'Health',
        format: 'Video',
        description: 'Structured ISBAR clinical communication video for nursing students.',
        accessUrl: 'https://example.edu/health-video-isbar',
        status: 'Published',
        publishedAt: new Date(),
        createdBy: adminUser._id,
      },
      {
        title: 'Evidence-Based Infection Control Guidelines',
        provider: 'Australian Health Review',
        studyArea: 'Health',
        format: 'Article',
        description: 'Peer-reviewed journal article on clinical infection prevention.',
        accessUrl: 'https://example.edu/health-article',
        status: 'Published',
        publishedAt: new Date(),
        createdBy: adminUser._id,
      },
      {
        title: 'Finite Element Truss Analysis Lecture (C++ Solver)',
        provider: 'QUT Civil Engineering',
        studyArea: 'Engineering',
        format: 'Video',
        description: 'Engineering video demonstrating truss stiffness matrices with C++ examples.',
        accessUrl: 'https://example.edu/eng-video',
        status: 'Published',
        publishedAt: new Date(),
        createdBy: adminUser._id,
      },
      {
        title: 'Unpublished Draft Health Video',
        provider: 'QUT Health Learning Studio',
        studyArea: 'Health',
        format: 'Video',
        description: 'Draft clinical video awaiting review.',
        accessUrl: 'https://example.edu/draft-health-video',
        status: 'Draft',
        createdBy: adminUser._id,
      },
      {
        title: 'Superseded 2019 Pharmacology Video',
        provider: 'Legacy Media Archive',
        studyArea: 'Health',
        format: 'Video',
        description: 'Withdrawn clinical video.',
        accessUrl: 'https://example.edu/archived-health-video',
        status: 'Archived',
        archivedAt: new Date(),
        createdBy: adminUser._id,
      },
    ]);
  });

  after(async () => {
    await teardownTestDB();
  });

  it('returns only published matches for a Health + Video filter and excludes Health articles, other-area videos, drafts and archived items (R1, S4)', async () => {
    const res = await request(app)
      .get('/api/resources')
      .query({ studyArea: 'Health', format: 'Video' })
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.lengthOf(1);
    expect(res.body[0].title).to.equal('Clinical Handover Simulation Walkthrough');
    expect(res.body[0].studyArea).to.equal('Health');
    expect(res.body[0].format).to.equal('Video');
  });

  it('supports keyword search with escaped regex metacharacters like "C++" without throwing 500 (PR #3 Self-Review)', async () => {
    const res = await request(app)
      .get('/api/resources')
      .query({ q: 'C++' })
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.lengthOf(1);
    expect(res.body[0].title).to.include('C++ Solver');
  });

  it('blocks direct Student detail access to Draft, Archived or invalid resource IDs with 404 (R2, DC4)', async () => {
    const publishedItem = fixtures[0];
    const draftItem = fixtures[3];
    const archivedItem = fixtures[4];

    const okRes = await request(app)
      .get(`/api/resources/${publishedItem._id}`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(okRes.status).to.equal(200);
    expect(okRes.body.title).to.equal(publishedItem.title);

    const draftRes = await request(app)
      .get(`/api/resources/${draftItem._id}`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(draftRes.status).to.equal(404);

    const archivedRes = await request(app)
      .get(`/api/resources/${archivedItem._id}`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(archivedRes.status).to.equal(404);

    const malformedRes = await request(app)
      .get('/api/resources/not-a-valid-objectid')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(malformedRes.status).to.equal(404);
  });
});
