// Notification stub — emails are logged to console per spec §7 (no SMTP required).

type NotificationEvent =
  | { type: "CANDIDATE_INVITED"; to: string; positionTitle: string; testUrl: string }
  | { type: "TEST_COMPLETED"; to: string; candidateName: string; positionTitle: string }
  | { type: "DECISION_RECORDED"; to: string; candidateName: string; positionTitle: string; status: string }
  | { type: "VERIFY_EMAIL"; to: string; verifyUrl: string }
  | { type: "PASSWORD_RESET"; to: string; resetUrl: string };

export function sendNotification(event: NotificationEvent): void {
  // Prototype: log instead of sending real email.
  console.log(`[NOTIFICATION] ${event.type} -> ${"to" in event ? event.to : "?"}`, event);
}