/**
 * Generates a static build for Vercel/Netlify deployment.
 * Reads the Vite manifest and creates a standalone index.html
 * with hardcoded Inertia page data (no PHP required).
 */
import { readFileSync, writeFileSync, mkdirSync, cpSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Read the Vite manifest
const manifest = JSON.parse(
    readFileSync(join(root, 'public/build/manifest.json'), 'utf-8')
);

// Find entry point assets
const entry = manifest['resources/js/app.ts'];
if (!entry) {
    console.error('Could not find app.ts in manifest');
    process.exit(1);
}

const jsFile = `/build/${entry.file}`;
const cssFiles = (entry.css || []).map((f) => `/build/${f}`);

// Hardcoded Inertia page data (mirrors SignupController@show)
const pageData = {
    component: 'Signup/Index',
    props: {
        plans: [
            {
                id: 1,
                name: '1 Year Plan',
                slug: '1-year',
                duration_months: 12,
                original_price_pence: 1799,
                discounted_price_pence: 699,
                discount_percentage: 60,
                currency: 'GBP',
                is_active: true,
            },
        ],
        initialStep: 1,
        affiliateParams: {},
        coupon: {
            code: 'GOLD_DISCOUNT_2026',
            discountLabel: '67% OFF',
            isApplied: true,
        },
        config: {
            supportEmail: 'support@privatebyright.com',
            supportUrl: 'support.privatebyright.com',
            trustpilotScore: 5,
            trustpilotReviews: 176,
            vatRate: 20,
            currency: 'GBP',
            currencySymbol: '£',
            maxDevices: 5,
        },
    },
    url: '/signup',
    version: '',
};

// Generate index.html
const html = `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Sign Up - PrivateByRight VPN</title>
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,600,700,900&display=swap" rel="stylesheet" />
        ${cssFiles.map((f) => `<link rel="stylesheet" href="${f}" />`).join('\n        ')}
        <script type="module" src="${jsFile}"></script>
    </head>
    <body class="font-sans antialiased">
        <div id="app" data-page='${JSON.stringify(pageData)}'></div>
    </body>
</html>
`;

// Create dist directory and write files
mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist/index.html'), html);

// Copy build assets
cpSync(join(root, 'public/build'), join(root, 'dist/build'), { recursive: true });

// Copy favicon
try {
    cpSync(join(root, 'public/favicon.ico'), join(root, 'dist/favicon.ico'));
} catch {
    // favicon may not exist
}

console.log('Static build generated in dist/');
console.log(`  JS: ${jsFile}`);
console.log(`  CSS: ${cssFiles.join(', ')}`);
