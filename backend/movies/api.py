from rest_framework import serializers, viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Movie, Director, Actor, UserRating, UserWatchlist
from recommendations.recommendation_engine import ContentBasedRecommender, HybridRecommender


class DirectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Director
        fields = ['name_id', 'name']


class ActorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Actor
        fields = ['name_id', 'name']


class MovieSerializer(serializers.ModelSerializer):
    director = DirectorSerializer(read_only=True)
    cast = ActorSerializer(many=True, read_only=True)
    genres = serializers.JSONField()
    user_rating = serializers.SerializerMethodField()
    in_watchlist = serializers.SerializerMethodField()
    
    class Meta:
        model = Movie
        fields = [
            'imdb_id', 'name', 'poster_url', 'year', 'certificate',
            'runtime', 'genres', 'rating_value', 'rating_count',
            'summary_text', 'director', 'cast', 'user_rating', 'in_watchlist'
        ]
    
    def get_user_rating(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                rating = UserRating.objects.get(user=request.user, movie=obj)
                return rating.rating
            except UserRating.DoesNotExist:
                pass
        return None
    
    def get_in_watchlist(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserWatchlist.objects.filter(user=request.user, movie=obj).exists()
        return False


class MovieListSerializer(serializers.ModelSerializer):
    genres = serializers.JSONField()
    
    class Meta:
        model = Movie
        fields = ['imdb_id', 'name', 'poster_url', 'year', 'genres', 'rating_value']


class UserRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRating
        fields = ['movie', 'rating', 'timestamp']
        read_only_fields = ['timestamp']


class MovieViewSet(viewsets.ModelViewSet):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'director__name', 'cast__name']
    lookup_field = 'imdb_id'
    
    def get_serializer_class(self):
        if self.action == 'list':
            return MovieListSerializer
        return MovieSerializer
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def rate(self, request, imdb_id=None):
        movie = self.get_object()
        user = request.user
        rating = request.data.get('rating')
        
        if not rating or not isinstance(rating, (int, float)) or not (0 <= rating <= 5):
            return Response(
                {'error': 'Please provide a valid rating between 0 and 5'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user_rating, created = UserRating.objects.update_or_create(
            user=user,
            movie=movie,
            defaults={'rating': rating}
        )
        
        serializer = UserRatingSerializer(user_rating)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def watchlist(self, request, imdb_id=None):
        movie = self.get_object()
        user = request.user
        action = request.data.get('action')
        
        if action == 'add':
            UserWatchlist.objects.get_or_create(user=user, movie=movie)
            return Response({'status': 'added to watchlist'})
        elif action == 'remove':
            UserWatchlist.objects.filter(user=user, movie=movie).delete()
            return Response({'status': 'removed from watchlist'})
        else:
            return Response(
                {'error': 'Please provide a valid action (add or remove)'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def recommendations(self, request):
        movie_id = request.query_params.get('movie_id')
        
        if not movie_id:
            return Response(
                {'error': 'Please provide a movie_id parameter'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if movie exists
        get_object_or_404(Movie, imdb_id=movie_id)
        
        # Get recommendations
        recommender = ContentBasedRecommender()
        recommendations = recommender.get_recommendations(movie_id)
        
        # Get movie objects
        movie_ids = [movie['imdb_id'] for movie in recommendations]
        movies = Movie.objects.filter(imdb_id__in=movie_ids)
        
        # Maintain the order of recommendations
        ordered_movies = []
        for movie_id in movie_ids:
            for movie in movies:
                if movie.imdb_id == movie_id:
                    ordered_movies.append(movie)
                    break
        
        serializer = MovieListSerializer(ordered_movies, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def personalized(self, request):
        user_id = request.user.id
        
        # Get personalized recommendations
        recommender = HybridRecommender()
        recommendations = recommender.get_recommendations_for_user(user_id)
        
        # Get movie objects
        movie_ids = [movie['imdb_id'] for movie in recommendations]
        movies = Movie.objects.filter(imdb_id__in=movie_ids)
        
        # Maintain the order of recommendations
        ordered_movies = []
        for movie_id in movie_ids:
            for movie in movies:
                if movie.imdb_id == movie_id:
                    ordered_movies.append(movie)
                    break
        
        serializer = MovieListSerializer(ordered_movies, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def watchlist(self, request):
        user = request.user
        watchlist = UserWatchlist.objects.filter(user=user).select_related('movie')
        movies = [item.movie for item in watchlist]
        
        serializer = MovieListSerializer(movies, many=True, context={'request': request})
        return Response(serializer.data)