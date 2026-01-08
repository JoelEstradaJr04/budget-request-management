// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data (optional - be careful in production)
  console.log('🧹 Cleaning existing data...');
  await prisma.budget_request_item.deleteMany({});
  await prisma.budget_request.deleteMany({});
  await prisma.budget_category.deleteMany({});
  await prisma.attachment.deleteMany({});

  // ============================================================================
  // SEED BUDGET CATEGORIES (at least 20)
  // ============================================================================
  console.log('📦 Seeding budget categories...');
  
  const categories = await prisma.budget_category.createMany({
    data: [
      { code: 'OFFICE_SUPPLIES', name: 'Office Supplies', description: 'General office supplies and stationery', is_active: true },
      { code: 'EQUIPMENT', name: 'Equipment', description: 'Office and technical equipment', is_active: true },
      { code: 'FURNITURE', name: 'Furniture', description: 'Office furniture and fixtures', is_active: true },
      { code: 'IT_HARDWARE', name: 'IT Hardware', description: 'Computers, servers, and IT infrastructure', is_active: true },
      { code: 'IT_SOFTWARE', name: 'IT Software', description: 'Software licenses and subscriptions', is_active: true },
      { code: 'MARKETING', name: 'Marketing', description: 'Marketing and advertising expenses', is_active: true },
      { code: 'TRAINING', name: 'Training', description: 'Employee training and development', is_active: true },
      { code: 'TRAVEL', name: 'Travel', description: 'Business travel and accommodation', is_active: true },
      { code: 'UTILITIES', name: 'Utilities', description: 'Electricity, water, internet, and other utilities', is_active: true },
      { code: 'MAINTENANCE', name: 'Maintenance', description: 'Building and equipment maintenance', is_active: true },
      { code: 'SECURITY', name: 'Security', description: 'Security services and equipment', is_active: true },
      { code: 'TRANSPORTATION', name: 'Transportation', description: 'Vehicle maintenance and fuel', is_active: true },
      { code: 'COMMUNICATIONS', name: 'Communications', description: 'Phone, internet, and communication services', is_active: true },
      { code: 'PROFESSIONAL_SERVICES', name: 'Professional Services', description: 'Consulting and professional fees', is_active: true },
      { code: 'INSURANCE', name: 'Insurance', description: 'Business insurance premiums', is_active: true },
      { code: 'LEGAL', name: 'Legal', description: 'Legal services and compliance', is_active: true },
      { code: 'HEALTHCARE', name: 'Healthcare', description: 'Employee healthcare and medical supplies', is_active: true },
      { code: 'FACILITIES', name: 'Facilities', description: 'Facility improvements and renovations', is_active: true },
      { code: 'EVENTS', name: 'Events', description: 'Corporate events and conferences', is_active: true },
      { code: 'RESEARCH', name: 'Research', description: 'Research and development expenses', is_active: true },
      { code: 'INVENTORY', name: 'Inventory', description: 'Inventory and stock purchases', is_active: true },
      { code: 'MISCELLANEOUS', name: 'Miscellaneous', description: 'Other uncategorized expenses', is_active: true },
    ]
  });

  console.log(`✅ Created ${categories.count} budget categories`);

  // Fetch created categories
  const categoryList = await prisma.budget_category.findMany({
    orderBy: { id: 'asc' }
  });

  // ============================================================================
  // SEED BUDGET REQUESTS (at least 20)
  // ============================================================================
  console.log('📝 Seeding budget requests...');

  const departments = ['operations', 'finance', 'hr', 'inventory', 'it', 'marketing', 'admin'];
  const departmentNames = ['Operations', 'Finance', 'Human Resources', 'Inventory', 'Information Technology', 'Marketing', 'Administration'];
  const requestTypes: ('REGULAR' | 'PROJECT_BASED' | 'URGENT' | 'EMERGENCY')[] = ['REGULAR', 'PROJECT_BASED', 'URGENT', 'EMERGENCY'];
  const statuses: ('PENDING' | 'APPROVED' | 'REJECTED' | 'ADJUSTED' | 'CLOSED')[] = ['PENDING', 'APPROVED', 'REJECTED', 'ADJUSTED', 'CLOSED'];
  const users = ['user001', 'user002', 'user003', 'user004', 'user005', 'admin001', 'admin002'];

  const budgetRequestsData = [];

  // Generate 25 budget requests with varied data
  for (let i = 1; i <= 25; i++) {
    const deptIndex = Math.floor(Math.random() * departments.length);
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const requestDate = new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    
    const budgetRequest = {
      department_id: departments[deptIndex],
      department_name: departmentNames[deptIndex],
      requested_by: users[Math.floor(Math.random() * users.length)],
      requested_for: Math.random() > 0.5 ? `Project ${i}` : null,
      request_date: requestDate,
      total_amount: 0, // Will be calculated from items
      status: status,
      purpose: generatePurpose(i),
      remarks: Math.random() > 0.3 ? `Additional notes for request ${i}` : null,
      request_type: requestTypes[Math.floor(Math.random() * requestTypes.length)],
      pr_reference_code: Math.random() > 0.6 ? `PR-2025-${String(i).padStart(4, '0')}` : null,
      approved_by: status === 'APPROVED' || status === 'ADJUSTED' ? 'admin001' : null,
      approved_at: status === 'APPROVED' || status === 'ADJUSTED' ? new Date(requestDate.getTime() + 3 * 24 * 60 * 60 * 1000) : null,
      rejected_by: status === 'REJECTED' ? 'admin001' : null,
      rejected_at: status === 'REJECTED' ? new Date(requestDate.getTime() + 2 * 24 * 60 * 60 * 1000) : null,
      rejection_reason: status === 'REJECTED' ? 'Insufficient budget allocation for this period' : null,
      created_at: requestDate,
      updated_at: new Date(),
      is_deleted: false
    };

    budgetRequestsData.push(budgetRequest);
  }

  // Create budget requests
  for (const requestData of budgetRequestsData) {
    const budgetRequest = await prisma.budget_request.create({
      data: requestData
    });

    // Create 2-5 items for each budget request
    const numItems = Math.floor(Math.random() * 4) + 2;
    let totalAmount = 0;

    for (let j = 0; j < numItems; j++) {
      const category = categoryList[Math.floor(Math.random() * categoryList.length)];
      const requestedAmount = parseFloat((Math.random() * 50000 + 5000).toFixed(2));
      const approvedAmount = requestData.status === 'APPROVED' || requestData.status === 'ADJUSTED' 
        ? parseFloat((requestedAmount * (0.8 + Math.random() * 0.2)).toFixed(2))
        : 0;

      totalAmount += requestedAmount;

      await prisma.budget_request_item.create({
        data: {
          budget_request_id: budgetRequest.id,
          category_id: category.id,
          description: `${category.name} - Item ${j + 1} for ${requestData.purpose}`,
          requested_amount: requestedAmount,
          approved_amount: approvedAmount,
          notes: Math.random() > 0.5 ? `Notes for item ${j + 1}` : null,
          pr_item_id: requestData.pr_reference_code ? Math.floor(Math.random() * 1000) : null
        }
      });
    }

    // Update budget request with calculated total_amount
    await prisma.budget_request.update({
      where: { id: budgetRequest.id },
      data: { total_amount: totalAmount }
    });
  }

  console.log(`✅ Created ${budgetRequestsData.length} budget requests with items`);

  // ============================================================================
  // SEED ATTACHMENTS (at least 20)
  // ============================================================================
  console.log('📎 Seeding attachments...');

  const allBudgetRequests = await prisma.budget_request.findMany({
    select: { id: true, request_code: true }
  });

  const fileTypes = ['pdf', 'docx', 'xlsx', 'jpg', 'png'];
  const attachmentData = [];

  for (let i = 0; i < 30; i++) {
    const randomRequest = allBudgetRequests[Math.floor(Math.random() * allBudgetRequests.length)];
    const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
    
    attachmentData.push({
      entity_type: 'BUDGET_REQUEST',
      entity_id: randomRequest.request_code,
      file_name: `attachment_${i + 1}.${fileType}`,
      file_type: fileType,
      file_url: `/uploads/budget_requests/${randomRequest.request_code}/attachment_${i + 1}.${fileType}`,
      file_size: Math.floor(Math.random() * 5000000) + 10000,
      description: `Supporting document ${i + 1} for budget request`,
      uploaded_by: users[Math.floor(Math.random() * users.length)],
      created_at: new Date(),
      updated_at: new Date(),
      is_deleted: false
    });
  }

  await prisma.attachment.createMany({ data: attachmentData });
  console.log(`✅ Created ${attachmentData.length} attachments`);

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('\n📊 Seeding Summary:');
  const categoryCount = await prisma.budget_category.count();
  const requestCount = await prisma.budget_request.count();
  const itemCount = await prisma.budget_request_item.count();
  const attachmentCount = await prisma.attachment.count();

  console.log(`  - Budget Categories: ${categoryCount}`);
  console.log(`  - Budget Requests: ${requestCount}`);
  console.log(`  - Budget Request Items: ${itemCount}`);
  console.log(`  - Attachments: ${attachmentCount}`);
  console.log('\n✨ Database seeding completed successfully!');
}

function generatePurpose(index: number): string {
  const purposes = [
    'Annual office equipment upgrade and replacement',
    'Q1 marketing campaign budget allocation',
    'IT infrastructure modernization project',
    'Employee training and development program',
    'Facility maintenance and repairs',
    'New product launch marketing budget',
    'Office furniture replacement for expansion',
    'Security system upgrade and enhancement',
    'Software license renewals and upgrades',
    'Company annual event and team building',
    'Research and development initiative',
    'Customer service improvement project',
    'Supply chain optimization program',
    'Digital transformation initiative',
    'Emergency equipment repair and replacement',
    'Compliance and regulatory requirements',
    'Business continuity planning expenses',
    'Vendor management system implementation',
    'Quality assurance program enhancement',
    'Operational efficiency improvement project',
    'Environmental sustainability initiative',
    'Workplace safety and health program',
    'Client presentation and proposal materials',
    'Professional development and certification',
    'Strategic planning and consulting services'
  ];

  return purposes[(index - 1) % purposes.length];
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
