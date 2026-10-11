const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

let directorToken;
let accountsToken;
let employee1Token;
let employee2Token;

let emp1VoucherId;
let draftVoucherId;
let pendingVoucherId;

beforeAll(async () => {
  // Login as each user to get tokens
  const dirRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'director@abc.com', password: 'Director@123' });
  directorToken = dirRes.body.data.token;

  const accRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'accounts@abc.com', password: 'Accounts@123' });
  accountsToken = accRes.body.data.token;

  const emp1Res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'employee1@abc.com', password: 'Employee@123' });
  employee1Token = emp1Res.body.data.token;

  const emp2Res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'employee2@abc.com', password: 'Employee@123' });
  employee2Token = emp2Res.body.data.token;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('1. Authentication & Me Endpoints', () => {
  test('POST /api/v1/auth/login with valid credentials succeeds', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'employee1@abc.com', password: 'Employee@123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('EMPLOYEE');
  });

  test('POST /api/v1/auth/login with invalid password fails with 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'employee1@abc.com', password: 'WrongPassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/v1/auth/me returns authenticated user details', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${employee1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('employee1@abc.com');
  });
});

describe('2. Role Access Control & Permissions', () => {
  test('ACCOUNTS cannot create a voucher (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/v1/vouchers')
      .set('Authorization', `Bearer ${accountsToken}`)
      .send({
        department: 'Finance',
        expenseTitle: 'Audit fee',
        expenseDate: '2026-03-01',
        expenseCategory: 'Other',
        amount: 5000
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('DIRECTOR cannot create a voucher (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/v1/vouchers')
      .set('Authorization', `Bearer ${directorToken}`)
      .send({
        department: 'Executive',
        expenseTitle: 'Executive Lunch',
        expenseDate: '2026-03-01',
        expenseCategory: 'Food',
        amount: 2500
      });

    expect(res.status).toBe(403);
  });

  test('EMPLOYEE cannot approve a voucher (403 Forbidden)', async () => {
    // Find any pending voucher
    const pending = await prisma.voucher.findFirst({
      where: { status: 'PENDING_APPROVAL' }
    });

    const res = await request(app)
      .post(`/api/v1/vouchers/${pending.id}/approve`)
      .set('Authorization', `Bearer ${employee1Token}`)
      .send({ directorSignaturePath: '/uploads/sample-director-signature.png' });

    expect(res.status).toBe(403);
  });

  test('EMPLOYEE cannot reject a voucher (403 Forbidden)', async () => {
    const pending = await prisma.voucher.findFirst({
      where: { status: 'PENDING_APPROVAL' }
    });

    const res = await request(app)
      .post(`/api/v1/vouchers/${pending.id}/reject`)
      .set('Authorization', `Bearer ${employee1Token}`)
      .send({ rejectionReason: 'Cannot approve this amount' });

    expect(res.status).toBe(403);
  });
});

