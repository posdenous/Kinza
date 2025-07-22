# Complete Role Definitions - Kinza Berlin App

## 🎯 **All User Roles Clearly Defined**

### **👨‍👩‍👧‍👦 PARENT** - Primary Family User
**Definition:** Registered family user seeking age-appropriate events and activities for their children

#### **Key Characteristics:**
- **Child-focused:** Looking for kid-friendly events and activities
- **Safety-conscious:** Requires moderated, safe content
- **Community-oriented:** Wants to connect with other local families
- **Privacy-aware:** Needs strong child data protection

#### **Permissions:**
- ✅ View all age-appropriate events
- ✅ Save events to personal collections
- ✅ Comment and engage in community discussions
- ✅ Full map access with location services
- ✅ Edit profile and privacy settings
- ✅ Access child profile management (with consent)

#### **Unique Features:**
- **Age-based filtering** for events
- **Child profile management** (gated behind consent)
- **Parental controls** and privacy settings
- **Safety reporting** tools
- **Family-oriented recommendations**

---

### **📅 ORGANISER** - Event Creator & Host
**Definition:** Individual or small organization that creates and hosts events for families and children

#### **Key Characteristics:**
- **Event creators:** Individuals, schools, libraries, community groups
- **Non-commercial focus:** Community-driven, not primarily profit-focused
- **Local hosts:** Neighborhood-level event organizers
- **Verification required:** Must be verified to create public events

#### **Permissions:**
- ✅ All Parent permissions
- ✅ Create and edit their own events
- ✅ View analytics for their events
- ✅ Access Organiser Dashboard
- ✅ Manage event attendees and comments

#### **Unique Features:**
- **Event creation tools** with validation requirements
- **Event analytics** and attendance tracking
- **Organiser verification badge**
- **Event moderation** for their own events
- **Community reputation system**

#### **Examples:**
- Local parent organizing playground meetups
- Library hosting story time
- School organizing family events
- Community center hosting activities

---

### **🏢 PARTNER** - Business & Commercial Venue
**Definition:** Commercial businesses and venues that promote kid-friendly services and host events for revenue

#### **Key Characteristics:**
- **Commercial entities:** Businesses, restaurants, entertainment venues
- **Revenue-focused:** Events and promotions drive business
- **Professional services:** Established businesses with facilities
- **Marketing-oriented:** Promote their venue and services

#### **Permissions:**
- ✅ All Organiser permissions
- ✅ Enhanced business analytics
- ✅ Promotional features and highlighting
- ✅ Multiple location management
- ✅ Advanced event marketing tools

#### **Unique Features:**
- **Business profile** with hours, contact, website
- **Multiple venue locations**
- **Promotional event highlighting**
- **Revenue tracking and business analytics**
- **Partnership benefits** (featured placement, etc.)
- **Commercial event categories**

#### **Examples:**
- Restaurants with kids' menus and play areas
- Entertainment venues (bowling, mini golf, etc.)
- Educational businesses (music lessons, art classes)
- Retail stores hosting family events

---

### **👤 GUEST** - Unregistered Browser
**Definition:** Unregistered user with read-only access to public content

#### **Key Characteristics:**
- **Anonymous browsing:** No account or personal data
- **Exploration phase:** Deciding whether to register
- **Limited engagement:** Cannot interact or save content
- **Conversion target:** Should be encouraged to register

#### **Permissions:**
- ✅ View public events (limited details)
- ✅ Basic search and filtering
- ✅ Limited map view
- ❌ Cannot save, comment, or interact

#### **Conversion Paths:**
- **Save Event** → Register as Parent
- **Comment** → Register as Parent
- **Create Event** → Register as Organiser
- **Business Features** → Register as Partner

---

### **⚡ ADMIN** - Platform Administrator
**Definition:** Kinza team members and moderators responsible for platform governance and safety

#### **Key Characteristics:**
- **Platform governance:** Ensure safety and quality
- **Content moderation:** Review and approve user-generated content
- **User management:** Handle disputes and violations
- **System oversight:** Monitor platform health and usage

