import unittest
import requests


class TestChatExample(unittest.TestCase):
    def test_chat_example(self):
        url = "http://localhost:8080"
        param = {
            "names": ["Bob", "Alice"],
            "bios": [
                "I am a biology student, I like to play basketball on my free time",
                "I am a computer science student, I like to play video games on my free time",
            ],
        }
        r = requests.post(
            url,
            json=param,
            headers={
                "Content-Type": "application/json",
                "Origin": "http://localhost:8080",
            },
        )
        self.assertEqual(r.status_code, 200, "Status code should be 200")
