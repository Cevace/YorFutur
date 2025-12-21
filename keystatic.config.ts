import { config, fields, collection, singleton } from '@keystatic/core';

export default config({
  storage: {
    kind: 'local',
  },
  singletons: {
    homepageHero: singleton({
      label: 'Homepage Hero',
      path: 'content/homepage-hero',
      schema: {
        badgeText: fields.text({
          label: 'Badge Text',
          description: 'Kleine tekst in de badge boven de headline',
          defaultValue: 'Private Career Club',
        }),
        headlinePart1: fields.text({
          label: 'Headline Deel 1',
          description: 'Eerste regel (bijv. "Unlock your")',
          defaultValue: 'Unlock your',
        }),
        headlineHighlight: fields.text({
          label: 'Headline Highlight',
          description: 'Gemarkeerde tekst in oranje (bijv. "Unfair")',
          defaultValue: 'Unfair',
        }),
        headlinePart2: fields.text({
          label: 'Headline Deel 2',
          description: 'Laatste regel (bijv. "Advantage.")',
          defaultValue: 'Advantage.',
        }),
        description: fields.text({
          label: 'Beschrijving',
          multiline: true,
          description: 'De ondertekst onder de headline',
          defaultValue: 'Solliciteren is topsport. Cevace is jouw elite trainingskamp. Train IQ, optimaliseer je profiel met AI en versla de concurrentie.',
        }),
        ctaPrimaryText: fields.text({
          label: 'Primaire CTA Tekst',
          defaultValue: 'Start 7 Dagen Gratis',
        }),
        ctaPrimaryLink: fields.text({
          label: 'Primaire CTA Link',
          defaultValue: '/login',
        }),
        ctaSecondaryText: fields.text({
          label: 'Secundaire CTA Tekst',
          defaultValue: 'Bekijk Film',
        }),
        heroImage: fields.image({
          label: 'Hero Afbeelding',
          description: 'De afbeelding rechts in de hero sectie',
          directory: 'public/images/hero',
          publicPath: '/images/hero',
        }),
        socialProofText: fields.text({
          label: 'Social Proof Tekst',
          defaultValue: 'Trusted by 2.000+ members',
        }),
      },
    }),
    homepageLayout: singleton({
      label: 'Homepage Layout',
      path: 'content/homepage-layout',
      schema: {
        sections: fields.array(
          fields.object({
            type: fields.select({
              label: 'Sectie Type',
              options: [
                { label: 'Hero', value: 'hero' },
                { label: 'Features', value: 'features' },
                { label: 'Testimonials', value: 'testimonials' },
                { label: 'Blog', value: 'blog' },
                { label: 'FAQ', value: 'faq' },
                { label: 'Pricing', value: 'pricing' },
              ],
              defaultValue: 'hero',
            }),
            enabled: fields.checkbox({
              label: 'Sectie zichtbaar',
              defaultValue: true,
            }),
            sectionTitle: fields.text({
              label: 'Sectie Titel (optioneel)',
              description: 'Overschrijft de standaard titel van deze sectie',
            }),
          }),
          {
            label: 'Secties',
            itemLabel: (props) => props.fields.type.value || 'Sectie',
          }
        ),
      },
    }),
    sectionSettings: singleton({
      label: 'Sectie Instellingen',
      path: 'content/section-settings',
      schema: {
        featuresSubtitle: fields.text({
          label: 'Features Ondertitel',
          description: 'Tekst onder de features titel',
        }),
        testimonialsSubtitle: fields.text({
          label: 'Testimonials Ondertitel',
          defaultValue: 'Professionals die Cevace gebruiken werken bij de top.',
        }),
        testimonialsLogos: fields.array(
          fields.image({
            label: 'Bedrijfslogo',
            directory: 'public/images/logos',
            publicPath: '/images/logos',
          }),
          { label: 'Bedrijfslogo\'s (afbeeldingen)' }
        ),
        blogSubtitle: fields.text({
          label: 'Blog Ondertitel',
          defaultValue: 'Praktische tips en inzichten voor je carrière en sollicitatie.',
        }),
        faqSubtitle: fields.text({
          label: 'FAQ Ondertitel',
          defaultValue: 'Alles wat je moet weten over Cevace.',
        }),
        pricingSubtitle: fields.text({
          label: 'Pricing Ondertitel',
        }),
        // Quote sectie in Features
        quoteText: fields.text({
          label: 'Quote Tekst',
          multiline: true,
          defaultValue: 'De meeste mensen bereiden zich voor op het verleden. Cevace bereidt je voor op de toekomst van recruitment.',
        }),
        quoteAuthor: fields.text({
          label: 'Quote Auteur',
          defaultValue: 'James V.',
        }),
        quoteRole: fields.text({
          label: 'Quote Functie',
          defaultValue: 'Head of Talent, TechCorp',
        }),
        quotePhoto: fields.image({
          label: 'Quote Auteur Foto',
          directory: 'public/images/quotes',
          publicPath: '/images/quotes',
        }),
      },
    }),
  },
  collections: {
    faqCategories: collection({
      label: 'FAQ Categorieën',
      slugField: 'name',
      path: 'content/faq-categories/*',
      schema: {
        name: fields.slug({ name: { label: 'Categorie Naam' } }),
        order: fields.integer({
          label: 'Volgorde',
          defaultValue: 0,
        }),
      },
    }),
    faqItems: collection({
      label: 'FAQ Vragen',
      slugField: 'question',
      path: 'content/faq-items/*',
      schema: {
        question: fields.slug({ name: { label: 'Vraag' } }),
        answer: fields.text({
          label: 'Antwoord',
          multiline: true,
        }),
        category: fields.text({
          label: 'Categorie',
          description: 'Slug van de categorie (bijv. "cevace-pakketten")',
        }),
        order: fields.integer({
          label: 'Volgorde',
          defaultValue: 0,
        }),
      },
    }),
    testimonials: collection({
      label: 'Testimonials',
      slugField: 'name',
      path: 'content/testimonials/*',
      schema: {
        name: fields.slug({ name: { label: 'Naam' } }),
        role: fields.text({ label: 'Functie' }),
        company: fields.text({ label: 'Bedrijf' }),
        quote: fields.text({
          label: 'Quote',
          multiline: true,
          description: 'De testimonial tekst',
        }),
        photo: fields.image({
          label: 'Foto',
          directory: 'public/images/testimonials',
          publicPath: '/images/testimonials',
        }),
        rating: fields.integer({
          label: 'Sterren (1-5)',
          defaultValue: 5,
          validation: { min: 1, max: 5 },
        }),
        order: fields.integer({
          label: 'Volgorde',
          defaultValue: 0,
          description: 'Lagere nummers verschijnen eerst',
        }),
      },
    }),
    pricingCards: collection({
      label: 'Pricing Cards',
      slugField: 'slug',
      path: 'content/pricing/*',
      schema: {
        slug: fields.slug({ name: { label: 'URL Slug (niet wijzigen na aanmaken)' } }),
        name: fields.text({ label: 'Weergavenaam', validation: { isRequired: true } }),
        description: fields.text({
          label: 'Beschrijving',
          multiline: true,
          description: 'Tekst tussen de naam en de prijs',
        }),
        price: fields.text({
          label: 'Prijs',
          description: 'Bijv. "€9,95" of "Gratis"',
        }),
        priceYearly: fields.text({
          label: 'Jaarlijkse Prijs',
          description: 'Prijs bij jaarlijks abonnement (optioneel)',
        }),
        period: fields.text({
          label: 'Periode',
          description: 'Bijv. "/ maand" of "eenmalig"',
        }),
        features: fields.array(
          fields.text({ label: 'Feature' }),
          { label: 'Features' }
        ),
        highlight: fields.checkbox({
          label: 'Uitgelicht (populair)',
          defaultValue: false,
        }),
        buttonText: fields.text({
          label: 'Button Tekst',
          defaultValue: 'Kies Plan',
        }),
        buttonLink: fields.text({
          label: 'Button Link',
          defaultValue: '/login',
        }),
        order: fields.integer({
          label: 'Volgorde',
          defaultValue: 0,
        }),
      },
    }),
    features: collection({
      label: 'Features',
      slugField: 'title',
      path: 'content/features/*',
      schema: {
        title: fields.slug({ name: { label: 'Titel' } }),
        description: fields.text({
          label: 'Beschrijving',
          multiline: true,
        }),
        icon: fields.select({
          label: 'Icoon',
          options: [
            { label: 'Brain (Hersenen)', value: 'brain' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'Users (Mensen)', value: 'users' },
            { label: 'Target (Doel)', value: 'target' },
            { label: 'Sparkles (Sterren)', value: 'sparkles' },
            { label: 'Rocket (Raket)', value: 'rocket' },
            { label: 'Award (Prijs)', value: 'award' },
            { label: 'TrendingUp (Groei)', value: 'trending-up' },
          ],
          defaultValue: 'brain',
        }),
        order: fields.integer({
          label: 'Volgorde',
          defaultValue: 0,
        }),
      },
    }),
    pages: collection({
      label: 'Pages',
      slugField: 'title',
      path: 'content/pages/*',
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        content: fields.blocks(
          {
            hero: {
              label: 'Hero Section',
              schema: fields.object({
                headline: fields.text({ label: 'Headline' }),
                subheadline: fields.text({ label: 'Subheadline' }),
                ctaText: fields.text({ label: 'CTA Text' }),
                ctaLink: fields.text({ label: 'CTA Link' }),
                backgroundImage: fields.image({
                  label: 'Background Image',
                  directory: 'public/images/pages',
                  publicPath: '/images/pages',
                }),
              }),
            },
            textBlock: {
              label: 'Text Block',
              schema: fields.object({
                content: fields.document({
                  label: 'Content',
                  formatting: true,
                  dividers: true,
                  links: true,
                  images: {
                    directory: 'public/images/pages',
                    publicPath: '/images/pages',
                  },
                }),
              }),
            },
            stats: {
              label: 'Stats Block',
              schema: fields.object({
                stats: fields.array(
                  fields.object({
                    value: fields.text({ label: 'Value (e.g. 31)' }),
                    label: fields.text({ label: 'Label' }),
                  }),
                  { label: 'Statistics' }
                ),
              }),
            },
            cardGrid: {
              label: 'Card Grid (Coaching)',
              schema: fields.object({
                headline: fields.text({ label: 'Headline' }),
                cards: fields.array(
                  fields.object({
                    title: fields.text({ label: 'Title' }),
                    description: fields.text({ label: 'Description', multiline: true }),
                    image: fields.image({
                      label: 'Card Image',
                      directory: 'public/images/cards',
                      publicPath: '/images/cards',
                    }),
                    link: fields.text({ label: 'Link URL' }),
                    linkLabel: fields.text({ label: 'Link Label' }),
                  }),
                  { label: 'Cards' }
                ),
              }),
            },
            pricing: {
              label: 'Pricing Block',
              schema: fields.object({
                headline: fields.text({ label: 'Headline' }),
                packages: fields.array(
                  fields.object({
                    name: fields.text({ label: 'Package Name' }),
                    price: fields.text({ label: 'Price' }),
                    priceSuffix: fields.text({
                      label: 'Price Suffix',
                      description: 'Text na de prijs, bijv. "per maand", "eenmalig", "voor altijd"'
                    }),
                    description: fields.text({
                      label: 'Package Description',
                      multiline: true,
                      description: 'Korte beschrijving voor wie dit pakket is'
                    }),
                    features: fields.array(fields.text({ label: 'Feature' }), { label: 'Features' }),
                    highlight: fields.checkbox({ label: 'Highlight this package?' }),
                  }),
                  { label: 'Packages' }
                ),
              }),
            },
            imageText: {
              label: 'Image & Text Block',
              schema: fields.object({
                headline: fields.text({ label: 'Headline' }),
                content: fields.text({
                  label: 'Content',
                  multiline: true,
                }),
                image: fields.image({
                  label: 'Image',
                  directory: 'public/images/blocks',
                  publicPath: '/images/blocks',
                }),
                layout: fields.select({
                  label: 'Layout',
                  options: [
                    { label: 'Image Left', value: 'left' },
                    { label: 'Image Right', value: 'right' },
                  ],
                  defaultValue: 'left',
                }),
                ctaText: fields.text({ label: 'Button Text' }),
                ctaLink: fields.text({ label: 'Button Link' }),
              }),
            },
            faq: {
              label: 'FAQ (Veelgestelde Vragen)',
              schema: fields.object({
                headline: fields.text({ label: 'Headline' }),
                items: fields.array(
                  fields.object({
                    question: fields.text({ label: 'Question' }),
                    answer: fields.text({
                      label: 'Answer',
                      multiline: true,
                    }),
                  }),
                  { label: 'Questions' }
                ),
              }),
            },
            successStories: {
              label: 'Success Stories Section',
              schema: fields.object({
                title: fields.text({ label: 'Title' }),
                subtitle: fields.text({ label: 'Subtitle' }),
              }),
            },
            logoGrid: {
              label: 'Logo Grid (Partners)',
              schema: fields.object({
                headline: fields.text({ label: 'Headline' }),
                logos: fields.array(
                  fields.image({
                    label: 'Logo',
                    directory: 'public/images/logos',
                    publicPath: '/images/logos',
                  }),
                  { label: 'Logos' }
                ),
              }),
            },
            callToAction: {
              label: 'App Download / CTA',
              schema: fields.object({
                headline: fields.text({ label: 'Headline' }),
                subheadline: fields.text({ label: 'Subheadline' }),
                appleLink: fields.text({ label: 'Apple App Store Link' }),
                googleLink: fields.text({ label: 'Google Play Store Link' }),
              }),
            },
            contactForm: {
              label: 'Contact Form',
              schema: fields.object({
                headline: fields.text({ label: 'Headline' }),
                subheadline: fields.text({ label: 'Subheadline' }),
              }),
            },
          },
          { label: 'Content Blocks' }
        ),
      },
    }),
    successStories: collection({
      label: 'Success Stories',
      slugField: 'name',
      path: 'content/success-stories/*',
      format: { contentField: 'quote' },
      schema: {
        name: fields.slug({ name: { label: 'Name' } }),
        jobTitle: fields.text({ label: 'Job Title' }),
        photo: fields.image({
          label: 'Photo',
          directory: 'public/images/success-stories',
          publicPath: '/images/success-stories',
        }),
        quote: fields.document({
          label: 'Quote',
          formatting: true,
        }),
      },
    }),
    blog: collection({
      label: 'Blog Posts',
      slugField: 'title',
      path: 'content/blog/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        category: fields.select({
          label: 'Category',
          options: [
            { label: 'Sollicitatie Tips', value: 'Sollicitatie Tips' },
            { label: 'CV Schrijven', value: 'CV Schrijven' },
            { label: 'Motivatiebrief', value: 'Motivatiebrief' },
            { label: 'LinkedIn', value: 'LinkedIn' },
            { label: 'Carrière', value: 'Carrière' },
            { label: 'Interview Tips', value: 'Interview Tips' },
          ],
          defaultValue: 'Sollicitatie Tips',
        }),
        excerpt: fields.text({
          label: 'Excerpt',
          description: 'Short summary (200 chars max)',
          multiline: true,
          validation: { length: { max: 200 } },
        }),
        coverImage: fields.image({
          label: 'Cover Image',
          directory: 'public/images/blog',
          publicPath: '/images/blog',
        }),
        author: fields.text({
          label: 'Author',
          defaultValue: 'Cevace',
        }),
        publishedDate: fields.date({
          label: 'Published Date',
          defaultValue: { kind: 'today' },
        }),
        published: fields.checkbox({
          label: 'Published',
          defaultValue: false,
        }),
        content: fields.document({
          label: 'Content',
          formatting: true,
          dividers: true,
          links: true,
          images: {
            directory: 'public/images/blog',
            publicPath: '/images/blog',
          },
          tables: true,
        }),
      },
    }),
  },
});
