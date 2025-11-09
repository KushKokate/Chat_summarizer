from django.db import models


class Conversation(models.Model):
    """
    Represents a single chat session between the user and the AI.
    """
    title = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, default='active')  # 'active' or 'ended'
    summary = models.TextField(blank=True, null=True)

    def __str__(self):
        # Return title if available, else a default formatted name
        return self.title or f"Conversation {self.id}"

    class Meta:
        ordering = ['-created_at']  # Latest conversations first
        verbose_name = "Conversation"
        verbose_name_plural = "Conversations"


class Message(models.Model):
    """
    Represents each message (user or AI) in a conversation.
    """
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.CharField(max_length=10)  # 'user' or 'ai'
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        # Show sender and a snippet of the message
        return f"{self.sender.capitalize()}: {self.content[:50]}"

    class Meta:
        ordering = ['timestamp']
        verbose_name = "Message"
        verbose_name_plural = "Messages"
