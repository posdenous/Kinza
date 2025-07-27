#!/usr/bin/env node

/**
 * Berlin Event Scraper Tool - Enhanced with Kid-Friendly Filtering
 * Scrapes events from berlin.de and Google Maps to populate Kinza event creator fields
 * Now includes smart filtering for family-appropriate content and proper categorization
 * 
 * Usage:
 *   node event-scraper.js --url "https://www.berlin.de/wochenend-tipps/"
 *   node event-scraper.js --kids-only --max-age 12
 *   node event-scraper.js --categories "outdoor,educational" --output family-events.json
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const { URL } = require('url');

class BerlinEventScraper {
    constructor(options = {}) {
        this.options = {
            headless: true,
            timeout: 30000,
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            kidsOnly: false,
            maxAge: 18,
            minAge: 0,
            allowedCategories: null, // null = all categories
            ...options
        };
        this.browser = null;
        this.page = null;
        
        // Define Kinza categories and their criteria
        this.kinzaCategories = {
            outdoor: {
                keywords: ['park', 'garten', 'spielplatz', 'outdoor', 'draußen', 'spaziergang', 'wanderung', 'zoo', 'tierpark', 'strand', 'see'],
                excludeKeywords: ['bar', 'club', 'alkohol'],
                ageAppropriate: true
            },
            indoor: {
                keywords: ['museum', 'indoor', 'drinnen', 'bibliothek', 'kino', 'theater', 'werkstatt', 'labor'],
                excludeKeywords: ['bar', 'club', 'alkohol', 'casino'],
                ageAppropriate: true
            },
            educational: {
                keywords: ['lernen', 'bildung', 'workshop', 'kurs', 'schule', 'universität', 'wissenschaft', 'experiment', 'labor', 'museum'],
                excludeKeywords: ['erwachsene', 'alkohol'],
                ageAppropriate: true
            },
            sports: {
                keywords: ['sport', 'fußball', 'schwimmen', 'laufen', 'radfahren', 'klettern', 'turnen', 'fitness'],
                excludeKeywords: ['extremsport', 'alkohol', 'gewalt'],
                ageAppropriate: true
            },
            arts: {
                keywords: ['kunst', 'malen', 'zeichnen', 'basteln', 'kreativ', 'handwerk', 'musik', 'tanz', 'theater'],
                excludeKeywords: ['alkohol', 'erwachsene'],
                ageAppropriate: true
            },
            music: {
                keywords: ['musik', 'konzert', 'singen', 'instrument', 'chor', 'band'],
                excludeKeywords: ['alkohol', 'club', 'party'],
                ageAppropriate: true
            }
        };
        
        // Kid-friendly content filters
        this.kidFriendlyFilters = {
            // Content that should be excluded for kids
            excludeKeywords: [
                'alkohol', 'bier', 'wein', 'cocktail', 'bar', 'club', 'party', 'disco',
                'erwachsene', 'adult', '18+', 'ab 18', 'volljährig',
                'casino', 'glücksspiel', 'wetten',
                'horror', 'gewalt', 'krieg', 'tod',
                'erotik', 'sex', 'nackt',
                'rauchen', 'zigarette', 'tabak'
            ],
            
            // Content that indicates kid-friendly events
            includeKeywords: [
                'kinder', 'familie', 'familien', 'kids', 'jugend', 'jugendliche',
                'baby', 'kleinkind', 'schüler', 'grundschule',
                'spielen', 'spaß', 'lernen', 'entdecken',
                'basteln', 'malen', 'kreativ', 'workshop für kinder'
            ],
            
            // Age-related patterns
            agePatterns: [
                /ab\s*(\d+)\s*jahr/i,
                /(\d+)\s*bis\s*(\d+)\s*jahr/i,
                /für\s*kinder\s*ab\s*(\d+)/i,
                /(\d+)\s*-\s*(\d+)\s*jahre/i
            ],
            
            // Venues known to be family-friendly
            familyVenues: [
                'kindermuseum', 'spielplatz', 'zoo', 'tierpark', 'aquarium',
                'bibliothek', 'grundschule', 'kindergarten', 'familienzentrum',
                'jugendclub', 'freizeitzentrum'
            ]
        };
    }

    async init() {
        this.browser = await puppeteer.launch({
            headless: this.options.headless,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.page = await this.browser.newPage();
        await this.page.setUserAgent(this.options.userAgent);
        await this.page.setViewport({ width: 1200, height: 800 });
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    /**
     * Check if event is appropriate for kids based on content analysis
     */
    isKidFriendly(event) {
        const text = `${event.title} ${event.description} ${event.venue} ${event.category}`.toLowerCase();
        
        // Check for explicit exclude keywords
        for (const keyword of this.kidFriendlyFilters.excludeKeywords) {
            if (text.includes(keyword)) {
                console.log(`❌ Excluded "${event.title}" - contains: ${keyword}`);
                return false;
            }
        }
        
        // Check age appropriateness
        if (event.minAge && event.minAge > this.options.maxAge) {
            console.log(`❌ Excluded "${event.title}" - min age ${event.minAge} > ${this.options.maxAge}`);
            return false;
        }
        
        // If kids-only mode, require positive indicators
        if (this.options.kidsOnly) {
            const hasKidIndicator = this.kidFriendlyFilters.includeKeywords.some(keyword => 
                text.includes(keyword)
            );
            
            const hasKidVenue = this.kidFriendlyFilters.familyVenues.some(venue => 
                text.includes(venue)
            );
            
            // Check if it's in a kid-friendly category
            const isKidCategory = event.category && (
                event.category.includes('Kinder') || 
                event.category.includes('Jugend') ||
                event.category.includes('Familie')
            );
            
            if (!hasKidIndicator && !hasKidVenue && !isKidCategory) {
                console.log(`❌ Excluded "${event.title}" - no kid-friendly indicators`);
                return false;
            }
        }
        
        console.log(`✅ Approved "${event.title}" - kid-friendly`);
        return true;
    }

    /**
     * Categorize event into Kinza categories based on content analysis
     */
    categorizeEvent(event) {
        const text = `${event.title} ${event.description} ${event.venue}`.toLowerCase();
        const matchedCategories = [];
        
        // Score each category based on keyword matches
        for (const [categoryName, categoryData] of Object.entries(this.kinzaCategories)) {
            let score = 0;
            
            // Check include keywords
            for (const keyword of categoryData.keywords) {
                if (text.includes(keyword)) {
                    score += 1;
                }
            }
            
            // Check exclude keywords (negative score)
            for (const keyword of categoryData.excludeKeywords) {
                if (text.includes(keyword)) {
                    score -= 2;
                }
            }
            
            // Add category if score is positive
            if (score > 0) {
                matchedCategories.push({
                    name: categoryName,
                    score: score
                });
            }
        }
        
        // Sort by score and return top categories
        matchedCategories.sort((a, b) => b.score - a.score);
        const finalCategories = matchedCategories.slice(0, 3).map(c => c.name);
        
        // Ensure at least one category
        if (finalCategories.length === 0) {
            // Default categorization based on berlin.de category
            if (event.category) {
                if (event.category.includes('Kinder')) return ['educational'];
                if (event.category.includes('Ausstellung')) return ['arts'];
                if (event.category.includes('Sport')) return ['sports'];
                if (event.category.includes('Markt')) return ['outdoor'];
            }
            return ['outdoor']; // Default fallback
        }
        
        console.log(`🏷️ Categorized "${event.title}" as: ${finalCategories.join(', ')}`);
        return finalCategories;
    }

    /**
     * Enhanced age detection with better parsing
     */
    extractAgeRange(text) {
        const ageInfo = { minAge: 0, maxAge: 18 };
        
        // Try different age patterns
        for (const pattern of this.kidFriendlyFilters.agePatterns) {
            const match = text.match(pattern);
            if (match) {
                if (match[2]) {
                    // Range pattern (e.g., "6 bis 12 Jahre")
                    ageInfo.minAge = parseInt(match[1]);
                    ageInfo.maxAge = parseInt(match[2]);
                } else {
                    // Single age pattern (e.g., "ab 6 Jahren")
                    ageInfo.minAge = parseInt(match[1]);
                    ageInfo.maxAge = 18; // Default max
                }
                break;
            }
        }
        
        // Special handling for common terms
        if (text.includes('baby') || text.includes('säugling')) {
            ageInfo.minAge = 0;
            ageInfo.maxAge = 2;
        } else if (text.includes('kleinkind')) {
            ageInfo.minAge = 1;
            ageInfo.maxAge = 4;
        } else if (text.includes('vorschul')) {
            ageInfo.minAge = 3;
            ageInfo.maxAge = 6;
        } else if (text.includes('grundschul')) {
            ageInfo.minAge = 6;
            ageInfo.maxAge = 12;
        } else if (text.includes('jugendliche')) {
            ageInfo.minAge = 13;
            ageInfo.maxAge = 17;
        }
        
        return ageInfo;
    }

    /**
     * Scrape events from berlin.de weekend tips with enhanced filtering
     */
    async scrapeBerlinWeekendTips(url = 'https://www.berlin.de/wochenend-tipps/') {
        console.log(`🔍 Scraping Berlin weekend tips from: ${url}`);
        console.log(`📋 Filters: Kids-only=${this.options.kidsOnly}, Max age=${this.options.maxAge}`);
        
        await this.page.goto(url, { waitUntil: 'networkidle2', timeout: this.options.timeout });
        
        // Extract all event sections
        const events = await this.page.evaluate(() => {
            const eventSections = [];
            
            // Find all event categories
            const categories = document.querySelectorAll('h2');
            
            categories.forEach(categoryHeader => {
                const categoryName = categoryHeader.textContent.trim();
                
                // Skip non-event categories
                if (categoryName.includes('Wetter') || categoryName.includes('Newsletter')) {
                    return;
                }
                
                // Find events in this category
                let currentElement = categoryHeader.nextElementSibling;
                
                while (currentElement && currentElement.tagName !== 'H2') {
                    if (currentElement.tagName === 'H3') {
                        const eventLink = currentElement.querySelector('a');
                        if (eventLink) {
                            const eventData = {
                                title: eventLink.textContent.trim(),
                                url: eventLink.href,
                                category: categoryName,
                                rawHtml: currentElement.parentElement.innerHTML
                            };
                            
                            // Look for date and description in following elements
                            let nextEl = currentElement.nextElementSibling;
                            while (nextEl && nextEl.tagName !== 'H3' && nextEl.tagName !== 'H2') {
                                const text = nextEl.textContent.trim();
                                
                                // Try to extract date
                                const dateMatch = text.match(/(\d{1,2}\.\s*\w+\s*\d{4})/);
                                if (dateMatch) {
                                    eventData.dateText = dateMatch[1];
                                }
                                
                                // Try to extract date range
                                const dateRangeMatch = text.match(/(\d{1,2}\.\s*\w+\s*bis\s*\d{1,2}\.\s*\w+\s*\d{4})/);
                                if (dateRangeMatch) {
                                    eventData.dateText = dateRangeMatch[1];
                                }
                                
                                // Extract description (usually the longest text block)
                                if (text.length > 50 && !eventData.description) {
                                    eventData.description = text.replace(/\s*\[mehr\].*$/, '').trim();
                                }
                                
                                nextEl = nextEl.nextElementSibling;
                            }
                            
                            eventSections.push(eventData);
                        }
                    }
                    currentElement = currentElement.nextElementSibling;
                }
            });
            
            return eventSections;
        });
        
        console.log(`📊 Found ${events.length} raw events from berlin.de`);
        
        // Apply kid-friendly filtering
        const filteredEvents = events.filter(event => this.isKidFriendly(event));
        console.log(`👶 ${filteredEvents.length} events passed kid-friendly filter`);
        
        // Enhance events with detailed information
        const enhancedEvents = [];
        for (const event of filteredEvents.slice(0, 20)) { // Limit for demo
            try {
                const detailedEvent = await this.scrapeEventDetails(event);
                
                // Apply additional filtering after getting details
                if (this.isKidFriendly(detailedEvent)) {
                    enhancedEvents.push(detailedEvent);
                }
            } catch (error) {
                console.warn(`⚠️ Could not enhance event: ${event.title}`, error.message);
                if (this.isKidFriendly(event)) {
                    enhancedEvents.push(event);
                }
            }
        }
        
        console.log(`✅ Final result: ${enhancedEvents.length} kid-friendly events`);
        return enhancedEvents;
    }

    /**
     * Enhanced event details scraping with better content analysis
     */
    async scrapeEventDetails(event) {
        if (!event.url || !event.url.startsWith('http')) {
            return event;
        }
        
        console.log(`📄 Getting details for: ${event.title}`);
        
        try {
            await this.page.goto(event.url, { waitUntil: 'networkidle2', timeout: 15000 });
            
            const details = await this.page.evaluate(() => {
                const result = {};
                const fullText = document.body.textContent.toLowerCase();
                
                // Try to find venue/location
                const locationSelectors = [
                    '[class*="location"]',
                    '[class*="venue"]',
                    '[class*="address"]',
                    'address',
                    '.event-location',
                    '.venue-name'
                ];
                
                for (const selector of locationSelectors) {
                    const element = document.querySelector(selector);
                    if (element && element.textContent.trim()) {
                        result.venue = element.textContent.trim();
                        break;
                    }
                }
                
                // Try to find full address
                const berlinAddressMatch = fullText.match(/([^,\n]+(?:straße|platz|damm|allee|ring|weg)[^,\n]*,?\s*\d{5}?\s*Berlin)/i);
                if (berlinAddressMatch) {
                    result.address = berlinAddressMatch[1].trim();
                }
                
                // Try to find time information
                const timeMatch = fullText.match(/(\d{1,2}:\d{2})/);
                if (timeMatch) {
                    result.time = timeMatch[1];
                }
                
                // Enhanced price detection
                const priceMatch = fullText.match(/(kostenlos|frei|gratis|eintritt\s*frei|(\d+[,.]?\d*)\s*€)/i);
                if (priceMatch) {
                    if (priceMatch[1].toLowerCase().includes('kostenlos') || 
                        priceMatch[1].toLowerCase().includes('frei') || 
                        priceMatch[1].toLowerCase().includes('gratis')) {
                        result.isFree = true;
                        result.price = 0;
                    } else if (priceMatch[2]) {
                        result.isFree = false;
                        result.price = parseFloat(priceMatch[2].replace(',', '.'));
                    }
                }
                
                // Store full text for age analysis
                result.fullText = fullText;
                
                return result;
            });
            
            // Enhanced age detection
            const ageInfo = this.extractAgeRange(details.fullText || '');
            details.minAge = ageInfo.minAge;
            details.maxAge = ageInfo.maxAge;
            
            return { ...event, ...details };
            
        } catch (error) {
            console.warn(`Could not get details for ${event.title}:`, error.message);
            return event;
        }
    }

    /**
     * Convert scraped data to Kinza event creator format with enhanced categorization
     */
    normalizeEventData(rawEvent) {
        // Apply smart categorization
        const categories = this.categorizeEvent(rawEvent);
        
        // Filter categories if specified
        const finalCategories = this.options.allowedCategories 
            ? categories.filter(cat => this.options.allowedCategories.includes(cat))
            : categories;
        
        const normalized = {
            // Required fields from event creator
            title: rawEvent.title || '',
            description: rawEvent.description || '',
            venue: rawEvent.venue || '',
            address: rawEvent.address || '',
            
            // Date/time handling
            startDate: this.parseDate(rawEvent.dateText),
            startTime: rawEvent.time || '10:00',
            
            // Enhanced age range
            minAge: rawEvent.minAge || 0,
            maxAge: rawEvent.maxAge || 18,
            
            // Pricing
            isFree: rawEvent.isFree !== false,
            price: rawEvent.price || 0,
            
            // Smart categorization
            categories: finalCategories,
            
            // Metadata
            source: rawEvent.url || 'scraped',
            sourceUrl: rawEvent.url,
            scrapedAt: new Date().toISOString(),
            kidFriendly: true, // All events passed kid-friendly filter
            
            // Default values for required fields
            cityId: 'berlin',
            images: [],
            organiser: {
                id: 'scraped',
                name: 'Berlin.de'
            }
        };
        
        return normalized;
    }

    // ... (keep existing parseDate, exportEvents, and other utility methods)
    
    parseDate(dateText) {
        if (!dateText) return new Date();
        
        const germanMonths = {
            'januar': 0, 'februar': 1, 'märz': 2, 'april': 3,
            'mai': 4, 'juni': 5, 'juli': 6, 'august': 7,
            'september': 8, 'oktober': 9, 'november': 10, 'dezember': 11
        };
        
        const match = dateText.match(/(\d{1,2})\.\s*(\w+)\s*(\d{4})/);
        if (match) {
            const day = parseInt(match[1]);
            const monthName = match[2].toLowerCase();
            const year = parseInt(match[3]);
            const month = germanMonths[monthName];
            
            if (month !== undefined) {
                return new Date(year, month, day);
            }
        }
        
        return new Date();
    }

    async exportEvents(events, format = 'json', filename = 'scraped-events') {
        const normalizedEvents = events.map(event => this.normalizeEventData(event));
        
        switch (format.toLowerCase()) {
            case 'json':
                const jsonData = JSON.stringify(normalizedEvents, null, 2);
                await fs.writeFile(`${filename}.json`, jsonData);
                console.log(`📁 Exported ${events.length} events to ${filename}.json`);
                break;
                
            case 'kinza':
                const kinzaData = normalizedEvents.map(event => ({
                    ...event,
                    status: 'pending',
                    approved: false,
                    views: 0,
                    saves: 0,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }));
                await fs.writeFile(`${filename}-kinza.json`, JSON.stringify(kinzaData, null, 2));
                console.log(`📁 Exported ${events.length} events to ${filename}-kinza.json (Kinza format)`);
                break;
        }
        
        return normalizedEvents;
    }
}

