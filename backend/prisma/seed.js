const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  console.log('Seed started...');

  // 0. Clear existing data
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.editorProfile.deleteMany();
  await prisma.user.deleteMany();
  console.log('Cleared existing database');

  // 1. Create Multiple Clients with Indian Names
  const clientsData = [
    { name: 'Arjun Sharma', email: 'arjun@example.com' },
    { name: 'Priya Patel', email: 'priya@example.com' },
    { name: 'Rohan Gupta', email: 'rohan@example.com' },
    { name: 'Ananya Iyer', email: 'ananya@example.com' }
  ];

  const clients = [];
  for (const c of clientsData) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const client = await prisma.user.create({
      data: {
        email: c.email,
        password: hashedPassword,
        name: c.name,
        role: 'client'
      }
    });
    clients.push(client);
    console.log(`Created client: ${c.name}`);
  }

  // 2. Create Editors with Indian Names
  const editorsData = [
    { name: 'Vikram Singh', email: 'vikram@example.com', phone: '+91 98765 43210', skills: ['Adobe Premiere Pro', 'Color Grading'], exp: '5+ years' },
    { name: 'Sanya Malhotra', email: 'sanya@example.com', phone: '+91 87654 32109', skills: ['After Effects', 'VFX'], exp: '4 years' },
    { name: 'Rahul Verma', email: 'rahul@example.com', phone: '+91 76543 21098', skills: ['Final Cut Pro', 'Sound Design'], exp: '6 years' },
    { name: 'Ishani Rao', email: 'ishani@example.com', phone: '+91 65432 10987', skills: ['CapCut', 'Subtitles'], exp: '2 years' },
    { name: 'Kabir Das', email: 'kabir@example.com', phone: '+91 54321 09876', skills: ['DaVinci Resolve', 'Storytelling'], exp: '8 years' },
    { name: 'Nisha Reddy', email: 'nisha@example.com', phone: '+91 43210 98765', skills: ['Adobe Premiere Pro', 'After Effects'], exp: '3 years' },
    { name: 'Aman Khan', email: 'aman@example.com', phone: '+91 32109 87654', skills: ['Motion Graphics', '3D Animation'], exp: '5+ years' },
    { name: 'Divya Joshi', email: 'divya@example.com', phone: '+91 21098 76543', skills: ['Final Cut Pro', 'CapCut'], exp: '2 years' },
    { name: 'Siddharth Mehra', email: 'sid@example.com', phone: '+91 10987 65432', skills: ['Color Grading', 'VFX'], exp: '7 years' },
    { name: 'Tanvi Shah', email: 'tanvi@example.com', phone: '+91 09876 54321', skills: ['Sound Design', 'Storytelling'], exp: '4 years' }
  ];

  const editors = [];
  for (const ed of editorsData) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const editor = await prisma.user.create({
      data: {
        email: ed.email,
        password: hashedPassword,
        name: ed.name,
        phone: ed.phone,
        role: 'editor',
        editorProfile: {
          create: {
            bio: `Professional Indian video editor specializing in ${ed.skills[0]}.`,
            skills: ed.skills,
            experience: ed.exp,
            experienceDetails: `I have extensive experience working with ${ed.skills.join(', ')} on high-quality Indian content.`,
            portfolioLinks: [`https://vimeo.com/${ed.name.toLowerCase().replace(' ', '')}`],
            availability: 'Full-time'
          }
        }
      }
    });
    editors.push(editor);
    console.log(`Created editor: ${ed.name}`);
  }

  // 3. Sample Job Data from different clients
  const jobsData = [
    {
      title: 'Bollywood Style Wedding Highlight',
      description: 'Need a cinematic 5-minute wedding highlight for a destination wedding in Udaipur. Must have high-quality color grading.',
      category: 'Wedding',
      videoType: 'Long Video (YouTube/Doc)',
      software: ['Adobe Premiere Pro', 'DaVinci Resolve'],
      budget: 15000,
      deadline: new Date('2026-06-01'),
      createdBy: clients[0].id
    },
    {
      title: 'Indian Street Food Vlog Edit',
      description: 'Edit a 12-minute vlog about Old Delhi street food. Need fast-paced cuts and engaging Hindi subtitles.',
      category: 'YouTube',
      videoType: 'Long Video (YouTube/Doc)',
      software: ['Adobe Premiere Pro'],
      budget: 5000,
      deadline: new Date('2026-05-15'),
      createdBy: clients[1].id
    },
    {
      title: 'Tech Review Reels (5 Pack)',
      description: 'Need 5 tech review reels in Hindi. 30-60 seconds each. Use trending transitions.',
      category: 'Social Media',
      videoType: 'Short Video (Reels/TikTok)',
      software: ['CapCut', 'After Effects'],
      budget: 3500,
      deadline: new Date('2026-04-30'),
      createdBy: clients[2].id
    },
    {
      title: 'Real Estate Luxury Villa Tour',
      description: 'Cinematic tour of a villa in Goa. 3 minutes long. Need drone footage stabilization.',
      category: 'Real Estate',
      videoType: 'Corporate Video',
      software: ['Final Cut Pro'],
      budget: 8000,
      deadline: new Date('2026-05-20'),
      createdBy: clients[3].id
    },
    {
      title: 'Indie Music Video - Hip Hop',
      description: 'Edit a 3-minute music video for a Mumbai based rapper. Gritty and high energy style needed.',
      category: 'Music Video',
      videoType: 'Long Video (YouTube/Doc)',
      software: ['After Effects', 'Adobe Premiere Pro'],
      budget: 12000,
      deadline: new Date('2026-07-01'),
      createdBy: clients[0].id
    }
  ];

  const createdJobs = [];
  for (const job of jobsData) {
    const createdJob = await prisma.job.create({ data: job });
    createdJobs.push(createdJob);
  }

  // 4. Create Sample Applications
  await prisma.application.create({ data: { jobId: createdJobs[0].id, editorId: editors[0].id } });
  await prisma.application.create({ data: { jobId: createdJobs[0].id, editorId: editors[4].id } });
  await prisma.application.create({ data: { jobId: createdJobs[1].id, editorId: editors[1].id } });

  console.log('Seed completed successfully with Indian names!');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
