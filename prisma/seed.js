const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Kategorien erstellen
  const uiCategory = await prisma.category.create({
    data: { name: 'User Interface' },
  });

  const performanceCategory = await prisma.category.create({
    data: { name: 'Performance' },
  });

  // Beispielbenutzer als Admin erstellen
  const hashedPassword = await hash('password123', 10);
  const adminUser = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      password: hashedPassword,
      role: 'ADMIN', // Setze die Rolle auf ADMIN
    },
  });

  // Normalen Benutzer erstellen
  const normalUser = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: hashedPassword,
      role: 'USER', // Explizit als normaler Benutzer gesetzt
    },
  });

  // Feature-Ideen erstellen
  await prisma.idea.create({
    data: {
      title: 'Dark Mode Implementation',
      description: 'Add a dark mode option to improve user experience in low-light environments.',
      authorId: adminUser.id,
      categoryId: uiCategory.id,
    },
  });

  await prisma.idea.create({
    data: {
      title: 'Optimize Image Loading',
      description: 'Implement lazy loading for images to improve initial page load times.',
      authorId: normalUser.id,
      categoryId: performanceCategory.id,
    },
  });

  console.log('Seed data created successfully');
  console.log('Admin user created:', adminUser.email);
  console.log('Normal user created:', normalUser.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });