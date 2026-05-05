-- Wipe orders (PostgreSQL). Run manually only when you intend to delete ALL orders.
DELETE FROM tracking_events;
DELETE FROM order_items;
DELETE FROM orders;
