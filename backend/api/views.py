from rest_framework import viewsets, status, generics, permissions, filters
from rest_framework.decorators import api_view, permission_classes
import json
import urllib.request
import os
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Project, Experience, ContactMessage, Developer, Education, Skill
from .serializers import (
    ProjectSerializer, ExperienceSerializer,
    ContactMessageSerializer, DeveloperSerializer, EducationSerializer, SkillSerializer
)
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
        serializer.save(developer=self.request.user)

class EducationViewSet(viewsets.ModelViewSet):
    serializer_class = EducationSerializer
    permission_classes = [IsOwnerOrReadOnly]

    def get_queryset(self):
        queryset = Education.objects.all()
        username = self.request.query_params.get('user')
        if username:
            queryset = queryset.filter(developer__developer_profile__username=username)
        return queryset

    def perform_create(self, serializer):
        serializer.save(developer=self.request.user)
class SkillViewSet(viewsets.ModelViewSet):
    serializer_class = SkillSerializer
    permission_classes = [IsOwnerOrReadOnly]

    def get_queryset(self):
        queryset = Skill.objects.all()
        username = self.request.query_params.get('user')
        if username:
            queryset = queryset.filter(developer__developer_profile__username=username)
        return queryset

    def perform_create(self, serializer):
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


class CVImportView(APIView):
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'detail': 'Auth required.'}, status=status.HTTP_401_UNAUTHORIZED)

        groq_api_key = os.environ.get('GROQ_API_KEY')
        if not groq_api_key:
            return Response({'detail': 'GROQ API key not configured.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Extract text: either from uploaded PDF file or from pasted text
        cv_text = ''
        uploaded_file = request.FILES.get('file')
        if uploaded_file:
            try:
                import PyPDF2
                import io
                pdf_reader = PyPDF2.PdfReader(io.BytesIO(uploaded_file.read()))
                cv_text = '\n'.join(
                    page.extract_text() or '' for page in pdf_reader.pages
                ).strip()
            except Exception as e:
                return Response({'detail': f'Không thể đọc PDF: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            cv_text = request.data.get('text', '').strip()

        if not cv_text:
            return Response({'detail': 'Không có nội dung CV. Vui lòng upload file PDF hoặc dán văn bản.'}, status=status.HTTP_400_BAD_REQUEST)

        # Truncate to avoid token limits (roughly ~12k chars safe)
        cv_text = cv_text[:12000]

        system_prompt = """You are an expert CV parser. Extract information from the CV text and return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "profile": {
    "full_name": "...",
    "bio": "A professional summary in 2-3 sentences"
  },
  "education": [
    {
      "degree": "...",
      "school": "...",
      "period": "...",
      "description": "..."
    }
  ],
  "experiences": [
    {
      "title": "Job title",
      "company": "Company name",
      "period": "e.g. Jan 2022 - Present",
      "description": "Key responsibilities and achievements",
      "skills": ["skill1", "skill2"]
    }
  ],
  "projects": [
    {
      "title": "...",
      "description": "...",
      "tags": ["tech1", "tech2"]
    }
  ],
  "skills": [
    {
      "name": "Skill name e.g. React",
      "category": "One of: frontend, backend, devops, tools, language, other",
      "level": 80,
      "icon": "A relevant emoji e.g. ⚛️"
    }
  ]
}
Rules:
- If a section is not found, return an empty array [] or empty string ""
- categories must be one of: frontend, backend, devops, tools, language, other
- level should be an integer from 0 to 100 representing proficiency, default to 80
- skills and tags must be arrays
- Return ONLY valid JSON, nothing else"""

        payload = json.dumps({
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Parse this CV:\n\n{cv_text}"}
            ],
            "temperature": 0.2,
            "max_tokens": 4096,
            "response_format": {"type": "json_object"}
        }).encode('utf-8')

        req = urllib.request.Request(
            "https://api.groq.com/openai/v1/chat/completions",
            data=payload,
            headers={
                "Authorization": f"Bearer {groq_api_key}",
                "Content-Type": "application/json"
            },
            method="POST"
        )

        try:
            with urllib.request.urlopen(req, timeout=60) as response:
                result = json.loads(response.read().decode('utf-8'))
                content = result['choices'][0]['message']['content'].strip()
                parsed = json.loads(content)
                return Response(parsed)
        except json.JSONDecodeError as e:
            return Response({'detail': f'AI trả về dữ liệu không hợp lệ: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
