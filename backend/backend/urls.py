from django.contrib import admin
from django.urls import path
from django.http import JsonResponse

# Import all the view functions and classes from your API
from api.views import (
    ConversationListView,
    ConversationDetailView,
    create_conversation,
    send_message,
    end_conversation,
    get_conversation_history,
    get_all_conversations
)

urlpatterns = [
    # Django admin
    path('admin/', admin.site.urls),

    # === API ENDPOINTS ===
    # List all conversations (ListView)
    path('api/conversations/', ConversationListView.as_view(), name='conversation-list'),

    # Single conversation detail
    path('api/conversations/<int:pk>/', ConversationDetailView.as_view(), name='conversation-detail'),

    # Create new conversation
    path('api/conversations/create/', create_conversation, name='conversation-create'),

    # Send new message to conversation
    path('api/conversations/<int:pk>/send/', send_message, name='conversation-send'),

    # End a conversation and generate summary
    path('api/conversations/<int:pk>/end/', end_conversation, name='conversation-end'),

    # Retrieve full message history for a conversation
    path('api/conversations/<int:pk>/history/', get_conversation_history, name='conversation-history'),

    # List all conversations (for sidebar display)
    path('api/conversations/all/', get_all_conversations, name='conversation-all'),
]

# === ROOT ROUTE ===
urlpatterns += [
    path('', lambda request: JsonResponse({
        "message": "Welcome to the Chat Summariser API!",
        "available_endpoints": [
            "/api/conversations/",
            "/api/conversations/create/",
            "/api/conversations/<id>/",
            "/api/conversations/<id>/send/",
            "/api/conversations/<id>/end/",
            "/api/conversations/<id>/history/",
            "/api/conversations/all/"
        ]
    })),
]
