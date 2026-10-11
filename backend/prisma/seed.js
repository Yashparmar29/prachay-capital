const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Ensure sample signatures exist in uploads folder
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Base64 minimal PNG for realistic signature preview
  const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAFAAAAAyCAYAAAD6zkEEAAAAeUlEQVR42u3PMQ0AMAgEQcqH/TuuBCv42AQ0d2b2Oq8DPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uvH7lB5e/hS3vD93qAAAAAElFTkSuQmCC';
  const sigBuffer = Buffer.from(base64Png, 'base64');
  fs.writeFileSync(path.join(uploadsDir, 'sample-director-signature.png'), sigBuffer);
  fs.writeFileSync(path.join(uploadsDir, 'sample-employee-signature.png'), sigBuffer);

  // 2. Clear existing records for a fresh clean seed
  await prisma.voucherStatusHistory.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.voucherCounter.deleteMany();
  await prisma.user.deleteMany();

  // 3. Create Users
  const directorPassword = await bcrypt.hash('Director@123', 10);
  const accountsPassword = await bcrypt.hash('Accounts@123', 10);
  const employeePassword = await bcrypt.hash('Employee@123', 10);

  const director = await prisma.user.create({
    data: {
      name: 'Rajesh Sharma',
      email: 'director@abc.com',
      passwordHash: directorPassword,
      role: 'DIRECTOR',
      employeeCode: 'DIR-001',
      department: 'Executive Management',
      signaturePath: '/uploads/sample-director-signature.png'
    }
  });

  const accounts = await prisma.user.create({
    data: {
      name: 'Pooja Mehta',
      email: 'accounts@abc.com',
      passwordHash: accountsPassword,
      role: 'ACCOUNTS',
      employeeCode: 'ACC-001',
      department: 'Finance & Accounts',
      signaturePath: null
    }
  });

  const emp1 = await prisma.user.create({
    data: {
      name: 'Aarav Gupta',
      email: 'employee1@abc.com',
      passwordHash: employeePassword,
      role: 'EMPLOYEE',
      employeeCode: 'EMP-101',
      department: 'Engineering',
      signaturePath: '/uploads/sample-employee-signature.png'
    }
  });

  const emp2 = await prisma.user.create({
    data: {
      name: 'Sneha Patel',
      email: 'employee2@abc.com',
      passwordHash: employeePassword,
      role: 'EMPLOYEE',
      employeeCode: 'EMP-102',
      department: 'Marketing',
      signaturePath: '/uploads/sample-employee-signature.png'
    }
  });

  const emp3 = await prisma.user.create({
    data: {
      name: 'Vikram Malhotra',
      email: 'employee3@abc.com',
      passwordHash: employeePassword,
      role: 'EMPLOYEE',
      employeeCode: 'EMP-103',
      department: 'Human Resources',
      signaturePath: '/uploads/sample-employee-signature.png'
    }
  });

  console.log('✅ Users created: Director, Accounts, 3 Employees');

  // 4. Sample Voucher definitions (20 realistic vouchers across all statuses)
  const voucherSpecs = [
    // Drafts (4)
    {
      num: 1,
      emp: emp1,
      title: 'Cloud AWS Architecture Certification',
      cat: 'Training',
      desc: 'Registration fee for AWS Certified Solutions Architect Associate examination.',
      amount: 12500.00,
      daysAgo: 2,
      status: 'DRAFT',
      withSig: true
    },
    {
      num: 2,
      emp: emp1,
      title: 'Ergonomic Mechanical Keyboard',
      cat: 'Office Supplies',
      desc: 'Ergonomic mechanical split keyboard for development workstation.',
      amount: 4899.50,
      daysAgo: 3,
      status: 'DRAFT',
      withSig: false
    },
    {
      num: 3,
      emp: emp2,
      title: 'Digital Marketing Campaign Banners',
      cat: 'Other',
      desc: 'Freelance graphic design charges for Q4 product launch banners.',
      amount: 8200.00,
      daysAgo: 1,
      status: 'DRAFT',
      withSig: true
    },
    {
      num: 4,
      emp: emp3,
      title: 'Team Offsite Refreshments & Snacks',
      cat: 'Food',
      desc: 'Snacks and beverages for all-hands quarterly HR townhall meeting.',
      amount: 3450.00,
      daysAgo: 4,
      status: 'DRAFT',
      withSig: true
    },

    // Pending Approval (5)
    {
      num: 5,
      emp: emp1,
      title: 'Client Onsite Visit - Mumbai Express Cab',
      cat: 'Travel',
      desc: 'Uber cab travel to and from client headquarters in Bandra Kurla Complex.',
      amount: 1450.00,
      daysAgo: 5,
      status: 'PENDING_APPROVAL',
      withSig: true
    },
    {
      num: 6,
      emp: emp1,
      title: 'JetBrains All Products Annual Subscription',
      cat: 'Software',
      desc: 'Annual license renewal for developer IDE tooling suite.',
      amount: 22400.00,
      daysAgo: 6,
      status: 'PENDING_APPROVAL',
      withSig: true
    },
    {
      num: 7,
      emp: emp2,
      title: 'Client Dinner at Taj Gateway',
      cat: 'Food',
      desc: 'Strategic client engagement dinner with enterprise prospect team.',
      amount: 7850.00,
      daysAgo: 7,
      status: 'PENDING_APPROVAL',
      withSig: true
    },
    {
      num: 8,
      emp: emp2,
      title: 'Conference Passes for TechSparks 2026',
      cat: 'Training',
      desc: 'Delegate registration passes for national tech marketing summit.',
      amount: 15000.00,
      daysAgo: 8,
      status: 'PENDING_APPROVAL',
      withSig: true
    },
    {
      num: 9,
      emp: emp3,
      title: 'Campus Recruitment Drive Printing Materials',
      cat: 'Office Supplies',
      desc: 'Printing brochures, candidate forms, and banners for campus hiring at IIT.',
      amount: 6720.00,
      daysAgo: 3,
      status: 'PENDING_APPROVAL',
      withSig: true
    },

    // Approved (8)
    {
      num: 10,
      emp: emp1,
      title: 'Flight Tickets Bangalore to Delhi Client Meeting',
      cat: 'Travel',
      desc: 'Air India round-trip economy flight for technical architecture presentation.',
      amount: 18450.00,
      daysAgo: 14,
      status: 'APPROVED',
      withSig: true,
      approvalDaysAgo: 10
    },
    {
      num: 11,
      emp: emp1,
      title: 'Radisson Blu Delhi Hotel Stay (2 Nights)',
      cat: 'Accommodation',
      desc: 'Hotel room accommodation during Delhi technical workshop.',
      amount: 14200.00,
      daysAgo: 12,
      status: 'APPROVED',
      withSig: true,
      approvalDaysAgo: 9
    },
    {
      num: 12,
      emp: emp1,
      title: 'Docker Desktop Business License',
      cat: 'Software',
      desc: 'Annual container development virtualization license.',
      amount: 9800.00,
      daysAgo: 20,
      status: 'APPROVED',
      withSig: true,
      approvalDaysAgo: 15
    },
    {
      num: 13,
      emp: emp2,
      title: 'Google Ads Quarterly Promotional Credits',
      cat: 'Software',
      desc: 'Paid search campaign targeting corporate wealth management clients.',
      amount: 35000.00,
      daysAgo: 25,
      status: 'APPROVED',
      withSig: true,
      approvalDaysAgo: 18
    },
    {
      num: 14,
      emp: emp2,
      title: 'Prachay Capital Corporate Gift Hampers',
      cat: 'Other',
      desc: 'Festive gift hampers sent to premium institutional clients.',
      amount: 16500.00,
      daysAgo: 18,
      status: 'APPROVED',
      withSig: true,
      approvalDaysAgo: 12
    },
    {
      num: 15,
      emp: emp2,
      title: 'Local Travel & Fuel Allowance',
      cat: 'Travel',
      desc: 'Reimbursement for client site visits across the city.',
      amount: 3200.00,
      daysAgo: 9,
      status: 'APPROVED',
      withSig: true,
      approvalDaysAgo: 5
    },
    {
      num: 16,
      emp: emp3,
      title: 'Employee Annual Health Checkup Camps',
      cat: 'Other',
      desc: 'Diagnostic wellness package arranged for company staff.',
      amount: 28000.00,
      daysAgo: 30,
      status: 'APPROVED',
      withSig: true,
      approvalDaysAgo: 22
    },
    {
      num: 17,
      emp: emp3,
      title: 'LinkedIn Recruiter Corporate Seat',
      cat: 'Software',
      desc: 'Monthly recruiter talent seat for hiring senior leadership.',
      amount: 11200.00,
      daysAgo: 11,
      status: 'APPROVED',
      withSig: true,
      approvalDaysAgo: 7
    },

    // Rejected (3)
    {
      num: 18,
      emp: emp1,
      title: 'High-End Noise Cancelling Headphones',
      cat: 'Office Supplies',
      desc: 'Premium noise-cancelling headphones claimed under workstation accessories.',
      amount: 29990.00,
      daysAgo: 15,
      status: 'REJECTED',
      withSig: true,
      rejectionReason: 'Exceeds the standard company equipment budget allowance for peripheral audio gear. Please request a standard company headset through IT operations.'
    },
    {
      num: 19,
      emp: emp2,
      title: 'Personal Cab Fare Weekend Trips',
      cat: 'Travel',
      desc: 'Weekend commute travel receipts claimed without event agenda.',
      amount: 2450.00,
      daysAgo: 10,
      status: 'REJECTED',
      withSig: true,
      rejectionReason: 'Expense dates fall on Saturday and Sunday with no pre-approved client meeting log attached. Please attach client confirmation email.'
    },
    {
      num: 20,
      emp: emp3,
      title: 'Premium Espresso Coffee Machine',
      cat: 'Office Supplies',
      desc: 'Espresso coffee machine for 3rd floor pantry.',
      amount: 45000.00,
      daysAgo: 8,
      status: 'REJECTED',
      withSig: true,
      rejectionReason: 'Capital pantry appliances must be procured centrally through Administration Services PO, not via individual employee expense voucher.'
    }
  ];

  const currentYear = new Date().getFullYear();

  for (const spec of voucherSpecs) {
    const voucherNumber = `VCH-${currentYear}-${String(spec.num).padStart(4, '0')}`;
    const expDate = new Date();
    expDate.setDate(expDate.getDate() - spec.daysAgo);

    const voucher = await prisma.voucher.create({
      data: {
        voucherNumber,
        voucherDate: expDate,
        expenseDate: expDate,
        department: spec.emp.department,
        expenseTitle: spec.title,
        expenseCategory: spec.cat,
        expenseDescription: spec.desc,
        amount: spec.amount,
        employeeId: spec.emp.id,
        employeeName: spec.emp.name,
        employeeCode: spec.emp.employeeCode,
        employeeSignaturePath: spec.withSig ? '/uploads/sample-employee-signature.png' : null,
        status: spec.status,
        directorId: spec.status === 'APPROVED' || spec.status === 'REJECTED' ? director.id : null,
        directorSignaturePath: spec.status === 'APPROVED' ? '/uploads/sample-director-signature.png' : null,
        approvalDate: spec.status === 'APPROVED'
          ? new Date(Date.now() - (spec.approvalDaysAgo || 1) * 86400000)
          : null,
        rejectionReason: spec.rejectionReason || null
      }
    });

    // Create status histories
    // 1. Initial draft history
    await prisma.voucherStatusHistory.create({
      data: {
        voucherId: voucher.id,
        fromStatus: 'NONE',
        toStatus: 'DRAFT',
        changedBy: spec.emp.id,
        remarks: 'Voucher created as Draft',
        createdAt: new Date(expDate.getTime() - 3600000)
      }
    });

    if (spec.status !== 'DRAFT') {
      // 2. Submit transition
      await prisma.voucherStatusHistory.create({
        data: {
          voucherId: voucher.id,
          fromStatus: 'DRAFT',
          toStatus: 'SUBMITTED',
          changedBy: spec.emp.id,
          remarks: 'Voucher submitted by employee',
          createdAt: new Date(expDate.getTime() - 1800000)
        }
      });

      // 3. Pending approval transition
      await prisma.voucherStatusHistory.create({
        data: {
          voucherId: voucher.id,
          fromStatus: 'SUBMITTED',
          toStatus: 'PENDING_APPROVAL',
          changedBy: spec.emp.id,
          remarks: 'Moved to Director review queue',
          createdAt: expDate
        }
      });
    }

    if (spec.status === 'APPROVED') {
      await prisma.voucherStatusHistory.create({
        data: {
          voucherId: voucher.id,
          fromStatus: 'PENDING_APPROVAL',
          toStatus: 'APPROVED',
          changedBy: director.id,
          remarks: 'Approved by Director',
          createdAt: voucher.approvalDate || new Date()
        }
      });
    } else if (spec.status === 'REJECTED') {
      await prisma.voucherStatusHistory.create({
        data: {
          voucherId: voucher.id,
          fromStatus: 'PENDING_APPROVAL',
          toStatus: 'REJECTED',
          changedBy: director.id,
          remarks: `Rejected by Director: ${spec.rejectionReason}`,
          createdAt: new Date(expDate.getTime() + 86400000)
        }
      });
    }
  }

  // Set the sequence counter to 20 so next voucher is VCH-2026-0021
  await prisma.voucherCounter.upsert({
    where: { year: currentYear },
    update: { lastCount: voucherSpecs.length },
    create: { year: currentYear, lastCount: voucherSpecs.length }
  });

  console.log(`✅ 20 Sample vouchers seeded successfully with realistic history and counters!`);
  console.log('🎉 Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
