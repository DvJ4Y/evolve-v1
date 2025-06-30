# Evolve AI MVP - Comprehensive Test Plan

## Overview
This document outlines extensive test cases for the Evolve AI MVP launch, covering all features mentioned in the MVP plan. Tests are organized by feature area with clear pass/fail criteria.

---

## F1: User Authentication & Basic Profile Setup

### Test Case 1.1: Google OAuth Sign-Up Flow
**Objective**: Verify new users can sign up using Google OAuth simulation

**Pre-conditions**: 
- App is loaded
- No existing user session
- Clear browser storage

**Test Steps**:
1. Open the application
2. Verify welcome screen displays with "Welcome to Evolve AI" message
3. Click "Continue with Google" button
4. Verify loading state appears briefly
5. Verify successful sign-up with demo user data

**Expected Results**:
- Welcome screen shows glassmorphic card with app branding
- Google button is prominent and accessible
- Success toast appears: "Welcome to Evolve AI!"
- User is redirected to onboarding flow
- User data is stored in localStorage

**Pass Criteria**: ✅ All steps complete without errors

---

### Test Case 1.2: Returning User Sign-In
**Objective**: Verify returning users can sign in and skip onboarding

**Pre-conditions**: 
- User has completed onboarding previously
- User data exists in localStorage with primaryWellnessGoal

**Test Steps**:
1. Clear current session (sign out)
2. Reload application
3. Click "Continue with Google"
4. Verify user bypasses onboarding
5. Verify direct navigation to dashboard

**Expected Results**:
- Welcome toast: "Welcome back!"
- No onboarding screen shown
- Dashboard loads with user's existing data
- User profile shows completed information

**Pass Criteria**: ✅ User reaches dashboard directly

---

### Test Case 1.3: Session Persistence
**Objective**: Verify user sessions persist across browser refreshes

**Pre-conditions**: 
- User is signed in and has completed onboarding

**Test Steps**:
1. Complete sign-in and onboarding
2. Navigate to dashboard
3. Refresh browser page
4. Verify user remains signed in
5. Verify dashboard data loads correctly

**Expected Results**:
- No re-authentication required
- Dashboard loads with user data
- No loading delays or errors

**Pass Criteria**: ✅ Session persists without re-authentication

---

### Test Case 1.4: Sign Out Functionality
**Objective**: Verify users can sign out and clear session data

**Pre-conditions**: 
- User is signed in

**Test Steps**:
1. Click "Sign Out" button (debug button in top-right)
2. Verify sign-out toast appears
3. Verify redirect to welcome screen
4. Verify localStorage is cleared
5. Attempt to access dashboard directly

**Expected Results**:
- Toast: "Signed Out - See you next time!"
- Welcome screen displays
- localStorage 'evolve_user' key is removed
- Dashboard access redirects to welcome screen

**Pass Criteria**: ✅ Complete session cleanup and redirect

---

## F2: Streamlined Onboarding - Core Data Collection

### Test Case 2.1: Onboarding Form Validation
**Objective**: Verify onboarding form validates required fields

**Pre-conditions**: 
- New user has signed up
- Onboarding screen is displayed

**Test Steps**:
1. Leave age field empty, click "Complete Setup"
2. Verify validation error appears
3. Enter age, leave goal field empty, click "Complete Setup"
4. Verify validation error appears
5. Enter invalid age (e.g., 0, 150), click "Complete Setup"
6. Verify validation handles edge cases

**Expected Results**:
- Error toast: "Please complete all fields"
- Form submission is blocked
- Age validation accepts 13-120 range
- Goal field requires non-empty text

**Pass Criteria**: ✅ All validation rules enforced

---

### Test Case 2.2: Successful Onboarding Completion
**Objective**: Verify complete onboarding flow with valid data

**Pre-conditions**: 
- New user on onboarding screen

**Test Steps**:
1. Enter valid age (e.g., 28)
2. Enter meaningful wellness goal (e.g., "I want to exercise regularly and reduce stress")
3. Click "Complete Setup"
4. Verify loading state during submission
5. Verify success toast and redirect to dashboard

**Expected Results**:
- Button shows "Setting up..." during loading
- Success toast: "Welcome to Evolve AI!"
- Redirect to /mvp-dashboard
- User data updated in localStorage
- Dashboard shows personalized greeting

