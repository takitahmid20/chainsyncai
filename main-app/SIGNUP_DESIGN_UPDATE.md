# Signup Screen Design Update

## Overview
The signup screen has been completely redesigned to match the HTML prototype (`html2/retailer/signup.html`) exactly.

## Changes Made

### 1. New UI Components Created
- **GradientBackground.tsx** - Reusable background with purple gradient (#667eea → #764ba2)
- **RoleCard.tsx** - Role selection cards with icons, gradient when selected
- **SocialButton.tsx** - Google/Facebook login buttons (placeholders)

### 2. Updated Signup Screen (`app/signup.tsx`)
The signup screen now includes:

#### Visual Design
- ✅ Gradient background matching HTML design
- ✅ White card container with rounded corners (24px border-radius)
- ✅ Purple gradient header with logo and title
- ✅ Matching colors and spacing from HTML prototype

#### Form Fields
- ✅ **Role Selection**: Interactive cards for Retailer/Supplier
- ✅ **Business Name**: Text input with business icon
- ✅ **Full Name**: Text input with person icon
- ✅ **Email**: Email input with mail icon
- ✅ **Phone**: Phone number input with call icon
- ✅ **Password**: 6-digit secure input with lock icon
- ✅ **Confirm Password**: 6-digit secure input with lock icon
- ✅ **Terms & Conditions**: Checkbox with link
- ✅ **Social Login**: Google and Facebook buttons (placeholders)

#### Functionality
- ✅ Form validation for all fields
- ✅ Password matching validation
- ✅ Terms acceptance validation
- ✅ API integration with authService
- ✅ Loading states and error handling
- ✅ Navigation to OTP verification screen on success

### 3. Updated Auth Service
Extended `SignupData` interface to include:
```typescript
interface SignupData {
  email: string;
  password: string;
  user_type: 'retailer' | 'supplier';
  business_name?: string;    // NEW
  full_name?: string;         // NEW
  phone?: string;             // NEW
  confirm_password?: string;  // NEW (client-side only)
}
```

## Design Specifications

### Colors
- Gradient Background: `#667eea` → `#764ba2`
- Primary Gradient: `#6366f1` → `#8b5cf6`
- Text Primary: `#0f172a`
- Text Secondary: `#64748b`
- Border: `#e2e8f0`
- Error: `#ef4444`

### Components
- Border Radius: 24px (card), 12px (inputs/buttons)
- Spacing: Uses design tokens from `constants/Spacing.ts`
- Typography: Uses design tokens from `constants/Typography.ts`
- Shadows: Card has elevation with subtle shadow

## Usage

The signup screen is fully functional and matches the HTML design. Users can:

1. Select their role (Retailer or Supplier)
2. Fill in business and personal information
3. Set up a 6-digit password
4. Accept terms and conditions
5. Sign up and receive email verification

### Social Login
Google and Facebook buttons are present but show "Coming Soon" alerts. These can be implemented when OAuth is configured.

## Testing Checklist

- [ ] Role selection (retailer/supplier) works correctly
- [ ] All form fields accept input
- [ ] Password fields only accept digits (max 6)
- [ ] Form validation shows appropriate error messages
- [ ] Terms checkbox can be toggled
- [ ] Signup button triggers API call
- [ ] Loading state displays during API request
- [ ] Success navigates to OTP verification screen
- [ ] Error shows alert with API error message
- [ ] Social buttons show "Coming Soon" alert

## Next Steps

1. **Backend Update**: Update Django signup endpoint to accept new fields (business_name, full_name, phone)
2. **Password Policy**: Consider enhancing password requirements beyond 6 digits
3. **Social Login**: Implement OAuth for Google/Facebook
4. **Terms Link**: Add navigation to Terms & Conditions page
5. **Accessibility**: Add accessibility labels for screen readers

## Files Modified

- `main-app/app/signup.tsx` - Complete redesign
- `main-app/services/authService.ts` - Updated SignupData interface
- `main-app/components/ui/GradientBackground.tsx` - Created
- `main-app/components/ui/RoleCard.tsx` - Created
- `main-app/components/ui/SocialButton.tsx` - Created
