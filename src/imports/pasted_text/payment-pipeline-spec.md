Design and build a premium internal PAYMENT PIPELINE / PAYMENT TRACKING SOFTWARE for a digital agency called “FIRST CLICK”.

This is NOT a generic accounting app. It is an agency-focused payment management dashboard used to track payments from clients for WEBSITE services and SOCIAL MEDIA MANAGEMENT services.

DESIGN DIRECTION:
- Premium modern SaaS dashboard
- Dark theme
- Black / charcoal background
- Purple / violet primary accent
- Clean white typography
- Glassmorphism used subtly
- Rounded cards
- Excellent spacing and hierarchy
- Professional but visually impressive
- Desktop-first responsive design
- Smooth micro-interactions
- Use clear status badges, progress indicators and payment timelines
- Avoid unnecessary charts and clutter
- Make the UI extremely easy to understand at a glance

==================================================
MAIN STRUCTURE
==================================================

LEFT SIDEBAR:

FIRST CLICK logo

Dashboard
Clients
Payment Pipeline
  ├── Website
  └── Social Media
Payments
Upcoming Dues
Payment History
Reports
Settings

Bottom:
Admin profile
Notifications

==================================================
1. DASHBOARD
==================================================

Create a powerful payment overview dashboard.

Top KPI cards:

TOTAL CLIENTS
TOTAL COLLECTED
TOTAL DUE
DUE THIS MONTH
OVERDUE
RECURRING MONTHLY REVENUE

Each card should show:
- Amount
- Small comparison / trend
- Number of clients
- Relevant icon

Below:

PAYMENT PIPELINE

Show a horizontal pipeline:

LEAD
→ ADVANCE RECEIVED
→ WORK IN PROGRESS
→ PAYMENT DUE
→ FULLY PAID

Each stage should show number of clients and total amount.

Below that:

UPCOMING PAYMENTS

Table:

Client
Service
Payment Type
Amount
Due Date
Status
Action

Status:
PAID
PARTIALLY PAID
DUE
OVERDUE

Actions:
View
Record Payment
Send Reminder

==================================================
2. CLIENTS
==================================================

Create a client management section.

Client card/table should contain:

Client Name
Business Name
Phone
Email
Service
Total Contract Value
Amount Paid
Amount Due
Next Due Date
Payment Status

Clicking a client opens a detailed CLIENT PAYMENT PROFILE.

Client profile should show:

CLIENT INFORMATION

SERVICE INFORMATION

PAYMENT SUMMARY

Timeline of all payments

Total Contract:
₹____

Total Paid:
₹____

Total Due:
₹____

Next Payment:
₹____

Next Due Date:
____

Payment History:

Date
Description
Amount
Payment Method
Status

Buttons:

+ ADD PAYMENT
+ ADD DUE
EDIT CLIENT
SEND REMINDER

==================================================
3. PAYMENT PIPELINE
==================================================

This is the MOST IMPORTANT section.

Create two completely separate service categories:

WEBSITE
SOCIAL MEDIA

Use large category tabs/cards:

[ WEBSITE ]
[ SOCIAL MEDIA ]

Do NOT mix their payment structures.

==================================================
WEBSITE PAYMENT SYSTEM
==================================================

Website clients can have TWO payment components:

A. ONE-TIME WEBSITE PAYMENT
B. MONTHLY MAINTENANCE PAYMENT

When adding a website client:

Client Name
Business Name
Website Project
Website Total Amount
Advance Collected
Remaining Website Amount
Delivery Date
Website Payment Due Date

Example:

Website Project
₹5,000

Advance:
₹2,000

Remaining:
₹3,000

Status:
PARTIALLY PAID

Then separately:

MONTHLY MAINTENANCE

Monthly Maintenance:
₹1,000 / month

Start Date:
01/10/2026

Next Due Date:
01/11/2026

Status:
ACTIVE

This means the software must treat:

WEBSITE ONE-TIME PAYMENT

AND

WEBSITE MONTHLY MAINTENANCE

as TWO separate payment records.

Website payment timeline:

PROJECT CREATED
↓
ADVANCE RECEIVED
↓
WEBSITE IN DEVELOPMENT
↓
WEBSITE DELIVERED
↓
BALANCE PAYMENT DUE
↓
FULL PAYMENT RECEIVED
↓
MONTHLY MAINTENANCE ACTIVE
↓
NEXT MONTHLY PAYMENT
↓
RECURRING

==================================================
4. SOCIAL MEDIA PAYMENT SYSTEM
==================================================

Social Media is completely MONTHLY RECURRING.

When adding a Social Media client:

Client Name
Business Name
Monthly Package
Monthly Amount
Start Date
Next Due Date
Advance Collected
Current Month Payment
Outstanding Amount

Example:

SOCIAL MEDIA MANAGEMENT

₹7,000 / MONTH

Advance Collected:
₹3,000

Remaining:
₹4,000

Next Billing Date:
05/10/2026

Status:
PARTIALLY PAID

The system should automatically show recurring billing periods:

OCTOBER 2026
₹7,000
Paid ₹3,000
Due ₹4,000

NOVEMBER 2026
₹7,000
Upcoming

