const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/User');
const Resource = require('../models/Resource');
const Bookmark = require('../models/Bookmark');

dotenv.config();
mongoose.set('strictQuery', true);

const DEMO_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@kadidjiny.edu.au';
const DEMO_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'AdminPass123!';
const DEMO_STUDENT_EMAIL = process.env.SEED_STUDENT_EMAIL || 'student@kadidjiny.edu.au';
const DEMO_STUDENT_PASSWORD = process.env.SEED_STUDENT_PASSWORD || 'StudentPass123!';

const SAMPLE_RESOURCES = [
  {
    title: 'Structural steel design',
    provider: 'University engineering collection',
    studyArea: 'Engineering',
    format: 'Standard or code',
    description:
      'Reference guide to limit-states design of structural steel beams, columns and connections aligned with AS 4100.',
    accessUrl: 'https://www.standards.org.au/standards-catalogue/sa-snz/building/bd-001',
    status: 'Published',
  },
  {
    title: 'Timber connections under load',
    provider: 'QUT Civil Structures Laboratory',
    studyArea: 'Engineering',
    format: 'Article',
    description:
      'Experimental study examining dowel-bearing strength and ductile failure modes in engineered timber joints.',
    accessUrl: 'https://eprints.qut.edu.au/',
    status: 'Published',
  },
  {
    title: 'Clinical handover simulation walkthrough',
    provider: 'QUT Health Learning Studio',
    studyArea: 'Health',
    format: 'Video',
    description:
      'Annotated clinical simulation demonstrating structured ISBAR patient handover in acute ward settings.',
    accessUrl: 'https://www.safetyandquality.gov.au/standards/nsqhs-standards/communicating-safety-standard',
    status: 'Published',
  },
  {
    title: 'Evidence-based infection control guidelines',
    provider: 'NHMRC Clinical Educator Portal',
    studyArea: 'Health',
    format: 'Article',
    description:
      'Australian guidelines for the prevention and control of infection in healthcare facilities.',
    accessUrl: 'https://www.nhmrc.gov.au/about-us/publications/australian-guidelines-prevention-and-control-infection-healthcare-2019',
    status: 'Published',
  },
  {
    title: 'Reading research critically',
    provider: 'Kadidjiny Academic Skills',
    studyArea: 'Research methods',
    format: 'Learning material',
    description:
      'Practical checklist for evaluating study design, sampling bias, methodology and source attribution.',
    accessUrl: 'https://www.citewrite.qut.edu.au/',
    status: 'Published',
  },
  {
    title: 'Trends in sustainable construction (Draft review)',
    provider: 'Green Building Council Research Digest',
    studyArea: 'Construction',
    format: 'Industry report',
    description:
      'Draft review of embodied carbon benchmarks in commercial building envelopes awaiting staff publication.',
    accessUrl: 'https://new.gbca.org.au/',
    status: 'Draft',
  },
];

const runSeed = async () => {
  if (!process.env.MONGO_URI) {
    console.error('Error: MONGO_URI must be set in backend/.env before running seed.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  await Bookmark.syncIndexes();

  let admin = await User.findOne({ email: DEMO_ADMIN_EMAIL });
  if (!admin) {
    admin = await User.create({
      name: 'Ada Librarian (Admin)',
      email: DEMO_ADMIN_EMAIL,
      password: DEMO_ADMIN_PASSWORD,
      role: 'admin',
      university: 'Queensland University of Technology',
    });
    console.log(`Created Administrator account: ${DEMO_ADMIN_EMAIL}`);
  }

  let student = await User.findOne({ email: DEMO_STUDENT_EMAIL });
  if (!student) {
    student = await User.create({
      name: 'Sam Student',
      email: DEMO_STUDENT_EMAIL,
      password: DEMO_STUDENT_PASSWORD,
      role: 'student',
      university: 'Queensland University of Technology',
    });
    console.log(`Created Student account: ${DEMO_STUDENT_EMAIL}`);
  }

  for (const item of SAMPLE_RESOURCES) {
    const existing = await Resource.findOne({ title: item.title });
    if (!existing) {
      await Resource.create({
        ...item,
        createdBy: admin._id,
        publishedAt: item.status === 'Published' ? new Date() : null,
      });
      console.log(`Seeded [${item.status}] resource: ${item.title}`);
    }
  }

  // Ensure demo Student has one initial bookmark for immediate walkthrough testing
  const firstPublished = await Resource.findOne({ status: 'Published' });
  if (firstPublished) {
    await Bookmark.findOneAndUpdate(
      { userId: student._id, resourceId: firstPublished._id },
      { $setOnInsert: { userId: student._id, resourceId: firstPublished._id } },
      { upsert: true, new: true }
    );
  }

  console.log('Kadidjiny Library seed complete.');
  await mongoose.connection.close();
};

if (require.main === module) {
  runSeed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}

module.exports = { runSeed };
