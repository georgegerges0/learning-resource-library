const { expect } = require('chai');
const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const { setupTestDB, clearTestDB, teardownTestDB } = require('./testHelper');

describe('T1 · S1 Role Guard & Authentication Permissions (LRL-7)', function () {
  this.timeout(30000);

  before(async () => {
    await setupTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  after(async () => {
    await teardownTestDB();
  });

  it('returns 401 Unauthorized when a signed-out user attempts a catalogue write', async () => {
    const res = await request(app).post('/api/resources').send({
      title: 'Unauthorised Resource',
    });
    expect(res.status).to.equal(401);
    expect(res.body.message).to.match(/sign in|Authentication required/i);
  });

  it('returns 401 Unauthorized when a signed-out user attempts to read protected catalogue routes', async () => {
    const res = await request(app).get('/api/resources');
    expect(res.status).to.equal(401);
  });

  it('defaults public registration to Student role even if admin role is supplied in payload', async () => {
    const reg = await request(app).post('/api/auth/register').send({
      name: 'Sam Student',
      email: 'sam.student@qut.edu.au',
      password: 'Password123!',
      role: 'admin',
    });

    expect(reg.status).to.equal(201);
    expect(reg.body.role).to.equal('student');
    expect(reg.body.token).to.be.a('string');
  });

  it('returns 403 Forbidden and modifies no records when a signed-in Student attempts a catalogue write', async () => {
    const reg = await request(app).post('/api/auth/register').send({
      name: 'Sam Student',
      email: 'sam@qut.edu.au',
      password: 'Password123!',
    });
    const studentToken = reg.body.token;

    const writeRes = await request(app)
      .post('/api/resources')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Attempted Student Write',
        provider: 'QUT',
        studyArea: 'Engineering',
        format: 'Video',
        description: 'Should be rejected',
        accessUrl: 'https://library.qut.edu.au/video',
      });

    expect(writeRes.status).to.equal(403);
    expect(writeRes.body.message).to.match(/Educator/i);

    const manageRes = await request(app)
      .get('/api/resources/manage')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(manageRes.status).to.equal(403);
  });

  it('allows an authorised Educator past the role guard', async () => {
    await User.create({
      name: 'Ada Librarian',
      email: 'ada.admin@qut.edu.au',
      password: 'AdminPassword123!',
      role: 'admin',
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'ada.admin@qut.edu.au',
      password: 'AdminPassword123!',
    });

    expect(loginRes.status).to.equal(200);
    expect(loginRes.body.role).to.equal('admin');

    const manageRes = await request(app)
      .get('/api/resources/manage')
      .set('Authorization', `Bearer ${loginRes.body.token}`);

    expect(manageRes.status).to.equal(200);
  });
});