**Pass Criteria**: ✅ Smooth onboarding completion

---

### Test Case 2.3: Onboarding Data Persistence
**Objective**: Verify onboarding data is correctly saved and retrievable

**Pre-conditions**: 
- User completes onboarding

**Test Steps**:
1. Complete onboarding with specific data
2. Navigate to dashboard
3. Verify user's goal appears in "Your Goal" section
4. Sign out and sign back in
5. Verify data persists

**Expected Results**:
- Goal text displays exactly as entered
- Age is stored (though not displayed in MVP)
- Data survives sign-out/sign-in cycle

**Pass Criteria**: ✅ Data persistence verified

---

### Test Case 2.4: Onboarding UI/UX Validation
**Objective**: Verify onboarding interface meets design requirements

**Pre-conditions**: 
- Onboarding screen loaded

**Test Steps**:
1. Verify glassmorphic card styling
2. Check form field accessibility
3. Verify responsive design on different screen sizes
4. Test keyboard navigation
5. Verify visual feedback for interactions

**Expected Results**:
- Clean, modern glassmorphic design
- Form fields have proper labels and placeholders
- Touch-friendly button sizing (44px minimum)
- Keyboard tab order is logical
- Hover/focus states work correctly

**Pass Criteria**: ✅ UI meets design standards

---

## F3: Voice/Chat-First Activity Logging Interface & AI Core

### Test Case 3.1: Voice Button Visibility and Accessibility
**Objective**: Verify voice button is prominent and accessible

**Pre-conditions**: 
- User is on dashboard

**Test Steps**:
1. Verify voice button is visible in bottom-center
2. Check 3D shadow effects are applied
3. Verify button size meets touch targets (44px+)
4. Test hover/press animations
5. Verify button remains visible during scroll

**Expected Results**:
- Large, prominent orange gradient button
- 3D shadow effects with blur and glow
- Smooth hover/press animations
- Button floats above bottom navigation
- Accessible touch target size

**Pass Criteria**: ✅ Voice button meets design and accessibility standards

---

### Test Case 3.2: Voice Recording Activation
**Objective**: Verify voice recording starts correctly

**Pre-conditions**: 
- Browser supports speech recognition
- User grants microphone permissions

**Test Steps**:
1. Click voice button
2. Verify voice overlay appears
3. Check microphone icon animation
4. Verify "Listening..." status
5. Grant microphone permissions if prompted

**Expected Results**:
- Full-screen overlay with glassmorphic design
- Animated microphone icon
- "Listening..." text displayed
- Browser requests microphone permission
- Recording starts after permission granted

**Pass Criteria**: ✅ Voice recording activates successfully

---

### Test Case 3.3: Speech-to-Text Functionality
**Objective**: Verify speech is correctly transcribed

**Pre-conditions**: 
- Voice recording is active
- Microphone permissions granted

**Test Steps**:
1. Speak clearly: "I did a 30 minute workout"
2. Verify real-time transcription (if available)
3. Stop recording
4. Verify final transcript accuracy
5. Test with different speech patterns and accents

**Expected Results**:
- Speech is accurately transcribed
- Final transcript captures complete sentence
- Works with various speaking styles
- Handles background noise reasonably

**Pass Criteria**: ✅ Transcription accuracy >80% for clear speech

---

### Test Case 3.4: AI Intent Classification - Workout Activities
**Objective**: Verify AI correctly classifies workout-related activities

**Pre-conditions**: 
- Voice logging system is active

**Test Inputs & Expected Classifications**:
1. "I did a 30 minute workout" → **workout**
2. "Went for a 5km run this morning" → **workout**
3. "Completed my strength training session" → **workout**
4. "Did yoga for 45 minutes" → **workout**
5. "Played basketball for an hour" → **workout**

**Test Steps**:
1. Input each test phrase via voice or text
2. Verify AI classification in activity log
3. Check extracted keywords are relevant
4. Verify confidence scores are reasonable

**Expected Results**:
- All workout activities classified as "workout"
- Keywords include: workout, run, training, yoga, basketball
- Duration extracted when mentioned
- Confidence scores >0.7

**Pass Criteria**: ✅ 100% correct classification for workout activities

---

### Test Case 3.5: AI Intent Classification - Food Intake
**Objective**: Verify AI correctly classifies food-related activities

