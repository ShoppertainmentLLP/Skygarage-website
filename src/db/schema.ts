import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const garageTier = pgEnum('garage_tier', ['premium', 'verified', 'mobile']);
export const locationType = pgEnum('location_type', ['emirate', 'area']);
export const requestStatus = pgEnum('request_status', ['new', 'contacted', 'quoted', 'won', 'lost']);
export const bookingType = pgEnum('booking_type', ['appointment', 'pick_drop', 'emergency']);
export const bookingStatus = pgEnum('booking_status', ['new', 'confirmed', 'in_progress', 'completed', 'cancelled']);

export const serviceCategories = pgTable('service_categories', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 80 }).notNull().unique(),
  name: varchar('name', { length: 120 }).notNull(),
  tagline: text('tagline').notNull().default(''),
  description: text('description').notNull().default(''),
  sort: integer('sort').notNull().default(0),
});

export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id')
    .notNull()
    .references(() => serviceCategories.id, { onDelete: 'cascade' }),
  slug: varchar('slug', { length: 80 }).notNull().unique(),
  /*
    The indexable URL segment, e.g. car-detailing-dubai for the "detailing" service. Stored
    rather than derived so the agency can tune each one to the keyword research without a
    code change; `slug` stays the stable internal key that crossover pages are built from.
  */
  seoSlug: varchar('seo_slug', { length: 120 }).notNull().unique(),
  name: varchar('name', { length: 120 }).notNull(),
  excerpt: text('excerpt').notNull().default(''),
  description: text('description').notNull().default(''),
  priceFromAed: integer('price_from_aed'),
  priceToAed: integer('price_to_aed'),
  durationLabel: varchar('duration_label', { length: 60 }),
  sort: integer('sort').notNull().default(0),
});

export const locations = pgTable('locations', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 80 }).notNull().unique(),
  name: varchar('name', { length: 120 }).notNull(),
  type: locationType('type').notNull(),
  parentId: integer('parent_id'),
  blurb: text('blurb').notNull().default(''),
  sort: integer('sort').notNull().default(0),
});

/* Manufacturer pages: the brand a car owner searches for before they search for a garage. */
export const brands = pgTable('brands', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 80 }).notNull().unique(),
  name: varchar('name', { length: 120 }).notNull(),
  origin: varchar('origin', { length: 80 }).notNull().default(''),
  tagline: text('tagline').notNull().default(''),
  description: text('description').notNull().default(''),
  commonJobs: text('common_jobs').array().notNull().default([]),
  sort: integer('sort').notNull().default(0),
});

export const garages = pgTable('garages', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 80 }).notNull().unique(),
  name: varchar('name', { length: 160 }).notNull(),
  tier: garageTier('tier').notNull().default('verified'),
  description: text('description').notNull().default(''),
  phone: varchar('phone', { length: 30 }),
  whatsapp: varchar('whatsapp', { length: 30 }),
  warrantyMonths: integer('warranty_months').notNull().default(0),
  turnaroundHours: integer('turnaround_hours'),
  priceBand: varchar('price_band', { length: 8 }).notNull().default('$$'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const garageServices = pgTable(
  'garage_services',
  {
    garageId: integer('garage_id')
      .notNull()
      .references(() => garages.id, { onDelete: 'cascade' }),
    serviceId: integer('service_id')
      .notNull()
      .references(() => services.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.garageId, t.serviceId] })],
);

export const garageLocations = pgTable(
  'garage_locations',
  {
    garageId: integer('garage_id')
      .notNull()
      .references(() => garages.id, { onDelete: 'cascade' }),
    locationId: integer('location_id')
      .notNull()
      .references(() => locations.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.garageId, t.locationId] })],
);

export const garageBrands = pgTable(
  'garage_brands',
  {
    garageId: integer('garage_id')
      .notNull()
      .references(() => garages.id, { onDelete: 'cascade' }),
    brandId: integer('brand_id')
      .notNull()
      .references(() => brands.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.garageId, t.brandId] })],
);

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  garageId: integer('garage_id')
    .notNull()
    .references(() => garages.id, { onDelete: 'cascade' }),
  /*
    The job the review is about, where the reviewer named one. Service pages show and aggregate
    only reviews tagged with that service — an untagged review is real feedback about the garage,
    not evidence about this job, and rating markup that blurs the two is the kind of thing
    Google strips a rich result for.
  */
  serviceId: integer('service_id').references(() => services.id, { onDelete: 'set null' }),
  authorName: varchar('author_name', { length: 120 }).notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment').notNull().default(''),
  approved: boolean('approved').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const servicePackages = pgTable('service_packages', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 80 }).notNull().unique(),
  name: varchar('name', { length: 120 }).notNull(),
  description: text('description').notNull().default(''),
  priceAed: integer('price_aed').notNull(),
  features: text('features').array().notNull().default([]),
  sort: integer('sort').notNull().default(0),
});

