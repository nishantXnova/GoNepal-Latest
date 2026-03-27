import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from '@/utils/logger';
import {
  cachePhrases,
  cacheNews,
  getCachedPhrases,
  getCachedNews,
  getPhrasesByCategory,
  searchPhrases,
  PhraseEntry,
  NewsCacheItem,
  isOnline,
  syncFromSupabase
} from '@/lib/offlineDatabase';

// Supabase environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client (only if credentials exist)
export const supabase: SupabaseClient | null = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ============================================================================
// Phrase Sync from Supabase
// ============================================================================

/**
 * Fetch phrases from Supabase and return as PhraseEntry[]
 */
export const fetchPhrasesFromSupabase = async (): Promise<PhraseEntry[]> => {
  if (!supabase) {
    logger.warn('[SupabaseSync] Supabase not configured, using default phrases');
    return getDefaultPhrases();
  }

  try {
    const { data, error } = await supabase
      .from('phrases')
      .select('*')
      .order('category', { ascending: true });

    if (error) {
      logger.error('[SupabaseSync] Error fetching phrases:', error);
      return getDefaultPhrases();
    }

    if (data && data.length > 0) {
      // Transform Supabase data to PhraseEntry format
      return data.map(item => ({
        english: item.english || item.en || '',
        nepali: item.nepali || item.ne || '',
        pronunciation: item.pronunciation || '',
        category: item.category || 'Common',
        cachedAt: Date.now()
      }));
    }

    return getDefaultPhrases();
  } catch (error) {
    logger.error('[SupabaseSync] Phrase fetch failed:', error);
    return getDefaultPhrases();
  }
};

/**
 * Default phrases embedded in bundle for offline use
 * (These work without any network connection)
 */
