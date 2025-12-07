import { DecisionCategory, FocusStatus } from '@/lib/generated/prisma';
import { PrismaClient } from '@/lib/generated/prisma';
import { randomInt, randomUUID } from 'crypto';

const prisma = new PrismaClient();

const FOCUS_TITLES = [
  'Morning workout routine',
  'Deep work session',
  'Team meeting preparation',
  'Code review',
  'Documentation update',
  'Client call',
  'Project planning',
  'Learning new technology'
];

const DECISION_TITLES = [
  'Adopt new framework',
  'Hire new team member',
  'Change project direction',
  'Invest in new tooling',
  'Update development workflow',
  'Refactor legacy code',
  'Implement new feature',
  'Prioritize tasks'
];

async function generateDummyData(userId: string, daysBack = 45) {
  const now = new Date();
  const categories = Object.values(DecisionCategory);
  const moods = ['😊', '😐', '😔', '😃', '😌', '😕', '😫', '😤', '😎', '🤔'];

  // Generate focus entries
  for (let i = 0; i < daysBack; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Skip weekends (optional)
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const entriesPerDay = randomInt(1, 5);
    
    for (let j = 0; j < entriesPerDay; j++) {
      const status = Math.random() > 0.3 ? FocusStatus.ACHIEVED : 
                    Math.random() > 0.5 ? FocusStatus.PARTIALLY_ACHIEVED : 
                    FocusStatus.NOT_ACHIEVED;
      
      await prisma.focus.create({
        data: {
          title: FOCUS_TITLES[Math.floor(Math.random() * FOCUS_TITLES.length)],
          status,
          mood: moods[Math.floor(Math.random() * moods.length)],
          notes: `Dummy focus entry for testing. Status: ${status}`,
          date,
          userId
        }
      });
    }

    // Add decisions (less frequent)
    if (i % 3 === 0) {
      await prisma.decision.create({
        data: {
          title: DECISION_TITLES[Math.floor(Math.random() * DECISION_TITLES.length)],
          reason: 'Dummy decision for testing purposes',
          category: categories[Math.floor(Math.random() * categories.length)] as DecisionCategory,
          date,
          userId
        }
      });
    }
  }
}

// Get user ID from command line or use a default one
const userId = process.argv[2] || 'YOUR_USER_ID_HERE';

if (!userId) {
  console.error('Please provide a user ID as the first argument');
  process.exit(1);
}

generateDummyData(userId)
  .then(() => {
    console.log('Successfully generated dummy data!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error generating dummy data:', error);
    process.exit(1);
  });