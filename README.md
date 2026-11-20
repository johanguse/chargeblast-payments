# Chargeblast Payments

A standalone Next.js and TypeScript recreation of the Stripe Transactions → Payments screen. The visual target is [the original dashboard screenshot](docs/payments-original.png). The [specification](SPEC.md) describes the take-home requirements.

Live version: [chargeblast-payments.johanguse.workers.dev](https://chargeblast-payments.johanguse.workers.dev/)

## Run locally

Use Bun 1.3.11 to install dependencies and run scripts. Next.js, Playwright, and Wrangler also use Node.js 24 in CI.

```sh
bun install
bun run dev
```

Open [the payments list](http://localhost:3000/payments). The root route redirects to the list and preserves query parameters.

## Using the dashboard

- Search 600 seeded payments by ID, customer email, or last four digits. Sort by amount, status, or date. The result-range button changes the page size to 25, 50, or 100.
- Filter pills preview edits immediately. Apply commits them to the table and URL. Back discards the draft. Amount filter bounds round to two decimals, so 12.252665 becomes 12.25. Displayed payments use their currency’s precision.
- The default data columns are Amount (including currency), Status, Payment method, Description, Customer, Date, Refunded date, Decline reason, and Payment ID. Scroll horizontally to reach the full ID and its clipboard button.
- Open **Edit columns** in the toolbar to adjust the table in place. The panel opens beside its button. Use it to show or hide individual columns, wrap cells, or reset the layout. Drag headers to reorder, drag their edges to resize, or use the keyboard controls under **Column order and widths**. Optional columns without a seeded value display an em dash.
- **Analyze** summarizes the filtered payments by status. **Export** downloads the filtered results as CSV. Opening a row reveals payment details, events, and metadata. Hovering or focusing the date shows relative time.
- Creating payments, issuing refunds, sending receipts, and navigating to other Stripe products are unavailable.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, React Server Components, Suspense streaming), React 19, TypeScript |
| Styling | Plain CSS in [globals.css](src/app/globals.css) with custom properties |
| UI primitives | Native `<dialog>` and the Popover API, [Radix Tooltip](https://www.radix-ui.com/primitives/docs/components/tooltip), [Lucide](https://lucide.dev) icons |
| Unit and component tests | [Vitest](https://vitest.dev) with Testing Library in jsdom |
| Browser tests | [Playwright](https://playwright.dev) with [axe-core](https://github.com/dequelabs/axe-core) |
| Lint and format | [Biome](https://biomejs.dev) |
| Hosting | Cloudflare Workers through [OpenNext](https://opennext.js.org/cloudflare) |

## Project structure

```
src/
  app/                    Next.js routes only: load data, render a feature screen
  components/
    ui/                   Generic primitives (Popover, Spinner)
    layout/               App shell and sidebar
    icons/                Card, wallet and copy SVGs
  features/payments/
    domain/               Pure, framework-free logic: types, query/sort/pagination,
                          filters, columns, formatting, CSV, route helpers
    data/                 Deterministic seed data
    hooks/                React state: URL query, column layout, time zone, notices
    components/           Payments screen, table (rows, cells, headers), filters, details
                          (unit and component tests sit next to the code as *.test.ts[x])
  lib/                    Cross-feature helpers (mock latency, dialogs, downloads)
  test/                   Vitest setup and shared fixtures
e2e/                      Playwright browser tests
```

Logic that does not need React lives in `domain/` so it can be unit-tested directly. Components stay focused on rendering and wiring.

## Decisions and trade-offs

**Loading states.** The 600 local payments can be filtered and paginated immediately. The demo deliberately adds 350 ms on the initial list load and on committed query changes so reviewers can see the skeleton and browser tests can check it reliably. To try it, choose **Status → Pending → Apply**, remove the Status filter, then select **Next**. Only the rows show placeholders during these updates, so the headers and controls stay available. The trade-off is an extra 350 ms before results appear, even when they are already in memory. With a real API, the request lifecycle would control the skeleton. The demo timing is shared in [mock-response.ts](src/lib/mock-response.ts).

**Payment details.** Opening a payment simulates a 250 ms lookup. Once the page layout appears, individual React Suspense boundaries reveal sections over the next 340–800 ms. For example, Recent activity can be read while Metadata is still loading. These timings make the sequence reproducible for testing.

**Seed data and dates.** The seeded payments have stable IDs, and their dates are relative to the day the demo runs. That keeps **Today** useful whenever someone reviews the project. Calendar dates in the table will therefore differ from the reference screenshot.

**Client-side queries.** Filtering and sorting the full dataset before pagination keeps the table and CSV export consistent. This is practical for 600 records because the browser receives the whole dataset. A larger payment history would call for server-side filtering and pagination.

**The URL is the state store.** Filters, search, sort, page, and page size live in the query string, read and written by [use-payments-query.ts](src/features/payments/hooks/use-payments-query.ts). Views can be shared, survive a reload, and come back intact from the details page through its `back` parameter. Column layout is per-session UI state and stays in React. The trade-off is that every list change goes through `URLSearchParams` parsing, which is cheap at this scale.

### Libraries considered and not used

Each of these is a reasonable default in a larger app. Here the cost was higher than the benefit.

**Tailwind CSS.** The goal is a close visual match to one Stripe screen, and the styles were tuned against the reference screenshot property by property. Plain CSS with custom properties keeps those values in one readable place, needs no build plugin, and keeps markup short. Tailwind becomes the better choice once several screens share a design system and spacing and color scales need enforcing. The main cost of the current approach is one large stylesheet, which would be split per feature (or moved to CSS Modules) as the app grows.

**ESLint and Prettier.** Biome lints and formats TypeScript, JSX, CSS, and JSON in one fast tool with one config file. ESLint has a larger plugin ecosystem, including the official Next.js and React Hooks plugins. Biome's React and Next.js rule domains cover the checks this project needs. Markdown is excluded from Biome so prose tables keep their compact source formatting.

**Radix (or another headless kit) for popovers and dialogs.** Filter editors, menus, and settings use the native Popover API and `<dialog>`, which provide light dismiss, Escape handling, top-layer stacking, and focus return without JavaScript libraries. A small [Popover](src/components/ui/popover.tsx) component adds positioning. Radix is used only for the date tooltip, where hover and focus delays and collision handling are fiddly to get right. The trade-off is that jsdom does not implement these native APIs, so popover and dialog flows are tested in Playwright rather than Vitest.

## Verification

```sh
bun run check          # Biome lint + format, TypeScript, Vitest
bun run build
bunx playwright install chromium
bun run test:e2e
```

`bun run lint:fix` applies Biome's formatting and safe fixes. `bun run test:watch` runs Vitest in watch mode.

Vitest covers the domain logic (filtering, sorting, pagination, filter forms, formatting, CSV, route guards), the hooks, and the main components with Testing Library in jsdom. Native popovers and dialogs are not implemented in jsdom, so those flows are tested in the browser.

The browser suite starts the production build on port 3128. It covers desktop and mobile workflows, URL state across the details page, CSV contents, column resizing and reordering, keyboard interactions (skip link, `/` shortcut), axe checks on the list, the details page, open popovers and the mobile drawer, loading states, and filter drafts. Set CHROMIUM_PATH to use an existing Chromium installation.

## CI and Cloudflare deployment

Pull requests and pushes to `main` trigger the [Payments workflow](.github/workflows/payments.yml). CI uses `bun install --frozen-lockfile` so each build uses the committed dependency versions and fails if installation would change `bun.lock`. When changing dependencies locally, use `bun install` and commit the updated lockfile with `package.json`. The workflow runs Biome, the type check and the Vitest suite, builds the Next.js app with OpenNext, and runs the browser suite against the bundled Worker in local `workerd`. The manual release runs these same checks before deploying that build.

To preview the Worker locally, run the following from the project directory after `bun install`:

```sh
bun run build:worker
bun run preview:worker
```

Open [the local Worker preview](http://localhost:8787/payments). To run the browser suite against that build on Linux or WSL, use `TEST_WORKER=1 bun run test:e2e` after installing Playwright Chromium.

To publish a release:

1. Enable a `workers.dev` subdomain for the target Cloudflare account. The Worker name is `chargeblast-payments`. To rename it, update both `name` and the self-reference service in [wrangler.jsonc](wrangler.jsonc).
2. In the GitHub repository, add the Actions secrets `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`. Scope the token to the target account with the **Edit Cloudflare Workers** template. [Cloudflare authentication guide](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/)
3. Once the workflow is on the default branch, open **Actions → Payments CI and deployment → Run workflow**, select **main**, and run it. The final step prints the deployed Worker URL. Open `/payments` there.

### Deploy from the command line

Log in once. This opens a browser to authorize Wrangler:

```sh
bunx wrangler login
```

Build, then deploy:

```sh
bun run build:worker
bun run deploy:worker
```

`deploy:worker` runs `opennextjs-cloudflare deploy`, which wraps `wrangler deploy` using [wrangler.jsonc](wrangler.jsonc). It deploys the existing `.open-next` build and does not rebuild, so always run `build:worker` first. To test a build without sending it to production traffic, use `bun run upload:worker`. It uploads a new version and prints a preview URL, and production keeps serving the current version. Useful follow-ups:

```sh
bunx wrangler deployments list   # recent deployments
bunx wrangler rollback           # return to the previous version
bunx wrangler tail               # stream live logs
```

On a machine without a browser, skip `wrangler login` and export `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, the same values CI uses.

The app serves seeded data and static assets. The [OpenNext configuration](open-next.config.ts) requires no database or R2 bucket. Every route renders on demand, so no incremental cache is configured. The bundled Worker is about 940 KiB gzipped, within the 3 MiB limit of the Workers free plan. [OpenNext setup guide](https://opennext.js.org/cloudflare/get-started)

Known issue: when a browser leaves a page while it is still streaming, the local Worker can log `TypeError: Unable to enqueue` from OpenNext's response stream. The user has already navigated away and sees nothing. The browser suite triggers it by moving between pages quickly.
