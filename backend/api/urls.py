from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, ExperienceViewSet, contact_submit

router = DefaultRouter()
router.register(r'projects', ProjectViewSet)
router.register(r'experiences', ExperienceViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('contact/', contact_submit, name='contact-submit'),
]
