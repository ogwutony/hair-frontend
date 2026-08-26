// src/pages/ReturnPolicyPage.jsx
import React, { useEffect } from 'react';

export const ReturnPolicyPage = () => {
      useEffect(() => {
              window.scrollTo(0, 0);
              document.title = 'Return Policy | The Majorities';
      }, []);

      return (
              <div style={{ maxWidth: '860px', margin: '0 auto', padding: '60px 30px', fontFamily: 'Inter, sans-serif', color: '#222', lineHeight: 1.8 }}>
                        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>Return Policy</h1>h1>
                        <p style={{ color: '#888', fontSize: '13px', marginBottom: '40px' }}>Last updated: August 16, 2026</p>p>

                        <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>1. Return Window</h2>h2>
                        <p>You have <strong>30 days from the date of delivery</strong>strong> to initiate a return. Items must be in their original, unused condition and in original packaging where applicable. Returns requested outside this window will not be accepted.</p>p>
              
                    <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>2. Customer-Initiated Returns</h2>h2>
                    <p>To initiate a return, contact our support team at <a href="mailto:support@themajorities.com" style={{ color: '#222' }}>support@themajorities.com</a>a> before sending the item back. Include your order number and the reason for the return. Once approved, you will receive a <strong>Reference ID or Return Merchandise Authorization (RMA) number</strong>strong>. Unauthorized returns cannot be processed.</p>p>
              
                    <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>3. Return Shipping</h2>h2>
                    <p>Customers are responsible for return shipping costs unless the item arrived damaged or incorrect, in which case The Majorities will provide a prepaid return label. We recommend using a trackable shipping method, as we cannot guarantee receipt of untracked returns.</p>p>
              
                    <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>4. Packaging Your Return</h2>h2>
                    <p>Please create one return shipment per package (e.g., each box or mailer). You must clearly print your <strong>Reference ID/RMA and Tracking Number</strong>strong> on the outside of the external packaging. <em>Failure to include this information on the physical package may result in the disposal of your returned items without a refund.</em>em></p>p>
              
                    <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>5. Return to Sender (Failed Deliveries)</h2>h2>
                    <p>If a package cannot be delivered and is returned to our fulfillment center by the carrier, it will be automatically processed as a Return to Sender (RTS). Please ensure your address is correct at checkout to prevent delivery failures.</p>p>
              
                    <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>6. Items Not Eligible for Return</h2>h2>
                    <p>For safety, hygiene, and compliance reasons, our fulfillment centers cannot accept returns for the following items. These items will be automatically disposed of upon receipt:</p>p>
                    <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
                            <li>Hazardous materials (e.g., aerosols, batteries, certain chemicals)</li>li>
                            <li>Food products, ingestibles, medicines, vitamins, or supplements</li>li>
                            <li>Intimate apparel, toys, or intimacy-related goods</li>li>
                            <li>Medical supplies or testing kits</li>li>
                    </ul>ul>
              
                    <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>7. Refunds</h2>h2>
                    <p>Once your return is received and inspected, we will notify you by email. Approved refunds are issued to your <strong>original payment method</strong>strong> within <strong>5–10 business days</strong>strong>. If you paid by card, your bank's processing time may add additional days. We do not issue refunds to a different payment method than the one used at checkout.</p>p>
              
                    <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>8. Exchanges</h2>h2>
                    <p>If you would like to exchange an item, please initiate a return as described above and place a new order for the replacement item. We do not process direct exchanges at this time.</p>p>
              
                    <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>9. Contact Us</h2>h2>
                    <p>For any questions about your return, reach us at <a href="mailto:support@themajorities.com" style={{ color: '#222' }}>support@themajorities.com</a>a>. Please include your order number in all correspondence to help us assist you quickly.</p>p>
              </div>div>
            );
};
</p>
