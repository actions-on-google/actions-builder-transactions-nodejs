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

// Pizza line item
exports.PIZZA = {
  'id': 'LINE_ITEM_ID',
  'name': 'Pizza',
  'description': 'A four cheese pizza.',
  'priceAttributes': [
    {
      'type': 'REGULAR',
      'name': 'Item Price',
      'state': 'ACTUAL',
      'amount': {
        'currencyCode': 'USD',
        'amountInMicros': 8990000,
      },
      'taxIncluded': true,
    },
    {
      'type': 'TOTAL',
      'name': 'Total Price',
      'state': 'ACTUAL',
      'amount': {
        'currencyCode': 'USD',
        'amountInMicros': 9990000,
      },
      'taxIncluded': true,
    },
  ],
  'notes': [
    'Extra cheese.',
  ],
  'purchase': {
    'quantity': 1,
    'unitMeasure': {
      'measure': 1,
      'unit': 'POUND',
    },
    'itemOptions': [
      {
        'id': 'ITEM_OPTION_ID',
        'name': 'Pepperoni',
        'prices': [
          {
            'type': 'REGULAR',
            'state': 'ACTUAL',
            'name': 'Item Price',
            'amount': {
              'currencyCode': 'USD',
              'amountInMicros': 1000000,
            },
            'taxIncluded': true,
          },
          {
            'type': 'TOTAL',
            'name': 'Total Price',
            'state': 'ACTUAL',
            'amount': {
              'currencyCode': 'USD',
              'amountInMicros': 1000000,
            },
            'taxIncluded': true,
          },
        ],
        'note': 'Extra pepperoni',
        'quantity': 1,
        'subOptions': [],
      },
    ],
  },
};

/**
 * Gets the merchant information for a transaction
 * https://developers.google.com/assistant/transactions/reference/physical/rest/v3/Order#Merchant
 * @return {object} the merchant information of an order
 */
const getTransactionMerchant = () => {
  return {
    'id': 'http://www.example.com',
    'name': 'Example Merchant',
  };
};

/**
 * Gets the buyer information for a transaction
 * https://developers.google.com/assistant/transactions/reference/physical/rest/v3/Order#UserInfo
 * @return {object} the buyer information of an order
 */
const getBuyerInfo = () => {
  return {
    'email': 'janedoe@gmail.com',
    'firstName': 'Jane',
    'lastName': 'Doe',
  };
};

/**
 * Gets an array of follow up actions for a transaction
 * https://developers.google.com/assistant/transactions/reference/physical/rest/v3/Order#Action
 * @return {array} an array of follow up actions for an order
 */
const getFollowUpActions = () => {
  return [
    {
      'type': 'VIEW_DETAILS',
      'title': 'View details',
      'openUrlAction': {
        'url': 'http://example.com',
      },
    },
    {
      'type': 'CALL',
      'title': 'Call us',
      'openUrlAction': {
        'url': 'tel:+16501112222',
      },
    },
    {
      'type': 'EMAIL',
      'title': 'Email us',
      'openUrlAction': {
        'url': 'mailto:person@example.com',
      },
    },
  ];
};

/**
 * Gets promotions for a transaction
 * https://developers.google.com/assistant/transactions/reference/physical/rest/v3/Order#Promotion
 * @return {array} an array of promotions for an order
 */
const getPromotions = () => {
  return [
    {
      'coupon': 'COUPON_CODE',
    },
  ];
};

/**
 * Gets fulfillment information for a transaction
 * https://developers.google.com/assistant/transactions/reference/physical/rest/v3/Order#PurchaseFulfillmentInfo
 * @param {object} conv The conversation object
 * @return {object} the fulfillment information for an order
 */
const getFulfillmentInfo = (conv) => {
  const location = conv.session.params.TransactionDeliveryAddress.location;
  return {
    'id': 'FULFILLMENT_SERVICE_ID',
    'fulfillmentType': 'DELIVERY',
    'location': location,
    'shippingMethodName': 'USPS',
    'fulfillmentContact': {
      'email': 'johnjohnson@gmail.com',
      'firstName': 'John',
      'lastName': 'Johnson',
      'displayName': 'John Johnson',
    },
  };
};

/**
 * Gets purchase information for a transaction
 * https://developers.google.com/assistant/transactions/reference/physical/rest/v3/Order#PurchaseOrderExtension
 * @param {object} conv The conversation object
 * @return {object} the purchase information for an order
 */
const getPurchaseInfo = (conv) => {
  return {
    'status': 'CREATED',
    'userVisibleStatusLabel': 'CREATED',
    'type': 'FOOD',
    'fulfillmentInfo': getFulfillmentInfo(conv),
  };
};

/**
 * Calculates the price of an order given the price of each of it's line items
 * https://developers.google.com/assistant/transactions/reference/physical/rest/v3/Order#PriceAttribute
 * @param {object} order The order used to calculate the price
 */
