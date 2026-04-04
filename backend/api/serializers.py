from rest_framework import serializers
from .models import Project, Experience, ContactMessage, Developer

class DeveloperSerializer(serializers.ModelSerializer):
    class Meta:
        model = Developer
        fields = ['username', 'full_name', 'bio', 'avatar_url', 'github_url', 'linkedin_url']

class ProjectSerializer(serializers.ModelSerializer):
    developer_info = DeveloperSerializer(source='developer.developer_profile', read_only=True)
    
    class Meta:
        model = Project
        fields = ['id', 'title', 'description', 'tags', 'gradient', 'size', 'url', 'github_url', 'order', 'developer_info']
        read_only_fields = ['developer']

class ExperienceSerializer(serializers.ModelSerializer):
    developer_info = DeveloperSerializer(source='developer.developer_profile', read_only=True)

    class Meta:
        model = Experience
        fields = ['id', 'title', 'company', 'period', 'description', 'skills', 'is_active', 'order', 'developer_info']
        read_only_fields = ['developer']

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['name', 'email', 'message']
