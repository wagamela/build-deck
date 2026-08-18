# Anti-Vibecoded Design Guidelines

## Purpose

This project should feel intentionally designed, distinctive, polished, and human-made.

Avoid generic visual patterns that make modern web interfaces look AI-generated, template-driven, or "vibecoded." Do not blindly apply trendy UI patterns just because they are common in AI-generated products.

These guidelines are defaults, not excuses to make the interface boring. Break a rule when there is a clear product/design reason to do so.

---

## 30 Patterns to Avoid

### 1. Harsh gradients
Avoid obvious, high-contrast gradients used as decoration without a functional or brand reason.

### 2. Generic "liquid" / blob visuals
Avoid random blobs, liquid shapes, gradient blobs, and abstract decorative shapes that do not communicate anything.

### 3. Purple + black as the default aesthetic
Do not automatically fall back to the common dark-purple/black AI aesthetic. Choose colors based on the product's identity and context.

### 4. Excessive rounded corners
Do not give every element a large pill-like or oversized corner radius. Use radius intentionally and create hierarchy between components.

### 5. Overuse of drop shadows
Avoid putting a visible shadow on every card, button, input, and container. Use elevation sparingly.

### 6. "3 floating cards" layouts
Avoid arranging unrelated content into a predictable collection of floating cards simply because cards are easy to generate.

### 7. Excessive glassmorphism
Avoid translucent glass panels, blur, borders, and glowing backgrounds unless the visual language genuinely calls for them.

### 8. Liquid / overly decorative UI
Do not fill empty space with decorative shapes, gradients, glowing objects, or ornamental effects just to make the page look "designed."

### 9. Em dashes everywhere
Do not use em dashes as a substitute for normal punctuation or sentence structure.

### 10. Inter / Geist / Space Grotesk by default
Do not automatically choose Inter, Geist, Space Grotesk, or another fashionable startup font. Typography should be selected according to the product's personality and content.

### 11. Colored left stripes
Avoid the common card pattern where every item has a bright colored vertical stripe on its left edge.

### 12. Fake testimonials
Never invent testimonials, customer quotes, user counts, company logos, reviews, or social proof.

### 13. Bento grids by default
Do not use a bento grid simply because it is fashionable. Use one only when the information architecture benefits from it.

### 14. Terminal-window styling
Do not make ordinary product UI look like a fake terminal window unless the product itself is genuinely terminal-oriented.

### 15. "It's not X, it's Y"
Avoid repetitive marketing copy based on the "It's not X, it's Y" formula.

### 16. Checkmark bullet lists
Do not automatically turn feature lists into green checkmark bullet lists. Use appropriate visual hierarchy for the content.

### 17. Three pricing tiers
Do not automatically create a three-column pricing section. Only use pricing tiers when the actual product and business model require them.

### 18. Fake product demos
Do not create fake dashboards, fake metrics, fake analytics, or fake product screenshots just to make a marketing page look impressive.

### 19. Excessive soft corner radius
Avoid making every surface extremely soft and rounded. The interface should have intentional geometry.

### 20. Purple + black combinations
Treat purple/black as a deliberate brand choice, not a default shortcut for making something look modern or futuristic.

### 21. No skeleton loaders
For interfaces where loading states matter, do not leave the user staring at empty content. Design appropriate loading, skeleton, or progress states.

### 22. Radial orbs
Avoid large blurred radial gradient orbs used as generic background decoration.

### 23. Dot grids
Avoid decorative dot-grid backgrounds unless they have a strong connection to the product's visual language.

### 24. Sparkle icons
Do not use sparkle icons as generic decoration to imply "AI," "magic," or "premium."

### 25. Animated arrows
Do not add animated arrows, bouncing arrows, or movement effects simply to make static UI feel more dynamic.

### 26. Missing terms of service
For products that require legal/product terms, do not omit relevant Terms of Service information.

### 27. Missing privacy policy
For products that collect or process user data, do not omit appropriate privacy information.

### 28. Hover animations everywhere
Do not animate every element on hover. Motion should communicate state, affordance, or hierarchy.

### 29. Neon colors
Avoid neon accents and highly saturated glowing colors unless they are genuinely appropriate to the product's identity.

### 30. Basic pastel colors
Do not default to generic pastel blue, green, yellow, and pink palettes. Build a deliberate color system with meaningful contrast and hierarchy.

---

## General Anti-Vibecoded Principles

### Design with intent

Every major visual decision should have a reason.

Do not ask:
> "What trendy UI pattern can I put here?"

Ask:
> "What is the clearest and most appropriate way to communicate this information or action?"

### Avoid template composition

