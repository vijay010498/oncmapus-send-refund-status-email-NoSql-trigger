const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgmail = require('@sendgrid/mail');
admin.initializeApp();
const REFUND_DB = functions.config().database.refunddb;
const API_KEY = functions.config().sendgrid.key;
const TEMPLATE_REFUND = functions.config().sendgrid.templaterefundstatus;
sgmail.setApiKey(API_KEY);
const runTimeOpts = {
    timeoutSeconds: 300,
    memory: '1GB'
}
exports.sendRefundStatusEmail = 
functions
        .runWith(runTimeOpts)
        .database.instance(REFUND_DB).ref('/Refunds/{refundId}')
        .onWrite(async (change, context) =>{
            const snapshot = change.after;
            const refund = snapshot.val();
            const order = refund.orderModel;
            const orderId = context.params.refundId;
            const orderDate = order.transactionTime;
            const restaurantName = order.restaurantName.toLowerCase();
            const refundStatus = refund.status;
            const userName = order.userName;
            const refundAmount = refund.refundAmount;
            const userEmail = order.userEmail;
            const itemTotal = order.onlyFoodPrice;
            const packingCharges = order.packingCharges;
            const deliveryCharges = order.deliveryCharges;
            const totalAmount = order.totalPayment;
            const transactionId = order.transactionId;
            const paymentMode = order.paymentMode;


            var isPickup = order.pickup;
            var orderType = "";
            if(isPickup == true)
                orderType = "Pickup";
            else
                orderType = "Delivery";
            const itemList = order.cartItemList;

            //Logging
            console.log('Order Id',orderId);
            console.log('Order Date',orderDate);
            console.log('Restaurant Name',restaurantName);
            console.log('Refund Status',refundStatus);
            console.log('User Name',userName);
            console.log('Refund Amount',refundAmount);
            console.log('Order Type',orderType);
            console.log('User Email',userEmail);
            console.log('Cart Item',itemList);
            console.log('Total payment',totalAmount);
            console.log('Transaction Id',transactionId);
            console.log('Payment Mode',paymentMode);
            console.log('Item Total',itemTotal);
            console.log('packingCharges',packingCharges);
            console.log('deliveryCharges',deliveryCharges);

            //Sending Mail
            const msg = {
                to:{
                    email:userEmail,
                    name:userName
                },
                from:{
                    email:'refunds@mails.oncampus.in',
                    name:'onCampus.in'
                },
                reply_to:{
                    email:'contact@oncampus.in',
                    name:'onCampus.in'
                },
                click_tracking:{
                    enable:true,
                    enable_text:true
    
                },
                open_tracking:{
                    enable:true
    
                },
                templateId: TEMPLATE_REFUND,
                dynamic_template_data:{
                    orderId:orderId,
                    orderDate:orderDate,
                    restaurantName:restaurantName,
                    userName:userName,
                    refundStatus:refundStatus,
                    refundAmount:refundAmount,
                    orderType:orderType,
                    itemTotal:itemTotal,
                    packingCharges:packingCharges,
                    deliveryCharges:deliveryCharges,
                    totalAmount:totalAmount,
                    transactionId:transactionId,
                    paymentMode:paymentMode,
                    transactionTime:orderDate,
                    items:itemList,
                },
            };
            return await sgmail.send(msg)
                .then(() =>{
                    console.log('Email sent Successfully');
                }).catch((error) =>{
                    console.log('Email Sending Error',error);
                });
        
        });
