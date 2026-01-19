from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from calendar_app.models import Course, Room, ScheduledEvent, AuditLog, Major, Notification
from users.models import StudentProfile
import datetime

User = get_user_model()

class NotificationAuditTests(APITestCase):
    def setUp(self):
        # Create users
        self.admin = User.objects.create_user(username="admin", password="password", role="administrator")
        self.tutor = User.objects.create_user(username="tutor", password="password", role="tutor")
        
        self.student_user = User.objects.create_user(username="student", password="password", role="student")
        
        # Create metadata
        self.major = Major.objects.create(name="Computer Science")
        self.course = Course.objects.create(name="CS101", major=self.major, year=1)
        self.room = Room.objects.create(name="Room 101")
        
        # Setup student profile
        StudentProfile.objects.create(
            user=self.student_user,
            name="Test Student",
            email="student@test.com",
            dob=datetime.date(2000, 1, 1),
            student_id="S123",
            major=self.major,
            year=1
        )
        
        self.client.force_authenticate(user=self.admin)

    def test_create_event_triggers_notification_and_log(self):
        url = "/api/calendar/create_event/"
        data = {
            "title": "Intro to CS",
            "date": "2025-01-01",
            "start_time": "10:00",
            "end_time": "11:00",
            "course": self.course.id,
            "tutor": self.tutor.id,
            "room": self.room.id,
            "event_type": "lecture"
        }
        res = self.client.post(url, data)
        self.assertEqual(res.status_code, 201)
        
        event = ScheduledEvent.objects.get(title="Intro to CS")
        
        # Check Audit Log
        log = AuditLog.objects.filter(action="createEvent", event=event).first()
        self.assertIsNotNone(log)
        self.assertEqual(log.user, self.admin)
        
        # Check Notification (Student)
        notif = Notification.objects.filter(user=self.student_user).first()
        self.assertIsNotNone(notif)
        self.assertIn("Intro to CS", notif.message)
        self.assertIn("created", notif.message)

    def test_edit_event_triggers(self):
        # Create initial event
        event = ScheduledEvent.objects.create(
            title="Old Title",
            date=datetime.date(2025, 1, 1),
            start_time=datetime.time(10, 0),
            end_time=datetime.time(11, 0),
            course=self.course,
            tutor=self.tutor,
            room=self.room,
            event_type="lecture",
            status="pending"
        )
        
        url = f"/api/calendar/edit_event/{event.id}/"
        data = {"title": "New Title"}
        res = self.client.put(url, data)
        self.assertEqual(res.status_code, 200)
        
        # Check Audit Log
        log = AuditLog.objects.filter(action="editEvent", event=event).first()
        self.assertIsNotNone(log)
        
        # Check Notification
        notif = Notification.objects.filter(user=self.student_user).first()
        self.assertIsNotNone(notif)
        self.assertIn("New Title", notif.message)
        self.assertIn("updated", notif.message)

    def test_cancel_event_triggers(self):
        event = ScheduledEvent.objects.create(
            title="To Cancel",
            date=datetime.date(2025, 1, 1),
            start_time=datetime.time(10, 0),
            end_time=datetime.time(11, 0),
            course=self.course,
            tutor=self.tutor,
            room=self.room,
            event_type="lecture",
            status="pending"
        )
        
        url = f"/api/calendar/edit_event/{event.id}/"
        data = {"action": "cancel"}
        res = self.client.put(url, data, format='json')
        if res.status_code != 200:
            with open("debug_test.txt", "w") as f:
                f.write(f"{res.status_code}\n{res.content}")
            self.fail("Check debug_test.txt")
        self.assertEqual(res.status_code, 200)
        
        log = AuditLog.objects.filter(action="cancelEvent", event=event).first()
        self.assertIsNotNone(log)
        
        notif = Notification.objects.filter(user=self.student_user).first()
        self.assertIsNotNone(notif)
        self.assertIn("cancelled", notif.message)

    def test_reject_event_triggers(self):
        event = ScheduledEvent.objects.create(
            title="To Reject",
            date=datetime.date(2025, 1, 1),
            start_time=datetime.time(10, 0),
            end_time=datetime.time(11, 0),
            course=self.course,
            tutor=self.tutor,
            room=self.room,
            event_type="lecture",
            status="pending"
        )
        
        url = f"/api/calendar/reject/{event.id}/"
        res = self.client.post(url)
        self.assertEqual(res.status_code, 200)
        
        log = AuditLog.objects.filter(action="rejectEvent", event=event).first()
        self.assertIsNotNone(log)
        
        notif = Notification.objects.filter(user=self.student_user).first()
        self.assertIsNotNone(notif)
        self.assertIn("rejected", notif.message)
