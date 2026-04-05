from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProjectViewSet, ExperienceViewSet, EducationViewSet, SkillViewSet,
    contact_submit, developer_profile, update_profile,
    refine_text_with_ai, CVImportView
)

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'experiences', ExperienceViewSet, basename='experience')
router.register(r'education', EducationViewSet, basename='education')
router.register(r'skills', SkillViewSet, basename='skill')

urlpatterns = [
    path('', include(router.urls)),
    path('profile/<str:username>/', developer_profile, name='developer-profile'),
    path('profile/update/', update_profile, name='update-profile'),
    path('contact/', contact_submit, name='contact-submit'),
    path('ai/refine/', refine_text_with_ai, name='ai-refine'),
    path('cv-import/', CVImportView.as_view(), name='cv-import'),
]
