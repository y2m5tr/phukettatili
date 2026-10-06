import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const toursCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tours' }),
  schema: z.object({
    title: z.string(),
    category: z.string(),
    subcategory: z.string().optional(),
    category_label: z.string(),
    excerpt: z.string(),
    image: z.string().default('pileh.webp'),
    gallery: z.array(z.string()).default([]),
    price_type: z.enum(['fixed', 'starting', 'quote']).default('quote'),
    price_thb: z.number().nullable().optional(),
    duration: z.string().default('Tam gün'),
    included: z.array(z.string()).default([]),
    excluded: z.array(z.string()).default([]),
    program: z.array(z.string()).default([]),
    faq: z.array(z.object({
      q: z.string(),
      a: z.string(),
    })).default([]),
    restrictions: z.array(z.string()).default([]),
    age_min: z.string().optional(),
    max_weight: z.number().optional(),
    source_status: z.enum(['unverified', 'web_research', 'owner_approved', 'verified']).default('owner_approved'),
    verification_status: z.enum(['awaiting_verification', 'verified']).default('verified'),
    verified_until: z.string().optional(),
    verified_by: z.string().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(99),
  }),
});

const categoriesCollection = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/categories' }),
  schema: z.object({
    name: z.string(),
    label_tr: z.string(),
    slug: z.string(),
    icon: z.string().default('📍'),
    short_desc: z.string(),
    description: z.string(),
    hero_image: z.string().default('pileh.webp'),
    parent: z.string().nullable().optional(),
    order: z.number().default(0),
    children: z.array(z.object({
      name: z.string(),
      label_tr: z.string(),
      slug: z.string(),
      description: z.string().optional(),
      hero_image: z.string().optional(),
    })).default([]),
  }),
});

const servicesCollection = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    menu_label: z.string(),
    eyebrow: z.string(),
    heading: z.string(),
    intro: z.string(),
    media: z.string(),
    media_alt: z.string(),
    media_caption: z.string(),
    options: z.array(z.object({
      title: z.string(),
      text: z.string(),
    })),
    questions: z.array(z.string()),
    cta_context: z.string(),
    cta_details: z.string(),
    order: z.number().default(0),
  }),
});

const blogCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    cover_image: z.string().default('pileh.webp'),
    date: z.date(),
    author: z.string().default('Phuket Tatili Ekibi'),
    featured: z.boolean().default(false),
  }),
});

export const collections = {
  tours: toursCollection,
  categories: categoriesCollection,
  services: servicesCollection,
  blog: blogCollection,
};
