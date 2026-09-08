-- Pause Coffee — the enum values online ordering needs.
--
-- Alone in its own file, and it must be allowed to COMMIT before 0013 runs.
-- Postgres will not let a transaction *use* an enum value that the same
-- transaction added ("unsafe use of new value of enum type"), and 0013 writes
-- both a default and two check constraints against these. This is the same
-- split 0007/0008 already had to make for 'superadmin'.
--
-- !! RUN THIS FILE AND LET IT COMMIT BEFORE RUNNING 0013 !!

-- ------------------------------------------------------------ order status

-- awaiting_approval — an online order that has been paid for and is waiting on
--   a human. It is deliberately NOT one of the queue statuses, so it can never
--   appear on the barista's board.
-- rejected — a human looked at it and said no. Distinct from 'cancelled',
--   which means a real order was stopped after it had been accepted.
alter type public.order_status add value if not exists 'awaiting_approval';
alter type public.order_status add value if not exists 'rejected';

-- -------------------------------------------------------------- order type

-- Joins dine_in / take_out. An online order is either 'delivery' (needs a pin)
-- or 'take_out' (collected at the counter).
alter type public.order_type add value if not exists 'delivery';

-- ----------------------------------------------------------- new enum types

do $$
begin
  -- Which app the order came from. Everything that behaves differently online
  -- keys off this one column rather than sniffing at the other fields.
  create type public.order_channel as enum ('in_store', 'online');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  -- The two digital wallets the shop accepts. Cash has no value here: an
  -- in_store order leaves this null and is paid at the counter.
  create type public.payment_method as enum ('gcash', 'bank_transfer');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  -- Who wrote a chat message. Staff identity is never shown to the customer
  -- (see 0016) — this only says which side of the conversation it came from.
  create type public.message_sender as enum ('customer', 'staff');
exception
  when duplicate_object then null;
end
$$;
