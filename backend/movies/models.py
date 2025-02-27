from django.db import models
from django.contrib.auth.models import User


class Director(models.Model):
    name_id = models.CharField(max_length=50, primary_key=True)  # Increased from 20 to 50
    name = models.CharField(max_length=255)  # Increased from 100 to 255

    def __str__(self):
        return self.name


class Actor(models.Model):
    name_id = models.CharField(max_length=50, primary_key=True)  # Increased from 20 to 50
    name = models.CharField(max_length=255)  # Increased from 100 to 255

    def __str__(self):
        return self.name


class Movie(models.Model):
    imdb_id = models.CharField(max_length=50, primary_key=True)  # Increased from 20 to 50
    name = models.CharField(max_length=500)  # Increased from 255 to 500
    poster_url = models.URLField(max_length=1000, blank=True, null=True)  # Increased from 500 to 1000
    year = models.CharField(max_length=20, blank=True, null=True)  # Increased from 10 to 20
    certificate = models.CharField(max_length=50, blank=True, null=True)  # Increased from 20 to 50
    runtime = models.CharField(max_length=50, blank=True, null=True)  # Increased from 20 to 50
    genres = models.JSONField(default=list)
    rating_value = models.FloatField(blank=True, null=True)
    rating_count = models.BigIntegerField(blank=True, null=True)  # Changed from IntegerField to BigIntegerField
    summary_text = models.TextField(blank=True, null=True)
    director = models.ForeignKey(Director, on_delete=models.SET_NULL, null=True, related_name='movies')
    cast = models.ManyToManyField(Actor, related_name='movies')
    
    def __str__(self):
        return f"{self.name} ({self.year})"


class UserRating(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ratings')
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='user_ratings')
    rating = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'movie')

    def __str__(self):
        return f"{self.user.username}: {self.movie.name} - {self.rating}"


class UserWatchlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='watchlist')
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    added_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'movie')

    def __str__(self):
        return f"{self.user.username}: {self.movie.name}"
