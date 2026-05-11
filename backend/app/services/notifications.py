# app/services/notifications.py
# ─────────────────────────────────────────────────────────────────────────────
# Multi-channel notification dispatcher for SubPay.
# Handles SMS via Termii, Email via Brevo, and WhatsApp via Twilio.
# ─────────────────────────────────────────────────────────────────────────────

import httpx
from app.config import settings

class NotificationService:
    @staticmethod
    async def send_sms(to: str, message: str):
        """
        Dispatch SMS via Termii. 
        Note: phone numbers must be in international format (e.g. 23480...)
        """
        if not settings.TERMII_API_KEY:
            print(f"[STUB] SMS to {to}: {message}")
            return

        url = "https://api.ng.termii.com/api/sms/send"
        payload = {
            "to": to,
            "from": settings.TERMII_SENDER_ID,
            "sms": message,
            "type": "plain",
            "channel": "generic", # or "dnd" depending on Sender ID approval
            "api_key": settings.TERMII_API_KEY,
        }
        
        async with httpx.AsyncClient() as client:
            try:
                r = await client.post(url, json=payload, timeout=10.0)
                r.raise_for_status()
                return r.json()
            except Exception as e:
                print(f"[ERROR] Termii dispatch failed: {e}")
                raise

    @staticmethod
    async def send_email(to: str, subject: str, html_content: str):
        """
        Dispatch Transactional Email via Brevo (Sendinblue).
        """
        if not settings.BREVO_API_KEY:
            print(f"[STUB] Email to {to} | Subject: {subject}")
            return

        url = "https://api.brevo.com/v3/smtp/email"
        headers = {
            "accept": "application/json",
            "api-key": settings.BREVO_API_KEY,
            "content-type": "application/json",
        }
        payload = {
            "sender": {"name": settings.BREVO_SENDER_NAME, "email": settings.BREVO_SENDER_EMAIL},
            "to": [{"email": to}],
            "subject": subject,
            "htmlContent": html_content,
        }

        async with httpx.AsyncClient() as client:
            try:
                r = await client.post(url, headers=headers, json=payload, timeout=10.0)
                r.raise_for_status()
                return r.json()
            except Exception as e:
                print(f"[ERROR] Brevo dispatch failed: {e}")
                raise

    @staticmethod
    def send_sms_sync(to: str, message: str):
        """
        Synchronous wrapper for Celery workers (thread-based).
        """
        if not settings.TERMII_API_KEY:
            print(f"[STUB] SMS to {to}: {message}")
            return

        url = "https://api.ng.termii.com/api/sms/send"
        payload = {
            "to": to,
            "from": settings.TERMII_SENDER_ID,
            "sms": message,
            "type": "plain",
            "channel": "generic",
            "api_key": settings.TERMII_API_KEY,
        }
        
        with httpx.Client() as client:
            try:
                r = client.post(url, json=payload, timeout=15.0)
                r.raise_for_status()
                return r.json()
            except Exception as e:
                print(f"[ERROR] Termii sync dispatch failed: {e}")
                raise

    @staticmethod
    def send_email_sync(to: str, subject: str, html_content: str):
        """
        Synchronous wrapper for Celery workers.
        """
        if not settings.BREVO_API_KEY:
            print(f"[STUB] Email to {to} | Subject: {subject}")
            return

        url = "https://api.brevo.com/v3/smtp/email"
        headers = {
            "accept": "application/json",
            "api-key": settings.BREVO_API_KEY,
            "content-type": "application/json",
        }
        payload = {
            "sender": {"name": settings.BREVO_SENDER_NAME, "email": settings.BREVO_SENDER_EMAIL},
            "to": [{"email": to}],
            "subject": subject,
            "htmlContent": html_content,
        }

        with httpx.Client() as client:
            try:
                r = client.post(url, headers=headers, json=payload, timeout=15.0)
                r.raise_for_status()
                return r.json()
            except Exception as e:
                print(f"[ERROR] Brevo sync dispatch failed: {e}")
                raise

    @staticmethod
    async def send_whatsapp(to: str, message: str):
        """
        Dispatch WhatsApp message via Twilio.
        'to' must be 'whatsapp:+234...'
        """
        if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
            print(f"[STUB] WhatsApp to {to}: {message}")
            return

        url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.TWILIO_ACCOUNT_SID}/Messages.json"
        auth = (settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        data = {
            "To": to if to.startswith("whatsapp:") else f"whatsapp:{to}",
            "From": settings.WHATSAPP_FROM,
            "Body": message,
        }

        async with httpx.AsyncClient() as client:
            try:
                r = await client.post(url, auth=auth, data=data, timeout=10.0)
                r.raise_for_status()
                return r.json()
            except Exception as e:
                print(f"[ERROR] Twilio WhatsApp dispatch failed: {e}")
                raise

    @staticmethod
    def send_whatsapp_sync(to: str, message: str):
        """
        Synchronous wrapper for Celery workers.
        """
        if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
            print(f"[STUB] WhatsApp to {to}: {message}")
            return

        url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.TWILIO_ACCOUNT_SID}/Messages.json"
        auth = (settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        data = {
            "To": to if to.startswith("whatsapp:") else f"whatsapp:{to}",
            "From": settings.WHATSAPP_FROM,
            "Body": message,
        }

        with httpx.Client() as client:
            try:
                r = client.post(url, auth=auth, data=data, timeout=15.0)
                r.raise_for_status()
                return r.json()
            except Exception as e:
                print(f"[ERROR] Twilio WhatsApp sync dispatch failed: {e}")
                raise

