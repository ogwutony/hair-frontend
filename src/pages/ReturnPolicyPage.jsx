// src/pages/ReturnPolicyPage.jsx
import React, { useEffect } from 'react';

export const ReturnPolicyPage = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
          <div style={{ maxWidth: '860px', margin: '0 auto', padding: '60px 30px', fontFamily: 'Inter, sans-serif', color: '#222', lineHeight: 1.8 }}>
            <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>Return Policy</h1>
            <p style={{ color: '#888', fontSize: '13px', marginBottom: '40px' }}>Last updated: August 16, 2026</p>

            <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>1. Customer-Initiated Returns</h2>
            <p>If you wish to return a product, you must initiate the return with our support team before sending the item back. Once initiated, you will receive a Reference ID or Return Merchandise Authorization (RMA) number. Unauthorized returns cannot be processed.</p>

            <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>2. Packaging and Shipping Your Return</h2>
            <p>Please create one return shipment per package (e.g., each box or mailer). You must clearly print your <strong>Reference ID/RMA and Tracking Number</strong> on the outside of the external packaging. <em>Failure to include this information on the physical package may result in the disposal of your returned items without a refund.</em></p>

            <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>3. Return to Sender (Failed Deliveries)</h2>
            <p>If a package cannot be delivered and is returned to our fulfillment center by the carrier, it will be automatically processed as a Return to Sender (RTS). Please ensure your address is correct at checkout to prevent delivery failures.</p>

            <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>4. Items Not Eligible for Return</h2>
            <p>For safety, hygiene, and compliance reasons, our fulfillment centers cannot accept returns for the following items. These items will be automatically disposed of upon receipt:</p>
            <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
              <li>Hazardous materials (e.g., aerosols, batteries, certain chemicals)</li>
              <li>Food products, ingestibles, medicines, vitamins, or supplements</li>
              <li>Intimate apparel, toys, or intimacy-related goods</li>
              <li>Medical supplies or testing kits</li>
            </ul>

            <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>5. Processing and Refunds</h2>
            <p>Our fulfillment center processes the physical inventory upon receipt. Once the returned item is inspected and handled according to our safety guidelines, The Majorities will process your applicable refund or exchange. Please allow adequate time for processing after the carrier marks the return as delivered.</p>
          </div>
        );
  };
