from django.utils import timezone
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.decorators import api_view

from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from .ai_module import get_ai_response, summarize_conversation


# === GET: List all conversations ===
class ConversationListView(generics.ListAPIView):
    queryset = Conversation.objects.all().order_by('-created_at')
    serializer_class = ConversationSerializer


# === GET: Retrieve a conversation by ID ===
class ConversationDetailView(generics.RetrieveAPIView):
    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer


# === POST: Create a new conversation ===
@api_view(['POST'])
def create_conversation(request):
    title = request.data.get('title', 'Untitled Conversation')
    conv = Conversation.objects.create(title=title)
    return Response({'id': conv.id, 'title': conv.title})


# === POST: Send a message ===
@api_view(['POST'])
def send_message(request, pk):
    try:
        conv = Conversation.objects.get(id=pk)

        # Save user message
        user_msg = Message.objects.create(
            conversation=conv,
            sender='user',
            content=request.data['content']
        )

        # Build conversation history for AI
        history = [
            {"role": m.sender, "content": m.content}
            for m in conv.messages.all()
        ]
        history.append({"role": "user", "content": request.data['content']})

        # Generate AI response
        ai_text = get_ai_response(history)

        # Save AI message
        Message.objects.create(
            conversation=conv,
            sender='ai',
            content=ai_text
        )

        return Response({
            "user_message": user_msg.content,
            "ai_response": ai_text
        })

    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


# === POST: End a conversation ===
@api_view(['POST'])
def end_conversation(request, pk):
    try:
        conv = Conversation.objects.get(id=pk)
        all_msgs = "\n".join([f"{m.sender}: {m.content}" for m in conv.messages.all()])

        # Generate AI summary
        summary = summarize_conversation(all_msgs)

        conv.status = 'ended'
        conv.ended_at = timezone.now()  # ✅ fixed: matches your model field
        conv.summary = summary
        conv.save()

        return Response({
            "status": "Conversation ended",
            "summary": summary
        })
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


# === GET: Get conversation history ===
@api_view(['GET'])
def get_conversation_history(request, pk):
    """
    Retrieve all messages for a specific conversation.
    """
    try:
        conv = Conversation.objects.get(pk=pk)
        messages = conv.messages.order_by('timestamp').values('sender', 'content', 'timestamp')

        return Response({
            "conversation_id": conv.id,
            "title": conv.title,
            "messages": list(messages),
            "summary": conv.summary,
            "status": conv.status
        })
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


# === GET: List all conversations (for sidebar/history) ===
@api_view(['GET'])
def get_all_conversations(request):
    """
    Retrieve a list of all conversations with summary and timestamps.
    """
    try:
        conversations = Conversation.objects.order_by('-created_at').values(
            'id', 'title', 'summary', 'status', 'created_at'
        )
        return Response(list(conversations))
    except Exception as e:
        return Response({'error': str(e)}, status=500)
