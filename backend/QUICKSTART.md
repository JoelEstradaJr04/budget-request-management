# Quick Start Guide - Budget Request Database Seeding & API

## 🚀 Quick Commands

### Database Setup
```bash
# Navigate to backend
cd c:\capstone\budget\backend

# Seed database with test data (25 requests, 96 items, 30 attachments)
npm run prisma:seed

# View database in Prisma Studio
npm run prisma:studio

# Test aggregation calculations
npm run test:aggregation
```

### Start Servers
```bash
# Backend (Terminal 1)
cd c:\capstone\budget\backend
npm run dev

# Frontend (Terminal 2)
cd c:\capstone\budget\frontend
npm run dev
```

---

## 📊 What Was Implemented

### ✅ Database Seeder
- **22 budget categories** (Office Supplies, IT, Marketing, etc.)
- **25 budget requests** with varied statuses and types
- **96 budget request items** (2-5 items per request)
- **30 attachments** linked to requests

### ✅ Backend List Endpoint
- Returns budget requests with **aggregated amounts** from items
- Fields returned:
  - `aggregated_requested_amount` - SUM of all item requested amounts
  - `aggregated_approved_amount` - SUM of all item approved amounts
- Supports filtering, pagination, sorting
- Follows **strict snake_case** naming

### ✅ Frontend Integration
- Table displays aggregated amounts from backend
- Columns: Department, Date, Type, Requested Amount, Approved Amount, Status
- Connected to backend API
- Filters and search working

---

## 🧪 Test Results

```
✅ All aggregation tests passed
✅ 25 budget requests seeded
✅ 96 items with correct amounts
✅ Backend API returning correct data
✅ Frontend displaying aggregated amounts
```

---

## 📋 API Endpoint

### GET `/api/budget-requests`

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `status` - Filter by status (PENDING, APPROVED, REJECTED, ADJUSTED, CLOSED)
- `department` - Filter by department_id
- `dateFrom` / `dateTo` - Date range filter
- `search` - Search in purpose, remarks, request_code

**Response Fields (snake_case):**
```typescript
{
  id: number
  request_code: string
  department_id: string
  department_name: string
  request_date: string
  total_amount: number
  aggregated_requested_amount: number  // ← SUM from items
  aggregated_approved_amount: number   // ← SUM from items
  status: string
  request_type: string
  items: Array<{
    requested_amount: number
    approved_amount: number
  }>
}
```

---

## 🎯 Key Features

1. **Accurate Aggregation** - Amounts calculated from items, not stored total
2. **Snake_case Compliance** - All backend fields follow schema naming
3. **Realistic Data** - 25+ requests with varied statuses and amounts
4. **Full Integration** - Database → Backend → Frontend working end-to-end

---

## 📁 Files Modified

**Backend:**
- `prisma/seed.ts` - Database seeder
- `scripts/test-aggregation.mjs` - Aggregation test script
- `src/services/budgetRequest.service.ts` - Added aggregation logic
- `src/types/budgetRequest.types.ts` - Added aggregated fields
- `package.json` - Added seed and test scripts

**Frontend:**
- `app/services/budgetRequest.service.ts` - Updated interface
- `app/(pages)/budget-management/budgetRequest/page.tsx` - Updated table display

---

## 🔍 Verification Steps

1. **Check Seeded Data:**
   ```bash
   npm run prisma:studio
   ```
   - Browse to `budget_request` table
   - Verify 25 records exist
   - Check `budget_request_item` has 96 records

2. **Test Aggregation:**
   ```bash
   npm run test:aggregation
   ```
   - Should show ✅ PASS for all requests
   - Aggregated amounts should match stored totals

3. **Test API:**
   ```bash
   # Start backend
   npm run dev
   
   # In another terminal or Postman:
   curl http://localhost:3000/api/budget-requests
   ```

4. **Test Frontend:**
   - Navigate to: `http://localhost:3001/budget-management/budgetRequest`
   - Verify data loads
   - Check amounts display correctly
   - Test filters and sorting

---

## 💡 Pro Tips

- **Reseed Database:** Run `npm run prisma:seed` again to reset data
- **Check Calculations:** Use `npm run test:aggregation` to verify amounts
- **View Schema:** Use `npx prisma studio` for visual database inspection
- **API Testing:** Use Postman or Thunder Client for endpoint testing

---

## ⚠️ Important Notes

- All backend fields use **snake_case** (matches schema.prisma)
- Frontend can use UI-friendly names but API uses snake_case
- Aggregated amounts calculated dynamically from items
- Seeder cleans existing data before seeding (be careful in production!)

---

## 📖 Full Documentation

See `IMPLEMENTATION_GUIDE.md` for complete technical documentation.

---

**Status:** ✅ Fully Implemented & Tested
**Last Updated:** January 8, 2026
