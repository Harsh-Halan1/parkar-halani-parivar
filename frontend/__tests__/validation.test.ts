import { z } from 'zod';

// Test Zod schemas for form validation
describe('Form Validation Schemas', () => {
  // Family schema
  const familySchema = z.object({
    name: z.object({
      en: z.string().trim().min(1, 'English name is required'),
      gu: z.string().trim().optional(),
      hi: z.string().trim().optional(),
    }),
  });

  test('should validate valid family data', () => {
    const validData = {
      name: { en: 'Halani Family', gu: '', hi: '' },
    };
    expect(() => familySchema.parse(validData)).not.toThrow();
  });

  test('should reject family with empty English name', () => {
    const invalidData = {
      name: { en: '', gu: 'હાલાણી', hi: '' },
    };
    expect(() => familySchema.parse(invalidData)).toThrow();
  });

  // Person schema
  const translatedRequired = z.object({
    en: z.string().trim().min(1, 'English name is required'),
    gu: z.string().trim().optional(),
    hi: z.string().trim().optional(),
  });

  const personSchema = z.object({
    firstName: translatedRequired,
    lastName: z.object({
      en: z.string().trim().min(1, 'Last name is required'),
      gu: z.string().trim().optional(),
      hi: z.string().trim().optional(),
    }),
    email: z.string().trim().email('Invalid email').optional().or(z.literal('')),
    familyId: z.string().trim().min(1, 'Family is required'),
  });

  test('should validate valid person data', () => {
    const validData = {
      firstName: { en: 'Raj', gu: '', hi: '' },
      lastName: { en: 'Halani', gu: '', hi: '' },
      email: 'raj@example.com',
      familyId: '123',
    };
    expect(() => personSchema.parse(validData)).not.toThrow();
  });

  test('should reject person with invalid email', () => {
    const invalidData = {
      firstName: { en: 'Raj', gu: '', hi: '' },
      lastName: { en: 'Halani', gu: '', hi: '' },
      email: 'not-an-email',
      familyId: '123',
    };
    expect(() => personSchema.parse(invalidData)).toThrow();
  });

  test('should accept person without email', () => {
    const validData = {
      firstName: { en: 'Raj', gu: '', hi: '' },
      lastName: { en: 'Halani', gu: '', hi: '' },
      email: '',
      familyId: '123',
    };
    expect(() => personSchema.parse(validData)).not.toThrow();
  });

  test('should reject person with missing family', () => {
    const invalidData = {
      firstName: { en: 'Raj', gu: '', hi: '' },
      lastName: { en: 'Halani', gu: '', hi: '' },
      email: 'raj@example.com',
      familyId: '',
    };
    expect(() => personSchema.parse(invalidData)).toThrow();
  });

  // Event schema
  const eventSchema = z.object({
    title: z.object({
      en: z.string().trim().min(1, 'Title is required'),
      gu: z.string().trim().optional(),
      hi: z.string().trim().optional(),
    }),
    eventDate: z.string().trim().min(1, 'Date is required'),
    type: z.enum(['BIRTHDAY', 'BIRTH', 'DEATH', 'ACHIEVEMENT', 'GENERAL']),
  });

  test('should validate valid event data', () => {
    const validData = {
      title: { en: "Raj's Birthday", gu: '', hi: '' },
      eventDate: '2024-01-15',
      type: 'BIRTHDAY',
    };
    expect(() => eventSchema.parse(validData)).not.toThrow();
  });

  test('should reject event without date', () => {
    const invalidData = {
      title: { en: "Raj's Birthday", gu: '', hi: '' },
      eventDate: '',
      type: 'BIRTHDAY',
    };
    expect(() => eventSchema.parse(invalidData)).toThrow();
  });

  // Settings schema
  const passwordSchema = z.object({
    currentPassword: z.string().trim().min(1, 'Required'),
    newPassword: z.string().trim().min(8, 'Min 8 chars'),
    confirmPassword: z.string().trim(),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

  test('should validate matching passwords', () => {
    const validData = {
      currentPassword: 'oldPass123',
      newPassword: 'newPass1234',
      confirmPassword: 'newPass1234',
    };
    expect(() => passwordSchema.parse(validData)).not.toThrow();
  });

  test('should reject mismatched passwords', () => {
    const invalidData = {
      currentPassword: 'oldPass123',
      newPassword: 'newPass1234',
      confirmPassword: 'differentPass',
    };
    expect(() => passwordSchema.parse(invalidData)).toThrow();
  });

  test('should reject short new password', () => {
    const invalidData = {
      currentPassword: 'oldPass123',
      newPassword: 'short',
      confirmPassword: 'short',
    };
    expect(() => passwordSchema.parse(invalidData)).toThrow();
  });
});