describe('3. Employee Voucher Creation & Ownership (Prevent IDOR)', () => {
  test('EMPLOYEE can create a draft voucher with auto-generated voucherNumber', async () => {
    const res = await request(app)
      .post('/api/v1/vouchers')
      .set('Authorization', `Bearer ${employee1Token}`)
      .send({
        department: 'Engineering',
        expenseTitle: 'Cloud Server Test Instances',
        expenseDate: new Date().toISOString().split('T')[0],
        expenseCategory: 'Software',
        expenseDescription: 'EC2 instances for load testing',
        amount: 3450.75
      });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('DRAFT');
    expect(res.body.data.voucherNumber).toMatch(/^VCH-\d{4}-\d{4}$/);
    emp1VoucherId = res.body.data.id;
    draftVoucherId = res.body.data.id;
  });

  test('EMPLOYEE 2 cannot view EMPLOYEE 1 voucher (403 Forbidden - IDOR check)', async () => {
    const res = await request(app)
      .get(`/api/v1/vouchers/${emp1VoucherId}`)
      .set('Authorization', `Bearer ${employee2Token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('DIRECTOR can view EMPLOYEE 1 voucher', async () => {
    const res = await request(app)
      .get(`/api/v1/vouchers/${emp1VoucherId}`)
      .set('Authorization', `Bearer ${directorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(emp1VoucherId);
  });

  test('ACCOUNTS can view EMPLOYEE 1 voucher', async () => {
    const res = await request(app)
      .get(`/api/v1/vouchers/${emp1VoucherId}`)
      .set('Authorization', `Bearer ${accountsToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(emp1VoucherId);
  });
});

describe('4. Draft-only Edit & Delete Rules', () => {
  test('Owner can edit draft voucher', async () => {
    const res = await request(app)
      .put(`/api/v1/vouchers/${draftVoucherId}`)
      .set('Authorization', `Bearer ${employee1Token}`)
      .send({
        department: 'Engineering',
        expenseTitle: 'Cloud Server Test Instances - Updated',
        expenseDate: new Date().toISOString().split('T')[0],
        expenseCategory: 'Software',
        expenseDescription: 'Updated description for test instances',
        amount: 4200.00
      });

    expect(res.status).toBe(200);
    expect(res.body.data.amount).toBe(4200);
    expect(res.body.data.expenseTitle).toContain('Updated');
  });

  test('Future expense date is rejected during creation/update', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);

    const res = await request(app)
      .put(`/api/v1/vouchers/${draftVoucherId}`)
      .set('Authorization', `Bearer ${employee1Token}`)
      .send({
        department: 'Engineering',
        expenseTitle: 'Future Trip',
        expenseDate: futureDate.toISOString().split('T')[0],
        expenseCategory: 'Travel',
        amount: 1000
      });

    expect(res.status).toBe(422);
    expect(res.body.errors[0].message).toContain('future');
  });

  test('Owner cannot edit non-draft voucher (after submission)', async () => {
    // Find an approved voucher
    const approved = await prisma.voucher.findFirst({
      where: { status: 'APPROVED' }
    });

    const res = await request(app)
      .put(`/api/v1/vouchers/${approved.id}`)
      .set('Authorization', `Bearer ${employee1Token}`)
      .send({
        department: 'Engineering',
        expenseTitle: 'Tampering attempt',
        expenseDate: new Date().toISOString().split('T')[0],
        expenseCategory: 'Travel',
        amount: 99999
      });

    expect([400, 403]).toContain(res.status);
  });
});

describe('5. Submission, Approval & Rejection Workflow State Machine', () => {
  let voucherWithoutSigId;

  test('Submit without employee signature fails (400)', async () => {
    // Temporarily create user without signature
    const newEmp = await prisma.user.create({
      data: {
        name: 'Test NoSig',
        email: 'nosig@abc.com',
        passwordHash: 'dummy',
        role: 'EMPLOYEE',
        department: 'Test',
        signaturePath: null
      }
    });

    // Create a voucher without signature
    const created = await prisma.voucher.create({
      data: {
        voucherNumber: 'VCH-2026-9999',
        expenseDate: new Date(),
        department: 'Test',
        expenseTitle: 'No Sig Test',
        expenseCategory: 'Travel',
        expenseDescription: 'Test',
        amount: 500,
        employeeId: newEmp.id,
        employeeName: newEmp.name,
        employeeSignaturePath: null,
        status: 'DRAFT'
      }
    });
    voucherWithoutSigId = created.id;

    // Login or sign token for newEmp
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: newEmp.id, email: newEmp.email, role: 'EMPLOYEE' },
      process.env.JWT_SECRET || 'prachay_jwt_secret_super_secure_key_2026'
    );

    const res = await request(app)
      .post(`/api/v1/vouchers/${voucherWithoutSigId}/submit`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Employee signature is mandatory');
  });

  test('Submit with signature transitions voucher to PENDING_APPROVAL with audit trail', async () => {
    const res = await request(app)
      .post(`/api/v1/vouchers/${draftVoucherId}/submit`)
      .set('Authorization', `Bearer ${employee1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('PENDING_APPROVAL');
    pendingVoucherId = draftVoucherId;

    // Check status history records
    const history = await prisma.voucherStatusHistory.findMany({
      where: { voucherId: draftVoucherId },
      orderBy: { createdAt: 'asc' }
    });

    const transitions = history.map((h) => `${h.fromStatus}->${h.toStatus}`);
    expect(transitions).toContain('DRAFT->SUBMITTED');
    expect(transitions).toContain('SUBMITTED->PENDING_APPROVAL');
  });

  test('Approve without director signature fails (400)', async () => {
    const res = await request(app)
      .post(`/api/v1/vouchers/${pendingVoucherId}/approve`)
      .set('Authorization', `Bearer ${directorToken}`)
      .send({}); // no signature

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Director signature');
  });

  test('Reject without reason fails (422 / 400)', async () => {
    const res = await request(app)
      .post(`/api/v1/vouchers/${pendingVoucherId}/reject`)
      .set('Authorization', `Bearer ${directorToken}`)
      .send({ rejectionReason: 'abc' }); // less than 5 characters

    expect(res.status).toBe(422);
    expect(res.body.errors[0].message).toContain('at least 5 characters');
  });

  test('Reject with valid reason transitions voucher to REJECTED', async () => {
    const res = await request(app)
      .post(`/api/v1/vouchers/${pendingVoucherId}/reject`)
      .set('Authorization', `Bearer ${directorToken}`)
      .send({ rejectionReason: 'Original tax invoice copy is required for reimbursement' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('REJECTED');
    expect(res.body.data.rejectionReason).toBe(
      'Original tax invoice copy is required for reimbursement'
    );
  });

  test('Employee can see rejection reason on rejected voucher', async () => {
    const res = await request(app)
      .get(`/api/v1/vouchers/${pendingVoucherId}`)
      .set('Authorization', `Bearer ${employee1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('REJECTED');
    expect(res.body.data.rejectionReason).toContain('Original tax invoice');
  });

  test('Approve voucher with director signature transitions to APPROVED', async () => {
    // Create and submit a second voucher to approve
    const createRes = await request(app)
      .post('/api/v1/vouchers')
      .set('Authorization', `Bearer ${employee1Token}`)
      .send({
        department: 'Engineering',
        expenseTitle: 'Team Lunch Post Release',
        expenseDate: new Date().toISOString().split('T')[0],
        expenseCategory: 'Food',
        amount: 2800.00
      });

    const vId = createRes.body.data.id;

    // Submit it
    await request(app)
      .post(`/api/v1/vouchers/${vId}/submit`)
      .set('Authorization', `Bearer ${employee1Token}`);

    // Approve as Director
    const approveRes = await request(app)
      .post(`/api/v1/vouchers/${vId}/approve`)
      .set('Authorization', `Bearer ${directorToken}`)
      .send({ directorSignaturePath: '/uploads/sample-director-signature.png' });

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.data.status).toBe('APPROVED');
    expect(approveRes.body.data.approvalDate).toBeDefined();
    expect(approveRes.body.data.directorSignaturePath).toBe('/uploads/sample-director-signature.png');
  });
});

describe('6. Dashboard Stats by Role', () => {
  test('Employee dashboard stats returns personal metrics only', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/stats')
      .set('Authorization', `Bearer ${employee1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.role).toBe('EMPLOYEE');
    expect(res.body.data.stats.totalVouchers).toBeGreaterThan(0);
    expect(res.body.data.stats.totalAmountClaimed).toBeGreaterThan(0);
  });

  test('Director dashboard stats returns pending count and org totals', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/stats')
      .set('Authorization', `Bearer ${directorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.role).toBe('DIRECTOR');
    expect(res.body.data.stats.pendingApprovalCount).toBeDefined();
  });

  test('Accounts dashboard stats returns approved amounts and vouchers', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/stats')
      .set('Authorization', `Bearer ${accountsToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.role).toBe('ACCOUNTS');
    expect(res.body.data.stats.totalApprovedAmount).toBeGreaterThan(0);
  });
});