// Enhanced CLI Interface
async function main() {
    const args = process.argv.slice(2);
    const options = {
        kidsOnly: false,
        maxAge: 18,
        minAge: 0
    };
    
    // Parse command line arguments
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        if (arg === '--kids-only') {
            options.kidsOnly = true;
        } else if (arg === '--max-age') {
            options.maxAge = parseInt(args[++i]);
        } else if (arg === '--min-age') {
            options.minAge = parseInt(args[++i]);
        } else if (arg === '--categories') {
            options.allowedCategories = args[++i].split(',');
        } else if (arg.startsWith('--')) {
            const key = arg.replace('--', '');
            const value = args[++i];
            options[key] = value;
        }
    }
    
    console.log('🎯 Kid-Friendly Event Scraper Starting...');
    console.log(`📋 Configuration:`, options);
    
    const scraper = new BerlinEventScraper(options);
    
    try {
        await scraper.init();
        
        let events = [];
        
        if (options.url) {
            events = await scraper.scrapeBerlinWeekendTips(options.url);
        } else {
            // Default: scrape kid-friendly events
            events = await scraper.scrapeBerlinWeekendTips();
        }
        
        if (events.length > 0) {
            const outputFile = options.output ? options.output.replace(/\.[^/.]+$/, '') : 'kid-friendly-events';
            const format = options.format || 'kinza';
            
            const normalizedEvents = await scraper.exportEvents(events, format, outputFile);
            
            // Display enhanced summary
            console.log('\n📊 Kid-Friendly Scraping Summary:');
            console.log(`Total events: ${events.length}`);
            console.log(`Age range: ${normalizedEvents[0]?.minAge || 0}-${Math.max(...normalizedEvents.map(e => e.maxAge))}`);
            console.log(`Categories: ${[...new Set(normalizedEvents.flatMap(e => e.categories))].join(', ')}`);
            console.log(`Free events: ${normalizedEvents.filter(e => e.isFree).length}`);
            console.log(`With complete info: ${normalizedEvents.filter(e => e.venue && e.address).length}`);
            
        } else {
            console.log('❌ No kid-friendly events found with current filters');
        }
        
    } catch (error) {
        console.error('❌ Scraping failed:', error.message);
        process.exit(1);
    } finally {
        await scraper.close();
    }
}

module.exports = BerlinEventScraper;

if (require.main === module) {
    main().catch(console.error);
}
