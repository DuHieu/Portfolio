from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Project, Experience, ContactMessage
from .serializers import ProjectSerializer, ExperienceSerializer, ContactMessageSerializer


class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer


class ExperienceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Experience.objects.filter(is_active=True)
    serializer_class = ExperienceSerializer


@api_view(['POST'])
def contact_submit(request):
    serializer = ContactMessageSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'detail': 'Message received.'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
