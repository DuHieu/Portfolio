from rest_framework import viewsets, status, generics, permissions, filters
from rest_framework.decorators import api_view, permission_classes
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