**Test Inputs & Expected Classifications**:
1. "I had chicken salad for lunch" → **food_intake**
2. "Ate an apple as a snack" → **food_intake**
3. "Drank a protein shake after workout" → **food_intake**
4. "Had dinner with friends at a restaurant" → **food_intake**
5. "Cooked a healthy breakfast this morning" → **food_intake**

**Test Steps**:
1. Input each test phrase
2. Verify classification accuracy
3. Check food-related keywords extraction
4. Verify meal timing recognition

**Expected Results**:
- All food activities classified as "food_intake"
- Keywords include: chicken, salad, apple, protein, dinner
- Meal times extracted: lunch, snack, dinner, breakfast
- Relevant nutritional terms identified

**Pass Criteria**: ✅ 100% correct classification for food activities

---

### Test Case 3.6: AI Intent Classification - Supplements
**Objective**: Verify AI correctly classifies supplement intake

**Test Inputs & Expected Classifications**:
1. "Took my daily multivitamin" → **supplement_intake**
2. "Had my Vitamin D supplement" → **supplement_intake**
3. "Took omega-3 fish oil capsules" → **supplement_intake**
4. "Had my morning supplements" → **supplement_intake**
5. "Took magnesium before bed" → **supplement_intake**

**Test Steps**:
1. Input each test phrase
2. Verify classification accuracy
3. Check supplement name extraction
4. Verify timing recognition

**Expected Results**:
- All supplement activities classified as "supplement_intake"
- Keywords include: multivitamin, Vitamin D, omega-3, magnesium
- Timing extracted: daily, morning, before bed
- Supplement types correctly identified

**Pass Criteria**: ✅ 100% correct classification for supplement activities

---

### Test Case 3.7: AI Intent Classification - Meditation
**Objective**: Verify AI correctly classifies meditation activities

**Test Inputs & Expected Classifications**:
1. "Meditated for 15 minutes" → **meditation**
2. "Did breathing exercises" → **meditation**
3. "Practiced mindfulness meditation" → **meditation**
4. "Had a 10 minute meditation session" → **meditation**
5. "Did some deep breathing to relax" → **meditation**

**Test Steps**:
1. Input each test phrase
2. Verify classification accuracy
3. Check meditation-related keywords
4. Verify duration extraction

**Expected Results**:
- All meditation activities classified as "meditation"
- Keywords include: meditated, breathing, mindfulness, relaxation
- Duration extracted: 15 minutes, 10 minutes
- Meditation techniques identified

**Pass Criteria**: ✅ 100% correct classification for meditation activities

---

### Test Case 3.8: AI Intent Classification - General Activities
**Objective**: Verify AI handles user-specific goal activities

**Pre-conditions**: 
- User's goal: "I want to learn programming and be creative"

**Test Inputs & Expected Classifications**:
1. "Studied Python for 2 hours" → **general_activity_log**
2. "Worked on my art project" → **general_activity_log**
3. "Read a book about mindfulness" → **general_activity_log**
4. "Practiced guitar for 30 minutes" → **general_activity_log**
5. "Wrote in my journal" → **general_activity_log**

**Test Steps**:
1. Set user goal related to learning/creativity
2. Input each test phrase
3. Verify classification as general activity
4. Check goal-relevant keyword extraction

**Expected Results**:
- Activities classified as "general_activity_log"
- Keywords relate to user's stated goals
- Duration extracted when mentioned
- Context-aware classification

**Pass Criteria**: ✅ Correct classification for goal-related activities

---

### Test Case 3.9: Voice Logging Error Handling
**Objective**: Verify system handles voice logging errors gracefully

**Test Scenarios**:
1. **No microphone permission**: Deny microphone access
2. **Network error**: Disconnect internet during processing
3. **Empty speech**: Record silence or unclear speech
4. **API failure**: Simulate Gemini API error
5. **Very long input**: Speak for >2 minutes continuously

**Test Steps**:
1. Trigger each error scenario
2. Verify appropriate error messages
3. Check system recovery
4. Verify user can retry

**Expected Results**:
- Clear error messages for each scenario
- No app crashes or freezes
- Graceful fallback to manual input
- Retry functionality available

**Pass Criteria**: ✅ All error scenarios handled gracefully

