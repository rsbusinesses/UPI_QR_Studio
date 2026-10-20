
/*
=========================================================
Project      : UPI QR Studio
Website      : https://rsbusinesses0.github.io/UPI_QR_Studio/
Created By   : Sumit Kumar Shakya
Developer    : Solo Creator & Developer
Developed For: RS Businesses
GitHub       : https://github.com/sksumitkumarshakya
Contact      : sksumitkumarshakya@gmail.com

Description  : JavaScript functionality for UPI QR Studio,
               including QR generation, user interactions,
               and other client-side website features.

Year         : 2026
=========================================================
*/

/* ==========================================
   UPI QR STUDIO - FAQ FUNCTIONALITY
   File: js/upi-faqs.js
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    const questionContainer = document.getElementById("faqQuestions");
    const pagination = document.getElementById("faqPagination");
    const categoryTitle = document.getElementById("faqCategoryTitle");
    const categoryDescription = document.getElementById("faqCategoryDescription");
    const topicToggle = document.getElementById("topicToggle");
    const topicList = document.getElementById("topicList");

    if (!questionContainer || !pagination || !topicList) {
        console.error("FAQ elements are missing from the HTML.");
        return;
    }

    const PAGE_SIZE = 10;
    let activeTopic = "customers";
    let currentPage = 1;
    let topicButtons = [];

    const faqData = {
        customers: {
            title: "Customers",
            description: "Find answers to common questions about using UPI.",
            questions: [
                { q: "What is UPI?", a: "Unified Payments Interface (UPI) is an instant payment system that enables users to transfer money between participating bank accounts through supported payment applications." },
                { q: "What is UPI Help Assistant?", a: "UPI Help Assistant provides support for UPI-related questions and transaction issues. Its features depend on the service or application providing the assistance." },
                { q: "What is a UPI-PIN?", a: "A UPI PIN is a confidential authentication code used to authorize certain UPI transactions. Never share your UPI PIN with anyone." },
                { q: "What happens if I enter the wrong UPI-PIN during a transaction?", a: "The transaction may be declined. Follow your payment application's instructions. If your PIN is blocked or forgotten, use the official PIN-reset process." },
                { q: "I selected my bank to link with UPI, but my bank account was not found. Why?", a: "Check that the mobile number registered with your bank matches the number verified in your UPI application. Also confirm that your bank and account are supported. Contact your bank if the issue continues." },
                { q: "How do I pay an online merchant through UPI?", a: "Select UPI at checkout and follow the payment instructions. Verify the recipient and amount in your UPI application before authorizing the transaction." },
                { q: "Do UPI money transfers happen only during banking hours?", a: "UPI is designed to support payments 24 hours a day, seven days a week, subject to service availability, maintenance, bank restrictions, and applicable limits." },
                { q: "I paid, but I have not received the product or service. Why?", a: "Check the transaction status and contact the merchant with your transaction reference. If the payment succeeded but the issue remains unresolved, raise a complaint through your payment application or bank." },
                { q: "How can I view my transaction history?", a: "Open your UPI application and find the transaction history or activity section. The exact location depends on your application." },
                { q: "How is UPI different from IMPS?", a: "UPI provides features such as UPI IDs, QR-code payments, and integrated payment applications. IMPS is an instant bank transfer service. Their payment methods and user experiences differ." },
                { q: "Can I use UPI without sharing my bank account number?", a: "You can often send or receive money using a UPI ID or QR code without manually sharing your bank account number." },
                { q: "What should I do if a UPI transaction is pending?", a: "Check the transaction status before trying again. Avoid making a duplicate payment until the original transaction's status is clear." },
                { q: "Can I cancel a completed UPI payment?", a: "A successfully completed UPI payment generally cannot simply be cancelled. Contact your bank promptly if you sent money to the wrong recipient or suspect fraud." },
                { q: "Is it safe to scan a UPI QR code?", a: "Use QR codes from trusted sources and verify the recipient's displayed name and payment amount before authorizing the transaction." },
                { q: "Do I need to pay money to receive money through UPI?", a: "You do not need to enter your UPI PIN simply to receive money. Be cautious of requests asking you to enter your PIN to claim a refund or receive funds." },
                { q: "Can I link more than one bank account to UPI?", a: "Many UPI applications support multiple eligible bank accounts. You can select the account you want to use for a payment." },
                { q: "What should I do if my mobile phone is lost?", a: "Contact your mobile operator to block your SIM and notify your bank. Secure your accounts and never share your UPI PIN or OTP." },
                { q: "Can I use multiple UPI applications on one phone?", a: "Yes. You can register with multiple supported UPI applications, subject to each application's requirements and your bank's support." },
                { q: "What should I do if I forget my UPI PIN?", a: "Use the Forgot or Reset UPI PIN option in your application and complete the verification steps required by your bank." },
                { q: "Can I receive money by entering my UPI PIN?", a: "You do not need to enter your UPI PIN to receive money. A request to enter your PIN to receive funds may be fraudulent." },
                { q: "What should I do if I receive an unexpected collect request?", a: "Review the request carefully. Approve it only if you recognize the requester and intend to make the payment. Decline suspicious requests." },
                { q: "What if my bank account is debited but the transaction fails?", a: "Check the transaction status and applicable reversal period. If the amount is not returned within the expected period, raise a complaint through your UPI application or bank." }
            ]
        },

        banks: {
            title: "Banks",
            description: "Questions about banks and UPI banking services.",
            questions: [
                { q: "How do I link my bank account to UPI?", a: "Open a supported UPI application, select your bank, and follow the account-verification steps. Your registered mobile number generally needs to be available on the device." },
                { q: "Why is my bank account not showing in the app?", a: "Check your registered mobile number, network connection, bank availability, and account eligibility. Contact your bank if the account still does not appear." },
                { q: "Can I link more than one bank account?", a: "Many UPI applications support multiple eligible bank accounts. Follow the application's instructions to add and select an account." },
                { q: "What should I do if a bank transfer is pending?", a: "Check the transaction status and reference number. Contact your bank or use the application's dispute process if the transaction remains unresolved." },
                { q: "Can I change my default bank account?", a: "If your application supports multiple linked accounts, you can generally choose a preferred account in its bank-account settings." },
                { q: "How can a bank join UPI as a Payment Service Provider?", a: "A bank must follow the applicable NPCI onboarding process and technical, operational, security, and compliance requirements." },
                { q: "How can a bank participate as a remitter or beneficiary bank?", a: "The bank must complete the applicable onboarding and integration process for the relevant UPI role." },
                { q: "How can a bank onboard a merchant for UPI?", a: "The acquiring bank follows merchant verification, onboarding, and applicable compliance procedures before enabling UPI acceptance." },
                { q: "What should a bank do if a UPI transaction fails?", a: "The bank should investigate the transaction status, reconcile relevant records, process applicable reversals, and assist with dispute resolution." }
            ]
        },

        apps: {
            title: "Third Party Applications (TPAPs)",
            description: "Learn about third-party UPI applications.",
            questions: [
                { q: "What is a Third Party Application Provider (TPAP)?", a: "A TPAP is a third-party application provider participating in the UPI ecosystem through applicable banking and network arrangements." },
                { q: "How can a TPAP get onboarded on UPI?", a: "A TPAP generally approaches a sponsoring bank, which helps initiate the applicable onboarding process." },
                { q: "Can I use different UPI applications?", a: "Yes. You can use compatible applications supported by your bank and the UPI ecosystem, subject to each application's requirements." },
                { q: "Who should I contact about a transaction in a UPI application?", a: "Start with the application's official support channel and retain your transaction reference. Your bank may also assist with disputes." },
                { q: "What is the role of a sponsor bank?", a: "A sponsor bank facilitates the TPAP's participation in UPI and supports applicable technical, operational, security, and compliance processes." },
                { q: "Can users link bank accounts to a TPAP application?", a: "Eligible users can link supported bank accounts after completing mobile-number verification and the required registration steps." }
            ]
        },

        merchants: {
            title: "Merchants",
            description: "Information about receiving UPI payments as a merchant.",
            questions: [
                { q: "How can a merchant accept UPI payments?", a: "A merchant can arrange UPI acceptance through a supported acquiring bank or payment provider and use the payment methods offered." },
                { q: "Can I create a UPI QR code for my business?", a: "You can use a compatible merchant solution or an appropriate UPI QR generator. Verify the UPI ID and displayed recipient details before using the QR code." },
                { q: "How do I confirm that a customer has paid?", a: "Verify the successful transaction in your merchant application or bank records. Do not rely only on screenshots provided by the customer." },
                { q: "What is a Merchant Category Code?", a: "A Merchant Category Code (MCC) is a code used to classify a merchant according to the type of goods or services provided." },
                { q: "What UPI integration methods can merchants use?", a: "Depending on the payment provider, merchants may accept payments through QR codes, application integrations, intent-based payment flows, and supported collect requests." },
                { q: "What is QR-based UPI integration?", a: "A UPI QR code contains payment information that allows a customer to scan the code, review the recipient and amount, and authorize the payment." },
                { q: "How can a merchant report a failed transaction?", a: "Contact the acquiring bank or payment provider and provide the transaction reference and relevant payment details." },
                { q: "How should a merchant process a customer refund?", a: "Initiate the refund through the supported payment system or acquiring bank and follow the applicable refund procedures." }
            ]
        },

        ppi: {
            title: "PrePaid Payment Instruments (PPI) on UPI",
            description: "Questions about eligible prepaid payment instruments.",
            questions: [
                { q: "What is a Prepaid Payment Instrument?", a: "A Prepaid Payment Instrument (PPI) stores value in advance and can be used for eligible payments, subject to its terms and applicable regulations." },
                { q: "What is PPI interoperability through UPI?", a: "PPI interoperability allows eligible prepaid instruments to participate in UPI payments through supported applications and arrangements." },
                { q: "Can prepaid wallets be used through UPI?", a: "Availability depends on the PPI issuer, payment application, account eligibility, and applicable UPI rules." },
                { q: "How does PPI interoperability benefit customers?", a: "Eligible customers can use supported prepaid balances for permitted payments at participating merchants." },
                { q: "How does PPI interoperability benefit merchants?", a: "Merchants accepting UPI may accept eligible interoperable prepaid payments through their existing UPI acceptance arrangements." },
                { q: "Can I link a prepaid wallet to a third-party UPI application?", a: "This depends on the PPI issuer, the wallet's eligibility, and the capabilities of the supported UPI application." }
            ]
        },

        ipo: {
            title: "IPO",
            description: "Information about UPI and IPO applications.",
            questions: [
                { q: "What is IPO through UPI?", a: "UPI can be used to authorize a payment mandate for eligible IPO applications, subject to the applicable process and rules." },
                { q: "How do I apply for an IPO using UPI?", a: "Submit your application through an eligible intermediary, provide your UPI ID, receive the mandate request, and approve it through your UPI application." },
                { q: "What happens after I approve the IPO mandate?", a: "The application amount may be blocked in your bank account. The funds are debited or released according to the allotment result and applicable process." },
                { q: "Can I use any UPI ID for an IPO application?", a: "Use a valid UPI ID supported by the IPO process and linked to an eligible account. Verify the mandate details before approving." },
                { q: "What should I do if I do not receive the IPO mandate?", a: "Check your application's mandate section and verify the UPI ID used in the IPO application. Contact your intermediary or bank if the request does not appear." },
                { q: "What happens if my IPO application is unsuccessful?", a: "Blocked funds should be released according to the applicable IPO process and timelines. Contact your bank or intermediary if the release is delayed." },
                { q: "Can I use BHIM for an IPO mandate?", a: "Where supported, use your UPI ID in the eligible IPO application and approve the mandate through BHIM after verifying its details." }
            ]
        },

        lite: {
            title: "UPI Lite",
            description: "Learn about UPI Lite payments.",
            questions: [
                { q: "What is UPI Lite?", a: "UPI Lite is a payment feature designed to make eligible lower-value payments more convenient using a balance added from a linked bank account." },
                { q: "How does UPI Lite work?", a: "Enable UPI Lite in a supported application, add money from your linked bank account, and use the available balance for eligible payments." },
                { q: "What is the UPI Lite balance limit?", a: "Limits depend on the current scheme rules and supported application. Check your application's displayed limits before adding funds." },
                { q: "Do I need a UPI PIN for every UPI Lite payment?", a: "Eligible UPI Lite transactions may be completed without entering the UPI PIN for every payment. Other actions may require authentication." },
                { q: "Can I add money to UPI Lite?", a: "Yes. You can replenish the balance from a linked bank account through the supported top-up process." },
                { q: "Can I disable UPI Lite?", a: "Use the disable or deactivate option in your supported application and follow the instructions for any remaining balance." },
                { q: "What happens if my UPI Lite payment fails?", a: "Check the transaction status and available balance. If the issue remains unresolved, contact your bank or use the application's complaint process." }
            ]
        },

        litex: {
            title: "UPI LiteX",
            description: "Information about UPI LiteX and offline payment functionality.",
            questions: [
                { q: "What is UPI LiteX?", a: "UPI LiteX is associated with offline payment functionality that can support eligible small-value payments between compatible devices." },
                { q: "How does offline UPI LiteX payment work?", a: "Compatible devices use the supported offline payment mechanism. Transaction synchronization and status updates follow the service's rules." },
                { q: "Which devices support UPI LiteX?", a: "Availability depends on device compatibility, participating UPI applications, and supported service configurations." },
                { q: "Does every UPI application support UPI LiteX?", a: "No. Check the feature list and eligibility information provided by your bank or payment application." },
                { q: "What happens when a device reconnects to the internet?", a: "Transaction information may be synchronized through the supported service process. Check the status in your UPI application." }
            ]
        },

        tap: {
            title: "UPI Tap & Pay",
            description: "Questions about contactless UPI payments.",
            questions: [
                { q: "What is UPI Tap & Pay?", a: "UPI Tap & Pay allows eligible users to initiate payments using compatible contactless devices and merchant equipment." },
                { q: "What do I need to use UPI Tap & Pay?", a: "You need a compatible device, a UPI application that supports the feature, and a compatible merchant device or tag." },
                { q: "How do I make a payment using Tap & Pay?", a: "Open the supported application, select Tap & Pay, review the payment details, tap your device against the compatible receiver, and follow the authentication instructions." },
                { q: "Do I need a UPI PIN for Tap & Pay?", a: "Authentication requirements depend on the payment mode, amount, and applicable rules. Follow the instructions in your application." },
                { q: "Does every phone support Tap & Pay?", a: "No. Device compatibility and feature availability depend on the phone, payment application, and merchant setup." }
            ]
        },

        hello: {
            title: "Hello! UPI",
            description: "Information about conversational and voice-enabled UPI.",
            questions: [
                { q: "What is Hello! UPI?", a: "Hello! UPI is a conversational payment service designed to let users interact with supported UPI services through voice-based interfaces." },
                { q: "How can I make a payment using voice?", a: "Use a supported service, follow its voice instructions, review the recipient and amount, and complete the required authentication before authorizing payment." },
                { q: "Can I make a payment without checking the details?", a: "No. Always verify the recipient and amount before confirming a payment, including when using a voice-based interface." },
                { q: "What should I do if a voice payment fails?", a: "Check the transaction status in your UPI application or bank account. Contact your bank if the transaction remains unresolved." },
                { q: "Which languages are supported?", a: "Language availability depends on the participating service and current application capabilities." }
            ]
        },

        onboarding: {
            title: "User Onboarding on UPI",
            description: "Guidance for getting started with UPI.",
            questions: [
                { q: "What do I need to start using UPI?", a: "You generally need an eligible bank account, a supported payment application, and the ability to verify the mobile number registered with your bank." },
                { q: "How do I register for UPI?", a: "Install a supported application, verify your registered mobile number, select your bank account, and complete the required setup." },
                { q: "Why must my mobile number match my bank records?", a: "Mobile-number verification helps identify eligible bank accounts associated with the registered number." },
                { q: "Why is mobile verification failing?", a: "Check your SIM, SMS permissions, network signal, and the application's instructions. Contact your bank if verification continues to fail." },
                { q: "Do I need a debit card to set my UPI PIN?", a: "Depending on your bank and supported application, you may be able to set a UPI PIN using debit-card details or another supported authentication method." },
                { q: "Can I use UPI if I change my mobile number?", a: "Update your mobile number with your bank first, then complete the verification and account-linking process in your UPI application." }
            ]
        },

        number: {
            title: "UPI Number",
            description: "Questions about using a number to identify a UPI recipient.",
            questions: [
                { q: "What is a UPI Number?", a: "A UPI Number is a supported payment identifier that can be used to route eligible payments to a registered UPI user." },
                { q: "Can I use my mobile number as a UPI Number?", a: "Some supported applications allow a mobile number to be configured as a payment identifier. Availability depends on registration and provider support." },
                { q: "Can I change or disable my UPI Number?", a: "Where supported, you can manage the identifier through your application's profile or payment-address settings." },
                { q: "What should I do if a payment goes to the wrong recipient?", a: "Contact your bank or UPI application promptly and raise a dispute. Always verify the recipient's displayed name before authorizing payments." }
            ]
        },

        credit: {
            title: "Credit Line on UPI",
            description: "Information about eligible credit facilities linked to UPI.",
            questions: [
                { q: "What is Credit Line on UPI?", a: "Credit Line on UPI enables eligible customers to use a bank-approved credit facility for permitted UPI payments." },
                { q: "How do I link a credit line to UPI?", a: "Open a supported application, choose Credit Line, select the issuing bank and available facility, and complete the required verification and PIN setup." },
                { q: "Are there fees for linking a credit line?", a: "Linking may be free, but interest, processing fees, or other credit-facility charges may depend on the issuing bank. Review the terms before accepting an offer." },
                { q: "Can I use Credit Line on UPI to pay merchants?", a: "Eligible payments depend on the issuing bank, participating application, merchant category, and applicable rules." },
                { q: "How can I repay Credit Line on UPI?", a: "Follow the repayment options and due dates provided by your issuing bank. Available methods depend on the credit facility." },
                { q: "How can I dispute a Credit Line transaction?", a: "Raise a complaint through your UPI application or contact the issuing bank. Keep the transaction reference for tracking." },
                { q: "Can I check how much credit I have used?", a: "Supported applications may display the available credit, utilized amount, and repayment details." }
            ]
        },

        circle: {
            title: "UPI Circle",
            description: "Learn about delegated UPI payment functionality.",
            questions: [
                { q: "What is UPI Circle?", a: "UPI Circle allows a primary user to authorize a secondary user to make eligible payments under configured limits and safeguards." },
                { q: "Who is a primary user?", a: "The primary user is the account holder who delegates payment authority to another person." },
                { q: "Who is a secondary user?", a: "The secondary user is the person authorized to make payments under the primary user's UPI Circle arrangement." },
                { q: "Does a secondary user need a bank account?", a: "Eligibility depends on the supported UPI Circle arrangement. Certain arrangements may support secondary users without their own linked UPI bank account." },
                { q: "Can the primary user control delegated payments?", a: "The primary user can manage the delegation within the controls, limits, and permissions provided by the supported application." },
                { q: "Are UPI Circle payments subject to limits?", a: "Yes. Limits and authorization requirements depend on the applicable rules and participating bank or application." }
            ]
        },

        reserve: {
            title: "UPI Reserve Pay",
            description: "Information about Reserve Pay and supported payment features.",
            questions: [
                { q: "What is UPI Reserve Pay?", a: "UPI Reserve Pay is a UPI-related service category. Its functionality and availability depend on the current product specification and participating institutions." },
                { q: "How can I check whether Reserve Pay is available?", a: "Check the features displayed in your supported UPI application and confirm eligibility with your bank." },
                { q: "Where can I find the terms for Reserve Pay?", a: "Review the feature description and terms provided by the payment application or institution before authorizing a payment." }
            ]
        },

        bhim: {
            title: "BHIM UPI",
            description: "Questions about using BHIM for UPI payments.",
            questions: [
                { q: "What is BHIM?", a: "BHIM (Bharat Interface for Money) is a UPI-based payment application that supports eligible payments between bank accounts." },
                { q: "What can I do with BHIM?", a: "Depending on the current application version, BHIM can support sending and receiving money, QR payments, transaction history, balance checks, bill payments, and other UPI features." },
                { q: "Can I send money using a UPI ID or QR code?", a: "Yes. Choose the relevant payment option, verify the recipient and amount, and authorize the transaction in the application." },
                { q: "Can I request money through BHIM?", a: "Supported versions may allow collect requests. Approve a request only if you recognize it and intend to pay." },
                { q: "Can I check my bank balance in BHIM?", a: "If supported for your linked account, use the balance-enquiry feature and complete the requested authentication." },
                { q: "Can I download or share my BHIM QR code?", a: "If available in your application, open your profile or QR section and use the share or download option." },
                { q: "Can I block suspicious payment requests?", a: "Use the application's available report, block, or spam controls for suspicious requests." },
                { q: "Can I use BHIM for IPO mandates?", a: "Where supported, use your UPI ID for an eligible IPO application and approve the mandate after checking its details." },
                { q: "Can I pay bills through BHIM?", a: "Bill-payment availability depends on the current application version and supported billers." },
                { q: "Does BHIM support recurring payments?", a: "Eligible UPI AutoPay mandates may be created or managed through supported application features." },
                { q: "How do I get started with BHIM?", a: "Install the application, verify the mobile number registered with your bank, link an eligible account, and follow the setup instructions." }
            ]
        },

        rupay: {
            title: "RuPay Credit Card on UPI",
            description: "Questions about linking eligible RuPay credit cards with UPI.",
            questions: [
                { q: "What is RuPay Credit Card on UPI?", a: "It allows eligible RuPay credit card holders to link a card to a supported UPI application and make permitted payments." },
                { q: "Which banks support RuPay Credit Card on UPI?", a: "Support depends on participating card issuers and can change. Check current availability with your card issuer or application." },
                { q: "Which applications support linking a RuPay Credit Card?", a: "Only supported UPI applications offer this feature. Check the card-linking options in your application." },
                { q: "How do I link my RuPay Credit Card to UPI?", a: "Open a supported application, choose the credit-card option, select your issuing bank and eligible card, and complete the required verification and PIN setup." },
                { q: "Why is my credit card not appearing in the UPI app?", a: "Check that the mobile number registered with the card issuer matches the number verified in the UPI application and that both providers support the feature." },
                { q: "Can I use the linked card for every UPI payment?", a: "No. Permitted transactions depend on issuer rules, merchant category, applicable regulations, and the application's supported payment types." },
                { q: "Are fees or interest applicable?", a: "Charges, interest, and other card terms are set by the issuer. Review your card's terms before using it." }
            ]
        },

        erupi: {
            title: "e-RUPI",
            description: "Questions about purpose-specific digital vouchers.",
            questions: [
                { q: "What is e-RUPI?", a: "e-RUPI is a purpose-specific digital voucher issued for an eligible beneficiary and designated service or benefit." },
                { q: "Who can issue e-RUPI vouchers?", a: "Eligible participating banks and authorized programme sponsors can issue vouchers under the applicable framework." },
                { q: "What is the maximum value of an e-RUPI voucher?", a: "Voucher limits depend on the current regulatory framework and specific programme. Confirm the permitted value with the issuer." },
                { q: "How do I redeem an e-RUPI voucher?", a: "Follow the voucher instructions and present the required details at an eligible participating service provider." },
                { q: "Can an e-RUPI voucher be used for any purchase?", a: "No. A voucher is restricted to its designated purpose and the conditions set by the issuer or sponsoring programme." }
            ]
        },

        aadhaar: {
            title: "BHIM Aadhaar Pay",
            description: "Questions about Aadhaar-based merchant payments.",
            questions: [
                { q: "What is BHIM Aadhaar Pay?", a: "BHIM Aadhaar Pay is an Aadhaar-based payment service that enables participating merchants to accept payments using biometric authentication." },
                { q: "How does a BHIM Aadhaar Pay transaction work?", a: "The merchant enters the payment details, the customer identifies the eligible bank account, and the customer completes biometric authentication on a supported device." },
                { q: "What does a customer need to use BHIM Aadhaar Pay?", a: "The customer needs an Aadhaar number linked to an eligible bank account and must complete the required biometric verification." },
                { q: "What equipment does a merchant need?", a: "A merchant needs a supported application, compatible certified biometric device, and the required merchant and banking arrangements." },
                { q: "Does the customer need a debit card or smartphone?", a: "The described Aadhaar-based biometric process does not require the customer to present a physical debit card or initiate the payment from their own smartphone." }
            ]
        },

        global: {
            title: "UPI Global Acceptance",
            description: "Questions about using UPI at participating international merchants.",
            questions: [
                { q: "What is UPI Global Acceptance?", a: "It allows eligible users to pay at participating international merchant locations through supported UPI applications." },
                { q: "Can I use UPI at every shop abroad?", a: "No. The country and merchant must participate, and your bank and UPI application must support the service." },
                { q: "How do I pay an international merchant?", a: "Enable the supported international payment feature, scan the merchant's QR code, review the amount and currency conversion, and authorize the payment." },
                { q: "Will I see the currency conversion before paying?", a: "Review the foreign-currency amount, Indian-currency equivalent, exchange rate, and any displayed charges before confirming." },
                { q: "Can international UPI payments have fees?", a: "Exchange rates and applicable fees depend on the participating bank and payment arrangement. Review the displayed details before authorizing the payment." }
            ]
        },

        points: {
            title: "Pay by Points on UPI",
            description: "Questions about redeeming eligible reward points for UPI payments.",
            questions: [
                { q: "What is Pay by Points on UPI?", a: "It allows eligible users to redeem supported credit-card reward points for eligible UPI payments." },
                { q: "Which cards are eligible for Pay by Points?", a: "Eligibility depends on the card issuer and supported UPI application." },
                { q: "How can I check my available reward points?", a: "If supported, select the reward-points option during checkout and review the balance and value displayed by the application or issuer." },
                { q: "Can I pay the full amount using reward points?", a: "This may be possible when sufficient eligible points are available and the application supports full redemption." },
                { q: "What happens if a points-based transaction is reversed?", a: "The issuer processes the reversal under the applicable payment and rewards programme rules. Eligible points may be credited back." },
                { q: "Is there an additional charge for using points?", a: "Charges and conditions depend on the participating issuer and rewards programme. Review the terms before confirming." },
                { q: "Do points expire when linked to UPI?", a: "Reward-point expiry rules are governed by the applicable card or loyalty programme terms." },
                { q: "What is the conversion rate for reward points?", a: "The conversion value depends on the issuer or rewards programme. Review the value shown before confirming payment." },
                { q: "Can I earn reward points on UPI transactions?", a: "This depends on the rewards policy of your card issuer or loyalty programme." },
                { q: "How are refunds handled for points-based payments?", a: "Refunds are processed under the payment and rewards programme rules. Contact the issuer if points are not restored as expected." }
            ]
        },

        autopay: {
            title: "UPI AutoPay",
            description: "Questions about recurring payments and UPI mandates.",
            questions: [
                { q: "What is UPI AutoPay?", a: "UPI AutoPay lets users authorize recurring payments through a UPI mandate." },
                { q: "How do I create an AutoPay mandate?", a: "Choose the recurring service, review the amount, frequency, validity, and other terms, then authorize the mandate through a supported UPI application." },
                { q: "Can I pause or cancel an AutoPay mandate?", a: "Where supported, use the mandate-management section of your application to pause or revoke the mandate." },
                { q: "What happens if an AutoPay payment fails?", a: "Check the mandate and transaction status, confirm sufficient funds or credit availability, and contact your bank or service provider if the issue continues." },
                { q: "Can I review my active mandates?", a: "Open the mandate or AutoPay section of a supported UPI application to view available active and past mandates." }
            ]
        },

        cashpoint: {
            title: "UPI Cash Point",
            description: "Questions about cash services at participating outlets.",
            questions: [
                { q: "What is UPI Cash Point?", a: "UPI Cash Point refers to a service that enables eligible customers to access supported cash services at participating outlets." },
                { q: "How do I withdraw cash through UPI Cash Point?", a: "Visit a participating outlet and follow its supported process. Verify the amount and details, authorize as instructed, and collect cash after confirmation." },
                { q: "Do I need a debit card for a QR-based cash service?", a: "A supported QR-based UPI process generally does not require a physical debit card, but you need an eligible account and compatible application." },
                { q: "What if the outlet cannot provide the requested cash?", a: "Ask about available alternatives or visit another participating outlet. Do not authorize a transaction unless you understand its details." },
                { q: "What if my account is debited but I do not receive cash?", a: "Keep the transaction reference and report the issue promptly to your bank or UPI application. Check the status before attempting another withdrawal." }
            ]
        }
    };

    function syncTopicButtons() {
        Object.entries(faqData).forEach(([key, data]) => {
            let button = topicList.querySelector(
                `.faq-topic[data-topic="${key}"]`
            );

            if (!button) {
                button = document.createElement("button");
                button.type = "button";
                button.className = "faq-topic";
                button.dataset.topic = key;

                const label = document.createElement("span");
                label.className = "faq-topic-label";
                button.appendChild(label);

                const arrow = document.createElement("span");
                arrow.className = "topic-arrow";
                arrow.setAttribute("aria-hidden", "true");
                button.appendChild(arrow);

                topicList.appendChild(button);
            }

            const label = button.querySelector(".faq-topic-label") ||
                button.querySelector("span");

            if (label) {
                label.textContent = data.title;
            }

            button.setAttribute("aria-pressed", "false");
        });

        topicButtons = [...topicList.querySelectorAll(".faq-topic")];

        topicButtons.forEach(button => {
            button.addEventListener("click", () => {
                selectTopic(button.dataset.topic);
            });
        });
    }

    function getActiveData() {
        return faqData[activeTopic] || faqData.customers;
    }

    function renderQuestions() {
        const data = getActiveData();
        const totalPages = Math.max(
            1,
            Math.ceil(data.questions.length / PAGE_SIZE)
        );

        currentPage = Math.min(currentPage, totalPages);

        const start = (currentPage - 1) * PAGE_SIZE;
        const pageQuestions = data.questions.slice(
            start,
            start + PAGE_SIZE
        );

        if (categoryTitle) {
            categoryTitle.textContent = data.title;
        }

        if (categoryDescription) {
            categoryDescription.textContent = data.description;
        }

        questionContainer.replaceChildren();

        if (pageQuestions.length === 0) {
            const empty = document.createElement("p");
            empty.className = "faq-empty";
            empty.textContent = "No FAQs are available in this category yet.";
            questionContainer.appendChild(empty);
        } else {
            pageQuestions.forEach(item => {
                const details = document.createElement("details");
                details.className = "faq-item";

                const summary = document.createElement("summary");
                summary.className = "faq-question";

                const questionText = document.createElement("span");
                questionText.className = "faq-question-text";
                questionText.textContent = item.q;

                const chevron = document.createElement("span");
                chevron.className = "faq-chevron";
                chevron.setAttribute("aria-hidden", "true");

                summary.append(questionText, chevron);

                const answer = document.createElement("div");
                answer.className = "faq-answer";

                const paragraph = document.createElement("p");
                paragraph.textContent = item.a;

                answer.appendChild(paragraph);
                details.append(summary, answer);
                questionContainer.appendChild(details);
            });
        }

        renderPagination(totalPages);
    }

    function makePageButton(label, accessibleLabel) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "faq-page-button";
        button.textContent = label;
        button.setAttribute("aria-label", accessibleLabel);
        return button;
    }

    function renderPagination(totalPages) {
        pagination.replaceChildren();

        if (totalPages <= 1) {
            return;
        }

        const previous = makePageButton("‹", "Previous page");
        previous.disabled = currentPage === 1;

        previous.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                renderQuestions();
            }
        });

        pagination.appendChild(previous);

        const pageNumbers = new Set([1, totalPages]);

        for (
            let page = Math.max(1, currentPage - 1);
            page <= Math.min(totalPages, currentPage + 1);
            page++
        ) {
            pageNumbers.add(page);
        }

        const sortedPages = [...pageNumbers].sort((a, b) => a - b);
        let previousPage = 0;

        sortedPages.forEach(page => {
            if (previousPage && page - previousPage > 1) {
                const ellipsis = document.createElement("span");
                ellipsis.className = "faq-page-ellipsis";
                ellipsis.textContent = "…";
                ellipsis.setAttribute("aria-hidden", "true");
                pagination.appendChild(ellipsis);
            }

            const button = makePageButton(
                String(page),
                `Page ${page}`
            );

            if (page === currentPage) {
                button.classList.add("active");
                button.setAttribute("aria-current", "page");
            }

            button.addEventListener("click", () => {
                currentPage = page;
                renderQuestions();
            });

            pagination.appendChild(button);
            previousPage = page;
        });

        const next = makePageButton("›", "Next page");
        next.disabled = currentPage === totalPages;

        next.addEventListener("click", () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderQuestions();
            }
        });

        pagination.appendChild(next);
    }

    function selectTopic(topic) {
        if (!faqData[topic]) {
            return;
        }

        activeTopic = topic;
        currentPage = 1;

        topicButtons.forEach(button => {
            const selected = button.dataset.topic === topic;

            button.classList.toggle("active", selected);
            button.setAttribute("aria-pressed", String(selected));
        });

        renderQuestions();

        if (
            topicToggle &&
            topicList &&
            window.matchMedia("(max-width: 650px)").matches
        ) {
            topicList.classList.remove("is-open");
            topicToggle.setAttribute("aria-expanded", "false");
        }
    }

    syncTopicButtons();
    selectTopic("customers");

    if (topicToggle && topicList) {
        topicToggle.addEventListener("click", () => {
            const isOpen = topicList.classList.toggle("is-open");

            topicToggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );
        });
    }
});