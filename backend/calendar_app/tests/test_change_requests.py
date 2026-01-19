from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from calendar_app.models import Course, Room, ScheduledEvent, AuditLog, Major, Notification
import datetime

User = get_user_model()

class ChangeRequestTests(APITestCase):
    def setUp(self):
        # Create users
        self.admin = User.objects.create_user(username="admin", password="password", role="administrator")
        self.tutor = User.objects.create_user(username="tutor", password="password", role="tutor")
        
        self.major = Major.objects.create(name="CS")
        self.course = Course.objects.create(name="CS101", major=self.major)
        self.room = Room.objects.create(name="Room 1")
        
    def test_edit_approved_event_creates_change_request(self):
        self.client.force_authenticate(user=self.tutor)
        
        # Original Approved Event
        event = ScheduledEvent.objects.create(
            title="Original Title",
            date=datetime.date(2025, 1, 1),
            start_time=datetime.time(10, 0),
            end_time=datetime.time(11, 0),
            course=self.course,
            tutor=self.tutor,
            room=self.room,
            event_type="lecture",
            status="approved"
        )
        
        # Tutor edits it
        url = f"/api/calendar/edit_event/{event.id}/"
        data = {
            "title": "Changed Title",
            "date": "2025-01-02", # changed date
            "start_time": "12:00", # changed time
        }
        res = self.client.put(url, data, format='json')
        self.assertEqual(res.status_code, 201) # Should be 201 Created now
        
        # Check that original is UNCHANGED
        event.refresh_from_db()
        self.assertEqual(event.title, "Original Title")
        self.assertEqual(event.status, "approved")
        
        # Check for Child Event
        new_event = ScheduledEvent.objects.filter(related_event=event).first()
        self.assertIsNotNone(new_event)
        self.assertEqual(new_event.title, "Changed Title")
        self.assertEqual(new_event.status, "request_change")
        self.assertEqual(new_event.date, datetime.date(2025, 1, 2))
        
    def test_approve_change_request_merges_data(self):
        self.client.force_authenticate(user=self.admin)
        
        # Original Approved Event
        event = ScheduledEvent.objects.create(
            title="Original Title",
            date=datetime.date(2025, 1, 1),
            start_time=datetime.time(10, 0),
            end_time=datetime.time(11, 0),
            course=self.course,
            tutor=self.tutor,
            room=self.room,
            event_type="lecture",
            status="approved"
        )
        
        # Change Request
        change_request = ScheduledEvent.objects.create(
            title="New Merged Title",
            date=datetime.date(2025, 1, 5),
            start_time=datetime.time(9, 0),
            end_time=datetime.time(10, 0),
            course=self.course,
            tutor=self.tutor,
            room=self.room,
            event_type="lecture",
            status="request_change",
            related_event=event
        )
        
        # Approve the REQUEST
        url = f"/api/calendar/approve/{change_request.id}/"
        res = self.client.post(url)
        self.assertEqual(res.status_code, 200)
        
        # Check Merge
        event.refresh_from_db()
        self.assertEqual(event.title, "New Merged Title")
        self.assertEqual(event.date, datetime.date(2025, 1, 5))
        self.assertEqual(event.status, "approved")
        
        # Check Child deleted
        self.assertFalse(ScheduledEvent.objects.filter(id=change_request.id).exists())