export const quoteRequests = pgTable('quote_requests', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 120 }).notNull(),
  phone: varchar('phone', { length: 30 }).notNull(),
  email: varchar('email', { length: 160 }),
  vehicleMake: varchar('vehicle_make', { length: 60 }).notNull(),
  vehicleModel: varchar('vehicle_model', { length: 60 }).notNull(),
  vehicleYear: integer('vehicle_year'),
  serviceId: integer('service_id').references(() => services.id, { onDelete: 'set null' }),
  locationId: integer('location_id').references(() => locations.id, { onDelete: 'set null' }),
  details: text('details').notNull().default(''),
  status: requestStatus('status').notNull().default('new'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  type: bookingType('type').notNull().default('appointment'),
  name: varchar('name', { length: 120 }).notNull(),
  phone: varchar('phone', { length: 30 }).notNull(),
  serviceId: integer('service_id').references(() => services.id, { onDelete: 'set null' }),
  garageId: integer('garage_id').references(() => garages.id, { onDelete: 'set null' }),
  locationId: integer('location_id').references(() => locations.id, { onDelete: 'set null' }),
  preferredDate: varchar('preferred_date', { length: 20 }),
  preferredSlot: varchar('preferred_slot', { length: 40 }),
  pickAndDrop: boolean('pick_and_drop').notNull().default(false),
  notes: text('notes').notNull().default(''),
  status: bookingStatus('status').notNull().default('new'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const corporateLeads = pgTable('corporate_leads', {
  id: serial('id').primaryKey(),
  company: varchar('company', { length: 160 }).notNull(),
  contactName: varchar('contact_name', { length: 120 }).notNull(),
  phone: varchar('phone', { length: 30 }).notNull(),
  email: varchar('email', { length: 160 }).notNull(),
  fleetSize: varchar('fleet_size', { length: 40 }),
  message: text('message').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const partnerLeads = pgTable('partner_leads', {
  id: serial('id').primaryKey(),
  garageName: varchar('garage_name', { length: 160 }).notNull(),
  contactName: varchar('contact_name', { length: 120 }).notNull(),
  phone: varchar('phone', { length: 30 }).notNull(),
  email: varchar('email', { length: 160 }),
  area: varchar('area', { length: 120 }),
  message: text('message').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const serviceCategoriesRelations = relations(serviceCategories, ({ many }) => ({
  services: many(services),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  category: one(serviceCategories, {
    fields: [services.categoryId],
    references: [serviceCategories.id],
  }),
  garageServices: many(garageServices),
}));

export const locationsRelations = relations(locations, ({ one, many }) => ({
  parent: one(locations, { fields: [locations.parentId], references: [locations.id] }),
  garageLocations: many(garageLocations),
}));

export const garagesRelations = relations(garages, ({ many }) => ({
  garageServices: many(garageServices),
  garageLocations: many(garageLocations),
  garageBrands: many(garageBrands),
  reviews: many(reviews),
}));

export const brandsRelations = relations(brands, ({ many }) => ({
  garageBrands: many(garageBrands),
}));

export const garageBrandsRelations = relations(garageBrands, ({ one }) => ({
  garage: one(garages, { fields: [garageBrands.garageId], references: [garages.id] }),
  brand: one(brands, { fields: [garageBrands.brandId], references: [brands.id] }),
}));

export const garageServicesRelations = relations(garageServices, ({ one }) => ({
  garage: one(garages, { fields: [garageServices.garageId], references: [garages.id] }),
  service: one(services, { fields: [garageServices.serviceId], references: [services.id] }),
}));

export const garageLocationsRelations = relations(garageLocations, ({ one }) => ({
  garage: one(garages, { fields: [garageLocations.garageId], references: [garages.id] }),
  location: one(locations, { fields: [garageLocations.locationId], references: [locations.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  garage: one(garages, { fields: [reviews.garageId], references: [garages.id] }),
  service: one(services, { fields: [reviews.serviceId], references: [services.id] }),
}));
