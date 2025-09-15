-- Sample Data (Simple version without total_recipients)
-- Run this only after setting up tables and RLS policies

-- Insert sample donors (just 3-4 for testing)
INSERT INTO public.donors (name, email, phone, donation_type, membership) VALUES
('Rajesh Kumar', 'rajesh@example.com', '+91-9876543210', 'General Donation', 'Life'),
('Priya Sharma', 'priya@example.com', '+91-9876543211', 'Seva Donation', 'Regular'),
('Amit Patel', 'amit@example.com', '+91-9876543212', 'Annadanam', 'Special');

-- Insert sample donations (just a few)
INSERT INTO public.donations (donor_id, donation_type, amount, payment_mode, date_of_donation) VALUES
((SELECT id FROM public.donors WHERE name = 'Rajesh Kumar'), 'General Donation', 5000.00, 'Online', '2024-08-15'),
((SELECT id FROM public.donors WHERE name = 'Priya Sharma'), 'Seva Donation', 2500.00, 'QR Payment', '2024-08-10'),
((SELECT id FROM public.donors WHERE name = 'Amit Patel'), 'Annadanam', 1500.00, 'Offline', '2024-08-05');

-- Insert corresponding receipts (auto-generated receipt numbers)
INSERT INTO public.receipts (donation_id, is_printed, is_email_sent) VALUES
((SELECT id FROM public.donations WHERE amount = 5000.00), true, true),
((SELECT id FROM public.donations WHERE amount = 2500.00), false, true),
((SELECT id FROM public.donations WHERE amount = 1500.00), true, false);

-- Sample SMS event (without total_recipients - let it be calculated)
INSERT INTO public.sms_events (event_name, message_content, recipient_donor_ids) VALUES
('Janmashtami Celebration', 'Join us for Janmashtami celebration on August 26th at 6 PM. Your participation will make this event divine!', 
 (SELECT ARRAY_AGG(id) FROM public.donors LIMIT 3));

-- Verify the data was inserted
SELECT 'Sample data inserted successfully!' as status;
SELECT COUNT(*) as donor_count FROM public.donors;
SELECT COUNT(*) as donation_count FROM public.donations; 
SELECT COUNT(*) as receipt_count FROM public.receipts;
SELECT COUNT(*) as sms_event_count FROM public.sms_events;