---

### Test Case 3.10: Voice Overlay UI/UX
**Objective**: Verify voice overlay provides good user experience

**Pre-conditions**: 
- Voice recording is active

**Test Steps**:
1. Verify overlay covers full screen
2. Check glassmorphic background blur
3. Verify microphone animation during recording
4. Test "Stop Recording" button functionality
5. Check overlay dismissal on completion

**Expected Results**:
- Full-screen overlay with backdrop blur
- Animated microphone icon shows recording state
- Clear visual feedback for listening state
- Easy-to-access stop button
- Smooth overlay transitions

**Pass Criteria**: ✅ Voice overlay meets UX standards

---

## F4: Basic Activity Viewer

### Test Case 4.1: Activity List Display
**Objective**: Verify recent activities display correctly

**Pre-conditions**: 
- User has logged several activities

**Test Steps**:
1. Navigate to dashboard
2. Verify "Recent Activities" section exists
3. Check activity cards display properly
4. Verify chronological ordering (newest first)
5. Verify activity limit (10 activities shown)

**Expected Results**:
- Activities section clearly labeled
- Each activity in glassmorphic card
- Newest activities appear first
- Maximum 10 activities displayed
- Clean, readable layout

**Pass Criteria**: ✅ Activity list displays correctly

---

### Test Case 4.2: Activity Card Information
**Objective**: Verify each activity card shows complete information

**Pre-conditions**: 
- Activities with various data types exist

**Test Steps**:
1. Log activity with duration: "Meditated for 20 minutes"
2. Log activity with keywords: "Did strength training with weights"
3. Verify each card shows:
   - Intent badge with correct color
   - Original text input
   - Extracted keywords (up to 3)
   - Duration when available
   - Timestamp ("X minutes ago")

**Expected Results**:
- Intent badges color-coded correctly
- Original speech text in quotes
- Relevant keywords displayed as pills
- Duration shown when extracted
- Relative timestamps accurate

**Pass Criteria**: ✅ All activity information displayed correctly

---

### Test Case 4.3: Empty State Handling
**Objective**: Verify appropriate display when no activities exist

**Pre-conditions**: 
- New user with no logged activities

**Test Steps**:
1. Complete onboarding as new user
2. Navigate to dashboard
3. Verify empty state message
4. Check call-to-action guidance
5. Verify example suggestions

**Expected Results**:
- Friendly empty state with emoji
- Clear guidance: "Start Your Journey"
- Helpful example phrases provided
- Encouragement to use voice button

**Pass Criteria**: ✅ Empty state is helpful and encouraging

---

### Test Case 4.4: Activity Badge Color Coding
**Objective**: Verify intent badges use correct colors

**Test Data**:
- workout → Orange badge
- food_intake → Green badge  
- supplement_intake → Blue badge
- meditation → Purple badge
- general_activity_log → Gray badge

**Test Steps**:
1. Log one activity of each type
2. Verify badge colors match specification
3. Check color contrast for accessibility
4. Verify badge text is readable

**Expected Results**:
- Each intent type has distinct color
- Colors match design specification
- Sufficient contrast for readability
- Consistent styling across badges

**Pass Criteria**: ✅ All badge colors correct and accessible

---

### Test Case 4.5: Real-time Activity Updates
**Objective**: Verify activity list updates immediately after logging

**Pre-conditions**: 
- User is on dashboard

**Test Steps**:
1. Note current activity count
2. Log new activity via voice
3. Verify activity appears immediately
4. Check activity count increments
5. Verify new activity appears at top of list

**Expected Results**:
- No page refresh required
- New activity appears instantly
- Activity count updates
- List maintains proper ordering

**Pass Criteria**: ✅ Real-time updates work correctly

---

## Cross-Feature Integration Tests

### Test Case 5.1: Complete User Journey
**Objective**: Verify entire MVP flow works end-to-end

**Test Steps**:
1. Start as new user
2. Complete Google sign-up
3. Complete onboarding with goal
4. Log workout activity via voice
5. Log food intake via voice
6. Log meditation via voice
7. Verify all activities appear correctly
8. Sign out and sign back in
9. Verify data persistence

**Expected Results**:
- Smooth flow with no errors
- All data persists correctly
- UI remains responsive throughout
- No broken states or crashes

