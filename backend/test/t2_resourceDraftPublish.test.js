const { expect } = require('chai');
const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Resource = require('../models/Resource');
const { setupTestDB, clearTestDB, teardownTestDB } = require('./testHelper');

describe('T2 · S2 Draft Creation, Validation & Publication (LRL-11)', function () {
  this.timeout(30000);

  let adminToken;
  let studentToken;

  before(async () => {
    await setupTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
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
  });

  after(async () => {
    await teardownTestDB();
  });

  it('rejects incomplete metadata or invalid accessUrl with field-specific errors (R2)', async () => {
    const res = await request(app)
      .post('/api/resources')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: '',
        provider: 'QUT Engineering',
        studyArea: 'Engineering',
        format: 'Video',
        description: 'Walkthrough of steel connections.',
        accessUrl: 'ftp://invalid-protocol.example.com/file',
      });

    expect(res.status).to.equal(400);
    expect(res.body.fieldErrors).to.be.an('object');
    expect(res.body.fieldErrors).to.have.property('title');
    expect(res.body.fieldErrors).to.have.property('accessUrl');
    expect(await Resource.countDocuments()).to.equal(0);
  });

  it('keeps Draft resources hidden from Students until explicitly published, then exposes Published version', async () => {
    // 1. Create Draft
    const createRes = await request(app)
      .post('/api/resources')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Structural steel design (Draft)',
        provider: 'University engineering collection',
        studyArea: 'Engineering',
        format: 'Standard or code',
        description: 'Initial draft before review.',
        accessUrl: 'https://example.edu/structural-steel',
        status: 'Draft',
      });

    expect(createRes.status).to.equal(201);
    expect(createRes.body.status).to.equal('Draft');
    const resourceId = createRes.body._id;

    // 2. Student cannot see Draft in catalogue
    const studentBefore = await request(app)
      .get('/api/resources')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(studentBefore.status).to.equal(200);
    expect(studentBefore.body).to.have.lengthOf(0);

    // 3. Administrator edits Draft and publishes it
    const updateRes = await request(app)
      .put(`/api/resources/${resourceId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Structural steel design',
        provider: 'University engineering collection',
        studyArea: 'Engineering',
        format: 'Standard or code',
        description: 'Reviewed guide to AS 4100 structural steel member design.',
        accessUrl: 'https://example.edu/structural-steel',
        status: 'Draft',
      });
    expect(updateRes.status).to.equal(200);
    expect(updateRes.body.title).to.equal('Structural steel design');
    expect(updateRes.body.status).to.equal('Draft');

    const publishRes = await request(app)
      .patch(`/api/resources/${resourceId}/publish`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(publishRes.status).to.equal(200);
    expect(publishRes.body.status).to.equal('Published');
    expect(publishRes.body.publishedAt).to.not.equal(null);

    // 4. Student now sees only the Published version
    const studentAfter = await request(app)
      .get('/api/resources')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(studentAfter.status).to.equal(200);
    expect(studentAfter.body).to.have.lengthOf(1);
    expect(studentAfter.body[0].title).to.equal('Structural steel design');
  });
});
