import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (cascade delete handles relationships)
  await prisma.announcement.deleteMany();
  await prisma.relationship.deleteMany();
  await prisma.familyMember.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.family.deleteMany();
  await prisma.member.deleteMany();
  await prisma.fileStorage.deleteMany();

  console.log('✓ Cleared existing data');

  // Create Members (Individuals)
  const members = await Promise.all([
    // Halani Family
    prisma.member.create({
      data: {
        firstName: 'Rajesh',
        lastName: 'Halani',
        dateOfBirth: new Date('1965-05-15'),
        profession: 'Business Owner',
        maritalStatus: 'Married',
        photoUrl: null,
      },
    }),
    prisma.member.create({
      data: {
        firstName: 'Priya',
        lastName: 'Halani',
        dateOfBirth: new Date('1968-08-22'),
        profession: 'Educator',
        maritalStatus: 'Married',
        photoUrl: null,
      },
    }),
    prisma.member.create({
      data: {
        firstName: 'Arjun',
        lastName: 'Halani',
        dateOfBirth: new Date('1990-03-10'),
        profession: 'Software Engineer',
        maritalStatus: 'Single',
        photoUrl: null,
      },
    }),
    prisma.member.create({
      data: {
        firstName: 'Anjali',
        lastName: 'Halani',
        dateOfBirth: new Date('1992-11-28'),
        profession: 'Doctor',
        maritalStatus: 'Married',
        photoUrl: null,
      },
    }),
    // Parivar Family
    prisma.member.create({
      data: {
        firstName: 'Vikram',
        lastName: 'Parivar',
        dateOfBirth: new Date('1962-01-20'),
        profession: 'Retired',
        maritalStatus: 'Married',
        photoUrl: null,
      },
    }),
    prisma.member.create({
      data: {
        firstName: 'Meera',
        lastName: 'Parivar',
        dateOfBirth: new Date('1965-06-14'),
        profession: 'Homemaker',
        maritalStatus: 'Married',
        photoUrl: null,
      },
    }),
    prisma.member.create({
      data: {
        firstName: 'Rohan',
        lastName: 'Parivar',
        dateOfBirth: new Date('1988-09-05'),
        profession: 'Architect',
        maritalStatus: 'Married',
        photoUrl: null,
      },
    }),
    // Additional for relationships
    prisma.member.create({
      data: {
        firstName: 'Divya',
        lastName: 'Sharma',
        dateOfBirth: new Date('1991-04-17'),
        profession: 'Lawyer',
        maritalStatus: 'Married',
        photoUrl: null,
      },
    }),
  ]);

  console.log(`✓ Created ${members.length} members`);

  // Create Families
  const [haalaniFamily, parivarFamily] = await Promise.all([
    prisma.family.create({
      data: {
        name: 'Halani Family',
        city: 'Mumbai',
        description: 'Halani family from Mumbai, India',
      },
    }),
    prisma.family.create({
      data: {
        name: 'Parivar Family',
        city: 'Bangalore',
        description: 'Parivar family from Bangalore, India',
      },
    }),
  ]);

  console.log(`✓ Created ${2} families`);

  // Associate Members with Families
  await Promise.all([
    // Halani Family Members
    prisma.familyMember.create({
      data: {
        familyId: haalaniFamily.id,
        memberId: members[0].id, // Rajesh
        relationshipType: 'Head',
      },
    }),
    prisma.familyMember.create({
      data: {
        familyId: haalaniFamily.id,
        memberId: members[1].id, // Priya
        relationshipType: 'Spouse',
      },
    }),
    prisma.familyMember.create({
      data: {
        familyId: haalaniFamily.id,
        memberId: members[2].id, // Arjun
        relationshipType: 'Child',
      },
    }),
    prisma.familyMember.create({
      data: {
        familyId: haalaniFamily.id,
        memberId: members[3].id, // Anjali
        relationshipType: 'Child',
      },
    }),
    // Parivar Family Members
    prisma.familyMember.create({
      data: {
        familyId: parivarFamily.id,
        memberId: members[4].id, // Vikram
        relationshipType: 'Head',
      },
    }),
    prisma.familyMember.create({
      data: {
        familyId: parivarFamily.id,
        memberId: members[5].id, // Meera
        relationshipType: 'Spouse',
      },
    }),
    prisma.familyMember.create({
      data: {
        familyId: parivarFamily.id,
        memberId: members[6].id, // Rohan
        relationshipType: 'Child',
      },
    }),
  ]);

  console.log('✓ Created family-member associations');

  // Create Relationships (genealogical)
  await Promise.all([
    // Halani relationships
    prisma.relationship.create({
      data: {
        fromMemberId: members[0].id, // Rajesh
        toMemberId: members[2].id, // Arjun (child)
        type: 'Parent',
        familyId: haalaniFamily.id,
      },
    }),
    prisma.relationship.create({
      data: {
        fromMemberId: members[2].id, // Arjun
        toMemberId: members[0].id, // Rajesh (parent)
        type: 'Child',
        familyId: haalaniFamily.id,
      },
    }),
    prisma.relationship.create({
      data: {
        fromMemberId: members[3].id, // Anjali
        toMemberId: members[7].id, // Divya (spouse)
        type: 'Spouse',
        familyId: haalaniFamily.id,
      },
    }),
    // Parivar relationships
    prisma.relationship.create({
      data: {
        fromMemberId: members[4].id, // Vikram
        toMemberId: members[6].id, // Rohan (child)
        type: 'Parent',
        familyId: parivarFamily.id,
      },
    }),
  ]);

  console.log('✓ Created relationships');

  // Create Users (Authentication)
  const hashedPassword = await bcrypt.hash('Test@123', 10);

  const [user1, user2] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'rajesh@halani.com',
        phone: '+91-9876543210',
        passwordHash: hashedPassword,
        firstName: 'Rajesh',
        lastName: 'Halani',
        memberId: members[0].id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'arjun@halani.com',
        phone: '+91-8765432109',
        passwordHash: hashedPassword,
        firstName: 'Arjun',
        lastName: 'Halani',
        memberId: members[2].id,
      },
    }),
  ]);

  console.log(`✓ Created ${2} users`);

  // Create Announcements
  await Promise.all([
    prisma.announcement.create({
      data: {
        title: 'Arjun Birthday Celebration',
        content:
          'Join us for Arjun birthday party on March 20th at our residence in Mumbai.',
        type: 'Birthday',
        familyId: haalaniFamily.id,
      },
    }),
    prisma.announcement.create({
      data: {
        title: 'Family Reunion 2026',
        content:
          'Annual family reunion scheduled for May 2026. More details coming soon.',
        type: 'General',
        familyId: haalaniFamily.id,
      },
    }),
    prisma.announcement.create({
      data: {
        title: 'Wedding Anniversary',
        content: 'Celebrating Vikram and Meera 40th wedding anniversary!',
        type: 'Wedding',
        familyId: parivarFamily.id,
      },
    }),
  ]);

  console.log('✓ Created announcements');

  console.log('\n✅ Database seeding completed successfully!');
  console.log(`\nCreated:`);
  console.log(`  - 8 Members`);
  console.log(`  - 2 Families`);
  console.log(`  - 4 Relationships`);
  console.log(`  - 2 Users`);
  console.log(`  - 3 Announcements`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
