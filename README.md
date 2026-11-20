# Chargeblast Payments

A standalone Next.js and TypeScript recreation of the Stripe Transactions → Payments screen. The visual target is [the original dashboard screenshot](docs/payments-original.png). The [specification](docs/SPEC.md) describes the take-home requirements.

Live version: [chargeblast-payments.johanguse.workers.dev](https://chargeblast-payments.johanguse.workers.dev/)

## Run locally

Use Bun 1.3.11 to install dependencies and run scripts. Next.js, Playwright, and Wrangler also use Node.js 24 in CI.

```sh
bun install
bun run dev
```

Open [the payments list](http://localhost:3000/payments). The root route redirects to the list and preserves query parameters.

## Using the dashboard

- Search 600 seeded payments by ID, customer email, or last four digits. Sort by amount, status, or date. Choose 25, 50, or 100 per page from the dropdown beside **Previous** and **Next**.
- Filter pills preview edits immediately. Apply commits them to the table and URL. Back discards the draft. Amount filter bounds round to two decimals, so 12.252665 becomes 12.25. Displayed payments use their currency’s precision.
- The default data columns are Amount (including currency), Status, Payment method, Description, Customer, Date, Refunded date, Decline reason, and Payment ID. Scroll horizontally to reach the shortened ID. Hover or focus it to see the full value, or click it to copy.
- Open **Edit columns** in the toolbar to adjust the table in place. The panel opens beside its button. Use it to show or hide individual columns, wrap cells, or reset the layout. Drag headers to reorder, drag their edges to resize, or use the keyboard controls under **Column order and widths**. Optional columns without a seeded value display an em dash.
- **Analyze** summarizes the filtered payments by status. **Export** downloads all filtered payments across pages, in the current sort order, with the visible columns in their displayed order. The CSV uses UTF-8 with a byte-order mark for Excel. Dates include the year, local time and UTC offset, and payment IDs are complete. Opening a row reveals payment details, events, and metadata. Hovering or focusing the date shows relative time.
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

Every push and every pull request from a fork runs [CI](.github/workflows/ci.yml). It is split into small pieces:

| File | Role |
| --- | --- |
| [ci.yml](.github/workflows/ci.yml) | Entry point: triggers, concurrency, and which jobs run for which branch |
| [verify.yml](.github/workflows/verify.yml) | Reusable. Runs two jobs in parallel: Biome, the type check and Vitest in one; the OpenNext Worker build and the browser suite against it in local `workerd` in the other. Uploads the tested build as an artifact. |
| [deploy.yml](.github/workflows/deploy.yml) | Reusable. Deploys that artifact to `preview` or `production` and reports the URL |
| [actions/setup](.github/actions/setup/action.yml) | Shared steps: Node.js 24, Bun, the dependency cache, `bun install --frozen-lockfile` |
| [preview-alias.sh](.github/scripts/preview-alias.sh) | Turns a branch name into a preview URL alias |

Caches keep repeat runs fast:

| Cache | Key | Effect |
| --- | --- | --- |
| Bun packages (`~/.bun/install/cache`) | `bun.lock` | Install skips downloads |
| Next.js build (`.next/cache`) | `bun.lock` plus source files, falling back to the latest cache for the same lockfile | Incremental compilation |
| Playwright Chromium (`~/.cache/ms-playwright`) | Playwright version | Skips the browser download. System libraries are still installed each run because they live outside the cache. |

`--frozen-lockfile` makes CI fail if installation would change `bun.lock`. When changing dependencies locally, run `bun install` and commit the updated lockfile with `package.json`. Production can be deployed two ways, and both use the same build commands: automatically by GitHub Actions on every merge to `main`, or by hand from your machine with the Wrangler CLI. Both are described below.

To preview the Worker locally, run the following from the project directory after `bun install`:

```sh
bun run build:worker
bun run preview:worker
```

Open [the local Worker preview](http://localhost:8787/payments). To run the browser suite against that build on Linux or WSL, use `TEST_WORKER=1 bun run test:e2e` after installing Playwright Chromium.

### Deploy with GitHub Actions

Both deploy paths ship the exact `.open-next` build that passed the tests, handed over as a workflow artifact.

| Trigger | Jobs | Result |
| --- | --- | --- |
| Push to any branch other than `main` | `verify` → `preview` → `comment-preview` | Uploads a preview version without touching production, at `https://<branch>-chargeblast-payments.<subdomain>.workers.dev`. The branch name is lowercased, other characters become dashes, and it is cut to 40 characters, so `feature/New-Filters` becomes `feature-new-filters`. Each push updates the same URL. The URL is shown in the run summary and commented on the branch's open pull request, if there is one. |
| Push to `main` (a merge), or **Run workflow** on `main` | `verify` → `production` | Deploys to `https://chargeblast-payments.<subdomain>.workers.dev`. |
| Pull request from a fork | `verify` | Tests only. GitHub does not give secrets to fork pull requests. Pull requests from this repository are already tested by the push run for their branch. |

Dependabot branches are tested but not previewed, because Dependabot runs do not receive Actions secrets.

One-time setup:

1. In Cloudflare, enable a `workers.dev` subdomain (**Workers & Pages → Settings**).
2. Create an API token at **My Profile → API Tokens → Create Token** using the **Edit Cloudflare Workers** template, limited to your account. Copy your **Account ID** from the dashboard's account home page.
3. In GitHub, open **Settings → Secrets and variables → Actions** and add two repository secrets: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
4. Deploy production once, by merging to `main`, using **Run workflow**, or running `bun run deploy:worker` locally. Previews add versions to an existing Worker, so branch previews only work after that first deploy.

The jobs use the GitHub environments `preview` and `production`, which GitHub creates on first use and shows with their URLs on the repository page. To require an approval before production deploys, open **Settings → Environments → production** and add required reviewers. You can also move the two secrets into that environment to scope them there.

Preview versions run the branch's code with the production Worker's bindings. That is fine for this app, which has no data. [wrangler.jsonc](wrangler.jsonc) turns on `preview_urls`, which Wrangler disables by default, and Workers Logs (`observability`). The Worker name is `chargeblast-payments`. To rename it, update both `name` and the self-reference service in that file.

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

On a machine without a browser, skip `wrangler login` and export `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, the same values CI uses. A CLI deploy and a CI deploy update the same Worker. Whichever ran last is live, so a manual deploy is replaced by the next merge to `main`.

The app serves seeded data and static assets. The [OpenNext configuration](open-next.config.ts) requires no database or R2 bucket. Every route renders on demand, so no incremental cache is configured. The bundled Worker is about 940 KiB gzipped, within the 3 MiB limit of the Workers free plan. [OpenNext setup guide](https://opennext.js.org/cloudflare/get-started)

Known issue: when a browser leaves a page while it is still streaming, the local Worker can log `TypeError: Unable to enqueue` from OpenNext's response stream. The user has already navigated away and sees nothing. The browser suite triggers it by moving between pages quickly.

## License

This project is open source and available under the [MIT License](LICENSE).