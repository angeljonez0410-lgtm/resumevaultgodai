import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const event = await req.json();

    console.log('PayPal webhook event:', event.event_type);

    // Handle different PayPal events
    switch (event.event_type) {
      case 'CHECKOUT.ORDER.APPROVED':
      case 'PAYMENT.SALE.COMPLETED': {
        // One-time payment completed
        const customId = event.resource.custom_id || event.resource.custom || '';
        const [userEmail, productType, productId] = customId.split('|');

        if (!userEmail) {
          console.error('No user email in custom_id');
          return Response.json({ error: 'Invalid custom_id' }, { status: 400 });
        }

        // Find user subscription record
        const subscriptions = await base44.asServiceRole.entities.UserSubscription.filter({
          created_by: userEmail
        });

        let userSub = subscriptions[0];

        if (!userSub) {
          // Create new subscription record
          userSub = await base44.asServiceRole.entities.UserSubscription.create({
            created_by: userEmail,
            subscription_status: 'free',
            ai_tasks_used: 0,
            credits_balance: 0
          });
        }

        // Grant access based on product type
        if (productType === 'addon') {
          // Add to premium_addons
          const currentAddons = userSub.premium_addons ? userSub.premium_addons.split(',') : [];
          if (!currentAddons.includes(productId)) {
            currentAddons.push(productId);
            await base44.asServiceRole.entities.UserSubscription.update(userSub.id, {
              premium_addons: currentAddons.join(',')
            });
          }
        } else if (productType === 'credits') {
          // Add credits with exact amounts
          const creditAmounts = {
            'credits_50': 50,
            'credits_150': 150,
            'credits_400': 400,
            'credits_1000': 1000
          };

          const creditsToAdd = creditAmounts[productId] || 0;
          
          if (creditsToAdd > 0) {
            const currentBalance = userSub.credits_balance || 0;
            const newBalance = currentBalance + creditsToAdd;

            await base44.asServiceRole.entities.UserSubscription.update(userSub.id, {
              credits_balance: newBalance
            });

            await base44.asServiceRole.entities.CreditTransaction.create({
              created_by: userEmail,
              credits_amount: creditsToAdd,
              transaction_type: 'purchase',
              description: `Purchased ${creditsToAdd} credits via PayPal`,
              payment_id: event.resource.id || event.id,
              balance_after: newBalance
            });

            console.log(`${creditsToAdd} credits added to ${userEmail}. New balance: ${newBalance}`);
          }
        }

        console.log(`Access granted to ${userEmail} for ${productType}:${productId}`);
        break;
      }

      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        // Subscription activated
        const customId = event.resource.custom_id || '';
        const [userEmail, planName] = customId.split('|');

        if (!userEmail || !planName) {
          console.error('Invalid subscription custom_id');
          return Response.json({ error: 'Invalid custom_id' }, { status: 400 });
        }

        const subscriptions = await base44.asServiceRole.entities.UserSubscription.filter({
          created_by: userEmail
        });

        let userSub = subscriptions[0];

        if (!userSub) {
          userSub = await base44.asServiceRole.entities.UserSubscription.create({
            created_by: userEmail,
            subscription_status: planName,
            subscription_id: event.resource.id
          });
        } else {
          await base44.asServiceRole.entities.UserSubscription.update(userSub.id, {
            subscription_status: planName,
            subscription_id: event.resource.id
          });
        }

        console.log(`Subscription ${planName} activated for ${userEmail}`);
        break;
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.EXPIRED': {
        const subscriptionId = event.resource.id;

        const subscriptions = await base44.asServiceRole.entities.UserSubscription.filter({
          subscription_id: subscriptionId
        });

        if (subscriptions.length > 0) {
          await base44.asServiceRole.entities.UserSubscription.update(subscriptions[0].id, {
            subscription_status: 'free',
            subscription_id: null
          });
          console.log(`Subscription ${subscriptionId} cancelled/expired`);
        }
        break;
      }

      default:
        console.log('Unhandled event type:', event.event_type);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});