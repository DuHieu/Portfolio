from rest_framework import viewsets, status, generics, permissions, filters
from rest_framework.decorators import api_view, permission_classes
import json
import urllib.request
import os
from rest_framework.response import Response
from .models import Project, Experience, ContactMessage, Developer
from .serializers import ProjectSerializer, ExperienceSerializer, ContactMessageSerializer, DeveloperSerializer
from .permissions import IsOwnerOrReadOnly

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsOwnerOrReadOnly]

    def get_queryset(self):
        queryset = Project.objects.all()
        username = self.request.query_params.get('user')
        if username:
            queryset = queryset.filter(developer__developer_profile__username=username)
        return queryset

    def perform_create(self, serializer):
        # Tự động gán dự án cho User đang đăng nhập
        serializer.save(developer=self.request.user)

class ExperienceViewSet(viewsets.ModelViewSet):
    serializer_class = ExperienceSerializer
    permission_classes = [IsOwnerOrReadOnly]

    def get_queryset(self):
        queryset = Experience.objects.filter(is_active=True)
        username = self.request.query_params.get('user')
        if username:
            queryset = queryset.filter(developer__developer_profile__username=username)
        return queryset

    def perform_create(self, serializer):
        # Tự động gán kinh nghiệm cho User đang đăng nhập
        serializer.save(developer=self.request.user)

@api_view(['GET'])
def developer_profile(request, username):
    try:
        dev = Developer.objects.get(username=username)
        serializer = DeveloperSerializer(dev)
        return Response(serializer.data)
    except Developer.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PATCH'])
# Cần viết thêm Permission Class để check đúng chủ sở hữu ở bước sau
def update_profile(request):
    if not request.user.is_authenticated:
        return Response({'detail': 'Auth required.'}, status=status.HTTP_401_UNAUTHORIZED)
    
    dev = request.user.developer_profile
    serializer = DeveloperSerializer(dev, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def contact_submit(request):
    serializer = ContactMessageSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'detail': 'Message received.'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def refine_text_with_ai(request):
    if not request.user.is_authenticated:
        return Response({'detail': 'Auth required.'}, status=status.HTTP_401_UNAUTHORIZED)
        
    text = request.data.get('text', '')
    type_ = request.data.get('type', 'bio')
    
    if not text:
        return Response({'detail': 'Text is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
    groq_api_key = os.environ.get('GROQ_API_KEY')
    if not groq_api_key:
        return Response({'detail': 'GROQ API key not configured on server.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    prompts = {
        'bio': "Refine this personal portfolio bio to be professional, engaging, and concise. Keep it under 200 characters if possible. Output ONLY the refined text.",
        'experience': "Refine this work experience description to be impact-oriented and professional. Use strong action verbs. Output ONLY the refined text.",
        'project': "Refine this project description to highlight technical innovation and problem-solving. Output ONLY the refined text."
    }
    
    prompt = prompts.get(type_, prompts['bio'])
    
    data = json.dumps({
        "model": "llama3-8b-8192",
        "messages": [
            {
                "role": "system",
                "content": "You are a professional career coach and copywriter specializing in tech portfolios. You provide concise, high-impact text in the same language as the input (Vietnamese or English)."
            },
            {
                "role": "user",
                "content": f"{prompt}\n\nInput Text: {text}"
            }
        ],
        "temperature": 0.7,
        "max_tokens": 500
    }).encode('utf-8')
    
    req = urllib.request.Request(
        "https://api.groq.com/openai/v1/chat/completions",
        data=data,
        headers={
            "Authorization": f"Bearer {groq_api_key}",
            "Content-Type": "application/json"
        },
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            refined_text = result['choices'][0]['message']['content'].strip()
            return Response({'refined_text': refined_text})
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
