import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { db } from '../db/client';
import {
  bookings,
  corporateLeads,
  partnerLeads,
  quoteRequests,
  reviews,
} from '../db/schema';

const phone = z
  .string()
  .trim()
  .regex(/^\+?[0-9 ()-]{7,20}$/, 'Enter a valid phone number');

/** Unfilled form controls arrive as null or '' — normalise those to undefined before validating. */
const blankable = (schema: z.ZodTypeAny) =>
  z.preprocess((v) => (v === '' || v == null ? undefined : v), schema);
const optionalId = blankable(z.coerce.number().int().positive().optional());
const optionalText = (max: number) => blankable(z.string().trim().max(max).optional());
const optionalEmail = blankable(z.string().trim().email('Enter a valid email').max(160).optional());
/** Optional free-text field stored as '' when left empty. */
const textField = (max: number) =>
  z.preprocess((v) => (v == null ? '' : v), z.string().trim().max(max));

export const server = {
  submitQuote: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string().trim().min(2, 'Enter your name').max(120),
      phone,
      email: optionalEmail,
      vehicleMake: z.string().trim().min(1, 'Enter your car’s make').max(60),
      vehicleModel: z.string().trim().min(1, 'Enter the model').max(60),
      vehicleYear: blankable(z.coerce.number().int().min(1980).max(2030).optional()),
      serviceId: optionalId,
      locationId: optionalId,
      details: textField(2000),
    }),
    handler: async (input) => {
      const [row] = await db
        .insert(quoteRequests)
        .values({ ...input, email: input.email ?? null })
        .returning({ id: quoteRequests.id });
      return { id: row.id };
    },
  }),

  bookService: defineAction({
    accept: 'form',
    input: z.object({
      type: z.enum(['appointment', 'pick_drop', 'emergency']).default('appointment'),
      name: z.string().trim().min(2, 'Enter your name').max(120),
      phone,
      serviceId: optionalId,
      garageId: optionalId,
      locationId: optionalId,
      preferredDate: optionalText(20),
      preferredSlot: optionalText(40),
      pickAndDrop: z.coerce.boolean().default(false),
      notes: textField(2000),
    }),
    handler: async (input) => {
      const [row] = await db.insert(bookings).values(input).returning({ id: bookings.id });
      return { id: row.id };
    },
  }),

  corporateLead: defineAction({
    accept: 'form',
    input: z.object({
      company: z.string().trim().min(2, 'Enter your company name').max(160),
      contactName: z.string().trim().min(2, 'Enter a contact name').max(120),
      phone,
      email: z.string().trim().email('Enter a valid work email').max(160),
      fleetSize: optionalText(40),
      message: textField(2000),
    }),
    handler: async (input) => {
      const [row] = await db.insert(corporateLeads).values(input).returning({ id: corporateLeads.id });
      return { id: row.id };
    },
  }),

  partnerLead: defineAction({
    accept: 'form',
    input: z.object({
      garageName: z.string().trim().min(2, 'Enter your garage name').max(160),
      contactName: z.string().trim().min(2, 'Enter a contact name').max(120),
      phone,
      email: optionalEmail,
      area: optionalText(120),
      message: textField(2000),
    }),
    handler: async (input) => {
      const [row] = await db
        .insert(partnerLeads)
        .values({ ...input, email: input.email ?? null })
        .returning({ id: partnerLeads.id });
      return { id: row.id };
    },
  }),

  submitReview: defineAction({
    accept: 'form',
    input: z.object({
      garageId: z.coerce.number().int().positive(),
      authorName: z.string().trim().min(2, 'Enter your name').max(120),
      rating: z.coerce.number().int().min(1).max(5),
      comment: textField(2000),
    }),
    handler: async (input) => {
      // Reviews publish only after admin approval.
      await db.insert(reviews).values({ ...input, approved: false });
      return { ok: true };
    },
  }),
};
