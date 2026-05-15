import { db } from './index.js';
import { creators, programs, sessions } from './schema.js';
import bcrypt from 'bcryptjs';

const seed = async () => {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Create 2 Creators
    const pwd = await bcrypt.hash('password123', 10);
    
    const creatorData = [
      { name: 'Creator One', email: 'creator1@example.com', passwordHash: pwd },
      { name: 'Creator Two', email: 'creator2@example.com', passwordHash: pwd }
    ];

    const insertedCreators = await db.insert(creators).values(creatorData).returning();
    console.log(`✅ Created ${insertedCreators.length} creators.`);

    for (const creator of insertedCreators) {
      // 2. Create 3 Programs per Creator
      for (let p = 1; p <= 3; p++) {
        const [program] = await db.insert(programs).values({
          creatorId: creator.id,
          title: `${creator.name} - Program ${p}`,
          description: `This is a premium wellness program designed by ${creator.name}. Focus on balance and growth.`,
          thumbnailUrl: `https://picsum.photos/seed/prog${creator.id}${p}/800/600`
        }).returning();

        // 3. Create 10 Sessions per Program
        const sessionValues = [];
        for (let s = 1; s <= 10; s++) {
          sessionValues.push({
            programId: program.id,
            creatorId: creator.id,
            title: `Session ${s}: Deep Dive`,
            duration: 600 + (s * 60), // 10-20 mins
            position: s - 1,
            instructorName: creator.name,
            tags: ['wellness', 'yoga', 'mindfulness'],
            mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' // Generic mock link
          });
        }
        await db.insert(sessions).values(sessionValues);
        console.log(`   - Created Program ${p} with 10 sessions for ${creator.name}`);
      }
    }

    console.log('✨ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    process.exit(0);
  }
};

seed();
