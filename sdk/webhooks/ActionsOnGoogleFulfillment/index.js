/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const {
  PIZZA,
  addLineItem,
  createOrder,
  getGooglePaymentParameters,
  getMerchantPaymentParameters,
  getOrderOptions,
  getPresentationOptions,
} = require('./orders');
const {conversation, OrderUpdate} = require('@assistant/conversation');
const functions = require('firebase-functions');

const app = conversation({debug: true});

/*
 * Reset transaction decision session parameter
 * writeback value to allow slot to be filled again.
 */
const resetTransactionDecision = (conv) => {
  delete conv.session.params.TransactionDecision;
};

const createTransactionDecision =
  (order, orderOptions, presentationOptions, paymentParameters) => {
  return {
    // eslint-disable-next-line max-len
    '@type': 'type.googleapis.com/google.actions.transactions.v3.TransactionDecisionValueSpec',
    order,
    orderOptions,
    presentationOptions,
    paymentParameters,
  };
};

app.handle('configure_gpay_payment_option', (conv) => {
  conv.session.params.paymentOption = 'GOOGLE_PAY';
});

app.handle('configure_merchant_payment_option', (conv) => {
  conv.session.params.paymentOption = 'MERCHANT';
});

app.handle('prepare_order', (conv) => {
  // Create an order
  const order = createOrder(conv);
  addLineItem(order, PIZZA);

  const orderOptions = getOrderOptions();

  const presentationOptions = getPresentationOptions();
  const googlePaymentParams = getGooglePaymentParameters(order);
  const merchantPaymentParams = getMerchantPaymentParameters();
  const isGooglePay = conv.session.params.paymentOption === 'GOOGLE_PAY';
  const paymentParameters =
    isGooglePay ? googlePaymentParams : merchantPaymentParams;

  // Reset any previous Transaction Decision session parameter writebacks
  resetTransactionDecision(conv);

  conv.session.params.order = createTransactionDecision(
    order, orderOptions, presentationOptions, paymentParameters);
});

app.handle('update_order', (conv) => {
  const currentTime = new Date().toISOString();
  const order = conv.session.params.TransactionDecision.order;
  conv.add(new OrderUpdate({
    'updateMask': {
      'paths': [
        'purchase.status',
        'purchase.user_visible_status_label',
      ],
    },
    'order': {
      'merchantOrderId': order.merchantOrderId,
      'lastUpdateTime': currentTime,
      'purchase': {
        'status': 'SHIPPED',
        'userVisibleStatusLabel': 'Order confirmed',
      },
      'transaction_merchant': {
        'name': 'Helper Demo',
      },
    },
    'reason': 'Payment confirmed',
  }));
});

exports.ActionsOnGoogleFulfillment = functions.https.onRequest(app);