const calculatePrice = (order) => {
  // Reducer to calculate the subtotal of order line items
  const calculateSubTotal = (subTotal, lineItem) => {
    const isTotalPrice = (price) => { price.type === 'TOTAL' };
    subTotal + lineItem.priceAttributes.find(isTotalPrice);
  };
  // Reducer to calculate the total of order line items
  const calculateTotal = (totalPrice, fee) => {
    totalPrice + fee.amount.amountInMicros;
  };
  // Fixed delivery fee for order
  const deliveryFee = {
    'type': 'DELIVERY',
    'name': 'Delivery',
    'state': 'ACTUAL',
    'amount': {
      'currencyCode': 'USD',
      'amountInMicros': 2000000,
    },
    'taxIncluded': true,
  };
  // Subtotal for order
  const subTotal = {
    'type': 'SUBTOTAL',
    'name': 'Subtotal',
    'state': 'ESTIMATE',
    'amount': {
      'currencyCode': 'USD',
      'amountInMicros': order.contents.lineItems.reduce(calculateSubTotal, 0),
    },
    'taxIncluded': true,
  };
  // Fixed tax for order
  const tax = {
    'type': 'TAX',
    'name': 'Tax',
    'state': 'ESTIMATE',
    'amount': {
      'currencyCode': 'USD',
      'amountInMicros': 3780000,
    },
    'taxIncluded': true,
  };
  // Total price for order
  const total = {
    'type': 'TOTAL',
    'name': 'Total Price',
    'state': 'ESTIMATE',
    'amount': {
      'currencyCode': 'USD',
      'amountInMicros': [deliveryFee, subTotal, tax].reduce(calculateTotal, 0),
    },
    'taxIncluded': true,
  };
  order.priceAttributes.push(deliveryFee, subTotal, tax, total);
};

/**
 * Gets order options for a transaction
 * https://developers.google.com/assistant/transactions/reference/physical/rest/v3/OrderOptions
 * @return {object} the order options for an order
 */
exports.getOrderOptions = () => {
  return {
    'requestDeliveryAddress': true,
    'userInfoOptions': {
      'userInfoProperties': ['EMAIL'],
    },
  };
};

/**
 * Gets presentation options for a transaction
 * https://developers.google.com/assistant/transactions/reference/physical/rest/v3/PresentationOptions
 * @return {object} the presentation options for an order
 */
exports.getPresentationOptions = () => {
  return {
    'actionDisplayName': 'PLACE_ORDER',
  };
};

/**
 * Gets payment parameters for a transaction using the google payment option
 * https://developers.google.com/assistant/transactions/reference/physical/rest/v3/PaymentParameters
 * @return {object} the payment parameters for an order
 *
 * Caution: Currently, Google is working with a limited number of
 * partners that can get access to the production Google Pay API.
 * If you're not a partner, you're welcome to test 
 * the integration using the sandbox environment.
 */
exports.getGooglePaymentParameters = (order) => {
  const isTotalPrice = (price) => { price.type === 'TOTAL'};
  const calculateTotal = (total, price) => { total + price / 1000000 };
  return {
    'googlePaymentOption': {
      // facilitationSpec is expected to be a serialized JSON string
      'facilitationSpec': JSON.stringify({
        'apiVersion': 2,
        'apiVersionMinor': 0,
        'merchantInfo': {
          'merchantName': 'Example Merchant',
        },
        'allowedPaymentMethods': [
          {
            'type': 'CARD',
            'parameters': {
              'allowedAuthMethods': ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
              'allowedCardNetworks': [
                'AMEX', 'DISCOVER', 'JCB', 'MASTERCARD', 'VISA'],
            },
            'tokenizationSpecification': {
              'type': 'PAYMENT_GATEWAY',
              'parameters': {
                'gateway': 'example',
                'gatewayMerchantId': 'exampleGatewayMerchantId',
              },
            },
          },
        ],
        'transactionInfo': {
          'totalPriceStatus': 'FINAL',
          'totalPrice': `${order.priceAttributes.filter(isTotalPrice).reduce(calculateTotal, 0)}`,
          'currencyCode': 'USD',
        },
      }),
    },
  };
};

/**
 * Gets payment parameters for a transaction using the merchant payment option
 * https://developers.google.com/assistant/transactions/reference/physical/rest/v3/PaymentParameters
 * @return {object} the payment parameters for an order
 */
exports.getMerchantPaymentParameters = () => {
  return {
    'merchantPaymentOption': {
      'defaultMerchantPaymentMethodId': '12345678',
      'managePaymentMethodUrl': 'https://example.com/managePayment',
      'merchantPaymentMethod': [{
        'paymentMethodDisplayInfo': {
          'paymentMethodDisplayName': 'VISA **** 1234',
          'paymentType': 'PAYMENT_CARD',
        },
        'paymentMethodGroup': 'Payment method group',
        'paymentMethodId': '12345678',
        'paymentMethodStatus': {
          'status': 'STATUS_OK',
          'statusMessage': 'Status message',
        },
      }],
    },
  };
};

/**
 * Creates an order for a transaction containing no line items
 * https://developers.google.com/assistant/transactions/reference/physical/rest/v3/Order
 * @param {object} conv The conversation object
 * @return {object} an order
 */
exports.createOrder = (conv) => {
  const currentSecond = Math.round(Date.now() / 1000);
  const currentTime = new Date().toISOString();
  const orderId = `example-order-id-${currentSecond}`;
  return {
    'createTime': currentTime,
    'merchantOrderId': orderId,
    'userVisibleOrderId': orderId,
    'transactionMerchant': getTransactionMerchant(),
    'buyerInfo': getBuyerInfo(),
    'contents': {
      'lineItems': [],
    },
    'priceAttributes': [],
    'followUpActions': getFollowUpActions(),
    'termsOfServiceUrl': 'http://www.example.com',
    'note': 'Sale event',
    'promotions': getPromotions(),
    'purchase': getPurchaseInfo(conv),
  };
};

/**
 * Adds a line item to the contents of an order
 * https://developers.google.com/assistant/transactions/reference/physical/rest/v3/Order#LineItem
 * @param {object} order The order used for adding a line item
 */
exports.addLineItem = (order, lineItem) => {
  order.contents.lineItems.push(lineItem);
  calculatePrice(order);
};
