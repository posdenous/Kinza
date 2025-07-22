# Guest Role Definition - Kinza Berlin App

## 🎯 **Clear Definition**

**Guest** = **Unregistered user with read-only access to public content**

### **What is a Guest User?**
- **Unregistered visitors** who haven't created an account
- **Anonymous browsers** exploring the app before deciding to register
- **Temporary users** who want to see what's available without commitment
- **NOT registered users** who haven't completed onboarding (those would be incomplete Parent/Organiser profiles)

## 🔐 **Guest Permissions & Restrictions**

### **✅ What Guests CAN Do:**

#### **Public Content Access:**
- **View Events** - Browse all public events in their city
- **Search Events** - Use search functionality with filters
- **View Map** - See limited map view with event locations
- **Event Details** - View full event information and descriptions

#### **Basic Navigation:**
- **Home Screen** - Browse events (without personalization)
- **Search Screen** - Find events by criteria
- **Map Screen** - Geographic event discovery
- **Event Detail Screen** - Read event information

### **❌ What Guests CANNOT Do:**

#### **Interactive Features:**
- **Save Events** - Cannot bookmark or save events for later
- **Comment** - Cannot post comments or engage in discussions
- **Create Content** - Cannot submit events, reviews, or any UGC
- **Personalization** - No personalized recommendations or preferences

#### **Account Features:**
- **Profile Management** - No profile creation or editing
- **Privacy Settings** - No access to privacy controls
- **Saved Events List** - No personal event collections
- **Notifications** - No push notifications or alerts

#### **Business Features:**
- **Event Creation** - Cannot create or manage events
- **Dashboard Access** - No access to any dashboard screens
- **Analytics** - No access to usage analytics or insights

## 🚧 **Guest Experience Limitations**

### **Limited Map View:**
- **Basic location markers** only
- **No personalized location services**
- **No "nearby events" based on precise location**
- **No location history or preferences**

### **Reduced Home Screen:**
- **Generic event feed** without personalization
- **No "recommended for you" sections**
- **No "based on your interests" filtering**
- **Standard chronological or popularity sorting only**

### **Search Limitations:**
- **Can search and filter events**
- **Cannot save search queries or preferences**
- **No search history**
- **No personalized search suggestions**

## 🔄 **Guest to Registered User Flow**

### **Conversion Triggers:**
1. **Save Event** - Prompt to register when trying to save
2. **Comment** - Prompt to register when trying to comment
3. **Create Event** - Redirect to organiser registration
4. **Location Services** - Prompt for registration for personalized location features

### **Registration Options:**
- **Become Parent** - For families looking for kid-friendly events
- **Become Organiser** - For venues/hosts wanting to create events
- **Become Partner** - For businesses promoting kid-friendly places

## 🏛️ **Business Rules for Guests**

### **City Scoping:**
- **Guests are still city-scoped** based on their location/selection
- **Cannot access cross-city data**
- **Must select a city to browse content**

### **Content Moderation:**
- **Guests only see approved, moderated content**
- **Cannot contribute content that requires moderation**
- **No access to moderation tools or status**

### **GDPR Compliance:**
- **Minimal data collection** for guests
- **No persistent user tracking without consent**
- **Basic analytics only (anonymous, aggregated)**
- **No personal data storage**

## 📱 **Guest UI/UX Patterns**

### **Call-to-Action Placement:**
- **"Sign up to save this event"** buttons on event cards
- **"Register to comment"** prompts in comment sections
- **"Create account for personalized recommendations"** banners

### **Feature Teasing:**
- **Show what's available** after registration
- **Highlight premium features** (saving, commenting, creating)
- **Progressive disclosure** of functionality

### **Conversion Optimization:**
- **Clear value proposition** for registration
- **Easy registration flow** from any conversion point
- **Social proof** showing community engagement

## 🔍 **Testing Guest Role**

### **Test Scenarios:**
1. **Browse without account** - Verify read-only access works
2. **Attempt restricted actions** - Confirm proper registration prompts
3. **City switching** - Verify city scoping works for guests
4. **Search functionality** - Confirm search works without saving
5. **Event detail viewing** - Verify full content access without interaction features

### **Expected Behaviors:**
- **Graceful degradation** when features require authentication
- **Clear messaging** about what registration unlocks
- **Consistent UI** that doesn't break for missing user data
- **Proper error handling** for unauthorized actions

## 📊 **Guest Analytics**

### **Trackable Metrics:**
- **Page views** and **session duration**
- **Search queries** and **filter usage**
- **Event views** and **popular content**
- **Conversion funnel** from guest to registered user

### **Privacy Considerations:**
- **Anonymous tracking** only
- **No personal identifiers**
- **Aggregated data** for insights
- **GDPR-compliant** minimal data collection

---

## 🎯 **Summary**

The **Guest role** is now clearly defined as **unregistered users with read-only access to public content**. They can explore and discover events but must register to interact, save, or personalize their experience. This creates a clear value proposition for registration while still allowing meaningful exploration of the app's content.
