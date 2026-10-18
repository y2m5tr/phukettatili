import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const toursCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/tours" }),
  schema: z.object({
    title: z.string(),
    category: z.string(),
    subcategory: z.string().optional(),
    category_label: z.string().optional(),
    excerpt: z.string().optional(),
    image: z.string().optional(),
    gallery: z.array(z.string()).optional(),
    price_type: z.string().optional(),
    price_thb: z.number().nullable().optional(),
    duration: z.string().optional(),
    included: z.array(z.string()).optional(),
    excluded: z.array(z.string()).optional(),
    program: z.array(z.string()).optional(),
    program_images: z.array(z.string()).optional(),
    faq: z.array(
      z.object({
        q: z.string(),
        a: z.string(),
      })
    ).optional(),
    restrictions: z.array(z.string()).optional(),
    age_min: z.string().optional(),
    source_status: z.string().optional(),
    verification_status: z.string().optional(),
    verified_by: z.string().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(100),
  }),
});

const categoriesCollection = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/categories" }),
  schema: z.object({
    name: z.string(),
    label_tr: z.string(),
    slug: z.string(),
    icon: z.string().optional(),
    short_desc: z.string().optional(),
    description: z.string().optional(),
    hero_image: z.string().optional(),
    order: z.number().default(100),
    children: z.array(
      z.object({
        name: z.string(),
        label_tr: z.string(),
        slug: z.string(),
        description: z.string().optional(),
        hero_image: z.string().optional(),
      })
    ).optional().default([]),
  }),
});

const servicesCollection = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/services" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    menu_label: z.string().optional(),
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    intro: z.string().optional(),
    media: z.string().optional(),
    media_alt: z.string().optional(),
    media_caption: z.string().optional(),
    options: z.array(
      z.object({
        title: z.string(),
        text: z.string(),
      })
    ).optional().default([]),
    questions: z.array(z.string()).optional().default([]),
    cta_context: z.string().optional(),
    cta_details: z.string().optional(),
    order: z.number().default(100),
  }),
});

const blogCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string().optional(),
    cover_image: z.string().optional(),
    date: z.coerce.date().optional(),
    author: z.string().optional(),
    featured: z.boolean().default(false),
    related_tour: z.string().optional(),
  }),
});

export const collections = {
  tours: toursCollection,
  categories: categoriesCollection,
  services: servicesCollection,
  blog: blogCollection,
};
