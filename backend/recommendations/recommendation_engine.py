import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from movies.models import Movie, UserRating


class ContentBasedRecommender:
    """Content-based recommendation system for movies"""
    
    def __init__(self):
        self.movie_features = None
        self.similarity_matrix = None
        self.movie_indices = None
        self.tfidf_matrix = None
    
    def _prepare_data(self):
        """Prepare data for content-based recommendation"""
        # Get all movies from the database
        movies = Movie.objects.all().values(
            'imdb_id', 'name', 'year', 'genres', 
            'director__name', 'summary_text'
        )
        
        # Convert to DataFrame
        df = pd.DataFrame(list(movies))
        
        # Handle missing values
        df['director__name'] = df['director__name'].fillna('')
        df['summary_text'] = df['summary_text'].fillna('')
        df['year'] = df['year'].fillna('')
        
        # Create a mapping from imdb_id to index
        self.movie_indices = {movie['imdb_id']: i for i, movie in enumerate(movies)}
        
        # Create feature soup for each movie
        df['features'] = df.apply(self._create_feature_soup, axis=1)
        
        return df
    
    def _create_feature_soup(self, row):
        """Create a 'soup' of features for a movie"""
        genres = ' '.join(row['genres']) if row['genres'] else ''
        director = row['director__name'] if row['director__name'] else ''
        summary = row['summary_text'] if row['summary_text'] else ''
        
        # Add weight to genres and director by repeating them
        genres = ' '.join([genres] * 3)
        director = ' '.join([director] * 2)
        
        # Combine all features
        return f"{genres} {director} {summary}".lower()
    
    def build_model(self):
        """Build the recommendation model"""
        # Prepare data
        df = self._prepare_data()
        
        # Create TF-IDF matrix
        tfidf = TfidfVectorizer(stop_words='english')
        self.tfidf_matrix = tfidf.fit_transform(df['features'])
        
        # Calculate similarity matrix
        self.similarity_matrix = cosine_similarity(self.tfidf_matrix, self.tfidf_matrix)
        
        # Store movie features
        self.movie_features = df[['imdb_id', 'name', 'year']]
        
        return True
    
    def get_recommendations(self, movie_id, num_recommendations=10):
        """Get movie recommendations based on a movie ID"""
        # Check if model is built
        if self.similarity_matrix is None:
            self.build_model()
        
        # Get movie index
        if movie_id not in self.movie_indices:
            return []
        
        movie_idx = self.movie_indices[movie_id]
        
        # Get similarity scores
        sim_scores = list(enumerate(self.similarity_matrix[movie_idx]))
        
        # Sort movies based on similarity scores
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        
        # Get top similar movies (exclude the movie itself)
        sim_scores = sim_scores[1:num_recommendations+1]
        
        # Get movie indices
        movie_indices = [i[0] for i in sim_scores]
        
        # Return recommended movies
        recommended_movies = self.movie_features.iloc[movie_indices]
        
        return recommended_movies.to_dict('records')


class HybridRecommender:
    """Hybrid recommendation system combining content-based and collaborative filtering"""
    
    def __init__(self):
        self.content_recommender = ContentBasedRecommender()
    
    def get_recommendations_for_user(self, user_id, num_recommendations=10):
        """Get personalized recommendations for a user"""
        # Build content model if not already built
        if self.content_recommender.similarity_matrix is None:
            self.content_recommender.build_model()
        
        # Get user's highly rated movies
        user_ratings = UserRating.objects.filter(
            user_id=user_id, 
            rating__gte=4.0
        ).select_related('movie').order_by('-rating')[:5]
        
        # If user has no ratings, return popular movies
        if not user_ratings:
            return self._get_popular_movies(num_recommendations)
        
        # Get recommendations based on user's top rated movies
        all_recommendations = []
        for user_rating in user_ratings:
            movie_recommendations = self.content_recommender.get_recommendations(
                user_rating.movie.imdb_id, 
                num_recommendations=3
            )
            all_recommendations.extend(movie_recommendations)
        
        # Remove duplicates
        unique_recommendations = []
        seen_ids = set()
        
        for movie in all_recommendations:
            if movie['imdb_id'] not in seen_ids:
                unique_recommendations.append(movie)
                seen_ids.add(movie['imdb_id'])
                
                if len(unique_recommendations) >= num_recommendations:
                    break
        
        # If we still need more recommendations, add popular movies
        if len(unique_recommendations) < num_recommendations:
            popular_movies = self._get_popular_movies(
                num_recommendations - len(unique_recommendations)
            )
            
            for movie in popular_movies:
                if movie['imdb_id'] not in seen_ids:
                    unique_recommendations.append(movie)
                    seen_ids.add(movie['imdb_id'])
        
        return unique_recommendations
    
    def _get_popular_movies(self, limit=10):
        """Get popular movies based on rating"""
        popular_movies = Movie.objects.filter(
            rating_value__isnull=False
        ).order_by('-rating_value')[:limit]
        
        return [
            {
                'imdb_id': movie.imdb_id,
                'name': movie.name,
                'year': movie.year
            }
            for movie in popular_movies
        ]