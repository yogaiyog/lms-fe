---
type: "query"
date: "2026-07-31T07:41:27.322647+00:00"
question: "Bagaimana alur pembayaran Midtrans charge di UI billing admin?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["PaymentMethodModal", "useBilling", "createMidtransCharge", "midtrans.service", "payments.route", "ChargeResult"]
---

# Q: Bagaimana alur pembayaran Midtrans charge di UI billing admin?

## Answer

Alur: admin di menu Keuangan (admin-dashboard.tsx menu=billing) klik 'Bayar via Midtrans' pada invoice DRAFT -> openMethodModal() membuka PaymentMethodModal (komponen billing) yang menampilkan pilihan metode (VA 5 bank via 'Buat VA', QRIS via 'Buat QRIS', e-wallet GoPay/ShopeePay/Dana). Klik metode memanggil onCharge -> billing.chargeMidtrans() di hooks/useBilling.ts -> api.payments.createMidtransCharge (lib/api.ts) -> POST /api/v1/academic/payments/midtrans/charge (backend modules/payments/payments.route.ts) yang memanggil createChargeTransaction di services/midtrans/midtrans.service.ts (Core API https://api.sandbox.midtrans.com/v2/charge). Payment PENDING disimpan ke DB dengan detail paymentType/bank/vaNumber/qrString/deeplinkUrl/midtransRaw lalu tampil sebagai ChargeResult (VA number + tombol Salin, QR image, atau link 'Buka pembayaran'). Webhook Midtrans settlement di route yang sama memperbarui payment jadi SETTLEMENT dan invoice jadi PAID; tombol Refresh di modal memanggil refreshSelected() yang me-resolve lastChargeId dari data invoice fresh.

## Outcome

- Signal: useful

## Source Nodes

- PaymentMethodModal
- useBilling
- createMidtransCharge
- midtrans.service
- payments.route
- ChargeResult