DECEMBER 2026
₹7,000
Upcoming

Each month should have its own payment record.

Payment status:

PAID
PARTIALLY PAID
DUE
OVERDUE
UPCOMING

==================================================
5. PAYMENT RECORD MODAL
==================================================

Create a clean “Record Payment” modal.

Fields:

Client
Service Category
Payment Type

Payment Type options:

Website One-Time
Website Maintenance
Social Media Monthly

Total Amount
Amount Received
Remaining Amount
Payment Date
Next Due Date
Payment Method
Transaction ID
Notes

Payment Method:

UPI
BANK TRANSFER
CASH
OTHER

Automatically calculate:

TOTAL
- RECEIVED
= REMAINING

Show live calculation.

Example:

Total: ₹8,000
Received: ₹3,000
Remaining: ₹5,000

==================================================
6. UPCOMING DUES
==================================================

Create a dedicated page showing every upcoming payment.

Sections:

DUE TODAY
DUE THIS WEEK
DUE THIS MONTH
OVERDUE

Each row:

Client
Service
Amount
Due Date
Days Remaining
Status

Use visual urgency:

Upcoming → neutral
Due Soon → warning
Due Today → attention
Overdue → red

Include:

SEND REMINDER

button.

==================================================
7. PAYMENT HISTORY
==================================================

Create a complete payment history table.

Columns:

Date
Client
Service
Payment Type
Amount
Payment Method
Transaction ID
Status

Filters:

Website
Social Media
One-Time
Maintenance
Recurring
Paid
Partial
Due
Overdue

Date range filter.

Search client.

==================================================
8. REPORTS
==================================================

Create simple useful financial reports.

Cards:

Total Revenue
Website Revenue
Social Media Revenue
Maintenance Revenue
Outstanding Amount
Recurring Monthly Revenue

Charts:

Monthly Collections
Website vs Social Media Revenue
Outstanding Payments

Also show:

TOP CLIENTS BY REVENUE

and

CLIENTS WITH OVERDUE PAYMENTS

Do not make this look like complicated accounting software.

==================================================
9. ADD CLIENT FLOW
==================================================

Create a beautiful multi-step form:

STEP 1
CLIENT DETAILS

Name
Business
Phone
Email

STEP 2
SELECT SERVICE

WEBSITE
SOCIAL MEDIA
WEBSITE + SOCIAL MEDIA

STEP 3
PAYMENT STRUCTURE

If WEBSITE:

Website One-Time Amount
Advance Amount
Balance Due Date

Enable Maintenance?
YES / NO

If YES:
Monthly Maintenance Amount
Maintenance Start Date
Next Due Date

If SOCIAL MEDIA:

Monthly Amount
Advance Collected
Current Billing Due Date

STEP 4
REVIEW

Show complete payment summary.

BUTTON:

CREATE CLIENT

==================================================
10. WEBSITE + SOCIAL MEDIA CLIENT
==================================================

IMPORTANT:

If a client has BOTH Website + Social Media, do NOT combine everything into one payment.

Create separate payment streams:

WEBSITE
₹5,000 ONE-TIME
+
₹1,000 / MONTH MAINTENANCE

SOCIAL MEDIA
₹7,000 / MONTH

Dashboard should show them separately but also provide:

TOTAL CLIENT OUTSTANDING

Example:

Website Balance:
₹3,000

Website Maintenance:
₹1,000

Social Media:
₹7,000

TOTAL DUE:
₹11,000

==================================================
11. CLIENT DETAIL TIMELINE
==================================================

Create a beautiful visual payment timeline.

Example:

✓ Client Created
✓ ₹2,000 Website Advance Received
✓ Website Started
✓ Website Delivered
⚠ ₹3,000 Website Balance Due
✓ ₹1,000 Maintenance Payment Received
⚠ ₹7,000 Social Media Payment Due

Each event should show:

Date
Amount
Description
Status

==================================================
12. NOTIFICATIONS
==================================================

Create notifications for:

Payment due tomorrow
Payment due today
Payment overdue
Monthly recurring payment generated
Payment received
Partial payment received

==================================================
13. SEARCH + FILTERS
==================================================

Global search:

Search by:
Client
Business
Phone
Service

Filters:

Website
Social Media
Paid
Partial
Due
Overdue
Recurring
One-Time

==================================================
14. VISUAL PAYMENT STATUS
==================================================

Use extremely clear status indicators.

PAID
✓

PARTIALLY PAID
◐

DUE
○

OVERDUE
!

UPCOMING
→

Make these visually obvious throughout the application.

==================================================
15. UX REQUIREMENTS
==================================================

The application should feel like a real production SaaS product.

Important:

- No excessive empty space
- No giant typography taking up the entire screen
- Dense but clean information layout
- Tables should be highly usable
- Important amounts should be visually prominent
- Every important action should be accessible within 1–2 clicks
- Use confirmation dialogs before deleting payment records
- Include empty states
- Include loading states
- Include success notifications/toasts
- Include responsive layouts
- Maintain consistent spacing and typography

The final result should look like a premium agency finance/payment command center — something FIRST CLICK can actually use daily to track every client payment, website payment, maintenance payment and recurring social media payment.