const getDefaultPhrases = (): PhraseEntry[] => {
  const defaultPhrases: PhraseEntry[] = [
    // Greetings
    { english: 'Hello / Greetings', nepali: 'नमस्ते', pronunciation: 'Namaste', category: 'Greetings', cachedAt: Date.now() },
    { english: 'How are you?', nepali: 'तपाईंलाई कस्तो छ?', pronunciation: 'Tapailai kasto chha?', category: 'Greetings', cachedAt: Date.now() },
    { english: 'I am fine', nepali: 'म ठीक छु', pronunciation: 'Ma thik chhu', category: 'Greetings', cachedAt: Date.now() },
    { english: 'Thank you', nepali: 'धन्यवाद', pronunciation: 'Dhanyabad', category: 'Greetings', cachedAt: Date.now() },
    { english: "You're welcome", nepali: 'स्वागत छ', pronunciation: 'Swagat chha', category: 'Greetings', cachedAt: Date.now() },
    { english: 'Goodbye', nepali: 'नमस्ते', pronunciation: 'Namaste', category: 'Greetings', cachedAt: Date.now() },
    { english: 'Please', nepali: 'कृपया', pronunciation: 'Kripaya', category: 'Greetings', cachedAt: Date.now() },
    { english: 'Excuse me / Sorry', nepali: 'माफ गर्नुहोस', pronunciation: 'Maaf garnuhos', category: 'Greetings', cachedAt: Date.now() },
    
    // Directions
    { english: 'Where is ...?', nepali: '... कहाँ छ?', pronunciation: '... kaha chha?', category: 'Directions', cachedAt: Date.now() },
    { english: 'Left', nepali: 'बायाँ', pronunciation: 'Bayaa', category: 'Directions', cachedAt: Date.now() },
    { english: 'Right', nepali: 'दायाँ', pronunciation: 'Dayaa', category: 'Directions', cachedAt: Date.now() },
    { english: 'Straight ahead', nepali: 'सीधा', pronunciation: 'Sidha', category: 'Directions', cachedAt: Date.now() },
    { english: 'How far is it?', nepali: 'कति टाडा छ?', pronunciation: 'Kati tadha chha?', category: 'Directions', cachedAt: Date.now() },
    { english: 'Near / Close', nepali: 'नजिक', pronunciation: 'Najik', category: 'Directions', cachedAt: Date.now() },
    { english: 'Far', nepali: 'टाडा', pronunciation: 'Tadha', category: 'Directions', cachedAt: Date.now() },
    { english: 'Map', nepali: 'नक्सा', pronunciation: 'Naksa', category: 'Directions', cachedAt: Date.now() },
    
    // Food & Drink
    { english: 'Water', nepali: 'पानी', pronunciation: 'Paani', category: 'Food & Drink', cachedAt: Date.now() },
    { english: 'Food / Meal', nepali: 'खाना', pronunciation: 'Khaana', category: 'Food & Drink', cachedAt: Date.now() },
    { english: 'Rice', nepali: 'भात', pronunciation: 'Bhaat', category: 'Food & Drink', cachedAt: Date.now() },
    { english: 'Tea', nepali: 'चिया', pronunciation: 'Chiya', category: 'Food & Drink', cachedAt: Date.now() },
    { english: 'Delicious', nepali: 'मिठो', pronunciation: 'Mitho', category: 'Food & Drink', cachedAt: Date.now() },
    { english: 'I am vegetarian', nepali: 'म शाकाहारी हुँ', pronunciation: 'Ma shaakaahaari hun', category: 'Food & Drink', cachedAt: Date.now() },
    { english: 'The bill, please', nepali: 'बिल दिनुहोस', pronunciation: 'Bill dinuhos', category: 'Food & Drink', cachedAt: Date.now() },
    { english: 'Dal (Lentil soup)', nepali: 'दाल', pronunciation: 'Daal', category: 'Food & Drink', cachedAt: Date.now() },
    
    // Shopping
    { english: 'How much is this?', nepali: 'यो कति हो?', pronunciation: 'Yo kati ho?', category: 'Shopping', cachedAt: Date.now() },
    { english: 'Too expensive', nepali: 'धेरै महँगो', pronunciation: 'Dherai mahango', category: 'Shopping', cachedAt: Date.now() },
    { english: 'Can you reduce the price?', nepali: 'केही कम गर्न सक्नुहुन्छ?', pronunciation: 'Kehi kam garna saknuhunchha?', category: 'Shopping', cachedAt: Date.now() },
    { english: 'I want to buy', nepali: 'म किन्न चाहन्छु', pronunciation: 'Ma kinna chahanchu', category: 'Shopping', cachedAt: Date.now() },
    
    // Emergency
    { english: 'Help!', nepali: 'मद्दत!', pronunciation: 'Madad!', category: 'Emergency', cachedAt: Date.now() },
    { english: 'I need a doctor', nepali: 'मलाई डाक्टर चाहियो', pronunciation: 'Malai doctor chahiyo', category: 'Emergency', cachedAt: Date.now() },
    { english: 'Call an ambulance', nepali: 'एम्बुलेन्स बोलाउनुहोस', pronunciation: 'Ambulance bolauhnuhos', category: 'Emergency', cachedAt: Date.now() },
    { english: 'I am lost', nepali: 'म हराएँ', pronunciation: 'Ma haraen', category: 'Emergency', cachedAt: Date.now() },
    { english: 'Where is the police?', nepali: 'प्रहरी कहाँ छ?', pronunciation: 'Police kaha chha?', category: 'Emergency', cachedAt: Date.now() },
    { english: 'I am not feeling well', nepali: 'म राम्रो महसुस गर्दिनँ', pronunciation: 'Ma ramro mahsus gardainan', category: 'Emergency', cachedAt: Date.now() },
    { english: 'Altitude sickness', nepali: 'उच्च रक्तचाप', pronunciation: 'Uchha raktachap', category: 'Emergency', cachedAt: Date.now() },
    { english: 'Hypothermia', nepali: 'शीतदंश', pronunciation: 'Sheetdansh', category: 'Emergency', cachedAt: Date.now() },
    
    // Transport
    { english: 'Bus station', nepali: 'बस स्टेशन', pronunciation: 'Bus station', category: 'Transport', cachedAt: Date.now() },
    { english: 'Airport', nepali: 'विमानस्थल', pronunciation: 'Vimansthal', category: 'Transport', cachedAt: Date.now() },
    { english: 'Jeep', nepali: 'जिप', pronunciation: 'Jeep', category: 'Transport', cachedAt: Date.now() },
    { english: 'How much to ...?', nepali: '... कति?', pronunciation: '... kati?', category: 'Transport', cachedAt: Date.now() },
    
    // Accommodation
    { english: 'Hotel', nepali: 'होटेल', pronunciation: 'Hotel', category: 'Accommodation', cachedAt: Date.now() },
    { english: 'Guesthouse', nepali: 'गेस्ट हाउस', pronunciation: 'Guest house', category: 'Accommodation', cachedAt: Date.now() },
    { english: 'Room', nepali: 'कोठा', pronunciation: 'Kotha', category: 'Accommodation', cachedAt: Date.now() },
    { english: 'Bed', nepali: 'बिस्ता', pronunciation: 'Bista', category: 'Accommodation', cachedAt: Date.now() },
    { english: 'Hot shower', nepali: 'उष्ण धारा', pronunciation: 'Usna dhara', category: 'Accommodation', cachedAt: Date.now() },
    
    // Numbers
    { english: 'One', nepali: 'एक', pronunciation: 'Ek', category: 'Numbers', cachedAt: Date.now() },
    { english: 'Two', nepali: 'दुई', pronunciation: 'Dui', category: 'Numbers', cachedAt: Date.now() },
    { english: 'Three', nepali: 'तीन', pronunciation: 'Tin', category: 'Numbers', cachedAt: Date.now() },
    { english: 'Four', nepali: 'चार', pronunciation: 'Char', category: 'Numbers', cachedAt: Date.now() },
    { english: 'Five', nepali: 'पाँच', pronunciation: 'Pach', category: 'Numbers', cachedAt: Date.now() },
    { english: 'Ten', nepali: 'दश', pronunciation: 'Dash', category: 'Numbers', cachedAt: Date.now() },
    { english: 'Twenty', nepali: 'बिस', pronunciation: 'Bis', category: 'Numbers', cachedAt: Date.now() },
    { english: 'Hundred', nepali: 'सय', pronunciation: 'Say', category: 'Numbers', cachedAt: Date.now() },
  ];

  return defaultPhrases;
};

