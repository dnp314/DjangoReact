import json
import os
from django.core.management.base import BaseCommand
from django.db import transaction
from movies.models import Movie, Director, Actor

class Command(BaseCommand):
    help = 'Import movies from multiple JSON files in a folder'

    def add_arguments(self, parser):
        parser.add_argument('folder', type=str, help='Path to the folder containing JSON files')

    def handle(self, *args, **kwargs):
        folder = kwargs['folder']

        if not os.path.exists(folder) or not os.path.isdir(folder):
            self.stderr.write(self.style.ERROR(f'Invalid folder path: {folder}'))
            return

        json_files = [f for f in os.listdir(folder) if f.endswith('.json')]
        if not json_files:
            self.stdout.write(self.style.WARNING('No JSON files found in the folder.'))
            return

        total_files = len(json_files)
        self.stdout.write(self.style.SUCCESS(f'Found {total_files} JSON files in {folder}.'))

        for index, json_file in enumerate(json_files, 1):
            file_path = os.path.join(folder, json_file)
            self.stdout.write(f'Processing file {index}/{total_files}: {file_path}')

            try:
                with open(file_path, 'r', encoding='utf-8') as file:
                    movies_data = json.load(file)

                if not isinstance(movies_data, list):
                    self.stderr.write(self.style.ERROR(f'Skipping {json_file}: Invalid JSON format'))
                    continue

                self.import_movies(movies_data)
                self.stdout.write(self.style.SUCCESS(f'Successfully imported movies from {json_file}'))

            except Exception as e:
                self.stderr.write(self.style.ERROR(f'Error processing {json_file}: {e}'))

        self.stdout.write(self.style.SUCCESS(f'All {total_files} JSON files processed successfully.'))

    def import_movies(self, movies_data):
        movies_to_create = []
        actors_to_create = {}
        directors_to_create = {}

        for movie_data in movies_data:
            try:
                # Process director
                director = None
                director_data = movie_data.get('director', {})
                if director_data:
                    director_name_id = director_data.get('name_id', '')
                    if director_name_id not in directors_to_create:
                        director, _ = Director.objects.get_or_create(
                            name_id=director_name_id,
                            defaults={'name': director_data.get('name', '')}
                        )
                        directors_to_create[director_name_id] = director
                    else:
                        director = directors_to_create[director_name_id]

                # Convert rating_count safely
                rating_count = self.parse_rating_count(movie_data.get('ratingCount', '0'))

                # Prepare movie object
                movie = Movie(
                    imdb_id=movie_data.get('ImdbId') or movie_data.get('_id', ''),
                    name=movie_data.get('name', ''),
                    poster_url=movie_data.get('poster_url', ''),
                    year=movie_data.get('year', ''),
                    certificate=movie_data.get('certificate', ''),
                    runtime=movie_data.get('runtime', ''),
                    genres=movie_data.get('genre', []),
                    rating_value=float(movie_data.get('ratingValue', 0)) if movie_data.get('ratingValue') else None,
                    rating_count=rating_count,
                    summary_text=movie_data.get('summary_text', ''),
                    director=director,
                )
                movies_to_create.append(movie)

                # Process cast
                for actor_data in movie_data.get('cast', []):
                    actor_name_id = actor_data.get('name_id', '')
                    if actor_name_id not in actors_to_create:
                        actor, _ = Actor.objects.get_or_create(
                            name_id=actor_name_id,
                            defaults={'name': actor_data.get('name', '')}
                        )
                        actors_to_create[actor_name_id] = actor
                    movie.cast.add(actors_to_create[actor_name_id])

            except Exception as e:
                self.stderr.write(self.style.ERROR(f"Skipping movie {movie_data.get('name', 'Unknown')}: {e}"))

        # Bulk insert movies for efficiency
        if movies_to_create:
            Movie.objects.bulk_create(movies_to_create, ignore_conflicts=True)

    def parse_rating_count(self, rating_count_str):
        """Safely parse ratingCount from string (handles '1.2M', '500K', '$100M', etc.)."""
        rating_count_str = str(rating_count_str).replace('$', '').replace(',', '').strip()

        try:
            if 'M' in rating_count_str:
                return int(float(rating_count_str.replace('M', '')) * 1_000_000)
            elif 'K' in rating_count_str:
                return int(float(rating_count_str.replace('K', '')) * 1_000)
            return int(rating_count_str)
        except ValueError:
            return None
