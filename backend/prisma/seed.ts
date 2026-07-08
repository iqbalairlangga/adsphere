import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('password123', 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@adsphere.io' },
    update: {},
    create: {
      email: 'superadmin@adsphere.io',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@adsphere.io' },
    update: {},
    create: {
      email: 'admin@adsphere.io',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  const advertiser = await prisma.user.upsert({
    where: { email: 'advertiser@adsphere.io' },
    update: {},
    create: {
      email: 'advertiser@adsphere.io',
      password: hashedPassword,
      name: 'Advertiser Demo',
      role: 'ADVERTISER',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  const publisher = await prisma.user.upsert({
    where: { email: 'publisher@adsphere.io' },
    update: {},
    create: {
      email: 'publisher@adsphere.io',
      password: hashedPassword,
      name: 'Publisher Demo',
      role: 'PUBLISHER',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  const wallets = [
    { userId: superAdmin.id, balance: 50000 },
    { userId: admin.id, balance: 25000 },
    { userId: advertiser.id, balance: 10000 },
    { userId: publisher.id, balance: 5000 },
  ];

  for (const w of wallets) {
    await prisma.wallet.upsert({
      where: { userId: w.userId },
      create: w,
      update: { balance: w.balance },
    });
  }

  const campaign = await prisma.campaign.create({
    data: {
      userId: advertiser.id,
      name: 'Summer Sale 2026',
      description: 'Summer sale campaign for new product line',
      status: 'ACTIVE',
      type: 'DISPLAY',
      budget: 5000,
      dailyBudget: 200,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 86400000),
      targeting: {
        countries: ['US', 'UK', 'CA'],
        devices: ['desktop', 'mobile'],
        platforms: ['windows', 'macos', 'ios', 'android'],
      },
    },
  });

  const ad = await prisma.advertisement.create({
    data: {
      campaignId: campaign.id,
      name: 'Summer Banner 728x90',
      type: 'BANNER',
      title: 'Summer Sale - 50% Off!',
      description: 'Limited time summer sale banner',
      mediaUrl: 'https://placehold.co/728x90/3b82f6/ffffff?text=Summer+Sale',
      targetUrl: 'https://adsphere.io/summer-sale',
      dimensions: '728x90',
      width: 728,
      height: 90,
      status: 'ACTIVE',
    },
  });

  const website = await prisma.publisherWebsite.create({
    data: {
      userId: publisher.id,
      domain: 'example-blog.com',
      name: 'Example Tech Blog',
      description: 'A blog about technology and programming',
      category: 'technology',
      verified: true,
    },
  });

  const adUnit = await prisma.adUnit.create({
    data: {
      websiteId: website.id,
      name: 'Leaderboard',
      type: 'BANNER',
      width: 728,
      height: 90,
      adSize: '728x90',
      placement: 'header',
      status: 'active',
    },
  });

  await prisma.adPlacement.create({
    data: {
      adUnitId: adUnit.id,
      advertisementId: ad.id,
      status: 'active',
    },
  });

  const permissions = [
    { name: 'user:read', resource: 'users', action: 'read', description: 'View users' },
    { name: 'user:write', resource: 'users', action: 'write', description: 'Create/Edit users' },
    { name: 'user:delete', resource: 'users', action: 'delete', description: 'Delete users' },
    { name: 'campaign:read', resource: 'campaigns', action: 'read', description: 'View campaigns' },
    { name: 'campaign:write', resource: 'campaigns', action: 'write', description: 'Create/Edit campaigns' },
    { name: 'campaign:delete', resource: 'campaigns', action: 'delete', description: 'Delete campaigns' },
    { name: 'payment:read', resource: 'payments', action: 'read', description: 'View payments' },
    { name: 'payment:write', resource: 'payments', action: 'write', description: 'Process payments' },
    { name: 'analytics:read', resource: 'analytics', action: 'read', description: 'View analytics' },
    { name: 'settings:read', resource: 'settings', action: 'read', description: 'View settings' },
    { name: 'settings:write', resource: 'settings', action: 'write', description: 'Modify settings' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      create: perm,
      update: {},
    });
  }

  const settings = [
    { key: 'platform_name', value: 'AdSphere', group: 'general', type: 'string' },
    { key: 'platform_url', value: 'https://adsphere.io', group: 'general', type: 'string' },
    { key: 'support_email', value: 'support@adsphere.io', group: 'general', type: 'string' },
    { key: 'default_currency', value: 'USD', group: 'billing', type: 'string' },
    { key: 'commission_rate', value: 0.15, group: 'billing', type: 'number' },
    { key: 'min_withdrawal', value: 50, group: 'billing', type: 'number' },
    { key: 'max_daily_budget', value: 10000, group: 'campaign', type: 'number' },
    { key: 'fraud_detection_enabled', value: true, group: 'security', type: 'boolean' },
    { key: 'maintenance_mode', value: false, group: 'system', type: 'boolean' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      create: setting,
      update: { value: setting.value },
    });
  }

  console.log('Seed completed successfully!');
  console.log('---');
  console.log('Login Credentials:');
  console.log('  superadmin@adsphere.io / password123 (Super Admin)');
  console.log('  admin@adsphere.io / password123 (Admin)');
  console.log('  advertiser@adsphere.io / password123 (Advertiser)');
  console.log('  publisher@adsphere.io / password123 (Publisher)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