#### **Permissions:**
- ✅ All user permissions across all roles
- ✅ Content moderation and approval
- ✅ User management and suspension
- ✅ Platform analytics and insights
- ✅ System configuration and settings

#### **Unique Features:**
- **Admin Dashboard** with moderation queue
- **User management tools**
- **Content approval workflows**
- **Platform-wide analytics**
- **System health monitoring**

---

## 🔄 **Role Relationships & Hierarchies**

### **Permission Hierarchy:**
```
ADMIN > PARTNER ≥ ORGANISER > PARENT > GUEST
```

### **Role Progression Paths:**
1. **GUEST → PARENT** (most common conversion)
2. **GUEST → ORGANISER** (community leaders)
3. **GUEST → PARTNER** (businesses)
4. **PARENT → ORGANISER** (active community members)
5. **ORGANISER → PARTNER** (monetizing events)

### **Role Verification Levels:**
- **GUEST:** No verification needed
- **PARENT:** Email verification + optional child profile consent
- **ORGANISER:** Email + identity verification + community guidelines acceptance
- **PARTNER:** Business verification + commercial agreement
- **ADMIN:** Internal Kinza team only

---

## 🎯 **Key Distinctions**

### **ORGANISER vs PARTNER:**
| Aspect | ORGANISER | PARTNER |
|--------|-----------|---------|
| **Focus** | Community-driven | Revenue-driven |
| **Type** | Individual/Non-profit | Business/Commercial |
| **Events** | Free/Low-cost community events | Commercial events/services |
| **Verification** | Identity + community guidelines | Business license + commercial agreement |
| **Analytics** | Basic event metrics | Business intelligence + revenue tracking |
| **Promotion** | Standard listing | Enhanced/featured placement |

### **PARENT vs Other Roles:**
- **PARENT:** Consumer of events, child-focused
- **ORGANISER:** Creator of community events
- **PARTNER:** Creator of commercial events
- **ADMIN:** Platform governance
- **GUEST:** Anonymous browser

---

## 📋 **Business Rules by Role**

### **City Scoping:**
- **All roles** are scoped to their selected city
- **ADMIN** can access multiple cities but with clear boundaries

### **Content Moderation:**
- **GUEST:** See only approved content
- **PARENT/ORGANISER/PARTNER:** Can create content that requires moderation
- **ADMIN:** Can moderate and approve content

### **GDPR Compliance:**
- **GUEST:** Minimal anonymous data collection
- **PARENT:** Enhanced consent for child profiles
- **ORGANISER/PARTNER:** Business data handling agreements
- **ADMIN:** Full data access with strict governance

### **Authentication Requirements:**
- **GUEST:** No authentication
- **All others:** Email verification required
- **ORGANISER/PARTNER:** Additional verification steps
- **ADMIN:** Internal authentication system

---

## 🧪 **Testing Role Definitions**

### **Test Scenarios:**
1. **Role-specific screen access** - Verify each role sees appropriate screens
2. **Permission enforcement** - Test that restricted actions are properly blocked
3. **Role conversion flows** - Test Guest → registered user paths
4. **Cross-role interactions** - Verify proper data scoping and access
5. **Business rule compliance** - Test city scoping, moderation, consent

### **Success Criteria:**
- ✅ Each role has clear, distinct purpose and permissions
- ✅ No permission overlaps or conflicts
- ✅ Clear conversion paths between roles
- ✅ Proper business rule enforcement
- ✅ GDPR and safety compliance for all roles

---

## 📊 **Summary**

All roles are now clearly defined with:
- **Distinct purposes** and target users
- **Clear permission boundaries** and capabilities
- **Logical progression paths** between roles
- **Business rule compliance** for safety and privacy
- **Testable characteristics** for validation

This role system supports the Kinza Berlin app's mission of connecting families with safe, age-appropriate local events while enabling community organizers and businesses to reach their target audience effectively.
