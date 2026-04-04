from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, ExperienceViewSet, contact_submit, developer_profile, update_profile

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'experiences', ExperienceViewSet, basename='experience')

urlpatterns = [
    path('', include(router.urls)),
    path('profile/<str:username>/', developer_profile, name='developer-profile'),
    path('profile/update/', update_profile, name='update-profile'),
    path('contact/', contact_submit, name='contact-submit'),
]