**Pass Criteria**: ✅ Complete journey successful

---

### Test Case 5.2: Data Consistency
**Objective**: Verify data remains consistent across features

**Test Steps**:
1. Log activities with specific details
2. Verify data in activity list matches input
3. Check localStorage data accuracy
4. Verify API responses match UI display
5. Test data after browser refresh

**Expected Results**:
- Data consistency across all views
- No data loss or corruption
- Accurate timestamps
- Proper data formatting

**Pass Criteria**: ✅ Data consistency maintained

---

### Test Case 5.3: Performance Testing
**Objective**: Verify app performs well under normal usage

**Test Scenarios**:
1. **Load time**: Measure initial app load
2. **Voice processing**: Time from speech to log
3. **UI responsiveness**: Check animation smoothness
4. **Memory usage**: Monitor for memory leaks
5. **Battery impact**: Test on mobile devices

**Performance Targets**:
- Initial load: <3 seconds
- Voice processing: <5 seconds
- UI animations: 60fps
- Memory: <50MB after 1 hour use
- Battery: Minimal impact

**Pass Criteria**: ✅ All performance targets met

---

## Browser Compatibility Tests

### Test Case 6.1: Chrome/Chromium Support
**Objective**: Verify full functionality in Chrome-based browsers

**Test Browsers**:
- Chrome (latest)
- Edge (latest)
- Brave (latest)

**Test Steps**:
1. Test all core features in each browser
2. Verify speech recognition works
3. Check glassmorphic effects render
4. Test localStorage functionality

**Pass Criteria**: ✅ Full functionality in all Chrome-based browsers

---

### Test Case 6.2: Safari Support
**Objective**: Verify functionality in Safari

**Test Steps**:
1. Test core features in Safari
2. Check speech recognition availability
3. Verify glassmorphic effects
4. Test any Safari-specific issues

**Expected Limitations**:
- Speech recognition may not be available
- Some CSS effects may differ

**Pass Criteria**: ✅ Core functionality works, graceful degradation for unsupported features

---

### Test Case 6.3: Mobile Browser Testing
**Objective**: Verify mobile browser compatibility

**Test Devices**:
- iOS Safari
- Android Chrome
- Samsung Internet

**Test Steps**:
1. Test responsive design
2. Verify touch interactions
3. Check voice recording on mobile
4. Test keyboard behavior

**Pass Criteria**: ✅ Mobile-optimized experience works correctly

---

## Accessibility Tests

### Test Case 7.1: Keyboard Navigation
**Objective**: Verify app is fully keyboard accessible

**Test Steps**:
1. Navigate entire app using only keyboard
2. Verify tab order is logical
3. Check focus indicators are visible
4. Test form submission with keyboard
5. Verify voice button is keyboard accessible

**Pass Criteria**: ✅ All functionality accessible via keyboard

---

### Test Case 7.2: Screen Reader Compatibility
**Objective**: Verify app works with screen readers

**Test Steps**:
1. Test with NVDA/JAWS/VoiceOver
2. Verify proper heading structure
3. Check form labels are announced
4. Verify button purposes are clear
5. Test activity list readability

**Pass Criteria**: ✅ Screen readers can navigate and understand content

---

### Test Case 7.3: Color Contrast
**Objective**: Verify sufficient color contrast for accessibility

**Test Steps**:
1. Check all text/background combinations
2. Verify badge colors meet WCAG standards
3. Test with color blindness simulators
4. Check focus indicators are visible

**Pass Criteria**: ✅ All color combinations meet WCAG AA standards

---

## Security & Privacy Tests

### Test Case 8.1: Data Storage Security
**Objective**: Verify user data is handled securely

**Test Steps**:
1. Inspect localStorage data format
2. Verify no sensitive data in plain text
3. Check data is user-specific
4. Test data cleanup on sign-out

**Pass Criteria**: ✅ User data stored securely and cleaned up properly

---

### Test Case 8.2: API Security
**Objective**: Verify API endpoints are secure

**Test Steps**:
1. Test API endpoints with invalid user IDs
2. Verify user data isolation
3. Check for proper error handling
4. Test rate limiting if implemented

**Pass Criteria**: ✅ APIs properly validate and secure user data

---

## Edge Cases & Stress Tests

### Test Case 9.1: Network Connectivity
**Objective**: Verify app handles network issues

