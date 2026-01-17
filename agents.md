# Agents

Documentation for agents in this project.

## Implementation: High-Rated Popular Shows

### Changes Made

#### 1. **Enhanced Data Type** ([lib/tvmaze.ts](lib/tvmaze.ts#L1-L12))
- Added `rating?: number | null` field to `ShowWithNext` type
- Enables tracking and filtering shows by quality/rating

#### 2. **Rating Extraction from APIs** ([lib/tvmaze.ts](lib/tvmaze.ts))

**TMDB API Integration:**
- Extracts `vote_average` from TMDB API response (0-10 scale)
- Now included in show objects returned from TMDB source

**TV Maze Fallback:**
- Extracts `show.rating.average` from TV Maze schedule endpoint
- Preserves rating data when using TV Maze as fallback source

#### 3. **Rating-Based Filtering & Sorting** ([app/page.tsx](app/page.tsx#L5-L36))

**Filtering Strategy:**
- **Minimum Rating Threshold:** 7.0/10 (configurable)
- Only shows with ratings ≥ 7.0 are displayed
- Must also have an upcoming/future airstamp
- Eliminates low-quality or unrated shows

**Sorting Strategy:**
- **Primary Sort:** By rating (highest first) - shows highly-rated content first
- **Secondary Sort:** By nearest airstamp - within same rating tier, soonest episodes first

#### 4. **UI Enhancements** ([components/ShowCard.tsx](components/ShowCard.tsx#L43-L58))

**Rating Badge Display:**
- Shows star rating (★) next to show title
- Styled with amber/gold gradient background
- Only displays when rating data is available
- Format: `★ 8.2` (one decimal place)

### Result

The application now:
✅ Displays only high-quality shows (rating ≥ 7.0)
✅ Prioritizes highly-rated upcoming shows first
✅ Sorts secondarily by air date (soonest first)
✅ Shows ratings visually on each show card
✅ Featured show is now the highest-rated with an upcoming episode
✅ Provides better user experience by focusing on quality content