Do not assemble pages from predictable sections such as:

- Hero with giant gradient headline
- Three feature cards
- Logo cloud
- Three pricing cards
- Testimonials
- CTA banner
- Footer

Use the actual product and its information architecture to determine the page structure.

### Establish visual identity

The design should have its own recognizable visual language through:

- Typography
- Spacing
- Color
- Shape
- Iconography
- Layout
- Imagery
- Motion
- Content hierarchy

These should work together rather than being individually chosen from popular design trends.

### Prefer restraint over decoration

When something does not improve usability, hierarchy, branding, or comprehension, consider removing it.

Empty space is acceptable. Not every empty area needs a gradient, orb, grid, illustration, or card.

### Use hierarchy instead of containers

Not every piece of content needs its own bordered box.

Create hierarchy with:

- Typography
- Spacing
- Alignment
- Scale
- Position
- Contrast
- Grouping

Use borders and backgrounds when they clarify structure, not simply because a component needs a container.

### Make components feel related

Buttons, cards, inputs, navigation, dialogs, and other components should feel like they belong to the same design system.

Avoid a collection of individually styled components that look like they came from different templates.

### Motion must have a purpose

Animations should communicate:

- State changes
- Navigation
- Feedback
- Loading
- Continuity
- Interaction

Avoid animation purely for spectacle.

### Real content over placeholders

Use realistic content structure and meaningful labels.

Never invent:

- Testimonials
- Reviews
- Statistics
- Customer logos
- User counts
- Awards
- Performance claims
- Product capabilities

unless the data actually exists.

### Design for the actual product

The UI should reflect what the product does.

A developer tool can look technical without becoming a fake terminal.
A creative product can feel expressive without becoming a gradient-heavy SaaS template.
A productivity tool can feel calm without becoming another generic pastel dashboard.

---

## Typography

Choose typography intentionally.

Do not default to Inter, Geist, Space Grotesk, or similar fonts unless they genuinely fit the product.

Consider:

- Character
- Readability
- Density
- Scale
- Weight
- Line height
- Letter spacing
- Relationship between display and body type

Avoid excessive giant headings and excessive font-weight variation.

---

## Color

Create a coherent color system instead of selecting colors component-by-component.

Color should establish:

- Brand identity
- Hierarchy
- State
- Interaction
- Accessibility
- Focus
- Feedback

Avoid excessive gradients, neon accents, random pastels, and decorative color changes.

Do not use color merely to make a screenshot look more impressive.

---

## Layout

Do not force everything into:

- Cards
- Bento grids
- Three-column layouts
- Centered hero sections
- Floating panels
- Full-width gradient sections

Choose layouts based on the content.

Good layout should make the user's next action obvious.

---

## Cards

Cards are useful, but they should not become the default answer to every content problem.

Before creating a card, ask:

1. Does this content need separation?
2. Does the user need to compare it?
3. Does it represent an independent object?
4. Would spacing and typography communicate the hierarchy better?

If the answer is no, do not create a card.

---

## Icons

Use icons when they improve recognition or interaction.

Do not:

- Add sparkle icons everywhere
- Use icons as decoration without meaning
- Mix unrelated icon styles
- Put an icon next to every piece of text
- Use animated arrows just to create movement

Iconography should have a consistent visual language.

---

## Responsive Design

Do not treat mobile as a smaller desktop.

The layout should intentionally adapt to:

- Screen width
- Content density
- Navigation
- Touch targets
- Typography
- Spacing
- Component structure

---

## Accessibility

Visual polish must never come at the expense of usability.

Maintain:

- Sufficient contrast
- Visible focus states
- Keyboard accessibility
- Clear interaction states
- Appropriate touch targets
- Semantic structure
- Reduced-motion considerations

---

## Before Finishing a UI

Before considering a page complete, review it critically.

Ask:

- Does this look like a generic AI-generated SaaS page?
- Did I use a trendy pattern without a reason?
- Are there unnecessary cards?
- Are there unnecessary gradients?
- Are there unnecessary animations?
- Are the colors intentional?
- Is the typography distinctive and appropriate?
- Did I invent any social proof or data?
- Does the layout reflect the actual product?
- Is there enough visual hierarchy without excessive decoration?
- Does the interface still look good with the decorative effects removed?

If removing the gradients, shadows, blobs, sparkles, animations, and cards makes the design collapse, the underlying design is probably too dependent on decoration.

---

## Core Rule

**Do not design to look "AI-designed." Design to look appropriate for the product.**

Prefer intentionality, clarity, restraint, strong hierarchy, and distinctive visual decisions over trendy patterns and decoration.
