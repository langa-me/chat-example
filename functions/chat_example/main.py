import os
import logging
from datetime import datetime
from typing import Any
from flask import request, jsonify
import logging
from firebase_admin import firestore, initialize_app
from google.cloud.firestore import Client
import os
import openai
import requests
import asyncio
import functions_framework

initialize_app()

LANGAME_API_KEY = os.environ.get("LANGAME_API_KEY", None)
openai.api_key = os.environ.get("OPENAI_KEY", None)
openai.organization = os.environ.get("OPENAI_ORG", None)

assert openai.api_key is not None, "Missing OPENAI_KEY environment variable."
assert openai.organization is not None, "Missing OPENAI_ORG environment variable."
assert LANGAME_API_KEY is not None, "Missing LANGAME_API_KEY environment variable."

logger = logging.getLogger("chat_example")
logging.basicConfig(level=logging.INFO)
db: Client = firestore.client()


def chat(request):
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Origin, Accept",
        "Access-Control-Max-Age": "3600",
    }
    # Set CORS headers for the preflight request
    if request.method == "OPTIONS":
        return (
            {
                "error": {
                    "message": "This is a preflight request.",
                    "status": "preflight",
                },
                "results": [],
            },
            204,
            headers,
        )

    # if testing, return a dummy response
    if os.environ.get("TESTING", "false") == "true":
        return (
            {
                "error": None,
                "results": [
                    {
                        "conversation_starter": {
                            "en": "What is the question to the answer 42?",
                        },
                    },
                    {
                        "conversation_starter": {
                            "en": "What is the purpose of the universe?",
                        },
                    },
                    {
                        "conversation_starter": {
                            "en": "How do you like the weather today?",
                        },
                    },
                ],
            },
            200,
            headers,
        )

    json_data = request.get_json()
    names = json_data.get("names", None)
    bios = json_data.get("bios", None)
    limit = json_data.get("limit", 3)
    if not names:
        return (
            {
                "error": {
                    "message": "Missing names parameter.",
                    "status": "missing_names",
                },
                "results": [],
            },
            400,
            headers,
        )
    if not bios:
        return (
            {
                "error": {
                    "message": "Missing bios parameter.",
                    "status": "missing_bios",
                },
                "results": [],
            },
            400,
            headers,
        )

    # call Langame API to get conversation starter suggestions
    # that both people will like
    url = "https://api.langa.me/v1/conversation/starter"
    h = {
        "Content-Type": "application/json",
        "X-Api-Key": LANGAME_API_KEY,
    }
    data = {
        "personas": bios,
        "limit": limit,
    }
    response = requests.post(url, headers=h, json=data)
    if response.status_code != 200:
        return (
            {
                "error": {
                    "message": "Error calling Langame API.",
                    "status": "langame_api_error",
                },
                "results": [],
            },
            500,
            headers,
        )
    json_reponse = response.json()
    conversation_starters = json_reponse.get("results", [])
    if not conversation_starters or not conversation_starters[0].get(
        "conversation_starter", None
    ):
        return (
            {
                "error": {
                    "message": "No conversation starters found.",
                    "status": "no_conversation_starters",
                },
                "results": [],
            },
            500,
            headers,
        )
    return (
        {
            "error": None,
            "results": conversation_starters,
        },
        200,
        headers,
    )
