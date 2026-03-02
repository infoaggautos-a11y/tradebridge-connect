import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  console.error('Error: STRIPE_SECRET_KEY environment variable is required');
  console.error('Run: STRIPE_SECRET_KEY=sk_test_xxx npx tsx scripts/create-stripe-products.ts');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

const PRODUCTS = [
  {
    name: 'DIL Trade Bridge Starter',
    description: 'Perfect for small businesses starting with trade',
    prices: [
      { nickname: 'starter_monthly', amount: 1600, interval: 'month' },
      { nickname: 'starter_annual', amount: 15600, interval: 'year' },
    ],
  },
  {
    name: 'DIL Trade Bridge Growth',
    description: 'For growing businesses with active trade',
    prices: [
      { nickname: 'growth_monthly', amount: 2400, interval: 'month' },
      { nickname: 'growth_annual', amount: 22800, interval: 'year' },
    ],
  },
];

async function createProductsAndPrices() {
  console.log('Creating Stripe Products and Prices...\n');

  const results: Record<string, { productId: string; prices: Record<string, string> }> = {};

  for (const product of PRODUCTS) {
    console.log(`Creating product: ${product.name}`);

    // Create product
    const createdProduct = await stripe.products.create({
      name: product.name,
      description: product.description,
    });

    console.log(`  Product ID: ${createdProduct.id}`);

    const prices: Record<string, string> = {};

    // Create prices for each interval
    for (const priceConfig of product.prices) {
      console.log(`  Creating price: ${priceConfig.nickname} - $${priceConfig.amount / 100}/${priceConfig.interval}`);

      const createdPrice = await stripe.prices.create({
        product: createdProduct.id,
        unit_amount: priceConfig.amount,
        currency: 'usd',
        recurring: {
          interval: priceConfig.interval as 'month' | 'year',
        },
        nickname: priceConfig.nickname,
      });

      console.log(`    Price ID: ${createdPrice.id}`);
      prices[priceConfig.nickname] = createdPrice.id;
    }

    results[product.name] = {
      productId: createdProduct.id,
      prices,
    };

    console.log('');
  }

  // Output summary
  console.log('\n========================================');
  console.log('STRIPE CONFIGURATION SUMMARY');
  console.log('========================================\n');

  console.log('# Environment Variables for Frontend (.env):');
  console.log(`VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51T5TpVEPAQKb2xdh9mGnFrkFGBjOEx35NuiHGmtxdWorfG78VQnuI42TpWlVd0Han0WghsDNvbee8si2ytjA3HE700BOjt48PT`);
  console.log('');

  for (const [productName, data] of Object.entries(results)) {
    const tier = productName.includes('Starter') ? 'starter' : 'growth';
    console.log(`# ${tier.toUpperCase()} Plan`);
    console.log(`VITE_STRIPE_${tier.toUpperCase()}_PRODUCT_ID=${data.productId}`);
    console.log(`VITE_STRIPE_${tier.toUpperCase()}_MONTHLY_PRICE_ID=${data.prices[`${tier}_monthly`]}`);
    console.log(`VITE_STRIPE_${tier.toUpperCase()}_ANNUAL_PRICE_ID=${data.prices[`${tier}_annual`]}`);
    console.log('');
  }

  console.log('# Environment Variables for Backend/Server:');
  console.log('STRIPE_SECRET_KEY=<your_stripe_secret_key>');
  console.log('');

  // Create .env.local content
  console.log('# Copy to your .env.local file:');
  console.log('-----------------------------------');
  let envContent = `# Frontend (Vite)\n`;
  envContent += `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51T5TpVEPAQKb2xdh9mGnFrkFGBjOEx35NuiHGmtxdWorfG78VQnuI42TpWlVd0Han0WghsDNvbee8si2ytjA3HE700BOjt48PT\n`;
  envContent += `\n# Stripe Product/Price IDs\n`;

  for (const [productName, data] of Object.entries(results)) {
    const tier = productName.includes('Starter') ? 'starter' : 'growth';
    envContent += `VITE_STRIPE_${tier.toUpperCase()}_PRODUCT_ID=${data.productId}\n`;
    envContent += `VITE_STRIPE_${tier.toUpperCase()}_MONTHLY_PRICE_ID=${data.prices[`${tier}_monthly`]}\n`;
    envContent += `VITE_STRIPE_${tier.toUpperCase()}_ANNUAL_PRICE_ID=${data.prices[`${tier}_annual`]}\n`;
  }

  console.log(envContent);

  return results;
}

createProductsAndPrices()
  .then(() => console.log('\nDone!'))
  .catch(console.error);
