"""
=========================================================
Yukti AI — Task Types
=========================================================
"""

from enum import Enum


# ================= Task Types =================

class TaskType(str, Enum):
    GENERAL_CHAT = "general_chat"
    FAST_CHAT = "fast_chat"
    REASONING = "reasoning"
    CODING = "coding"
    WEB_SEARCH = "web_search"
    DEEP_RESEARCH = "deep_research"
    IMAGE_ANALYSIS = "image_analysis"
    DOCUMENT_ANALYSIS = "document_analysis"