**Test Scenarios**:
1. **Offline mode**: Disconnect internet
2. **Slow connection**: Throttle to 3G speeds
3. **Intermittent connection**: Toggle connection during use

**Expected Behavior**:
- Graceful error messages
- Retry mechanisms
- Offline functionality where possible

**Pass Criteria**: ✅ App handles network issues gracefully

---

### Test Case 9.2: Large Data Sets
**Objective**: Verify app handles many activities

**Test Steps**:
1. Log 100+ activities
2. Verify performance remains good
3. Check memory usage
4. Test scrolling and loading

**Pass Criteria**: ✅ App performs well with large data sets

---

### Test Case 9.3: Unusual Input Handling
**Objective**: Verify app handles edge case inputs

**Test Inputs**:
1. Very long speech (5+ minutes)
2. Non-English speech
3. Background noise/music
4. Multiple speakers
5. Whispered speech

**Expected Behavior**:
- Graceful handling of unusual inputs
- Appropriate error messages
- No crashes or freezes

**Pass Criteria**: ✅ All edge cases handled appropriately

---

## Test Execution Checklist

### Pre-Launch Testing
- [ ] All F1 tests pass (Authentication)
- [ ] All F2 tests pass (Onboarding)  
- [ ] All F3 tests pass (Voice Logging)
- [ ] All F4 tests pass (Activity Viewer)
- [ ] Integration tests pass
- [ ] Performance targets met
- [ ] Browser compatibility verified
- [ ] Accessibility standards met
- [ ] Security tests pass
- [ ] Edge cases handled

### Launch Readiness Criteria
- [ ] 100% core functionality tests pass
- [ ] 95% edge case tests pass
- [ ] Performance within targets
- [ ] No critical security issues
- [ ] Accessibility compliance verified
- [ ] Mobile experience optimized

### Post-Launch Monitoring
- [ ] User feedback collection
- [ ] Error rate monitoring
- [ ] Performance metrics tracking
- [ ] Voice recognition accuracy monitoring
- [ ] User engagement analytics

---

## Test Data & Scenarios

### Sample Voice Inputs for Testing
```
Workout Activities:
- "I did a 30 minute HIIT workout"
- "Went for a 5 kilometer run this morning"
- "Completed my strength training session with deadlifts and squats"
- "Did yoga for 45 minutes to stretch and relax"
- "Played tennis for an hour with my friend"

Food Activities:
- "Had a healthy chicken salad for lunch"
- "Ate an apple and some nuts as a snack"
- "Drank a protein shake after my workout"
- "Cooked salmon with vegetables for dinner"
- "Had oatmeal with berries for breakfast"

Supplement Activities:
- "Took my daily multivitamin this morning"
- "Had my Vitamin D supplement with breakfast"
- "Took omega-3 fish oil capsules"
- "Had my magnesium supplement before bed"
- "Took probiotics to support gut health"

Meditation Activities:
- "Meditated for 15 minutes using a guided app"
- "Did breathing exercises to reduce stress"
- "Practiced mindfulness meditation in the garden"
- "Had a 10 minute meditation session before work"
- "Did some deep breathing to calm my anxiety"

General Activities:
- "Studied Python programming for 2 hours"
- "Worked on my art project this afternoon"
- "Read a chapter of my personal development book"
- "Practiced guitar for 30 minutes"
- "Wrote in my gratitude journal before bed"
```

### Test User Profiles
```
Profile 1 - Fitness Enthusiast:
- Age: 28
- Goal: "I want to build muscle and improve my cardiovascular health"
- Expected activities: Workouts, protein intake, supplements

Profile 2 - Stress Management:
- Age: 35
- Goal: "I want to reduce stress and improve my mental well-being"
- Expected activities: Meditation, healthy eating, relaxation

Profile 3 - Holistic Wellness:
- Age: 42
- Goal: "I want to balance my physical, mental, and spiritual health"
- Expected activities: Mixed activities across all categories

Profile 4 - Learning Focus:
- Age: 24
- Goal: "I want to learn new skills and stay physically active"
- Expected activities: Study sessions, workouts, skill practice
```

This comprehensive test plan ensures the Evolve AI MVP is thoroughly validated before launch, covering all functional requirements, user experience standards, and technical quality criteria.