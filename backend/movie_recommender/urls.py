from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from movies.api import MovieViewSet
from django.conf import settings
from django.conf.urls.static import static

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'movies', MovieViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
]

# Add this only for development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)