// ============================================================================
// News Sync from Supabase
// ============================================================================

/**
 * Fetch news from Supabase and return as NewsCacheItem[]
 */
export const fetchNewsFromSupabase = async (): Promise<NewsCacheItem[]> => {
  if (!supabase) {
    logger.warn('[SupabaseSync] Supabase not configured');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('pubDate', { ascending: false })
      .limit(20);

    if (error) {
      logger.error('[SupabaseSync] Error fetching news:', error);
      return [];
    }

    if (data && data.length > 0) {
      return data.map(item => ({
        title: item.title || '',
        link: item.link || '',
        pubDate: item.pubDate || new Date().toISOString(),
        thumbnail: item.thumbnail || '',
        source: item.source || 'GoNepal',
        isEmergency: item.isEmergency || false,
        lastUpdated: item.lastUpdated || new Date().toLocaleTimeString(),
        cachedAt: Date.now()
      }));
    }

    return [];
  } catch (error) {
    logger.error('[SupabaseSync] News fetch failed:', error);
    return [];
  }
};

// ============================================================================
// Main Sync Function
// ============================================================================

/**
 * Initialize offline data - called on app startup
 * If online: fetches from Supabase and caches
 * If offline: uses already cached data
 */
export const initializeOfflineData = async (): Promise<void> => {
  logger.log('[SupabaseSync] Initializing offline data...');

  if (!isOnline()) {
    logger.log('[SupabaseSync] Offline - using cached data');
    return;
  }

  try {
    // First, try to sync from Supabase
    const phrases = await fetchPhrasesFromSupabase();
    await cachePhrases(phrases);
    logger.log(`[SupabaseSync] Cached ${phrases.length} phrases`);

    // News will be fetched separately as it's more dynamic
    // This is handled by the news service itself
  } catch (error) {
    logger.error('[SupabaseSync] Initialization error:', error);
  }

  logger.log('[SupabaseSync] Offline data initialized');
};

// ============================================================================
// Export combined sync for use in app
// ============================================================================

export const syncOfflineData = async (): Promise<void> => {
  await syncFromSupabase(
    supabase,
    fetchPhrasesFromSupabase,
    fetchNewsFromSupabase
  );
};

// Export individual getters for use in components
export {
  getCachedPhrases,
  getCachedNews,
  getPhrasesByCategory,
  searchPhrases,
  isOnline,
  cachePhrases,
  cacheNews
};
