// src/pages/AdminOrdersPage.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { BACKEND_URL } from '../utils/constants';
import { styles } from '../utils/styles';

export const AdminOrdersPage = ({ authToken, userEmail }) => {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const isOwner = userEmail === "YOUR_EMAIL@domain.com";

  const fetchAllOrders = useCallback(async () => {
    if (!authToken) return;
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Error retrieving site orders:", err);
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    if (isOwner) fetchAllOrders();
  }, [isOwner, fetchAllOrders]);

  const handleUpdateStatus = async (orderId, nextStatus) => {
    setUpdatingId(orderId);
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ status: nextStatus })
      });

      if (response.ok) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: nextStatus } : o));
      } else {
        alert("Server rejected status transition update.");
      }
    } catch (err) {
      alert("Network dropped during request.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isOwner) {
    return (
      <div style={styles.authContainer}>
        <div style={styles.authCard}>
          <h2>Access Restricted</h2>
          <p style={{ color: '#888' }}>This area is reserved for authorized personnel only.</p>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter(o => filterStatus === "All" || o.status === filterStatus);

  const getStatusColor = (status) => {
    if (status === "Shipped") return { background: '#d1ecf1', color: '#0c5460', border: '1px solid #bee5eb' };
    if (status === "Delivered") return { background: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' };
    return { background: '#fff3cd', color: '#856404', border: '1px solid #ffeeba' };
  };

  return (
    <div style={{ padding: '40px 60px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>Fulfillment Dashboard</h2>
          <p style={{ color: '#666', marginTop: '4px', fontSize: '14px' }}>Monitor customized formulas, audit transactions, and update package lifecycles.</p>
        </div>
        <button onClick={fetchAllOrders} style={{ ...styles.authButton, width: 'auto', padding: '10px 20px', background: '#34495e' }}>
          Refresh Orders
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '2px solid #eee', paddingBottom: '15px' }}>
        {["All", "Pending", "Shipped", "Delivered"].map(status => (
          <button key={status} onClick={() => setFilterStatus(status)}
            style={{
              padding: '8px 16px',
              backgroundColor: filterStatus === status ? '#222' : '#f5f5f5',
              color: filterStatus === status ? '#fff' : '#222',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px'
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#888' }}>Loading orders...</p>
      ) : filteredOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          No orders found matching status: <strong>"{filterStatus}"</strong>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredOrders.map(order => (
            <div key={order._id} style={{ border: '1px solid #e0e0e0', padding: '24px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', fontWeight: '700' }}>Order Reference</span>
                  <h3 style={{ margin: '2px 0', fontSize: '15px', fontFamily: 'monospace' }}>#{order._id}</h3>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#666' }}>Processed: <strong>{new Date(order.createdAt).toLocaleDateString()}</strong></span>
                  <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '20px', ...getStatusColor(order.status) }}>
                    {order.status || "Pending"}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '15px' }}>
                <div style={{ background: '#f9f9f9', padding: '14px', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 6px', fontSize: '12px', color: '#777', textTransform: 'uppercase' }}>Recipient</h4>
                  <p style={{ margin: '2px 0', fontSize: '13px' }}><strong>Email:</strong> {order.customerEmail}</p>
                </div>
                <div style={{ background: '#f9f9f9', padding: '14px', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 6px', fontSize: '12px', color: '#777', textTransform: 'uppercase' }}>Items</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                    {order.items?.map((item, idx) => (
                      <span key={idx} style={{ fontSize: '11px', backgroundColor: '#fff', border: '1px solid #ddd', padding: '3px 8px', borderRadius: '4px' }}>
                        {item.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid #f0f0f0', paddingTop: '15px' }}>
                <button disabled={updatingId === order._id || order.status === "Pending"} onClick={() => handleUpdateStatus(order._id, "Pending")}
                  style={{ padding: '6px 12px', fontSize: '12px', background: '#7f8c8d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: order.status === "Pending" ? 0.4 : 1 }}
                >Reset to Pending</button>
                <button disabled={updatingId === order._id || order.status === "Shipped"} onClick={() => handleUpdateStatus(order._id, "Shipped")}
                  style={{ padding: '6px 12px', fontSize: '12px', background: '#2980b9', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: order.status === "Shipped" ? 0.4 : 1 }}
                >Ship Package</button>
                <button disabled={updatingId === order._id || order.status === "Delivered"} onClick={() => handleUpdateStatus(order._id, "Delivered")}
                  style={{ padding: '6px 12px', fontSize: '12px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: order.status === "Delivered" ? 0.4 : 1 }}
                >Confirm Delivery</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
