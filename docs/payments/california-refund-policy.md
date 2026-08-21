# California Refund and Cancellation Policy

**Provider:** StateCourse LLC  
**Policy version:** CA-2026-08-20-v1  
**Adopted:** August 20, 2026  
**Applies to:** California statutory/pre-license correspondence/internet courses and California multi-course packages.

## Policy

A student may cancel and receive a **100% refund of tuition paid** through the later of:

1. seven business days after enrollment; or
2. completion of the first lesson assignment,

provided the student has **not attempted the final examination**.

After the full-refund period, a student who withdraws after completing **60% or less** of a course is eligible for a **pro rata refund of unearned tuition** based on the percentage of the course not completed.

No tuition refund is due after any of the following occurs, whichever comes first:

- the student has completed more than 60% of the course;
- the student has attempted a final examination; or
- a course completion certificate has been issued.

For a multi-course package, refund eligibility and earned tuition are calculated **separately for each course** using the package allocation recorded at checkout. Completed courses and courses beyond the refund threshold are non-refundable. Any remaining eligible course amount is refunded under this policy.

Approved refunds are returned to the **original payment method within 10 business days** after StateCourse LLC approves the cancellation or withdrawal request.

A cancellation or withdrawal request may be submitted:

- through the student's StateCourse LLC account; or
- in writing to **info@statecourse.com**.

The effective date of cancellation or withdrawal is the date the request is received by StateCourse LLC.

## Implementation requirements

This exact policy version must be used consistently in:

- California RE 313 General Information Pages;
- the student enrollment acknowledgment;
- checkout disclosures before payment;
- StateCourse LLC Terms;
- refund eligibility calculations;
- admin refund review;
- Stripe refund execution; and
- the California DRE submission consistency tests.

No alternative wording may be introduced into RE 313 or the enrollment flow without updating this source-of-truth policy and the related tests.

## Business days — the convention, and where it comes from

A business day is Monday through Friday, excluding the holidays in California Government Code section 6700 with the observance rules in section 6701 applied. Every federal holiday observed in California falls on a date section 6700 already names, so no further dates are added. Good Friday is not excluded, because section 6700(a)(19) makes it a holiday only from 12 noon until 3 p.m. rather than for a full day.

**This convention is StateCourse LLC's own.** It is adopted, not imposed:

- **5 CCR § 70000(d)**, effective 1 July 2026, gives the window its shape — *"'Cancellation
  Period' means the period from the signing of the enrollment agreement either through the
  student's attendance at the first class session, or the **seventh business day after
  enrollment, whichever is later**."* Read directly from the Bureau's published regulations.
- **5 CCR §§ 70000–76245 use "business day" throughout and define it nowhere.** The count is
  therefore ours to fix, and we fix it against **Government Code § 6700** with **§ 6701's**
  observance rules applied — read directly from leginfo.legislature.ca.gov.
- **The Department of Real Estate is not the source of the seven-day figure.** Its Course
  Provider Handbook requires the refund and cancellation policy to be disclosed on the RE 313
  General Information Page before registration/enrollment. **No StateCourse document may say
  that DRE or the Bureau requires this count.**

Excluding holidays **lengthens** the student's window; counting them as ordinary days would
shorten it. The convention adopted is the longer, more consumer-protective of the two.

### Two holidays that cannot be computed, and what the engine does about it

**§ 6700(a)(4) Lunar New Year** is defined as *"the second new moon following the winter
solstice"* and **§ 6700(a)(9) Diwali** as *"the 15th day of the month of Kartik in the Hindu
lunar calendar"*. Neither is derivable without shipping an ephemeris or a Hindu calendar, and
getting either subtly wrong would silently shorten a refund window.

They are recorded as **explicit dates, year by year**, in
`config/california/business-day-calendar.mjs`, and **a year whose dates are not recorded is
not covered: the engine throws rather than computing a window one day too short.** Covered
years at present: **2026**. 2027 is not covered — its Diwali
date is not recorded — so **a Diwali date for each year must be confirmed and added before any
enrollment window can run into that year.**

**§ 6700(a)(19) Good Friday is not excluded.** The statute makes it a holiday *"from 12 noon
until 3 p.m."* — three hours, not a day.

**§ 6700(a)(20)(A) days appointed ad hoc by the President or the Governor** cannot be known in
advance and are not in the table. Thanksgiving is the exception, because § 6700(a)(20)(B) names
it, and it is carried as the fourth Thursday in November. Any other proclaimed day must be
added before a window is computed across it.

**Every federal holiday observed in California under 5 U.S.C. § 6103 falls on a date § 6700
already names**, so the federal list adds no further dates.

## Packages, and the complimentary components

Refund eligibility is calculated **separately for each course**, using the allocation recorded
at checkout. The allocation rule is fixed:

> course allocation = package price × standalone course price ÷ sum of the standalone prices
> of the included DRE-credit courses

The first *n−1* courses take the rounded share and **the last course takes the remainder**, so
the allocation always sums to the package price exactly and always sums the same way. For the
**California Complete Licensing Path at $299.00** with three equally priced courses that is:

| Component | Allocated tuition |
|---|---|
| Real Estate Principles | $99.67 |
| Real Estate Practice | $99.67 |
| Mortgage Loan Brokering and Lending | $99.66 |
| California Exam Prep | $0.00 |
| Licensing/Application Navigator | $0.00 |
| **Total** | **$299.00** |

California Exam Prep and the Licensing/Application Navigator are complimentary package features included at no additional charge. They are not statutory pre-license education, carry no Department of Real Estate course credit, and have no separately allocated tuition value; the entire package price is allocated to the three DRE-credit courses for refund purposes.

The complimentary components stay in the allocation record at zero rather than being dropped,
so a student can see that what they bought includes them and that they carry no refundable
tuition value. This disclosure appears at checkout and in the RE 313 fee block.

## Regulatory posture

DRE requires the General Information Page to disclose the provider's refund/cancellation policy before registration. California private-postsecondary law also uses a cancellation period and pro-rata refund concept through the 60% completion point for institutions subject to those provisions. StateCourse LLC is adopting a policy that is intentionally consumer-protective while its BPPE classification/exemption analysis is finalized.

This policy does **not** represent or imply that StateCourse LLC or any California course is DRE-approved before written approval is issued.
