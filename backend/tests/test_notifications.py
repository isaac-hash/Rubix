# tests/test_notifications.py
import pytest
from unittest.mock import patch, MagicMock
from app.services.notifications import NotificationService
from app.config import settings

@pytest.fixture
def mock_settings():
    with patch("app.services.notifications.settings") as m:
        m.TERMII_API_KEY = "test_termii_key"
        m.TERMII_SENDER_ID = "SubPay"
        m.BREVO_API_KEY = "test_brevo_key"
        m.BREVO_SENDER_NAME = "SubPay Africa"
        m.BREVO_SENDER_EMAIL = "noreply@subpay.africa"
        m.TWILIO_ACCOUNT_SID = "test_sid"
        m.TWILIO_AUTH_TOKEN = "test_token"
        m.WHATSAPP_FROM = "whatsapp:+123"
        yield m

@pytest.mark.asyncio
async def test_send_sms_async(mock_settings):
    with patch("httpx.AsyncClient.post") as mock_post:
        mock_post.return_value = MagicMock(status_code=200)
        mock_post.return_value.json.return_value = {"message": "sent"}
        
        resp = await NotificationService.send_sms("2348000000000", "Hello Test")
        
        assert resp == {"message": "sent"}
        mock_post.assert_called_once()
        args, kwargs = mock_post.call_args
        assert kwargs["json"]["to"] == "2348000000000"
        assert kwargs["json"]["sms"] == "Hello Test"

@pytest.mark.asyncio
async def test_send_email_async(mock_settings):
    with patch("httpx.AsyncClient.post") as mock_post:
        mock_post.return_value = MagicMock(status_code=200)
        mock_post.return_value.json.return_value = {"messageId": "123"}
        
        resp = await NotificationService.send_email("test@example.com", "Subject", "<p>Body</p>")
        
        assert resp == {"messageId": "123"}
        mock_post.assert_called_once()
        args, kwargs = mock_post.call_args
        assert kwargs["json"]["subject"] == "Subject"
        assert kwargs["json"]["to"][0]["email"] == "test@example.com"

def test_send_sms_sync(mock_settings):
    with patch("httpx.Client.post") as mock_post:
        mock_post.return_value = MagicMock(status_code=200)
        mock_post.return_value.json.return_value = {"message": "sent"}
        
        resp = NotificationService.send_sms_sync("2348000000000", "Hello Sync")
        
        assert resp == {"message": "sent"}
        mock_post.assert_called_once()

def test_send_email_sync(mock_settings):
    with patch("httpx.Client.post") as mock_post:
        mock_post.return_value = MagicMock(status_code=200)
        mock_post.return_value.json.return_value = {"messageId": "123"}
        
        resp = NotificationService.send_email_sync("test@example.com", "Subject", "<p>Body</p>")
        
        assert resp == {"messageId": "123"}
        mock_post.assert_called_once()

@pytest.mark.asyncio
async def test_send_whatsapp_async(mock_settings):
    with patch("httpx.AsyncClient.post") as mock_post:
        mock_post.return_value = MagicMock(status_code=200)
        mock_post.return_value.json.return_value = {"sid": "wa123"}
        
        resp = await NotificationService.send_whatsapp("2348000000000", "Hello WA")
        
        assert resp == {"sid": "wa123"}
        mock_post.assert_called_once()
        args, kwargs = mock_post.call_args
        assert kwargs["data"]["To"] == "whatsapp:2348000000000"
        assert kwargs["data"]["Body"] == "Hello WA"
