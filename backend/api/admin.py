from django.contrib import admin
from .models import Project, Experience, ContactMessage

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'size', 'order')
    list_editable = ('order',)

@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'period', 'is_active', 'order')
    list_editable = ('is_active', 'order')

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'created_at', 'is_read')
    list_editable = ('is_read',)
    readonly_fields = ('name', 'email', 'message', 'created_at')
