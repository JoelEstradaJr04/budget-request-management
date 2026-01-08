// scripts/test-aggregation.mjs
// Quick test script to verify aggregation calculations

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAggregation() {
  console.log('🧪 Testing Budget Request Aggregation...\n');

  try {
    // Get first 5 budget requests with items
    const requests = await prisma.budget_request.findMany({
      take: 5,
      include: {
        items: true
      },
      orderBy: {
        id: 'asc'
      }
    });

    console.log(`Found ${requests.length} budget requests to test\n`);

    for (const request of requests) {
      console.log(`\n📋 Budget Request ID: ${request.id}`);
      console.log(`   Request Code: ${request.request_code}`);
      console.log(`   Status: ${request.status}`);
      console.log(`   Items Count: ${request.items.length}`);

      // Calculate aggregated amounts
      const aggregatedRequested = request.items.reduce((sum, item) => {
        return sum + Number(item.requested_amount);
      }, 0);

      const aggregatedApproved = request.items.reduce((sum, item) => {
        return sum + Number(item.approved_amount || 0);
      }, 0);

      console.log(`\n   💰 Aggregated Amounts:`);
      console.log(`      Requested: ₱${aggregatedRequested.toFixed(2)}`);
      console.log(`      Approved:  ₱${aggregatedApproved.toFixed(2)}`);

      console.log(`\n   📊 Item Breakdown:`);
      request.items.forEach((item, index) => {
        console.log(`      Item ${index + 1}:`);
        console.log(`         Requested: ₱${Number(item.requested_amount).toFixed(2)}`);
        console.log(`         Approved:  ₱${Number(item.approved_amount).toFixed(2)}`);
      });

      // Verify against stored total_amount
      console.log(`\n   ✓ Stored total_amount: ₱${Number(request.total_amount).toFixed(2)}`);
      const difference = Math.abs(Number(request.total_amount) - aggregatedRequested);
      if (difference < 0.01) {
        console.log(`   ✅ PASS: Aggregation matches stored amount`);
      } else {
        console.log(`   ⚠️  WARNING: Difference of ₱${difference.toFixed(2)}`);
      }

      console.log('   ' + '─'.repeat(60));
    }

    console.log('\n\n📊 Summary Statistics:');
    const totalRequests = await prisma.budget_request.count();
    const totalItems = await prisma.budget_request_item.count();
    const approvedRequests = await prisma.budget_request.count({
      where: { status: 'APPROVED' }
    });

    console.log(`   Total Requests: ${totalRequests}`);
    console.log(`   Total Items: ${totalItems}`);
    console.log(`   Approved Requests: ${approvedRequests}`);
    console.log(`   Avg Items per Request: ${(totalItems / totalRequests).toFixed(2)}`);

    console.log('\n✨ Aggregation test completed successfully!');

  } catch (error) {
    console.error('❌ Error during aggregation test:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testAggregation();
