# Mobile Inventory Classification

1. **customer.intake**: Already covered by `contracts/customer.intake.json`
2. **booking.create**: Already covered by `contracts/booking.create.json`
3. **case.progress.read**: Already covered by `contracts/case.progress.read.json`
4. **document.request.create**: Already covered by `contracts/document.request.create.json`

## Unique mobile situations/capabilities to classify

* **today**: MOBILE_ONLY_PRESENTATION (dashboard)
* **urgent**: MOBILE_ONLY_PRESENTATION
* **approve**: EXTRACT (Missing `approval.submit` or similar in contracts)
* **reply**: EXTRACT (Missing `message.reply` or similar)
* **scan/upload**: EXTRACT (`document.upload` or similar)
* **client lookup**: ALREADY_CANONICAL (`case.progress.read` might cover parts, but likely `customer.read` is needed - missing but standard)
* **payment status**: ALREADY_CANONICAL (or EXTRACT `payment.status.read`)
* **next action**: ALREADY_CANONICAL (part of workflow/WER, presentation level)
* **notification**: MOBILE_ONLY_PRESENTATION (push notifications rendering)
