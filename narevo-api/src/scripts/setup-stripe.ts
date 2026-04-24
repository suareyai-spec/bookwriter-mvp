import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-04-30.basil' as any });

async function main() {
  // Create product
  const product = await stripe.products.create({
    name: 'Narevo API',
    description: 'Social media management API — schedule, publish, analyze, and generate AI captions.',
  });
  console.log(`Product created: ${product.id}`);

  // Create prices
  const plans = [
    { name: 'starter', amount: 2900 },
    { name: 'growth', amount: 7900 },
    { name: 'agency', amount: 19900 },
  ];

  for (const plan of plans) {
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.amount,
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: { plan: plan.name },
    });
    console.log(`STRIPE_${plan.name.toUpperCase()}_PRICE_ID=${price.id}`);
  }

  console.log('\nAdd the price IDs above to your .env file.');
}

main().catch(console.error);
